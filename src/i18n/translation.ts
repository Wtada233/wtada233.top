import { siteConfig } from "../config";
import type I18nKey from "./i18nKey";
import { en } from "./languages/en";
import { ja } from "./languages/ja";
import { ko } from "./languages/ko";
import { zh_CN } from "./languages/zh_CN";
import { zh_TW } from "./languages/zh_TW";

export type Translation = {
	[K in I18nKey]: string;
};

const defaultTranslation = en;

const map: { [key: string]: Translation } = {
	en: en,
	en_us: en,
	en_gb: en,
	en_au: en,
	zh_cn: zh_CN,
	zh_tw: zh_TW,
	ja: ja,
	ja_jp: ja,
	ko: ko,
	ko_kr: ko,
};

export function getTranslation(lang: string): Translation {
	return map[lang.toLowerCase()] || defaultTranslation;
}

export function i18n(
	key: I18nKey,
	replacements?: Record<string, string | number>,
): string {
	const lang = siteConfig.lang || "en";
	let text = getTranslation(lang)[key];

	if (replacements) {
		for (const placeholder in replacements) {
			text = text.replace(
				`{${placeholder}}`,
				String(replacements[placeholder]),
			);
		}
	}

	return text;
}
