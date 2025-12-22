import { getHue, getStoredTheme, setHue, setTheme } from "./setting-utils";

export function loadTheme(): void {
	const theme = getStoredTheme();
	setTheme(theme);
}

export function loadHue(): void {
	setHue(getHue());
}
