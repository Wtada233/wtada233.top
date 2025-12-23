<script lang="ts">
import { onMount } from "svelte";

import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getPostUrlBySlug } from "../utils/url-utils";

export let sortedPosts: Post[] = [];

let tags: string[] = [];
let categories: string[] = [];
let series: string[] = [];
let uncategorized: string | null = null;

function updateFiltersFromURL() {
	if (typeof window === "undefined") return;
	const params = new URLSearchParams(window.location.search);
	tags = params.has("tag") ? params.getAll("tag") : [];
	categories = params.has("category") ? params.getAll("category") : [];
	series = params.has("series") ? params.getAll("series") : [];
	uncategorized = params.get("uncategorized");
}

onMount(() => {
	// Initial load
	updateFiltersFromURL();
});

interface Post {
	slug: string;
	data: {
		title: string;
		tags: string[];
		category?: string;
		series?: string;
		published: Date;
	};
}

interface Group {
	year: number;
	posts: Post[];
}

interface TitledGroup {
	title: string;
	posts: Post[];
}

type ViewMode = "time" | "series" | "category" | "tags";
let currentView: ViewMode = "time";

let groups: Group[] = [];
let seriesGroups: TitledGroup[] = [];
let categoryGroups: TitledGroup[] = [];
let tagGroups: TitledGroup[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	return tagList.map((t) => `#${t}`).join(" ");
}

$: {
	let filteredPosts: Post[] = sortedPosts;

	if (tags.length > 0) {
		filteredPosts = filteredPosts.filter((post) => Array.isArray(post.data.tags) && post.data.tags.some((tag) => tags.includes(tag)));
	}

	if (categories.length > 0) {
		filteredPosts = filteredPosts.filter((post) => post.data.category && categories.includes(post.data.category));
	}

	if (series.length > 0) {
		filteredPosts = filteredPosts.filter((post) => post.data.series && series.includes(post.data.series));
	}

	if (uncategorized) {
		filteredPosts = filteredPosts.filter((post) => !post.data.category);
	}

	// Time grouping
	const groupedByYear = filteredPosts.reduce(
		(acc, post) => {
			const year = post.data.published.getFullYear();
			if (!acc[year]) {
				acc[year] = [];
			}
			acc[year].push(post);
			return acc;
		},
		{} as Record<number, Post[]>,
	);

	const groupedPostsArray = Object.keys(groupedByYear).map((yearStr) => ({
		year: Number.parseInt(yearStr, 10),
		posts: groupedByYear[Number.parseInt(yearStr, 10)],
	}));

	groupedPostsArray.sort((a, b) => b.year - a.year);
	groups = groupedPostsArray;

	// Series grouping
	const groupedBySeries = filteredPosts.reduce(
		(acc, post) => {
			const seriesName = post.data.series || i18n(I18nKey.noSeries);
			if (!acc[seriesName]) {
				acc[seriesName] = [];
			}
			acc[seriesName].push(post);
			return acc;
		},
		{} as Record<string, Post[]>,
	);
	seriesGroups = Object.keys(groupedBySeries)
		.map((seriesName) => ({
			title: seriesName,
			posts: groupedBySeries[seriesName],
		}))
		.sort((a, b) => {
			if (a.title === i18n(I18nKey.noSeries)) return 1;
			if (b.title === i18n(I18nKey.noSeries)) return -1;
			return a.title.localeCompare(b.title);
		});

	// Category grouping
	const groupedByCategory = filteredPosts.reduce(
		(acc, post) => {
			const categoryName = post.data.category || i18n(I18nKey.uncategorized);
			if (!acc[categoryName]) {
				acc[categoryName] = [];
			}
			acc[categoryName].push(post);
			return acc;
		},
		{} as Record<string, Post[]>,
	);
	categoryGroups = Object.keys(groupedByCategory)
		.map((categoryName) => ({
			title: categoryName,
			posts: groupedByCategory[categoryName],
		}))
		.sort((a, b) => {
			if (a.title === i18n(I18nKey.uncategorized)) return 1;
			if (b.title === i18n(I18nKey.uncategorized)) return -1;
			return a.title.localeCompare(b.title);
		});

	// Tag grouping
	const groupedByTag = filteredPosts.reduce(
		(acc, post) => {
			if (post.data.tags && post.data.tags.length > 0) {
				post.data.tags.forEach((tagName) => {
					if (!acc[tagName]) {
						acc[tagName] = [];
					}
					acc[tagName].push(post);
				});
			} else {
				const noTagsKey = i18n(I18nKey.noTags);
				if (!acc[noTagsKey]) {
					acc[noTagsKey] = [];
				}
				acc[noTagsKey].push(post);
			}
			return acc;
		},
		{} as Record<string, Post[]>,
	);
	tagGroups = Object.keys(groupedByTag)
		.map((tagName) => ({
			title: tagName,
			posts: groupedByTag[tagName],
		}))
		.sort((a, b) => {
			if (a.title === i18n(I18nKey.noTags)) return 1;
			if (b.title === i18n(I18nKey.noTags)) return -1;
			return a.title.localeCompare(b.title);
		});
}
</script>

