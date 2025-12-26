import { z } from "zod";
import { adaptiveThemeConfig } from "../src/configs/adaptive-theme";
import { musicPlayerConfig } from "../src/configs/music";
import { aiSummaryConfig } from "../src/configs/ai-summary";
import { blogInfoConfig } from "../src/configs/blog-info";
import { effectsConfig } from "../src/configs/effects";
import { expressiveCodeConfig } from "../src/configs/expressive-code";
import { fontConfig } from "../src/configs/font";
import { Friends } from "../src/configs/friends";
import { licenseConfig } from "../src/configs/license";
import { navBarConfig } from "../src/configs/navbar";
import { outdatedReminderConfig } from "../src/configs/outdated-reminder";
import { pinningConfig } from "../src/configs/pinning";
import { profileConfig } from "../src/configs/profile";
import { relatedPostsConfig } from "../src/configs/related-posts";
import { runningTimeConfig } from "../src/configs/running-time";
import { seriesConfig } from "../src/configs/series";
import { shareButtonsConfig } from "../src/configs/share-buttons";
import { siteConfig } from "../src/configs/site";
import { twikooConfig } from "../src/configs/twikoo";
import { umamiConfig } from "../src/configs/umami";

import {
  AdaptiveThemeConfigSchema,
  SiteConfigSchema,
  NavBarConfigSchema,
  ProfileConfigSchema,
  LicenseConfigSchema,
  ExpressiveCodeConfigSchema,
  AiSummaryConfigSchema,
  BlogInfoConfigSchema,
  EffectsConfigSchema,
  FontConfigSchema,
  FriendsConfigSchema,
  OutdatedReminderConfigSchema,
  PinningConfigSchema,
  RelatedPostsConfigSchema,
  RunningTimeConfigSchema,
  SeriesConfigSchema,
  ShareButtonsConfigSchema,
  TwikooConfigSchema,
  MusicPlayerConfigSchema,
  UmamiConfigSchema,
} from "../src/types/config.schema";

const validations = [
  { name: "adaptiveThemeConfig", schema: AdaptiveThemeConfigSchema, data: adaptiveThemeConfig },
  { name: "siteConfig", schema: SiteConfigSchema, data: siteConfig },
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
