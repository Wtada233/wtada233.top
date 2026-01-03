import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";
import type { z } from "zod";
import type {
	AdaptiveThemeConfigSchema,
	AiSummaryConfigSchema,
	BannerConfigSchema,
	BlogInfoConfigSchema,
	DateConfigSchema,
	EffectsConfigSchema,
	ExpressiveCodeConfigSchema,
	FaviconConfigSchema,
	FontConfigSchema,
	FriendsConfigSchema,
	LicenseConfigSchema,
	MusicPlayerConfigSchema,
	NavBarConfigSchema,
	NavBarLinkSchema,
	OutdatedReminderConfigSchema,
	PinningConfigSchema,
	ProfileConfigSchema,
	PwaConfigSchema,
	RelatedPostsConfigSchema,
	RunningTimeConfigSchema,
	SearchConfigSchema,
	SeoConfigSchema,
	SeriesConfigSchema,
	ShareButtonsConfigSchema,
	SiteConfigSchema,
	TwikooConfigSchema,
	UmamiConfigSchema,
	WebmentionConfigSchema,
} from "@/types/config.schema";

export { LinkPreset } from "@/types/enums";

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type DateConfig = z.infer<typeof DateConfigSchema>;
export type BannerConfig = z.infer<typeof BannerConfigSchema>;
export type FaviconConfig = z.infer<typeof FaviconConfigSchema>;
export type Favicon = FaviconConfig[number];
export type PwaConfig = z.infer<typeof PwaConfigSchema>;
export type SeoConfig = z.infer<typeof SeoConfigSchema>;
export type AdaptiveThemeConfig = z.infer<typeof AdaptiveThemeConfigSchema>;
export type NavBarLink = z.infer<typeof NavBarLinkSchema>;
export type NavBarConfig = z.infer<typeof NavBarConfigSchema>;
export type ProfileConfig = z.infer<typeof ProfileConfigSchema>;
export type LicenseConfig = z.infer<typeof LicenseConfigSchema>;
export type ExpressiveCodeConfig = z.infer<typeof ExpressiveCodeConfigSchema>;
export type AiSummaryConfig = z.infer<typeof AiSummaryConfigSchema>;
export type BlogInfoConfig = z.infer<typeof BlogInfoConfigSchema>;
export type EffectsConfig = z.infer<typeof EffectsConfigSchema>;
export type FontConfig = z.infer<typeof FontConfigSchema>;
export type FriendsConfig = z.infer<typeof FriendsConfigSchema>;
export type OutdatedReminderConfig = z.infer<typeof OutdatedReminderConfigSchema>;
export type PinningConfig = z.infer<typeof PinningConfigSchema>;
export type RelatedPostsConfig = z.infer<typeof RelatedPostsConfigSchema>;
export type RunningTimeConfig = z.infer<typeof RunningTimeConfigSchema>;
export type SeriesConfig = z.infer<typeof SeriesConfigSchema>;
export type ShareButtonsConfig = z.infer<typeof ShareButtonsConfigSchema>;
export type TwikooConfig = z.infer<typeof TwikooConfigSchema>;
export type MusicPlayerConfig = z.infer<typeof MusicPlayerConfigSchema>;
export type UmamiConfig = z.infer<typeof UmamiConfigSchema>;
export type SearchConfig = z.infer<typeof SearchConfigSchema>;
export type WebmentionConfig = z.infer<typeof WebmentionConfigSchema>;

export type LIGHT_DARK_MODE = typeof LIGHT_MODE | typeof DARK_MODE | typeof AUTO_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	series?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};
