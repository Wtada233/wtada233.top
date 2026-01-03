import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { Image, Root } from "mdast";
import remarkDirective from "remark-directive";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { getFilesRecursive, getSiteDomain } from "./utils";

/**
 * 🖼️ 源码级外链图片本地化工具 (AST 稳健版)
 */

const CONTENT_DIR = "src/content";
const PUBLIC_DIR = "public";
const EXTERNAL_IMG_PATH = path.join("assets", "external");
const SAVE_DIR = path.join(PUBLIC_DIR, EXTERNAL_IMG_PATH);

if (!fs.existsSync(SAVE_DIR)) {
	fs.mkdirSync(SAVE_DIR, { recursive: true });
}

async function downloadImage(url: string): Promise<string | null> {
	console.log(`  >> Downloading image: ${url}`);
	try {
		const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		const buffer = await response.arrayBuffer();

		if (buffer.byteLength < 100) {
			console.warn(`  [WARN] Downloaded file too small (${buffer.byteLength} bytes), likely not a valid image: ${url}`);
			return null;
		}

		const contentType = response.headers.get("content-type");

		let ext = path.extname(new URL(url).pathname);
		if (!ext && contentType) {
			if (contentType.includes("image/jpeg")) ext = ".jpg";
			else if (contentType.includes("image/png")) ext = ".png";
			else if (contentType.includes("image/webp")) ext = ".webp";
			else if (contentType.includes("image/gif")) ext = ".gif";
			else if (contentType.includes("image/svg")) ext = ".svg";
		}
		if (!ext) ext = ".webp";

		const hash = crypto.createHash("md5").update(Buffer.from(buffer)).digest("hex");
		const filename = `${hash}${ext}`;
		const savePath = path.join(SAVE_DIR, filename);
		const publicUrl = `/${EXTERNAL_IMG_PATH}/${filename}`;

		if (!fs.existsSync(savePath)) {
			fs.writeFileSync(savePath, Buffer.from(buffer));
		}
		return publicUrl;
	} catch (e) {
		console.warn(`  [WARN] Failed to download ${url}: ${String(e)}`);
		return null;
	}
}

function cleanupOrphanedFiles() {
	console.log("\x1b[33m%s\x1b[0m", ">> Cleaning up orphaned assets...");
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
			console.log(`  [CLEANUP] Deleted orphaned asset: ${asset}`);
			deletedCount++;
		}
	}
	console.log(`>> Cleanup completed. (${deletedCount} assets removed)`);
}

async function main() {
	console.log("\x1b[36m%s\x1b[0m", ">> Starting Source-level Image Localization (AST Mode)...");

	const SITE_DOMAIN = await getSiteDomain();
	const ALLOWED_DOMAINS = [SITE_DOMAIN, "localhost", "127.0.0.1"];

	const files = getFilesRecursive(CONTENT_DIR, [".md", ".mdx"]);
	const processor = unified().use(remarkParse).use(remarkDirective);
	let totalDownloads = 0;

	for (const file of files) {
		const rawContent = fs.readFileSync(file, "utf-8");
		let content = rawContent;

		// 1. Process Frontmatter image field
		const fmMatch = rawContent.match(/^---[\r\n]+([\s\S]+?)[\r\n]+---/);
		if (fmMatch) {
			const lines = fmMatch[1].split(/[\r\n]+/);
			let externalUrl = "";
			for (const line of lines) {
				const colonIdx = line.indexOf(":");
				if (colonIdx === -1) continue;
				const key = line.slice(0, colonIdx).trim();
				if (key === "image") {
					let val = line.slice(colonIdx + 1).trim();
					if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
						val = val.slice(1, -1);
					}
					if (val.startsWith("http")) {
						externalUrl = val;
					}
					break;
				}
			}

			if (externalUrl && !ALLOWED_DOMAINS.some((domain) => externalUrl.includes(domain))) {
				const localPath = await downloadImage(externalUrl);
				if (localPath) {
					content = content.replace(externalUrl, localPath);
					totalDownloads++;
				} else {
					console.warn(`\x1b[33m[WARN]\x1b[0m Skipping localization for Frontmatter image: ${externalUrl} (Offline or Network Error)`);
				}
			}
		}

		// 2. Process Markdown image nodes via AST
		const tree = processor.parse(content) as Root;
		const changes: { start: number; end: number; newUrl: string }[] = [];

		visit(tree, "image", (node: Image) => {
			const url = node.url;
			if (url.startsWith("http") && !ALLOWED_DOMAINS.some((domain) => url.includes(domain))) {
				changes.push({
					start: node.position?.start.offset || 0,
					end: node.position?.end.offset || 0,
					newUrl: url,
				});
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
