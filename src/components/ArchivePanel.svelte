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

// Unified group structure for rendering
interface DisplayGroup {
	key: string | number;
	posts: Post[];
	isTimeGroup: boolean;
}

type ViewMode = "time" | "series" | "category" | "tags";
let currentView: ViewMode = "time";

let displayGroups: DisplayGroup[] = [];

function formatDate(date: Date) {
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const day = date.getDate().toString().padStart(2, "0");
	return `${month}-${day}`;
}

function formatTag(tagList: string[]) {
	if (!tagList) return "";
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

	// ----- Data Grouping Logic -----
	if (currentView === "time") {
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

		displayGroups = Object.keys(groupedByYear)
			.map((yearStr) => ({
				key: Number.parseInt(yearStr, 10),
				posts: groupedByYear[Number.parseInt(yearStr, 10)],
				isTimeGroup: true,
			}))
			.sort((a, b) => (b.key as number) - (a.key as number));
	} else {
		// series, category, or tags
		let getGroupKey: (post: Post) => string | string[];
		let noGroupKey: string;

		if (currentView === "series") {
			getGroupKey = (post) => post.data.series || i18n(I18nKey.noSeries);
			noGroupKey = i18n(I18nKey.noSeries);
		} else if (currentView === "category") {
			getGroupKey = (post) => post.data.category || i18n(I18nKey.uncategorized);
			noGroupKey = i18n(I18nKey.uncategorized);
		} else {
			// tags
			getGroupKey = (post) => (post.data.tags && post.data.tags.length > 0 ? post.data.tags : i18n(I18nKey.noTags));
			noGroupKey = i18n(I18nKey.noTags);
		}

		const grouped = filteredPosts.reduce(
			(acc, post) => {
				const keys = getGroupKey(post);
				const keyArray = Array.isArray(keys) ? keys : [keys];
				keyArray.forEach((key) => {
					if (!acc[key]) {
						acc[key] = [];
					}
					acc[key].push(post);
				});
				return acc;
			},
			{} as Record<string, Post[]>,
		);

		displayGroups = Object.keys(grouped)
			.map((groupKey) => ({
				key: groupKey,
				posts: grouped[groupKey],
				isTimeGroup: false,
			}))
			.sort((a, b) => {
				if (a.key === noGroupKey) return 1;
				if (b.key === noGroupKey) return -1;
				return (a.key as string).localeCompare(b.key as string);
			});
	}
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

	{#each displayGroups as group}
		<div>
			<!-- Group Header -->
			<div class="flex flex-row w-full items-center h-[3.75rem]">
				{#if group.isTimeGroup}
					<div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">
						{group.key}
					</div>
					<div class="w-[15%] md:w-[10%]">
						<div class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto -outline-offset-[2px] z-50 outline-3"></div>
					</div>
					<div class="w-[70%] md:w-[80%] transition text-left text-50">
						{group.posts.length}
						{i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
					</div>
				{:else}
					<div class="w-auto max-w-[50%] md:max-w-[70%] transition text-2xl font-bold text-left text-75 pr-4 truncate">
						{group.key}
					</div>
					<div class="w-[15%] md:w-[10%] flex-shrink-0">
						<div class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto -outline-offset-[2px] z-50 outline-3"></div>
					</div>
					<div class="w-auto transition text-left text-50 flex-shrink-0">
						{group.posts.length}
						{i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
					</div>
				{/if}
			</div>

			<!-- Post List -->
			{#each group.posts as post}
				<a
					href={getPostUrlBySlug(post.slug)}
					aria-label={post.data.title}
					class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
				>
					<div class="flex flex-row justify-start items-center h-full">
						<!-- date -->
						<div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">
							{formatDate(post.data.published)}
						</div>

						<!-- dot and line -->
						<div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
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
</div>

<style>
	.btn-regular.active {
		background-color: var(--primary);
		color: var(--deep-text);
		font-weight: bold;
	}
</style>
