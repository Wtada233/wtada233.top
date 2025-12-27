import { z } from "zod";
import { LinkPreset } from "./enums";

export type SeoConfig = {
	twitterId?: string;
	googleSiteVerification?: string;
	bingSiteVerification?: string;
	baiduSiteVerification?: string;
};

export const SeoConfigSchema: z.ZodType<SeoConfig> = z.object({
	twitterId: z.string().optional(),
	googleSiteVerification: z.string().optional(),
	bingSiteVerification: z.string().optional(),
	baiduSiteVerification: z.string().optional(),
});

export type SiteConfig = {
	title: string;
	subtitle: string;
	lang: "en" | "zh_CN" | "zh_TW" | "ja" | "ko";
	keywords: string;
	description: string;
	themeColor: {
		hue: number;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
		text?: {
			enable: boolean;
		};
		waves?: {
			enable: boolean;
		};
	};
	showLastModified?: boolean;
	favicon: {
		src: string;
		theme?: "light" | "dark";
		sizes?: string;
	}[];
	seo?: SeoConfig;
};

export const SiteConfigSchema: z.ZodType<SiteConfig> = z.object({
	title: z.string(),
	subtitle: z.string(),
	lang: z.enum(["en", "zh_CN", "zh_TW", "ja", "ko", "es", "th", "vi", "tr", "id"]),
	keywords: z.string(),
	description: z.string(),
	themeColor: z.object({
		hue: z.number().min(0).max(360),
	}),
	banner: z.object({
		enable: z.boolean(),
		src: z.string(),
		position: z.enum(["top", "center", "bottom"]).optional(),
		credit: z.object({
			enable: z.boolean(),
			text: z.string(),
			url: z.string().optional(),
		}),
		text: z
			.object({
				enable: z.boolean(),
			})
			.optional(),
		waves: z
			.object({
				enable: z.boolean(),
			})
			.optional(),
	}),
	showLastModified: z.boolean().optional(),
	favicon: z.array(
		z.object({
			src: z.string(),
			theme: z.enum(["light", "dark"]).optional(),
			sizes: z.string().optional(),
		}),
	),
	seo: SeoConfigSchema.optional(),
});

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export const NavBarLinkSchema: z.ZodType<NavBarLink> = z.object({
	name: z.string(),
	url: z.string(),
	external: z.boolean().optional(),
});

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export const NavBarConfigSchema: z.ZodType<NavBarConfig> = z.object({
	links: z.array(z.union([NavBarLinkSchema, z.nativeEnum(LinkPreset)])),
});

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export const ProfileConfigSchema: z.ZodType<ProfileConfig> = z.object({
	avatar: z.string().optional(),
	name: z.string(),
	bio: z.string().optional(),
	links: z.array(
		z.object({
			name: z.string(),
			url: z.string(),
			icon: z.string(),
		}),
	),
});

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export const LicenseConfigSchema: z.ZodType<LicenseConfig> = z.object({
	enable: z.boolean(),
	name: z.string(),
	url: z.string(),
});

export type ExpressiveCodeConfig = {
	theme: string;
};

export const ExpressiveCodeConfigSchema: z.ZodType<ExpressiveCodeConfig> = z.object({
	theme: z.string(),
});

export type AiSummaryConfig = {
	enabled: boolean;
};

export const AiSummaryConfigSchema: z.ZodType<AiSummaryConfig> = z.object({
	enabled: z.boolean(),
});

export type BlogInfoConfig = {
	enabled: boolean;
	showTotalArticles: boolean;
	showTotalSeries: boolean;
	showTotalTags: boolean;
	showTotalCategories: boolean;
	showTotalWords: boolean;
};

export const BlogInfoConfigSchema: z.ZodType<BlogInfoConfig> = z.object({
	enabled: z.boolean(),
	showTotalArticles: z.boolean(),
	showTotalSeries: z.boolean(),
	showTotalTags: z.boolean(),
	showTotalCategories: z.boolean(),
	showTotalWords: z.boolean(),
});

export type EffectsConfig = {
	enable: boolean;
	ripple: {
		enable: boolean;
	};
	scrollAnimation: {
		enable: boolean;
	};
	click: {
		sizeRange: {
			min: number;
			max: number;
		};
		distanceRange: {
			min: number;
			max: number;
		};
		animationDuration: number;
		particleCount: number;
	};
	trail: {
		size: number;
		animationDuration: number;
	};
	throttleLimit: number;
};

export const EffectsConfigSchema: z.ZodType<EffectsConfig> = z.object({
	enable: z.boolean(),
	ripple: z.object({
		enable: z.boolean(),
	}),
	scrollAnimation: z.object({
		enable: z.boolean(),
	}),
	click: z.object({
		sizeRange: z.object({
			min: z.number(),
			max: z.number(),
		}),
		distanceRange: z.object({
			min: z.number(),
			max: z.number(),
		}),
		animationDuration: z.number(),
		particleCount: z.number(),
	}),
	trail: z.object({
		size: z.number(),
		animationDuration: z.number(),
	}),
	tilt: z.object({
		enable: z.boolean(),
		intensity: z.number(),
	}),
	throttleLimit: z.number(),
});

