import path from "node:path";
import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { resolveImage } from "@utils/image-utils";
import { getDir, url } from "@utils/url-utils";
import type { APIContext } from "astro";
import * as cheerio from "cheerio";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

export async function GET(context: APIContext): Promise<Response> {
	const blog = await getSortedPosts();

	const items = await Promise.all(
		blog.map(async (post) => {
			const content = typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			const renderedContent = parser.render(cleanedContent);

			const $ = cheerio.load(renderedContent);

			const imagePromises = $("img")
				.get()
				.map(async (el) => {
					const src = $(el).attr("src");
					if (!src || src.startsWith("http") || src.startsWith("data:")) {
						return;
					}

					let absoluteUrl = "";
					try {
						if (src.startsWith("/")) {
							// Public folder image
							absoluteUrl = new URL(src, context.site ?? "https://wtada233.top").href;
						} else {
							// Relative image in content collection
							const postDir = path.join("content/posts/", getDir(post.id));
							const resolved = await resolveImage(src, postDir);

							if (resolved?.src) {
								absoluteUrl = new URL(resolved.src, context.site ?? "https://wtada233.top").href;
							} else {
								// Fallback
								const postPath = url(`/posts/${post.slug}/`);
								absoluteUrl = new URL(src, new URL(postPath, context.site ?? "https://wtada233.top")).href;
							}
						}

						if (absoluteUrl) {
							$(el).attr("src", absoluteUrl);
						}
					} catch (e) {
						console.error(`Failed to resolve image ${src} in post ${post.slug}`, e);
					}
				});

			await Promise.all(imagePromises);

			const finalHtml = $.html();

			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: url(`/posts/${post.slug}/`),
				content: sanitizeHtml(finalHtml, {
					allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
				}),
			};
		}),
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: context.site ?? "https://wtada233.top",
		items: items,
		customData: `<language>${siteConfig.lang}</language>`,
	});
}
