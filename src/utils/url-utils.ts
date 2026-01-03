import { getRuntimeLanguage, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@utils/i18n-runtime";

export function pathsEqual(path1: string, path2: string): boolean {
	const normalize = (p: string) => {
		let res = p.toLowerCase();
		if (res.startsWith("/")) res = res.slice(1);
		if (res.endsWith("/")) res = res.slice(0, -1);
		return res;
	};
	return normalize(path1) === normalize(path2);
}

export function url(path: string, lang?: string): string {
	const base = import.meta.env.BASE_URL;
	let cleanPath = path;
	while (cleanPath.startsWith("/")) {
		cleanPath = cleanPath.slice(1);
	}

	// Check if the path is a file (contains a dot and doesn't end with a slash)
	// Or if it contains query parameters (contains a question mark)
	const isFile = path.includes(".") && !path.endsWith("/");
	const hasQueryParams = path.includes("?");
	const suffix = isFile || hasQueryParams ? "" : "/";

	if (lang) {
		return (
			"/" +
			[base, lang, cleanPath]
				.map((p) => {
					let res = p;
					if (res.startsWith("/")) res = res.slice(1);
					if (res.endsWith("/")) res = res.slice(0, -1);
					return res;
				})
				.filter(Boolean)
				.join("/") +
			suffix
		);
	}
	return (
		"/" +
		[base, cleanPath]
			.map((p) => {
				let res = p;
				if (res.startsWith("/")) res = res.slice(1);
				if (res.endsWith("/")) res = res.slice(0, -1);
				return res;
			})
			.filter(Boolean)
			.join("/") +
		suffix
	);
}

export function getPostUrlBySlug(slug: string, lang?: string): string {
	return url(`/posts/${slug}/`, lang || getRuntimeLanguage());
}

export function getTagUrl(tag: string, lang?: string): string {
	const targetLang = lang || getRuntimeLanguage();
	if (!tag) return url("/archive/", targetLang);
	return url(`/archive/?tag=${encodeURIComponent(tag.trim())}`, targetLang);
}

export function getCategoryUrl(category: string | null, lang?: string): string {
	const targetLang = lang || getRuntimeLanguage();
	if (!category || category.trim() === "") return url("/archive/?uncategorized=true", targetLang);
	return url(`/archive/?category=${encodeURIComponent(category.trim())}`, targetLang);
}

export function getSeriesUrl(series: string, lang?: string): string {
	const targetLang = lang || getRuntimeLanguage();
	if (!series) return url("/archive/", targetLang);
	return url(`/archive/?series=${encodeURIComponent(series.trim())}`, targetLang);
}

export function getDir(path: string): string {
	const lastSlashIndex = path.lastIndexOf("/");
	if (lastSlashIndex < 0) {
		return "/";
	}
	return path.substring(0, lastSlashIndex + 1);
}

export const isHomePage = (pathname: string): boolean => {
	const parts = pathname.split("/").filter((p) => p !== "");
	// 情况1: 根路径 /
	if (parts.length === 0) return true;
	// 情况2: 语言根路径 /en/ 或 /zh_CN/
	if (parts.length === 1 && SUPPORTED_LANGUAGES.includes(parts[0] as SupportedLanguage)) return true;
	return false;
};
