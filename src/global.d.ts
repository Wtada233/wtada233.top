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
		postEffects?: boolean;
		customHue?: number;
		twikoo?: Twikoo;
		umami?: Umami;
		lastTrackTimestamp?: number;
		lastTrackedUrl?: string;
	}
}

export interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
}
