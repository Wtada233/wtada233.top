import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { HTML, Image, Root } from "mdast";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import sharp from "sharp";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { CONTENT_DIR, cleanupOrphanedFiles, EXTERNAL_ASSETS_DIR, getAllowedDomains, getFilesRecursive, parseFrontmatter, SAVE_DIR } from "./utils";

/**
 * 🖼️ 源码级外链图片本地化工具 (AST 稳健版)
 */

if (!fs.existsSync(SAVE_DIR)) {
	fs.mkdirSync(SAVE_DIR, { recursive: true });
}

async function downloadImage(url: string): Promise<string | null> {
	console.log(`  >> Downloading image: ${url}`);
	try {
		const response = await fetchWithRetry(url, 3, { "User-Agent": "Mozilla/5.0" });
		if (!response || !response.ok) throw new Error(`HTTP ${response?.status || "Unknown"}`);
		const buffer = await response.arrayBuffer();

		if (buffer.byteLength < 100) {
			console.warn(`  [WARN] Downloaded file too small (${buffer.byteLength} bytes), likely not a valid image: ${url}`);
			return null;
		}

		const contentType = response.headers.get("content-type");
		let ext = "";

		try {
			const metadata = await sharp(Buffer.from(buffer)).metadata();
			ext = `.${metadata.format}`;
		} catch {
			// Fallback to URL/Header detection
			ext = path.extname(new URL(url).pathname);
			if (!ext && contentType) {
				if (contentType.includes("image/jpeg")) ext = ".jpg";
				else if (contentType.includes("image/png")) ext = ".png";
				else if (contentType.includes("image/webp")) ext = ".webp";
				else if (contentType.includes("image/gif")) ext = ".gif";
				else if (contentType.includes("image/svg")) ext = ".svg";
			}
		}

		if (!ext || ext === ".undefined") ext = ".webp";

		const hash = crypto.createHash("md5").update(Buffer.from(buffer)).digest("hex");
		const filename = `${hash}${ext}`;
		const savePath = path.join(SAVE_DIR, filename);
		const publicUrl = `/${EXTERNAL_ASSETS_DIR}/${filename}`;

		if (!fs.existsSync(savePath)) {
			fs.writeFileSync(savePath, Buffer.from(buffer));
		}
		return publicUrl;
	} catch (e) {
		console.warn(`  [WARN] Failed to download ${url}: ${String(e)}`);
		return null;
	}
}

async function main() {
	console.log("\x1b[36m%s\x1b[0m", ">> Starting Source-level Image Localization (AST Mode)...");

	const ALLOWED_DOMAINS = await getAllowedDomains();

	const files = getFilesRecursive(CONTENT_DIR, [".md", ".mdx"]);
	const processor = unified().use(remarkParse).use(remarkDirective);
	let totalDownloads = 0;

	for (const file of files) {
		const rawContent = fs.readFileSync(file, "utf-8");
		let content = rawContent;

		// 1. Process Frontmatter image field
		const frontmatter = parseFrontmatter(rawContent);
		const externalUrl = frontmatter.image;

		if (externalUrl?.startsWith("http") && !ALLOWED_DOMAINS.some((domain) => externalUrl.includes(domain))) {
			const localPath = await downloadImage(externalUrl);
			if (localPath) {
				content = content.replace(externalUrl, localPath);
				totalDownloads++;
			} else {
				console.warn(`\x1b[33m[WARN]\x1b[0m Skipping localization for Frontmatter image: ${externalUrl} (Offline or Network Error)`);
			}
		}

		// 2. Process Markdown image nodes & HTML img tags via AST
		const tree = processor.parse(content) as Root;
		const changes: { start: number; end: number; newUrl: string }[] = [];

		visit(tree, (node) => {
			if (node.type === "image") {
				const n = node as Image;
				if (n.url.startsWith("http") && !ALLOWED_DOMAINS.some((domain) => n.url.includes(domain))) {
					changes.push({
						start: node.position?.start.offset || 0,
						end: node.position?.end.offset || 0,
						newUrl: n.url,
					});
				}
			} else if (node.type === "html") {
				const n = node as HTML;
				const imgRegex = /<img\s+[^>]*src=(["'])([^"']+)\1[^>]*>/gi;
				let match = imgRegex.exec(n.value);
				while (match !== null) {
					const url = match[2];
					if (url.startsWith("http") && !ALLOWED_DOMAINS.some((domain) => url.includes(domain))) {
						const startOffset = (node.position?.start.offset || 0) + match.index;
						changes.push({
							start: startOffset,
							end: startOffset + match[0].length,
							newUrl: url,
						});
					}
					match = imgRegex.exec(n.value);
				}
			}
		});

		if (changes.length > 0) {
			// 倒序替换以保证偏移量有效
			for (let i = changes.length - 1; i >= 0; i--) {
				const change = changes[i];
				const localPath = await downloadImage(change.newUrl);
				if (localPath) {
					const originalText = content.slice(change.start, change.end);
					const newText = originalText.replace(change.newUrl, localPath);
					content = content.slice(0, change.start) + newText + content.slice(change.end);
					totalDownloads++;
				} else {
					console.warn(`\x1b[33m[WARN]\x1b[0m Skipping localization for image: ${change.newUrl} in ${file}`);
				}
			}
		}

		if (content !== rawContent) {
			fs.writeFileSync(file, content);
			console.log(`✅ Updated source: ${file}`);
		}
	}
	console.log("\x1b[32m%s\x1b[0m", `>> Source Localization completed. (${totalDownloads} images processed)`);
	cleanupOrphanedFiles();
}

main().catch(console.error);
