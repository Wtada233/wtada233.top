import { z } from "zod";
import { LinkPreset } from "./enums";

export const SeoConfigSchema = z.object({
	twitterId: z.string().optional(),
	googleSiteVerification: z.string().optional(),
	bingSiteVerification: z.string().optional(),
	baiduSiteVerification: z.string().optional(),
});

export const SiteConfigSchema = z.object({
	title: z.string(),
	subtitle: z.string(),
	lang: z.enum(["en", "zh_CN", "zh_TW", "ja", "ko", "es", "th", "vi", "tr", "id"]),
	keywords: z.string(),
	description: z.string(),
	themeColor: z.object({
		hue: z.number().min(0).max(360),
		fixed: z.boolean(),
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

export const NavBarLinkSchema = z.object({
	name: z.string(),
	url: z.string(),
	external: z.boolean().optional(),
});

export const NavBarConfigSchema = z.object({
	links: z.array(z.union([NavBarLinkSchema, z.nativeEnum(LinkPreset)])),
});

export const ProfileConfigSchema = z.object({
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

export const LicenseConfigSchema = z.object({
	enable: z.boolean(),
	name: z.string(),
	url: z.string(),
});

export const ExpressiveCodeConfigSchema = z.object({
	theme: z.string(),
});

export const AiSummaryConfigSchema = z.object({
	enabled: z.boolean(),
});

export const BlogInfoConfigSchema = z.object({
	enabled: z.boolean(),
	showTotalArticles: z.boolean(),
	showTotalSeries: z.boolean(),
	showTotalTags: z.boolean(),
	showTotalCategories: z.boolean(),
	showTotalWords: z.boolean(),
});

export const EffectsConfigSchema = z.object({
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
	throttleLimit: z.number(),
});

export const FontConfigSchema = z.object({
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

export const FriendsConfigSchema = z.array(
	z.object({
		title: z.string(),
		imgurl: z.string(),
		desc: z.string(),
		siteurl: z.string(),
		tags: z.array(z.string()).optional(),
	}),
);

export const OutdatedReminderConfigSchema = z.object({
	enabled: z.boolean(),
	outdatedThresholdDays: z.number(),
});

export const PinningConfigSchema = z.object({
	enabled: z.boolean(),
});

export const RelatedPostsConfigSchema = z.object({
	enabled: z.boolean(),
	limit: z.number(),
});

export const RunningTimeConfigSchema = z.object({
	enableRunningTime: z.boolean(),
	startDate: z.string(),
});

export const SeriesConfigSchema = z.object({
	enabled: z.boolean(),
});

export const ShareButtonsConfigSchema = z.object({
	enabled: z.boolean(),
});

export const TwikooConfigSchema = z.object({
	enabled: z.boolean(),
	envId: z.string(),
	lang: z.string(),
});

export const MusicPlayerConfigSchema = z.object({
	enable: z.boolean(),
	mode: z.enum(["meting", "local"]),
	meting_api: z.string().optional(),
	id: z.string().optional(),
	server: z.string().optional(),
	type: z.string().optional(),
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

export const UmamiConfigSchema = z.object({
	enabled: z.boolean(),
	scriptUrl: z.string(),
	websiteId: z.string(),
	widgetEnabled: z.boolean(),
	apiUrl: z.string(),
	shareToken: z.string(),
});

export const GiscusConfigSchema = z.object({
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
