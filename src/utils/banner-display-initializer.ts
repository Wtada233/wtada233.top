import { siteConfig } from "../config";

export function showBanner() {
	if (!siteConfig.banner.enable) return;

	const banner = document.getElementById("banner");
	if (!banner) {
		console.error("Banner element not found");
		return;
	}

	banner.classList.remove("opacity-0", "scale-105");
}
