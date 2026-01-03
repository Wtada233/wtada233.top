import fs from "node:fs";
import path from "node:path";
import { fontConfig } from "@configs/font";
import * as cheerio from "cheerio";
import subsetFont from "subset-font";
import { getFilesRecursive } from "./utils";

const DIST_DIR = "dist";

/**
 * 从 HTML 中提取所有可见文本，自动移除脚本、样式并解码实体
 */
function extractTextFromHtml(html: string): string {
	const $ = cheerio.load(html);
	$("script, style").remove();

	let text = $("body").text();

	// Also extract text from common attributes
	$("[alt], [placeholder], [title]").each((_, el) => {
		text += $(el).attr("alt") || "";
		text += $(el).attr("placeholder") || "";
		text += $(el).attr("title") || "";
	});

	return text;
}

async function main() {
	console.log("\x1b[36m%s\x1b[0m", ">> Starting modern font subsetting (replacement for font-spider)...");

	if (!fontConfig.enable || fontConfig.fonts.length === 0) {
		console.log("Font subsetting disabled or no fonts configured in src/configs/font.ts.");
		return;
	}

	// 1. 收集所有 HTML 中的文字
	const htmlFiles = getFilesRecursive(DIST_DIR, [".html"]);
	if (htmlFiles.length === 0) {
		console.warn(`Dist directory '${DIST_DIR}' not found or contains no HTML files. Did you run build?`);
		return;
	}

	const charSet = new Set<string>();
	// 添加一些基础字符保证渲染（标点、数字等基本需求）
	for (const c of "0123456789.+-:()[]{} ".split("")) {
		charSet.add(c);
	}

	for (const file of htmlFiles) {
		const html = fs.readFileSync(file, "utf-8");
		const text = extractTextFromHtml(html);
		for (const char of text) {
			// 过滤掉不可见字符和空白，保留有意义的字符
			if (char.trim() || char === " ") charSet.add(char);
		}
	}

	const allChars = Array.from(charSet).sort().join("");
	console.log(`Extracted ${charSet.size} unique characters from ${htmlFiles.length} files:`);
	console.log(`\x1b[90m${allChars}\x1b[0m`); // 使用灰色输出详细字符集内容内容

	// 2. 遍历配置进行子集化
	for (const font of fontConfig.fonts) {
		const relativePath = font.src.startsWith("/") ? font.src.slice(1) : font.src;
		const fontPath = path.join(DIST_DIR, relativePath);

		if (!fs.existsSync(fontPath)) {
			console.error(`Font file not found in dist: ${fontPath}`);
			continue;
		}

		console.log(`Processing font: ${font.name} (${fontPath})`);

		try {
			const originalBuffer = fs.readFileSync(fontPath);

			// 执行子集化
			// subset-font 默认会根据输入 buffer 自动识别格式 (TTF/OTF/WOFF)
			// targetFormat 设为 'truetype' 对应 .ttf 格式
			const subsetBuffer = await subsetFont(originalBuffer, allChars, {
				targetFormat: "truetype",
			});

			// 检查压缩效果
			const oldSize = (originalBuffer.length / 1024).toFixed(2);
			const newSize = (subsetBuffer.length / 1024).toFixed(2);

			fs.writeFileSync(fontPath, subsetBuffer);
			console.log(`\x1b[32m  ✔ ${font.name}: ${oldSize}KB -> ${newSize}KB (Reduced by ${((1 - subsetBuffer.length / originalBuffer.length) * 100).toFixed(1)}%)\x1b[0m`);
		} catch (err) {
			console.error(`  ✘ Failed to subset ${font.name}:`, err);
		}
	}

	console.log("\x1b[32m%s\x1b[0m", ">> Font subsetting completed successfully.");
}

main().catch((err) => {
	console.error("Fatal error during font subsetting:", err);
	process.exit(1);
});
