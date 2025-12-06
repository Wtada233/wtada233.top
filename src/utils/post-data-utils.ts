import type { CollectionEntry } from "astro:content";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";

interface PostCardData {
	excerpt: string;
	wordCount: string;
	minuteCount: string;
}

export async function getPostCardData(
	entry: CollectionEntry<"posts">,
): Promise<PostCardData> {
	const { remarkPluginFrontmatter } = await entry.render();

	const excerpt = remarkPluginFrontmatter.excerpt;
	const words = remarkPluginFrontmatter.words;
	const minutes = remarkPluginFrontmatter.minutes;

	const wordCountString = `${words} ${i18n(words === 1 ? I18nKey.wordCount : I18nKey.wordsCount)}`;
	const minuteCountString = `${minutes} ${i18n(minutes === 1 ? I18nKey.minuteCount : I18nKey.minutesCount)}`;

	return {
		excerpt,
		wordCount: wordCountString,
		minuteCount: minuteCountString,
	};
}
