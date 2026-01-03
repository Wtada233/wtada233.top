export const searchConfig = {
	enable: true,
	// Add a debounce delay to search input to prevent excessive API calls, unit in ms
	debounce: 100,
	// The maximum number of characters to index per article. 0 means no limit
	indexMaxChars: 0,
	// Whether to index the post body content
	indexContent: false,
	// Whether to index categories
	indexCategories: false,
	// Whether to index tags
	indexTags: false,
	// Whether to index series name
	indexSeries: false,
	// Whether to index description/intro
	indexDescription: true,
};

export type SearchConfig = typeof searchConfig;
