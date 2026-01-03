import { searchConfig } from "@configs/search";
import { getPostTranslation, getSortedPosts } from "@utils/content-utils";
import { SUPPORTED_LANGUAGES } from "@utils/i18n-runtime";
import type { APIRoute } from "astro";
import { fromMarkdown } from "mdast-util-from-markdown";
// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";

export const GET: APIRoute = async () => {
	const posts = await getSortedPosts();

	const indexData = posts.map((post) => {
		const translations: Record<string, { title: string; category: string; tags: string[]; content: string; series: string; description: string }> = {};

		for (const lang of SUPPORTED_LANGUAGES) {
			const trans = getPostTranslation(post, lang);
			if (trans) {
				// Clean body content for indexing using MDAST utilities
				let bodyContent = "";
				if (searchConfig.indexContent) {
					const tree = fromMarkdown(trans.body);
					bodyContent = toString(tree);
					if (searchConfig.indexMaxChars > 0 && bodyContent.length > searchConfig.indexMaxChars) {
						bodyContent = bodyContent.substring(0, searchConfig.indexMaxChars);
					}
				}

				let searchContent = "";
				if (searchConfig.indexTags && trans.data.tags && trans.data.tags.length > 0) searchContent += `${trans.data.tags.join(" ")} `;
				if (searchConfig.indexCategories && trans.data.category) searchContent += `${trans.data.category} `;
				if (searchConfig.indexSeries && trans.data.series) searchContent += `${trans.data.series} `;
				if (searchConfig.indexDescription && trans.data.description) searchContent += `${trans.data.description} `;
				if (searchConfig.indexContent) searchContent += `${bodyContent} `;

				translations[lang] = {
					title: trans.data.title,
					category: trans.data.category || "",
					tags: trans.data.tags || [],
					series: trans.data.series || "",
					description: trans.data.description || "",
					content: searchContent.trim(),
				};
			}
		}

		return {
			slug: post.slug,
			image: post.data.image,
			published: post.data.published,
			translations,
		};
	});

	return new Response(JSON.stringify(indexData), {
		headers: {
			"Content-Type": "application/json",
		},
	});
};
