import path from "node:path";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { marked } from "marked";
import { siteConfig } from "@/configs/site";
import { getPostTranslation, getSortedPosts } from "@/utils/content-utils";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/utils/i18n-runtime";
import { resolveImage } from "@/utils/image-utils";
import { getDir, getPostUrlBySlug } from "@/utils/url-utils";

export async function getStaticPaths(): Promise<{ params: { lang: SupportedLanguage } }[]> {
	return SUPPORTED_LANGUAGES.map((lang) => ({ params: { lang } }));
}

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

interface RssItem {
	title: string;
	pubDate: Date;
	description: string;
	link: string;
	content: string;
	customData: string;
}

export async function GET(context: APIContext): Promise<Response> {
	const { lang } = context.params;
	const site = context.site;
	if (!site) {
		throw new Error("Site configuration is missing in astro.config.mjs");
	}
	const currentLang = lang as SupportedLanguage;
	const groupedPosts = await getSortedPosts();

	// Convert internal lang code to standard RSS language code
	const rssLang = currentLang.replace("_", "-").toLowerCase();

	const rssItems: RssItem[] = [];

	for (const post of groupedPosts) {
		// Fallback Logic
		const translation = getPostTranslation(post, currentLang);

		if (!translation) continue;

		const content = typeof translation.body === "string" ? translation.body : String(translation.body || "");
		const cleanedContent = stripInvalidXmlChars(content);
		// marked.parse returns a string or Promise<string>.
		// In simple cases it's a string, but to be safe with future versions we await it.
		let renderedContent = await marked.parse(cleanedContent);

		// Resolve absolute image paths properly with async resolveImage
		const imgRegex = /<img\s+[^>]*src=(["'])([^"']+)\1[^>]*>/gi;
		const matches = Array.from(renderedContent.matchAll(imgRegex));

		const resolvedUrls = new Map<string, string>();
		await Promise.all(
			matches.map(async (match) => {
				const src = match[2];
				if (!src || src.startsWith("http") || src.startsWith("data:")) return;

				try {
					let absoluteUrl = "";
					if (src.startsWith("/")) {
						absoluteUrl = new URL(src, site).href;
					} else {
						// content/posts/ + relative path (e.g. laptop-arch/BA8F...jpg)
						const postDir = path.join("content/posts/", getDir(translation.id));
						const resolved = await resolveImage(src, postDir);
						if (resolved?.src) {
							absoluteUrl = new URL(resolved.src, site).href;
						} else {
							// Fallback to relative path join if resolution fails
							const postPath = getPostUrlBySlug(post.slug, currentLang);
							absoluteUrl = new URL(src, new URL(postPath, site)).href;
						}
					}
					if (absoluteUrl) {
						resolvedUrls.set(src, absoluteUrl);
					}
				} catch (e) {
					console.error(`Failed to resolve image ${src} in post ${post.slug}`, e);
				}
			}),
		);

		// Apply all resolved URLs
		for (const [src, absoluteUrl] of resolvedUrls.entries()) {
			// Replace all occurrences of this specific src
			renderedContent = renderedContent.split(`src="${src}"`).join(`src="${absoluteUrl}"`);
			renderedContent = renderedContent.split(`src='${src}'`).join(`src='${absoluteUrl}'`);
		}

		const itemLink = getPostUrlBySlug(post.slug, currentLang);

		rssItems.push({
			title: translation.data.title,
			pubDate: translation.data.published,
			description: translation.data.description || "",
			link: itemLink,
			content: renderedContent,
			customData: `<guid isPermaLink="true">${new URL(itemLink, site).href}</guid>`,
		});
	}

	rssItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

	return rss({
		title: `${siteConfig.title}`,
		description: siteConfig.description || "No description",
		site: site,
		items: rssItems,
		customData: `<language>${rssLang}</language>`,
	});
}
