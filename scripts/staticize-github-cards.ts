import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Root } from "mdast";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { getFilesRecursive } from "./utils";

/**
 * 📦 源码级 GitHub 卡片静态化工具 (API 优先 + 自动重试版)
 *
 * 策略：
 * 1. 总是尝试请求 GitHub API 获取最新数据。
 * 2. 如果请求成功，更新 Markdown 源码。
 * 3. 如果请求失败（重试 5 次后），保留源码中原有的静态数据。
 */

const CONTENT_DIR = "src/content";
const PUBLIC_DIR = "public";
const AVATAR_PATH = path.join("assets", "external");
const SAVE_DIR = path.join(PUBLIC_DIR, AVATAR_PATH);

if (!fs.existsSync(SAVE_DIR)) {
	fs.mkdirSync(SAVE_DIR, { recursive: true });
}

async function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function downloadAvatar(url: string): Promise<string | null> {
	if (!url) return null;
	// 即使本地有文件，偶尔更新一下也是好的，但为了构建速度，这里可以先检查文件是否存在
	// 如果需要强刷新头像，可以移除这个检查
	// 这里保持简单的哈希检查逻辑

	// 我们先计算预期文件名（基于 URL），如果 URL 没变，内容大概率没变
	// 但为了确保万无一失，我们还是在 API 请求成功后再下载

	try {
		const response = await fetchWithRetry(url);
		if (!response) return null;

		const buffer = await response.arrayBuffer();
		if (buffer.byteLength < 50) {
			console.warn(`  [WARN] Downloaded avatar too small (${buffer.byteLength} bytes): ${url}`);
			return null;
		}
		const hash = crypto.createHash("md5").update(Buffer.from(buffer)).digest("hex");
		const filename = `avatar-${hash}.png`;
		const savePath = path.join(SAVE_DIR, filename);
		const publicUrl = `/${AVATAR_PATH}/${filename}`;

		if (!fs.existsSync(savePath)) {
			fs.writeFileSync(savePath, Buffer.from(buffer));
		}
		return publicUrl;
	} catch (e) {
		console.warn(`  [WARN] Failed to download avatar ${url}: ${String(e)}`);
		return null;
	}
}

async function fetchWithRetry(url: string, retries = 5, headers: HeadersInit = {}): Promise<Response | null> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url, { headers });
			if (response.ok) return response;
			if (response.status === 404) return null; // 404 不重试
			if (response.status === 403) {
				// Rate limit hit
				console.warn(`  [RATE LIMIT] Hit limit for ${url}, waiting...`);
				await wait(1000 * (i + 1));
			}
			throw new Error(`HTTP ${response.status}`);
		} catch (e) {
			if (i === retries - 1) throw e;
			const delay = 1000 * 2 ** i; // 指数退避
			console.log(`  [RETRY] ${url} failed, retrying in ${delay}ms...`);
			await wait(delay);
		}
	}
	return null;
}

async function fetchRepoData(repo: string) {
	console.log(`  >> Fetching GitHub data: ${repo}`);
	const headers: HeadersInit = {
		"User-Agent": "Astro-Blog-Staticizer",
	};
	if (process.env.GITHUB_TOKEN) {
		headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
	}

	try {
		const response = await fetchWithRetry(`https://api.github.com/repos/${repo}`, 5, headers);

		if (!response) {
			console.warn(`  [WARN] Failed to fetch data for ${repo} (After retries)`);
			return null;
		}

		const data = await response.json();
		const localAvatar = await downloadAvatar(data.owner?.avatar_url);

		// 更健壮的描述清理：移除 Emoji 标记，替换所有双引号，并移除可能干扰解析的控制字符
		const cleanDescription = (data.description || "No description")
			.replace(/:[a-zA-Z0-9_]+:/g, "")
			.replaceAll('"', "'")
			.replace(/[\n\r\t]/g, " ")
			.trim();

		return {
			description: cleanDescription,
			language: data.language || "Unknown",
			stars: Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(data.stargazers_count).replaceAll("\u202f", ""),
			forks: Intl.NumberFormat("en-us", { notation: "compact", maximumFractionDigits: 1 }).format(data.forks).replaceAll("\u202f", ""),
			license: data.license?.spdx_id || data.license?.name || "None",
			avatar: localAvatar || data.owner?.avatar_url || "",
		};
	} catch (e) {
		console.warn(`  [ERROR] Network error for ${repo}: ${String(e)}`);
		return null;
	}
}

