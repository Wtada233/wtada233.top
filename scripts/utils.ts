import fs from "node:fs";
import path from "node:path";

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
