import { type CollectionEntry, getCollection } from "astro:content";
import { pinningConfig } from "@configs/pinning";
import { relatedPostsConfig } from "@configs/related-posts";
import { seriesConfig } from "@configs/series";
import { siteConfig } from "@configs/site";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@utils/i18n-runtime";
import { getCategoryUrl } from "@utils/url-utils";
import { countWords } from "./word-count";

export type GroupedPost = {
	slug: string;
	translations: Partial<Record<SupportedLanguage, CollectionEntry<"posts">>>;
	data: CollectionEntry<"posts">["data"]; // Representative data (usually default lang)
};

/**
 * 获取特定集合的本地化条目
 */
export async function getLocalizedEntry<C extends "spec" | "posts">(collection: C, id: string): Promise<CollectionEntry<C> | undefined> {
	const targetLang = siteConfig.lang;
	const langPart = targetLang.split("_")[0];

	const entries = await getCollection(collection);

	// 优先级排序
	// 1. 匹配 ID + 目标语言后缀 (例如 about.zh_TW.md)
	let selected = entries.find((e: CollectionEntry<C>) => e.id.startsWith(`${id}.${targetLang}.`) || e.id.startsWith(`${id}.${targetLang}/`));

	// 2. 匹配 ID + 语言前缀后缀 (例如 about.en.md)
	if (!selected) {
		selected = entries.find((e: CollectionEntry<C>) => e.id.startsWith(`${id}.${langPart}.`) || e.id.startsWith(`${id}.${langPart}/`));
	}

	// 3. 匹配 基础 ID (例如 about.md)
	if (!selected) {
		selected = entries.find((e: CollectionEntry<C>) => e.id === id || e.id === `${id}.md` || e.id === `${id}/index.md`);
	}

	return selected as CollectionEntry<C>;
}

/**
 * 核心逻辑：按基础 ID 分组所有文章
 */
export async function getGroupedPosts(): Promise<GroupedPost[]> {
	const allPosts = await getCollection("posts");
	const groups = new Map<string, GroupedPost>();

	for (const post of allPosts) {
		let baseId = post.id;
		if (baseId.endsWith(".md")) baseId = baseId.slice(0, -3);
		for (const l of SUPPORTED_LANGUAGES) {
			if (baseId.endsWith(`.${l}`)) {
				baseId = baseId.slice(0, -(l.length + 1));
				break;
			}
		}
		if (baseId.endsWith("/index")) baseId = baseId.slice(0, -6);

		if (!groups.has(baseId)) {
			groups.set(baseId, {
				slug: baseId,
				translations: {},
				data: post.data, // Initial assignment
			});
		}

		const group = groups.get(baseId);
		if (!group) continue;
		let lang = siteConfig.lang as SupportedLanguage;

		// Map language code from file suffix
		for (const l of SUPPORTED_LANGUAGES) {
			if (post.id.endsWith(`.${l}.md`) || post.id.includes(`.${l}/`)) {
				lang = l as SupportedLanguage;
				break;
			}
		}

		group.translations[lang] = post;
	}

	const result = Array.from(groups.values()).filter((group) => {
		// Pick the most appropriate data for the group
		const defaultLang = siteConfig.lang as SupportedLanguage;
		const representative = group.translations[defaultLang] || Object.values(group.translations)[0];
		if (representative) {
			// CRITICAL: Shallow copy the data to avoid modifying the original entry in memory
			group.data = { ...representative.data };
		}
		return import.meta.env.PROD ? group.data.draft !== true : true;
	});

	return result.sort((a, b) => {
		if (pinningConfig.enabled && a.data.order !== b.data.order) {
			return b.data.order - a.data.order;
		}
		const dateA = new Date(a.data.published).getTime();
		const dateB = new Date(b.data.published).getTime();
		if (dateA !== dateB) return dateB - dateA;
		return a.slug.localeCompare(b.slug); // Stable sort fallback
	});
}

/**
 * 获取排序后的文章列表（带上下篇信息）
 */
export async function getSortedPosts(): Promise<GroupedPost[]> {
	const grouped = await getGroupedPosts();
	// Create deep copy of the structure to be safe during linking
	const sorted = grouped.map((p) => ({
		...p,
		data: { ...p.data },
	}));

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}
	return sorted;
}

export type PostForList = {
	slug: string;
	data: {
		published: Date;
	};
	translations: Partial<Record<SupportedLanguage, { data: CollectionEntry<"posts">["data"] }>>;
};

export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getGroupedPosts();
	return sortedFullPosts.map((post) => {
		const translations: PostForList["translations"] = {};
		for (const [lang, entry] of Object.entries(post.translations)) {
			translations[lang as SupportedLanguage] = {
				data: entry.data,
			};
		}
		return {
			slug: post.slug,
			data: {
				published: post.data.published,
			},
			translations,
		};
	});
}

/**
 * 获取文章的特定语言翻译，如果不存在则回退到默认语言或第一个可用语言
 */