function cleanupOrphanedFiles() {
	console.log("\x1b[33m%s\x1b[0m", ">> Cleaning up orphaned avatars...");
	const allFiles = getFilesRecursive(CONTENT_DIR, [".md", ".mdx"]);
	const existingAssets = fs.readdirSync(SAVE_DIR);
	const usedAssets = new Set<string>();

	for (const file of allFiles) {
		const content = fs.readFileSync(file, "utf-8");
		for (const asset of existingAssets) {
			if (content.includes(asset)) {
				usedAssets.add(asset);
			}
		}
	}

	let deletedCount = 0;
	for (const asset of existingAssets) {
		if (!usedAssets.has(asset)) {
			fs.unlinkSync(path.join(SAVE_DIR, asset));
			console.log(`  [CLEANUP] Deleted orphaned avatar: ${asset}`);
			deletedCount++;
		}
	}
	console.log(`>> Cleanup completed. (${deletedCount} assets removed)`);
}

interface DirectiveNode {
	type: string;
	name: string;
	attributes?: {
		repo?: string;
		description?: string;
		stars?: string;
		avatar?: string;
	};
	position?: {
		start: { offset: number };
		end: { offset: number };
	};
}

async function main() {
	console.log("\x1b[36m%s\x1b[0m", ">> Starting Source-level GitHub Staticization (API Priority)...");
	const files = getFilesRecursive(CONTENT_DIR, [".md", ".mdx"]);
	const processor = unified().use(remarkParse).use(remarkDirective);
	const repoMap = new Map<
		string,
		{
			description: string;
			language: string;
			stars: string;
			forks: string;
			license: string;
			avatar: string;
		}
	>();

	for (const file of files) {
		const rawContent = fs.readFileSync(file, "utf-8");
		const tree = processor.parse(rawContent) as Root;
		const changes: { start: number; end: number; repo: string }[] = [];

		visit(tree, "leafDirective", (node: unknown) => {
			const dNode = node as DirectiveNode;
			if (dNode.name === "github") {
				const repo = dNode.attributes?.repo;
				if (!repo) return;

				// 无论是否已静态化，都将其加入待处理队列，以尝试更新数据
				changes.push({
					start: dNode.position?.start.offset || 0,
					end: dNode.position?.end.offset || 0,
					repo: repo,
				});
			}
		});

		if (changes.length === 0) continue;

		let content = rawContent;
		// 倒序替换
		for (let i = changes.length - 1; i >= 0; i--) {
			const change = changes[i];
			if (!repoMap.has(change.repo)) {
				const data = await fetchRepoData(change.repo);
				if (data) {
					repoMap.set(change.repo, data);
				} else {
					console.warn(`\x1b[33m[WARN]\x1b[0m Skipping GitHub staticization for ${change.repo} after failed retries (Offline or Network Error).`);
				}
			}

			const data = repoMap.get(change.repo);
			if (data) {
				// 仅当成功获取到新数据时，才更新源码
				const staticDirective = `::github{repo="${change.repo}" description="${data.description}" stars="${data.stars}" forks="${data.forks}" license="${data.license}" language="${data.language}" avatar="${data.avatar}"}`;
				content = content.slice(0, change.start) + staticDirective + content.slice(change.end);
			}
		}

		if (content !== rawContent) {
			fs.writeFileSync(file, content);
			console.log(`✅ Updated source: ${file}`);
		}
	}
	console.log("\x1b[32m%s\x1b[0m", ">> GitHub Source Staticization completed.");
	cleanupOrphanedFiles();
}

main().catch(console.error);
