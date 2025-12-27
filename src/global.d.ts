import type { AstroIntegration } from "@swup/astro";

interface Twikoo {
	init: (options: { envId: string; lang: string; el: string; path: string }) => void;
}

interface Umami {
	track: (eventName?: string, eventData?: Record<string, string | number | boolean>) => void;
}

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind: {
			search: (query: string) => Promise<{
				results: Array<{
					data: () => Promise<SearchResult>;
				}>;
			}>;
			options: (config: { excerptLength: number }) => Promise<void>;
		};
		semifullScrollHandler?: () => void;
		postEffects?: boolean;
		customHue?: number;
		twikoo?: Twikoo;
		umami?: Umami;
		lastTrackTimestamp?: number;
		lastTrackedUrl?: string;
	}
}

interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