export function getPostTranslation<T extends GroupedPost | PostForList>(post: T, lang: string): T extends GroupedPost ? CollectionEntry<"posts"> : { data: CollectionEntry<"posts">["data"] } {
	if (!post || !post.translations) {
		throw new Error("getPostTranslation: Invalid post object provided");
	}
	const defaultLang = siteConfig.lang as SupportedLanguage;
	const trans = post.translations[lang as SupportedLanguage] || post.translations[defaultLang] || Object.values(post.translations)[0];
	return trans as T extends GroupedPost ? CollectionEntry<"posts"> : { data: CollectionEntry<"posts">["data"] };
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Record<SupportedLanguage, Tag[]>> {
	const allGroups = await getGroupedPosts();
	const result = {} as Record<SupportedLanguage, Tag[]>;
	const defaultLang = siteConfig.lang as SupportedLanguage;

	for (const lang of SUPPORTED_LANGUAGES) {
		const countMap: { [key: string]: number } = {};
		for (const group of allGroups) {
			const trans = group.translations[lang] || group.translations[defaultLang] || Object.values(group.translations)[0];
			if (trans) {
				for (const tag of trans.data.tags || []) {
					countMap[tag] = (countMap[tag] || 0) + 1;
				}
			}
		}
		result[lang] = Object.keys(countMap)
			.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
			.map((key) => ({ name: key, count: countMap[key] }));
	}
	return result;
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Record<SupportedLanguage, Category[]>> {
	const allGroups = await getGroupedPosts();
	const result = {} as Record<SupportedLanguage, Category[]>;
	const defaultLang = siteConfig.lang as SupportedLanguage;

	for (const lang of SUPPORTED_LANGUAGES) {
		const count: { [key: string]: number } = {};
		for (const group of allGroups) {
			const trans = group.translations[lang] || group.translations[defaultLang] || Object.values(group.translations)[0];
			if (trans) {
				const categoryName = trans.data.category ? trans.data.category.trim() : i18n(I18nKey.uncategorized, {}, lang);
				count[categoryName] = (count[categoryName] || 0) + 1;
			}
		}
		result[lang] = Object.keys(count)
			.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
			.map((c) => ({
				name: c,
				count: count[c],
				url: getCategoryUrl(c, lang),
			}));
	}
	return result;
}

export async function getPostSeries(seriesName: string): Promise<GroupedPost[]> {
	if (!seriesConfig.enabled) return [];
	const defaultLang = siteConfig.lang as SupportedLanguage;
	const posts = (await getGroupedPosts()).filter((p) => {
		const trans = p.translations[defaultLang] || Object.values(p.translations)[0];
		return p.data.series === seriesName || trans?.data.series === seriesName;
	});
	return posts.sort((a, b) => new Date(a.data.published).getTime() - new Date(b.data.published).getTime());
}

export async function getRelatedPosts(currentPost: GroupedPost, allPosts: GroupedPost[], limit: number = relatedPostsConfig.limit): Promise<GroupedPost[]> {
	if (!relatedPostsConfig.enabled) return [];
	const related = allPosts
		.filter((p) => p.slug !== currentPost.slug)
		.map((post) => {
			let score = 0;
			const sharedTags = (currentPost.data.tags || []).filter((t: string) => (post.data.tags || []).includes(t));
			score += sharedTags.length * 2;
			if (currentPost.data.category && post.data.category && currentPost.data.category === post.data.category) score += 5;
			return { post, score };
		})
		.filter((item) => item.score > 0)
		.sort((a, b) => b.score - a.score || b.post.data.published.getTime() - a.post.data.published.getTime());
	return related.slice(0, limit).map((i) => i.post);
}

interface LanguageStats {
	totalArticles: number;
	totalWords: number;
	totalSeries: number;
	totalTags: number;
	totalCategories: number;
}

interface BlogStats {
	[lang: string]: LanguageStats;
}

let statsCache: BlogStats | null = null;

export async function getBlogStats(): Promise<BlogStats> {
	if (statsCache) return statsCache;
	const groupedPosts = await getGroupedPosts();
	const stats: BlogStats = {};
	const defaultLang = siteConfig.lang as SupportedLanguage;

	for (const lang of SUPPORTED_LANGUAGES) {
		let totalArticles = 0;
		let totalWords = 0;
		const uniqueTags = new Set<string>();
		const uniqueCategories = new Set<string>();
		const uniqueSeries = new Set<string>();

		for (const group of groupedPosts) {
			const post = group.translations[lang] || group.translations[defaultLang] || Object.values(group.translations)[0];
			if (post) {
				totalArticles++;
				for (const t of post.data.tags || []) {
					uniqueTags.add(t);
				}
				if (post.data.category) uniqueCategories.add(post.data.category);
				if (post.data.series) uniqueSeries.add(post.data.series);
				totalWords += countWords(post.body || "");
			}
		}

		stats[lang] = {
			totalArticles,
			totalWords,
			totalSeries: uniqueSeries.size,
			totalTags: uniqueTags.size,
			totalCategories: uniqueCategories.size,
		};
	}

	statsCache = stats;
	return statsCache;
}

export async function getPostCardData(entry: CollectionEntry<"posts">, lang?: string): Promise<{ excerpt: string; wordCount: string; minuteCount: string }> {
	const { remarkPluginFrontmatter } = await entry.render();
	const words = remarkPluginFrontmatter.words;
	const minutes = remarkPluginFrontmatter.minutes;
	return {
		excerpt: remarkPluginFrontmatter.excerpt,
		wordCount: `${words} ${i18n(words === 1 ? I18nKey.wordCount : I18nKey.wordsCount, {}, lang)}`,
		minuteCount: `${minutes} ${i18n(minutes === 1 ? I18nKey.minuteCount : I18nKey.minutesCount, {}, lang)}`,
	};
}