<div class="card-base px-8 py-6">
	<div class="flex justify-center flex-wrap gap-2 mb-8">
		<button
			class="btn-regular h-9 px-4 rounded-lg text-sm"
			class:active={currentView === "time"}
			on:click={() => (currentView = "time")}>{i18n(I18nKey.byTime)}</button
		>
		<button
			class="btn-regular h-9 px-4 rounded-lg text-sm"
			class:active={currentView === "series"}
			on:click={() => (currentView = "series")}>{i18n(I18nKey.bySeries)}</button
		>
		<button
			class="btn-regular h-9 px-4 rounded-lg text-sm"
			class:active={currentView === "category"}
			on:click={() => (currentView = "category")}>{i18n(I18nKey.byCategory)}</button
		>
		<button
			class="btn-regular h-9 px-4 rounded-lg text-sm"
			class:active={currentView === "tags"}
			on:click={() => (currentView = "tags")}>{i18n(I18nKey.byTag)}</button
		>
	</div>

	{#if currentView === "time"}
		{#each groups as group}
			<div>
				<div class="flex flex-row w-full items-center h-[3.75rem]">
					<div
						class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75"
					>
						{group.year}
					</div>
					<div class="w-[15%] md:w-[10%]">
						<div
							class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
                  -outline-offset-[2px] z-50 outline-3"
						></div>
					</div>
					<div class="w-[70%] md:w-[80%] transition text-left text-50">
						{group.posts.length}
						{i18n(
							group.posts.length === 1
								? I18nKey.postCount
								: I18nKey.postsCount,
						)}
					</div>
				</div>

				{#each group.posts as post}
					<a
						href={getPostUrlBySlug(post.slug)}
						aria-label={post.data.title}
						class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
					>
						<div class="flex flex-row justify-start items-center h-full">
							<!-- date -->
							<div
								class="w-[15%] md:w-[10%] transition text-sm text-right text-50"
							>
								{formatDate(post.data.published)}
							</div>

							<!-- dot and line -->
							<div
								class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center"
							>
								<div
									class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
								></div>
							</div>

							<!-- post title -->
							<div
								class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
							>
								{post.data.title}
							</div>

							<!-- tag list -->
							<div
								class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
							>
								{formatTag(post.data.tags)}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/each}
	{:else}
		{@const groupList =
			currentView === "series"
				? seriesGroups
				: currentView === "category"
				? categoryGroups
				: tagGroups}
		{#each groupList as group}
			<div>
				<div class="flex flex-row w-full items-center h-[3.75rem]">
					<div
						class="w-auto max-w-[50%] md:max-w-[70%] transition text-2xl font-bold text-left text-75 pr-4 truncate"
					>
						{group.title}
					</div>
					<div class="w-[15%] md:w-[10%] flex-shrink-0">
						<div
							class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto
              -outline-offset-[2px] z-50 outline-3"
						></div>
					</div>
					<div class="w-auto transition text-left text-50 flex-shrink-0">
						{group.posts.length}
						{i18n(
							group.posts.length === 1
								? I18nKey.postCount
								: I18nKey.postsCount,
						)}
					</div>
				</div>

				{#each group.posts as post}
					<a
						href={getPostUrlBySlug(post.slug)}
						aria-label={post.data.title}
						class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
					>
						<div class="flex flex-row justify-start items-center h-full">
							<!-- date -->
							<div
								class="w-[15%] md:w-[10%] transition text-sm text-right text-50"
							>
								{formatDate(post.data.published)}
							</div>

							<!-- dot and line -->
							<div
								class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center"
							>
								<div
									class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                       bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                       outline outline-4 z-50
                       outline-[var(--card-bg)]
                       group-hover:outline-[var(--btn-plain-bg-hover)]
                       group-active:outline-[var(--btn-plain-bg-active)]"
								></div>
							</div>

							<!-- post title -->
							<div
								class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold
                     group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                     text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
							>
								{post.data.title}
							</div>

							<!-- tag list -->
							<div
								class="hidden md:block md:w-[15%] text-left text-sm transition
                     whitespace-nowrap overflow-ellipsis overflow-hidden text-30"
							>
								{formatTag(post.data.tags)}
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.btn-regular.active {
		background-color: var(--primary);
		color: var(--deep-text);
		font-weight: bold;
	}
</style>