import { adaptiveThemeConfig } from "@configs/adaptive-theme";
import { aiSummaryConfig } from "@configs/ai-summary";
import { bannerConfig } from "@configs/banner";
import { blogInfoConfig } from "@configs/blog-info";
import { effectsConfig } from "@configs/effects";
import { expressiveCodeConfig } from "@configs/expressive-code";
import { faviconConfig } from "@configs/favicon";
import { fontConfig } from "@configs/font";
import { Friends } from "@configs/friends";
import { licenseConfig } from "@configs/license";
import { musicPlayerConfig } from "@configs/music";
import { navBarConfig } from "@configs/navbar";
import { outdatedReminderConfig } from "@configs/outdated-reminder";
import { pinningConfig } from "@configs/pinning";
import { profileConfig } from "@configs/profile";
import { pwaConfig } from "@configs/pwa";
import { relatedPostsConfig } from "@configs/related-posts";
import { runningTimeConfig } from "@configs/running-time";
import { searchConfig } from "@configs/search";
import { seoConfig } from "@configs/seo";
import { seriesConfig } from "@configs/series";
import { shareButtonsConfig } from "@configs/share-buttons";
import { siteConfig } from "@configs/site";
import { twikooConfig } from "@configs/twikoo";
import { umamiConfig } from "@configs/umami";
import { webmentionConfig } from "@configs/webmention";

import {
	AdaptiveThemeConfigSchema,
	AiSummaryConfigSchema,
	BannerConfigSchema,
	BlogInfoConfigSchema,
	EffectsConfigSchema,
	ExpressiveCodeConfigSchema,
	FaviconConfigSchema,
	FontConfigSchema,
	FriendsConfigSchema,
	LicenseConfigSchema,
	MusicPlayerConfigSchema,
	NavBarConfigSchema,
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

const validations = [
	{ name: "adaptiveThemeConfig", schema: AdaptiveThemeConfigSchema, data: adaptiveThemeConfig },
	{ name: "siteConfig", schema: SiteConfigSchema, data: siteConfig },
	{ name: "bannerConfig", schema: BannerConfigSchema, data: bannerConfig },
	{ name: "faviconConfig", schema: FaviconConfigSchema, data: faviconConfig },
	{ name: "seoConfig", schema: SeoConfigSchema, data: seoConfig },
	{ name: "pwaConfig", schema: PwaConfigSchema, data: pwaConfig },
	{ name: "navBarConfig", schema: NavBarConfigSchema, data: navBarConfig },
	{ name: "profileConfig", schema: ProfileConfigSchema, data: profileConfig },
	{ name: "licenseConfig", schema: LicenseConfigSchema, data: licenseConfig },
	{
		name: "expressiveCodeConfig",
		schema: ExpressiveCodeConfigSchema,
		data: expressiveCodeConfig,
	},
	{
		name: "aiSummaryConfig",
		schema: AiSummaryConfigSchema,
		data: aiSummaryConfig,
	},
	{ name: "blogInfoConfig", schema: BlogInfoConfigSchema, data: blogInfoConfig },
	{ name: "effectsConfig", schema: EffectsConfigSchema, data: effectsConfig },
	{ name: "fontConfig", schema: FontConfigSchema, data: fontConfig },
	{ name: "friendsConfig", schema: FriendsConfigSchema, data: Friends },
	{
		name: "outdatedReminderConfig",
		schema: OutdatedReminderConfigSchema,
		data: outdatedReminderConfig,
	},
	{ name: "pinningConfig", schema: PinningConfigSchema, data: pinningConfig },
	{
		name: "relatedPostsConfig",
		schema: RelatedPostsConfigSchema,
		data: relatedPostsConfig,
	},
	{
		name: "runningTimeConfig",
		schema: RunningTimeConfigSchema,
		data: runningTimeConfig,
	},
	{ name: "seriesConfig", schema: SeriesConfigSchema, data: seriesConfig },
	{
		name: "shareButtonsConfig",
		schema: ShareButtonsConfigSchema,
		data: shareButtonsConfig,
	},
	{ name: "twikooConfig", schema: TwikooConfigSchema, data: twikooConfig },
	{
		name: "musicPlayerConfig",
		schema: MusicPlayerConfigSchema,
		data: musicPlayerConfig,
	},
	{ name: "umamiConfig", schema: UmamiConfigSchema, data: umamiConfig },
	{ name: "searchConfig", schema: SearchConfigSchema, data: searchConfig },
	{ name: "webmentionConfig", schema: WebmentionConfigSchema, data: webmentionConfig },
];

let hasError = false;

console.log("Starting configuration validation...");

for (const { name, schema, data } of validations) {
	const result = schema.safeParse(data);
	if (!result.success) {
		hasError = true;
		console.error(`❌ Validation failed for ${name}:`);
		console.error(JSON.stringify(result.error.format(), null, 2));
	} else {
		console.log(`✅ ${name} is valid.`);
	}
}

if (hasError) {
	console.error("Configuration validation failed.");
	process.exit(1);
} else {
	console.log("All configurations are valid.");
}
