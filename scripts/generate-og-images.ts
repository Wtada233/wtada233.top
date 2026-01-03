import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { fontConfig } from "../src/configs/font";
import { siteConfig } from "../src/configs/site";
import { getFilesRecursive } from "./utils";

const POSTS_DIR = "src/content/posts";
const OUTPUT_DIR = "dist/assets/og";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
	fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Load font Path for rendering
const primaryFont = fontConfig.fonts[0];

function parseFrontmatter(content: string) {
	const match = content.match(/^---[\r\n]+([\s\S]+?)[\r\n]+---/);
	const result = { title: "Untitled", image: "", og_theme: "light" };
	if (!match) return result;

	const yamlContent = match[1];
	// More robust field extraction
	const getField = (field: string) => {
		const regex = new RegExp(`^${field}:\\s*(.*)$`, "m");
		const m = yamlContent.match(regex);
		if (!m) return "";
		let val = m[1].trim();
		if ((val.startsWith("'") && val.endsWith("'")) || (val.startsWith('"') && val.endsWith('"'))) {
			val = val.slice(1, -1);
		}
		return val;
	};

	result.title = getField("title") || "Untitled";
	result.image = getField("image");
	result.og_theme = getField("og_theme") || "light";

	return result;
}

function stringToColor(str: string, baseHue: number, isDark = false) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const s = 60 + (Math.abs(hash) % 20);
	const l = isDark ? 15 + (Math.abs(hash >> 2) % 10) : 40 + (Math.abs(hash >> 2) % 20);
	return `hsl(${baseHue}, ${s}%, ${l}%)`;
}

/**
 * 安全地转义用于 Pango Markup 的 XML 字符
 */
function escapePangoMarkup(unsafe: string) {
	return unsafe.replace(/[<>&"']/g, (c) => {
		switch (c) {
			case "<":
				return "&lt;";
			case ">":
				return "&gt;";
			case "&":
				return "&amp;";
			case "'":
				return "&apos;";
			case '"':
				return "&quot;";
		}
		return c;
	});
}

async function generateOgImage(title: string, outputPath: string, isDark = false) {
	const width = 1200;
	const height = 630;
	const hue = siteConfig.themeColor.hue;
	const bgColor = stringToColor(title, hue, isDark);

	// 使用 Hex 颜色以获得 Pango 的最佳兼容性
	const textColor = isDark ? "#E6E6E6" : "#FFFFFF";
	const fontName = primaryFont?.name || "sans-serif";

	// Robust font path resolution
	let fontPath = "";
	if (primaryFont) {
		const relativeSrc = primaryFont.src.startsWith("/") ? primaryFont.src.slice(1) : primaryFont.src;
		fontPath = path.resolve(process.cwd(), "public", relativeSrc);
		if (!fs.existsSync(fontPath)) {
			console.warn(`[WARN] Font not found at ${fontPath}, using system fallback.`);
			fontPath = "";
		}
	}

	// 1. Create Background Layer
	const backgroundSvg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <rect width="100%" height="100%" fill="${isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}"/>
        <circle cx="${width}" cy="0" r="300" fill="rgba(255,255,255,${isDark ? "0.05" : "0.1"})"/>
        <circle cx="0" cy="${height}" r="300" fill="rgba(255,255,255,${isDark ? "0.05" : "0.1"})"/>
    </svg>
    `;

	try {
		// 2. Render Text Layers using Sharp's text input with Pango Markup
		// size 是以 1/1024 磅为单位的，这里设为 70pt
		const titleLayer = await sharp({
			text: {
				text: `<span foreground="${textColor}" size="${70 * 1024}"><b>${escapePangoMarkup(title)}</b></span>`,
				font: fontName,
				fontfile: fontPath,
				width: 1000,
				align: "center",
				rgba: true,
			},
		})
			.png()
			.toBuffer();

		const footerLayer = await sharp({
			text: {
				text: `<span foreground="${textColor}" alpha="70%" size="${28 * 1024}">${escapePangoMarkup(siteConfig.title)}</span>`,
				font: fontName,
				fontfile: fontPath,
				align: "center",
				rgba: true,
			},
		})
			.extend({
				bottom: 60,
				background: { r: 0, g: 0, b: 0, alpha: 0 },
			})
			.png()
			.toBuffer();

		// 3. Composite everything onto the background
		await sharp(Buffer.from(backgroundSvg))
			.composite([
				{ input: titleLayer, gravity: "center" },
				{ input: footerLayer, gravity: "south" },
			])
			.png()
			.toFile(outputPath);
	} catch (e) {
		console.error(`❌ Failed to generate OG for ${title}:`, e);
	}
}

async function main() {
	console.log("\x1b[36m%s\x1b[0m", ">> Starting Optimized OG Image Generation...");
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}
	const files = getFilesRecursive(POSTS_DIR, [".md", ".mdx"]);

	const supportedLangs = ["en", "zh_CN", "zh_TW", "ja", "ko"];
	const defaultLang = siteConfig.lang;

	let count = 0;

	for (const file of files) {
		const content = fs.readFileSync(file, "utf-8");
		const { title, image, og_theme } = parseFrontmatter(content);

		const relativePath = path.relative(POSTS_DIR, file);
		const parsed = path.parse(relativePath);

		let slug = parsed.dir ? `${parsed.dir}/${parsed.name}` : parsed.name;
		let lang = defaultLang;

		for (const l of supportedLangs) {
			if (slug.endsWith(`.${l}`)) {
				slug = slug.substring(0, slug.length - l.length - 1);
				lang = l;
				break;
			}
		}

		if (slug.endsWith("/index")) slug = slug.substring(0, slug.length - 6);
		else if (slug === "index") slug = "";

		const safeSlug = slug.replace(/\//g, "_") || "home";
		const isDark = og_theme === "dark";
		const filename = `${safeSlug}_${lang}${isDark ? "_dark" : ""}.png`;
		const outputPath = path.join(OUTPUT_DIR, filename);

		// Generate if image is missing in frontmatter
		if (!image) {
			await generateOgImage(title, outputPath, isDark);
			count++;
		}
	}
	console.log("\x1b[32m%s\x1b[0m", `>> OG Image Generation completed. (${count} images)`);
}

main();
