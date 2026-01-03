import { siteConfig } from "@configs/site";
import type I18nKey from "@i18n/i18nKey";
import { en } from "@i18n/languages/en";
import { ja } from "@i18n/languages/ja";
import { ko } from "@i18n/languages/ko";
import { zh_CN } from "@i18n/languages/zh_CN";
import { zh_TW } from "@i18n/languages/zh_TW";

export type Translation = {
	[K in I18nKey]: string;
};

const defaultTranslation = en;

export const languages: Record<string, Translation> = {
	en: en,
	zh_cn: zh_CN,
	zh_tw: zh_TW,
	ja: ja,
	ko: ko,
};

export function getTranslation(lang: string): Translation {
	return languages[lang.toLowerCase().replaceAll("-", "_")] || defaultTranslation;
}

export function i18n(key: I18nKey, replacements?: Record<string, string | number>, lang?: string): string {
	const targetLang = lang || siteConfig.lang || "en";
	let text = getTranslation(targetLang)[key];

	if (replacements) {
		for (const placeholder in replacements) {
			text = text.replaceAll(`{${placeholder}}`, String(replacements[placeholder]));
		}
	}

	return text;
}
