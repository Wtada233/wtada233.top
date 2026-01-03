import type { TwikooConfig } from "@/types/config";

export const twikooConfig: TwikooConfig = {
	enabled: true,
	envId: "https://twikoo.wtada233.top", // Twikoo server environment ID
	lang: "auto", // Can be 'auto' or any Twikoo supported language like 'zh-CN', 'en', 'zh-TW', 'ja', 'ko'
	langAlias: {
		zh_CN: "zh-CN",
		zh_TW: "zh-TW",
		en: "en",
		ja: "ja",
		ko: "ko",
	},
};
