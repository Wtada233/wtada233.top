import { adaptiveThemeConfig } from "@/config";
import { applyHue, getHue, getStoredTheme, setTheme } from "./setting-utils";

export function loadTheme(): void {
	const theme = getStoredTheme();
	setTheme(theme);
}

export function loadHue(): void {
	const postContainer = document.getElementById("post-container");
	const customHue = postContainer?.dataset.hue;
	if (adaptiveThemeConfig.enable && customHue) {
		applyHue(Number.parseInt(customHue, 10));
	} else {
		applyHue(getHue());
	}
}
