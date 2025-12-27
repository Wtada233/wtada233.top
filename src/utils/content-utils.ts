import { type CollectionEntry, getCollection } from "astro:content";
import { pinningConfig } from "@configs/pinning";
import { relatedPostsConfig } from "@configs/related-posts";
import { seriesConfig } from "@configs/series";
import { siteConfig } from "@configs/site";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import getReadingTime from "reading-time";
import type { BlogPostData } from "@/types/config";

/**
 * 获取特定集合的本地化条目
 */
export async function getLocalizedEntry<C extends "spec" | "posts">(collection: C, id: string): Promise<CollectionEntry<C> | undefined> {
	const targetLang = siteConfig.lang;
	const langPart = targetLang.split("_")[0];

	const entries = await getCollection(collection);

	// 优先级排序
	// 1. 匹配 ID + 目标语言后缀 (例如 about.zh_TW.md)
	let selected = entries.find((e) => e.id.startsWith(`${id}.${targetLang}.`) || e.id.startsWith(`${id}.${targetLang}/`));

	// 2. 匹配 ID + 语言前缀后缀 (例如 about.en.md)
	if (!selected) {
		selected = entries.find((e) => e.id.startsWith(`${id}.${langPart}.`) || e.id.startsWith(`${id}.${langPart}/`));
	}

	// 3. 匹配 基础 ID (例如 about.md)
	if (!selected) {
		selected = entries.find((e) => e.id === id || e.id === `${id}.md` || e.id === `${id}/index.md`);
	}

	return selected as CollectionEntry<C>;
}

/**
 * 核心过滤逻辑：根据当前语言选择最合适的文章版本
 */
async function getRawSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	const targetLang = siteConfig.lang;
	const langPart = targetLang.split("_")[0];

	const allPosts = await getCollection("posts");
	const groups = new Map<string, CollectionEntry<"posts">[]>();

	for (const post of allPosts) {
		// 提取基础 ID。去掉语言后缀和扩展名，同时处理 /index
		const baseId = post.id
			.replace(/\.(en|ja|ko|zh_TW|zh_CN)\.md$/, "")
			.replace(/\.md$/, "")
			.replace(/\/index$/, "");

		if (!groups.has(baseId)) groups.set(baseId, []);
		groups.get(baseId)?.push(post);
	}

	const filteredPosts: CollectionEntry<"posts">[] = [];

	for (const [baseId, entries] of groups) {
		// 精确后缀匹配，避免模糊包含导致的错误
		let selected = entries.find((e) => e.id.endsWith(`.${targetLang}.md`));
		if (!selected) selected = entries.find((e) => e.id.endsWith(`.${langPart}.md`));
		if (!selected) selected = entries.find((e) => e.data.lang === targetLang);
		if (!selected) {
			// 找默认文件：不包含任何已知语言后缀的 .md 文件
			selected = entries.find((e) => !e.id.match(/\.(en|ja|ko|zh_TW|zh_CN)\.md$/));
		}
		if (!selected) selected = entries[0];

		if (selected) {
			const entry = { ...selected, slug: baseId };
			if (import.meta.env.PROD ? entry.data.draft !== true : true) {
				filteredPosts.push(entry);
			}
		}
	}

	return filteredPosts.sort((a, b) => {
		if (pinningConfig.enabled && a.data.order !== b.data.order) {
			return b.data.order - a.data.order;
		}
		return new Date(b.data.published).getTime() - new Date(a.data.published).getTime();
	});
}

/**
 * 获取排序后的文章列表（带上下篇信息）
 */
export async function getSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	const sorted = await getRawSortedPosts();
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
	data: CollectionEntry<"posts">["data"];
};

export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();
	return sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));
}

export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getRawSortedPosts();
	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post) => {
		post.data.tags.forEach((tag: string) => {
			countMap[tag] = (countMap[tag] || 0) + 1;
		});
	});
	return Object.keys(countMap)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getRawSortedPosts();
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post) => {
		const categoryName = post.data.category ? post.data.category.trim() : i18n(I18nKey.uncategorized);
		count[categoryName] = (count[categoryName] || 0) + 1;
	});
	return Object.keys(count)
		.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
		.map((c) => ({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		}));
}

export async function getPostSeries(seriesName: string): Promise<{ body: string; data: BlogPostData; slug: string }[]> {
	if (!seriesConfig.enabled) return [];
	const posts = (await getRawSortedPosts()).filter((p) => p.data.series === seriesName) as unknown as { body: string; data: BlogPostData; slug: string }[];
	return posts.sort((a, b) => new Date(a.data.published).getTime() - new Date(b.data.published).getTime());
}

export async function getRelatedPosts(currentPost: CollectionEntry<"posts">, allPosts: CollectionEntry<"posts">[], limit: number = relatedPostsConfig.limit): Promise<CollectionEntry<"posts">[]> {
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

interface BlogStats {
	totalArticles: number;
	totalWords: number;
	totalSeries: number;
	totalTags: number;
	totalCategories: number;
}

let statsCache: BlogStats | null = null;

export async function getBlogStats(): Promise<BlogStats> {
	if (statsCache) return statsCache;
	const allBlogPosts = await getRawSortedPosts();
	let totalArticles = 0;
	let totalWords = 0;
	const uniqueTags = new Set<string>();
	const uniqueCategories = new Set<string>();
	const uniqueSeries = new Set<string>();

	for (const post of allBlogPosts) {
		totalArticles++;
		(post.data.tags || []).forEach((t: string) => {
			uniqueTags.add(t);
		});
		if (post.data.category) uniqueCategories.add(post.data.category);
		if (post.data.series) uniqueSeries.add(post.data.series);
		totalWords += getReadingTime(post.body || "").words || 0;
	}

	statsCache = {
		totalArticles,
		totalWords,
		totalSeries: uniqueSeries.size,
		totalTags: uniqueTags.size,
		totalCategories: uniqueCategories.size,
	};
	return statsCache;
}

export async function getPostCardData(entry: CollectionEntry<"posts">): Promise<{ excerpt: string; wordCount: string; minuteCount: string }> {
	const { remarkPluginFrontmatter } = await entry.render();
	const words = remarkPluginFrontmatter.words;
	const minutes = remarkPluginFrontmatter.minutes;
	return {
		excerpt: remarkPluginFrontmatter.excerpt,
		wordCount: `${words} ${i18n(words === 1 ? I18nKey.wordCount : I18nKey.wordsCount)}`,
		minuteCount: `${minutes} ${i18n(minutes === 1 ? I18nKey.minuteCount : I18nKey.minutesCount)}`,
	};
}
