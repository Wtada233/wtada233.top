import { siteConfig } from "@configs/site";

export const SUPPORTED_LANGUAGES = ["en", "zh_CN", "zh_TW", "ja", "ko"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "lang";

export function getStoredLanguage(): SupportedLanguage | null {
	if (typeof localStorage === "undefined") return null;
	const lang = localStorage.getItem(STORAGE_KEY);
	if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
		return lang as SupportedLanguage;
	}
	return null;
}

export function setStoredLanguage(lang: SupportedLanguage): void {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(STORAGE_KEY, lang);
}

export function getLangFromPathname(pathname: string): SupportedLanguage {
	const pathParts = pathname.split("/").filter((p) => p !== "");
	const base = import.meta.env.BASE_URL.split("/").filter(Boolean).join("/");
	const baseParts = base ? base.split("/") : [];

	// The language code should be right after the base path
	const langIndex = baseParts.length;

	if (pathParts.length > langIndex && SUPPORTED_LANGUAGES.includes(pathParts[langIndex] as SupportedLanguage)) {
		return pathParts[langIndex] as SupportedLanguage;
	}

	return siteConfig.lang as SupportedLanguage;
}

export function getRuntimeLanguage(): SupportedLanguage {
	if (typeof window !== "undefined") {
		return getLangFromPathname(window.location.pathname);
	}
	return siteConfig.lang as SupportedLanguage;
}

export function resolveRedirectLanguage(): SupportedLanguage {
	if (typeof window === "undefined") return siteConfig.lang as SupportedLanguage;

	// 1. Check URL params (e.g., ?lang=zh_CN)
	const urlParams = new URLSearchParams(window.location.search);
	const urlLang = urlParams.get("lang");
	if (urlLang && SUPPORTED_LANGUAGES.includes(urlLang as SupportedLanguage)) {
		return urlLang as SupportedLanguage;
	}

	// 2. Check current pathname (useful for 404 detection)
	const pathLang = getLangFromPathname(window.location.pathname);
	if (pathLang !== (siteConfig.lang as SupportedLanguage)) {
		return pathLang;
	}

	// 3. Check localStorage
	const storedLang = getStoredLanguage();
	if (storedLang) return storedLang;

	return siteConfig.lang as SupportedLanguage;
}

export function applyLanguage(lang: SupportedLanguage): void {
	if (typeof document === "undefined") return;
	document.documentElement.setAttribute("data-lang", lang);
	setStoredLanguage(lang);
}

export function getPathWithoutLang(pathname: string): string {
	const pathParts = pathname.split("/").filter((p) => p !== "");
	const base = import.meta.env.BASE_URL.split("/").filter(Boolean).join("/");
	const baseParts = base ? base.split("/") : [];
	const langIndex = baseParts.length;

	if (pathParts.length > langIndex && (SUPPORTED_LANGUAGES as readonly string[]).includes(pathParts[langIndex])) {
		pathParts.splice(langIndex, 1);
	}

	const res = `/${pathParts.join("/")}`;
	return res.endsWith("/") || res.includes(".") ? res : `${res}/`;
}

export function getLanguageSwitchUrl(targetLang: SupportedLanguage, currentUrl: string | URL): string {
	const url = typeof currentUrl === "string" ? new URL(currentUrl) : currentUrl;
	const pathParts = url.pathname.split("/").filter((p) => p !== "");
	const base = import.meta.env.BASE_URL.replace(/^\/|\/$/g, "");
	const baseParts = base ? base.split("/") : [];
	const langIndex = baseParts.length;

	if (pathParts.length > langIndex && (SUPPORTED_LANGUAGES as readonly string[]).includes(pathParts[langIndex])) {
		pathParts[langIndex] = targetLang;
	} else {
		pathParts.splice(langIndex, 0, targetLang);
	}

	return `/${pathParts.join("/")}/${url.search}`;
}
