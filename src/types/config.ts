import type { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants";
import type { z } from "zod";
import type {
	AiSummaryConfigSchema,
	BlogInfoConfigSchema,
	EffectsConfigSchema,
	ExpressiveCodeConfigSchema,
	FontConfigSchema,
	FriendsConfigSchema,
	GiscusConfigSchema,
	LicenseConfigSchema,
	NavBarConfigSchema,
	NavBarLinkSchema,
	OutdatedReminderConfigSchema,
	PinningConfigSchema,
	ProfileConfigSchema,
	RelatedPostsConfigSchema,
	RunningTimeConfigSchema,
	SeriesConfigSchema,
	ShareButtonsConfigSchema,
	SiteConfigSchema,
	TwikooConfigSchema,
	MusicPlayerConfigSchema,
	UmamiConfigSchema,
} from "./config.schema";

export { LinkPreset } from "./enums";

export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type Favicon = SiteConfig["favicon"][number];
export type NavBarLink = z.infer<typeof NavBarLinkSchema>;
export type NavBarConfig = z.infer<typeof NavBarConfigSchema>;
export type ProfileConfig = z.infer<typeof ProfileConfigSchema>;
export type LicenseConfig = z.infer<typeof LicenseConfigSchema>;
export type ExpressiveCodeConfig = z.infer<typeof ExpressiveCodeConfigSchema>;
export type GiscusConfig = z.infer<typeof GiscusConfigSchema>;

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
