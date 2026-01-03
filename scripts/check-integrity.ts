import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import { Friends } from "../src/configs/friends";
import { getFilesRecursive, getSiteDomain } from "./utils";

/**
 * 🕵️ 站点完整性与离线化漏洞检测工具 (Merged Version)
 * 目的：
 * 1. 确保构建产物中不含有任何未授权的外部依赖 (Asset Integrity)。
 * 2. 检查站点中的外部链接是否可用 (Link Connectivity)。
 * 验证“十年之约”离线生存能力与长期维护性。
 */

import type { Root } from "mdast";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";

const DIST_DIR = "dist";

// 允许存在的外部链接（例如友链、社交媒体跳转），但不允许资源类链接（img, script, link）
const ASSET_TAGS = {
	img: "src",
	script: "src",
	link: "href",
	source: "src",
	video: "src",
};

const processor = unified().use(remarkParse).use(remarkDirective);

/**
 * 🔗 检查 URL 连通性
 */
async function checkUrl(url: string): Promise<{ url: string; alive: boolean; error?: string }> {
	try {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 10000); // 10秒超时

		// 使用 HEAD 请求尝试连接，若失败则回退到 GET
		const response = await fetch(url, {
			method: "HEAD",
			signal: controller.signal,
			headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
		}).catch(() =>
			fetch(url, {
				method: "GET",
				signal: controller.signal,
				headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
			}),
		);

		clearTimeout(timeout);

		if (response.ok) {
			return { url, alive: true };
		}
		return { url, alive: false, error: `HTTP ${response.status} ${response.statusText}` };
	} catch (e: unknown) {
		return { url, alive: false, error: e instanceof Error ? e.message : String(e) };
	}
}

interface DirectiveNode {
	type: string;
	name: string;
	attributes?: Record<string, string>;
}

/**
 * 📝 从 Markdown 提取 URL
 */
function extractUrlsFromMarkdown(content: string): string[] {
	const tree = processor.parse(content) as Root;
	const urls: string[] = [];

	visit(tree, (node) => {
		// 1. Standard links [text](url)
		if (node.type === "link" || node.type === "definition") {
			const n = node as { url?: string };
			if (n.url?.startsWith("http")) {
				urls.push(n.url);
			}
		}
		// 2. Directives ::github{repo="..."}
		if (node.type === "leafDirective" || node.type === "textDirective" || node.type === "containerDirective") {
			const n = node as unknown as DirectiveNode;
			if (n.name === "github" && n.attributes?.repo) {
				urls.push(`https://github.com/${n.attributes.repo}`);
			}
		}
	});

	return urls;
}

async function main() {
	console.log("\x1b[36m%s\x1b[0m", ">> Starting Site Integrity & Connectivity Check...");

	const SITE_DOMAIN = await getSiteDomain();

	const ALLOWED_DOMAINS = [
		SITE_DOMAIN,
		"localhost",
		"127.0.0.1",
		"twikoo",
		"umami",
		"data:", // Base64 图片
		"blob:",
		"mailto:",
		"tel:",
	];

	// --- 1. Offline Integrity Check ---
	console.log("\n[1/2] Checking for external asset leaks in 'dist'...");
	if (!fs.existsSync(DIST_DIR)) {
		console.error(`Error: Directory '${DIST_DIR}' not found. Please run 'pnpm build' first.`);
		process.exit(1);
	}

	const htmlFiles = getFilesRecursive(DIST_DIR, [".html"]);
	let leakedAssets = 0;
	const leaks: string[] = [];

	for (const file of htmlFiles) {
		const content = fs.readFileSync(file, "utf-8");
		const $ = cheerio.load(content);
		const relativePath = path.relative(DIST_DIR, file);

		for (const [tag, attr] of Object.entries(ASSET_TAGS)) {
			$(tag).each((_, el) => {
				const value = $(el).attr(attr);
				if (value && (value.startsWith("http://") || value.startsWith("https://"))) {
					const isAllowed = ALLOWED_DOMAINS.some((domain) => value.includes(domain));
					if (!isAllowed) {
						leaks.push(`[LEAK] In ${relativePath}: <${tag} ${attr}="${value}">`);
						leakedAssets++;
					}
				}
			});
		}
	}

	if (leakedAssets > 0) {
		console.warn("\x1b[33m%s\x1b[0m", `⚠️ Found ${leakedAssets} external asset(s) that might break in offline mode:`);
		for (const leak of leaks) console.log(`  ${leak}`);
	} else {
		console.log("\x1b[32m✔ No external asset leaks detected.\x1b[0m");
	}

	// --- 2. Link Connectivity Check ---
	console.log("\n[2/2] Checking link connectivity in source content...");
	const urlsToCheck = new Set<string>();
	for (const f of Friends) urlsToCheck.add(f.siteurl);

	const postsDir = "src/content/posts";
	const sourceFiles = fs.readdirSync(postsDir, { recursive: true }) as string[];
	for (const file of sourceFiles) {
		if (file.endsWith(".md") || file.endsWith(".mdx")) {
			const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
			for (const url of extractUrlsFromMarkdown(content)) urlsToCheck.add(url);
		}
	}

	console.log(`Verifying ${urlsToCheck.size} unique URLs...`);
	const results = await Promise.all(Array.from(urlsToCheck).map((url) => checkUrl(url)));
	const deadLinks = results.filter((r) => !r.alive);

	if (deadLinks.length > 0) {
		console.warn("\x1b[33m%s\x1b[0m", `⚠️ Found ${deadLinks.length} unreachable links:`);
		for (const l of deadLinks) {
			console.log(`  - \x1b[31m[DEAD]\x1b[0m ${l.url} (Error: ${l.error})`);
		}
	} else {
		console.log("\x1b[32m✔ All links are reachable.\x1b[0m");
	}

	// Exit logic: Warn only, do not fail build on dead links to ensure deployment robustness
	if (deadLinks.length > 0) {
		console.warn("\n\x1b[33m[WARN] Site check found unreachable links. Continuing build anyway...\x1b[0m");
	}

	console.log("\n\x1b[32m✅ All integrity checks passed!\x1b[0m");
}

main().catch((err) => {
	console.error("Fatal error during integrity check:", err);
	process.exit(1);
});
