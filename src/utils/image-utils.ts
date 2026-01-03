import fs from "node:fs";
import path from "node:path";
import { rgbToHue } from "@utils/color-utils";
import type { ImageMetadata } from "astro";
import sharp from "sharp";

export async function resolveImage(src: string, basePath = "/"): Promise<ImageMetadata | undefined> {
	// The glob path here is relative to the project root for consistency.
	// Adjust if images are in a different base directory.
	const files = import.meta.glob<ImageMetadata>("/src/**/*.{jpg,jpeg,png,gif,webp,avif}", { import: "default" });

	const fullPath = path
		.normalize(path.join("/src", basePath, src)) // Ensure path starts from project root for glob matching
		.replace(/\\/g, "/");

	// Check for exact match
	let file = files[fullPath];

	// If exact match not found, try other variations (e.g., if src already includes part of basePath)
	if (!file) {
		// This is a more flexible search, looking for any file that ends with the src path
		const potentialPaths = Object.keys(files).filter((key) => key.endsWith(fullPath));
		if (potentialPaths.length > 0) {
			file = files[potentialPaths[0]];
		}
	}

	if (!file) {
		console.error(`[ERROR] Image file not found by utility: ${fullPath}`);
		return undefined;
	}
	return await file();
}

const hueCache = new Map<string, number | undefined>();

/**
 * 提取图片的主色调 Hue 值
 * @param src 图片路径
 * @param basePath 基础路径
 */
export async function extractHueFromImage(src: string, basePath = "/"): Promise<number | undefined> {
	const cacheKey = `${basePath}:${src}`;
	if (hueCache.has(cacheKey)) {
		return hueCache.get(cacheKey);
	}

	try {
		let absolutePath = "";
		if (src.startsWith("/")) {
			// 公共目录
			absolutePath = path.join(process.cwd(), "public", src);
		} else {
			// 内容目录
			absolutePath = path.join(process.cwd(), "src", basePath, src);
		}

		if (!fs.existsSync(absolutePath)) {
			hueCache.set(cacheKey, undefined);
			return undefined;
		}

		// 使用 sharp 缩小图片到 1x1 像素以获取平均值
		const { data } = await sharp(absolutePath).resize(1, 1).raw().toBuffer({ resolveWithObject: true });

		const r = data[0];
		const g = data[1];
		const b = data[2];

		const hue = rgbToHue(r, g, b);
		hueCache.set(cacheKey, hue);
		return hue;
	} catch (e) {
		console.error(`[Adaptive Theme] Failed to extract color from ${src}:`, e);
		hueCache.set(cacheKey, undefined);
		return undefined;
	}
}
