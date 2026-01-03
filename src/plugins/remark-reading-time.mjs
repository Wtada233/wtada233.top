// biome-ignore lint/suspicious/noShadowRestrictedNames: <toString from mdast-util-to-string>
import { toString } from "mdast-util-to-string";
import { countWords } from "../utils/word-count.ts";

export function remarkReadingTime() {
	return (tree, { data }) => {
		const textOnPage = toString(tree);
		const totalCount = countWords(textOnPage);
		const minutes = Math.max(1, Math.ceil(totalCount / 200));

		data.astro.frontmatter.minutes = minutes;
		data.astro.frontmatter.words = totalCount;
	};
}
