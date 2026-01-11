import fs from "node:fs";
import path from "node:path";

export const CONTENT_DIR = "src/content";
export const POSTS_DIR = path.join(CONTENT_DIR, "posts");
export const PUBLIC_DIR = "public";
export const EXTERNAL_ASSETS_DIR = path.join("assets", "external");
export const SAVE_DIR = path.join(PUBLIC_DIR, EXTERNAL_ASSETS_DIR);
export const DIST_DIR = "dist";

export const SUPPORTED_LANGUAGES = ["en", "zh_CN", "zh_TW", "ja", "ko"] as const;

/**
 * 获取允许的外部域名列表
 */
export async function getAllowedDomains(): Promise<string[]> {
	const SITE_DOMAIN = await getSiteDomain();
	return [SITE_DOMAIN, "localhost", "127.0.0.1"];
}

/**
 * 递归获取目录下匹配指定扩展名的文件
 * @param dir 目录路径
 * @param extensions 扩展名列表，例如 ['.html', '.md']
 * @returns 文件完整路径数组
 */
export function getFilesRecursive(dir: string, extensions: string[]): string[] {
	let results: string[] = [];
	if (!fs.existsSync(dir)) return [];

	const list = fs.readdirSync(dir);
	for (const file of list) {
		const fullPath = path.join(dir, file);
		const stat = fs.statSync(fullPath);

		if (stat.isDirectory()) {
			results = results.concat(getFilesRecursive(fullPath, extensions));
		} else {
			if (extensions.some((ext) => file.endsWith(ext))) {
				results.push(fullPath);
			}
		}
	}
	return results;
}

/**
 * 🛠️ 从 astro.config.mjs 提取 site 配置并返回 hostname
 */
export async function getSiteDomain(): Promise<string> {
	try {
		const configPath = path.resolve(process.cwd(), "astro.config.mjs");
		// Use a file URL for dynamic import on Linux/Windows
		const configUrl = `file://${configPath}`;
		const config = await import(configUrl);
		const site = config.default?.site;

		if (!site) {
			console.error("❌ Error: 'site' configuration not found in astro.config.mjs.");
			console.error("   Please add 'site: \"https://your-domain.com\"' to your astro.config.mjs.");
			process.exit(1);
		}

		return new URL(site).hostname;
	} catch (e) {
		console.error("❌ Error: Failed to load astro.config.mjs or parse 'site'.");
		console.error(e);
		process.exit(1);
	}
}

/**
 * 带有重试机制的 fetch
 */
export async function fetchWithRetry(url: string, retries = 5, headers: HeadersInit = {}): Promise<Response | null> {
	for (let i = 0; i < retries; i++) {
		try {
			const response = await fetch(url, { headers });
			if (response.ok) return response;
			if (response.status === 404) return null; // 404 不重试
			if (response.status === 403) {
				// Rate limit hit
				console.warn(`  [RATE LIMIT] Hit limit for ${url}, waiting...`);
				await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
			}
			throw new Error(`HTTP ${response.status}`);
		} catch (e) {
			if (i === retries - 1) throw e;
			const delay = 1000 * 2 ** i; // 指数退避
			console.log(`  [RETRY] ${url} failed, retrying in ${delay}ms...`);
			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
	return null;
}

/**
 * 解析 Markdown 内容中的 Frontmatter
 */
export function parseFrontmatter(content: string): Record<string, string> {
	const match = content.match(/^---[\r\n]+([\s\S]+?)[\r\n]+---/);
	const result: Record<string, string> = {};
	if (!match) return result;

	const yamlContent = match[1];
	const lines = yamlContent.split(/[\r\n]+/);

	for (const line of lines) {
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) continue;
		const key = line.slice(0, colonIdx).trim();
		let val = line.slice(colonIdx + 1).trim();
		if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
			val = val.slice(1, -1);
		}
		result[key] = val;
	}
	return result;
}

/**
 * 清理外部资源目录中未被 Markdown 引用的文件
 */
export function cleanupOrphanedFiles(label = "assets") {
	console.log("\x1b[33m%s\x1b[0m", `>> Cleaning up orphaned ${label}...`);
	if (!fs.existsSync(SAVE_DIR)) return;

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
			console.log(`  [CLEANUP] Deleted orphaned ${label}: ${asset}`);
			deletedCount++;
		}
	}
	console.log(`>> Cleanup completed. (${deletedCount} items removed)`);
}
