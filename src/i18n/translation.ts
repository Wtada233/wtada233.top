import { siteConfig } from "@configs/site";
import type I18nKey from "@i18n/i18nKey";
import { getInternalLang } from "@utils/i18n-runtime";

export type Translation = {
	[K in I18nKey]: string;
};

// Use import.meta.glob to dynamically import all language files
const languageModules = import.meta.glob<{ translation: Translation }>("./languages/*.ts", { eager: true });

export const languages: Record<string, Translation> = {};

for (const path in languageModules) {
	const langCode = path.split("/").pop()?.split(".")[0];
	if (langCode) {
		languages[langCode] = languageModules[path].translation;
	}
}

// Helper to get a safe fallback translation
const defaultLang = siteConfig.lang;
const defaultTranslation = languages[defaultLang] || Object.values(languages)[0];

export function getTranslation(lang: string): Translation {
	return languages[getInternalLang(lang)] || defaultTranslation;
}

export function i18n(key: I18nKey, replacements?: Record<string, string | number>, lang?: string): string {
	const targetLang = lang || siteConfig.lang;
	const trans = getTranslation(targetLang);
	let text = trans[key] || languages[defaultLang]?.[key] || Object.values(languages)[0][key] || "";

	if (replacements) {
		for (const placeholder in replacements) {
			text = text.replaceAll(`{${placeholder}}`, String(replacements[placeholder]));
		}
	}

	return text;
}
