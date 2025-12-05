import { type CollectionEntry, getCollection } from "astro:content";
import { pinningConfig } from "@configs/pinning";
import { relatedPostsConfig } from "@configs/related-posts";
import { seriesConfig } from "@configs/series";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";
import type { BlogPostData } from "@/types/config";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// 自定义排序逻辑
	const sorted = allBlogPosts.sort((a, b) => {
		// 第一优先级：按 order 字段排序（1 > 0 > -1)
		if (pinningConfig.enabled) {
			if (a.data.order !== b.data.order) {
				return b.data.order - a.data.order; // 降序：置顶(1)在前，置底(-1)在后
			}
		}

		// 第二优先级：order 相同时，按发布日期倒序（新文章在前）
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}

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

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: CollectionEntry<"posts">) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: CollectionEntry<"posts">) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

export async function getPostSeries(
	seriesName: string,
): Promise<{ body: string; data: BlogPostData; slug: string }[]> {
	if (!seriesConfig.enabled) {
		return [];
	}
	const posts = (await getCollection("posts", ({ data }) => {
		return (
			(import.meta.env.PROD ? data.draft !== true : true) &&
			data.series === seriesName
		);
	})) as unknown as { body: string; data: BlogPostData; slug: string }[];

	posts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? 1 : -1;
	});

	return posts;
}

export async function getRelatedPosts(
	currentPost: CollectionEntry<"posts">,
	allPosts: CollectionEntry<"posts">[],
	limit: number = relatedPostsConfig.limit,
): Promise<CollectionEntry<"posts">[]> {
	if (!relatedPostsConfig.enabled) {
		return [];
	}

	const relatedPosts: { post: CollectionEntry<"posts">; score: number }[] = [];

	for (const post of allPosts) {
		// Exclude the current post
		if (post.slug === currentPost.slug) {
			continue;
		}

		let score = 0;

		// Score based on shared tags
		const currentPostTags = currentPost.data.tags || [];
		const postTags = post.data.tags || [];
		const sharedTags = currentPostTags.filter((tag: string) =>
			postTags.includes(tag),
		);
		score += sharedTags.length * 2; // Each shared tag gives 2 points

		// Score based on shared category
		if (
			currentPost.data.category &&
			post.data.category &&
			currentPost.data.category === post.data.category
		) {
			score += 5; // Shared category gives 5 points
		}

		if (score > 0) {
			relatedPosts.push({ post, score });
		}
	}

	// Sort by score in descending order, then by published date (newest first)
	relatedPosts.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		return b.post.data.published.getTime() - a.post.data.published.getTime();
	});

	return relatedPosts.slice(0, limit).map((item) => item.post);
}

export async function getBlogStats(): Promise<{
	totalArticles: number;
	totalWords: number;
	totalSeries: number;
	totalTags: number;
	totalCategories: number;
}> {
	const allPosts = await getRawSortedPosts();
	const allTags = await getTagList();
	const allCategories = await getCategoryList();

	const totalArticles = allPosts.length;

	// Correctly calculate totalWords by rendering each post
	let totalWords = 0;
	for (const post of allPosts) {
		const { remarkPluginFrontmatter } = await post.render();
		totalWords += remarkPluginFrontmatter?.words || 0;
	}

	let totalSeries = 0;
	if (seriesConfig.enabled) {
		const uniqueSeries = new Set<string>();
		allPosts.forEach((post) => {
			if (post.data.series) {
				uniqueSeries.add(post.data.series);
			}
		});
		totalSeries = uniqueSeries.size;
	}

	const totalTags = allTags.length;
	const totalCategories = allCategories.length;

	return {
		totalArticles,
		totalWords,
		totalSeries,
		totalTags,
		totalCategories,
	};
}