export type FontConfig = {
	enable: boolean;
	fonts: {
		name: string;
		src: string;
		type: string;
		weight: string;
		style: string;
		display: string;
	}[];
	family: string;
};

export const FontConfigSchema: z.ZodType<FontConfig> = z.object({
	enable: z.boolean(),
	fonts: z.array(
		z.object({
			name: z.string(),
			src: z.string(),
			type: z.string(),
			weight: z.string(),
			style: z.string(),
			display: z.string(),
		}),
	),
	family: z.string(),
});

export type Friend = {
	title: string;
	imgurl: string;
	desc: string;
	siteurl: string;
	tags?: string[];
};

export type FriendsConfig = Friend[];

export const FriendsConfigSchema: z.ZodType<FriendsConfig> = z.array(
	z.object({
		title: z.string(),
		imgurl: z.string(),
		desc: z.string(),
		siteurl: z.string(),
		tags: z.array(z.string()).optional(),
	}),
);

export type OutdatedReminderConfig = {
	enabled: boolean;
	outdatedThresholdDays: number;
};

export const OutdatedReminderConfigSchema: z.ZodType<OutdatedReminderConfig> = z.object({
	enabled: z.boolean(),
	outdatedThresholdDays: z.number(),
});

export type PinningConfig = {
	enabled: boolean;
};

export const PinningConfigSchema: z.ZodType<PinningConfig> = z.object({
	enabled: z.boolean(),
});

export type RelatedPostsConfig = {
	enabled: boolean;
	limit: number;
};

export const RelatedPostsConfigSchema: z.ZodType<RelatedPostsConfig> = z.object({
	enabled: z.boolean(),
	limit: z.number(),
});

export type RunningTimeConfig = {
	enableRunningTime: boolean;
	startDate: string;
};

export const RunningTimeConfigSchema: z.ZodType<RunningTimeConfig> = z.object({
	enableRunningTime: z.boolean(),
	startDate: z.string(),
});

export type SeriesConfig = {
	enabled: boolean;
};

export const SeriesConfigSchema: z.ZodType<SeriesConfig> = z.object({
	enabled: z.boolean(),
});

export type ShareButtonsConfig = {
	enabled: boolean;
};

export const ShareButtonsConfigSchema: z.ZodType<ShareButtonsConfig> = z.object({
	enabled: z.boolean(),
});

export type TwikooConfig = {
	enabled: boolean;
	envId: string;
	lang: string;
};

export const TwikooConfigSchema: z.ZodType<TwikooConfig> = z.object({
	enabled: z.boolean(),
	envId: z.string(),
	lang: z.string(),
});

export type MusicPlayerConfig = {
	enable: boolean;
	mode: "meting" | "local";
	meting_api: string;
	id: string;
	server: string;
	type: string;
	local_playlist?: {
		id: number;
		title: string;
		artist: string;
		cover: string;
		url: string;
		duration: number;
	}[];
};

export const MusicPlayerConfigSchema: z.ZodType<MusicPlayerConfig> = z.object({
	enable: z.boolean(),
	mode: z.enum(["meting", "local"]),
	meting_api: z.string(),
	id: z.string(),
	server: z.string(),
	type: z.string(),
	local_playlist: z
		.array(
			z.object({
				id: z.number(),
				title: z.string(),
				artist: z.string(),
				cover: z.string(),
				url: z.string(),
				duration: z.number(),
			}),
		)
		.optional(),
});

export type UmamiConfig = {
	enabled: boolean;
	scriptUrl: string;
	websiteId: string;
	widgetEnabled: boolean;
	apiUrl: string;
	shareToken: string;
};

export const UmamiConfigSchema: z.ZodType<UmamiConfig> = z.object({
	enabled: z.boolean(),
	scriptUrl: z.string(),
	websiteId: z.string(),
	widgetEnabled: z.boolean(),
	apiUrl: z.string(),
	shareToken: z.string(),
});

export type GiscusConfig = {
	enabled: boolean;
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
	mapping?: string;
	reactionsEnabled?: boolean;
	emitMetadata?: boolean;
	inputPosition?: "top" | "bottom";
	lang?: string;
};

export const GiscusConfigSchema: z.ZodType<GiscusConfig> = z.object({
	enabled: z.boolean(),
	repo: z.string(),
	repoId: z.string(),
	category: z.string(),
	categoryId: z.string(),
	mapping: z.string().optional(),
	reactionsEnabled: z.boolean().optional(),
	emitMetadata: z.boolean().optional(),
	inputPosition: z.enum(["top", "bottom"]).optional(),
	lang: z.string().optional(),
});

export type AdaptiveThemeConfig = {
	enable: boolean;
	animation: boolean;
};

export const AdaptiveThemeConfigSchema: z.ZodType<AdaptiveThemeConfig> = z.object({
	enable: z.boolean(),
	animation: z.boolean(),
});
