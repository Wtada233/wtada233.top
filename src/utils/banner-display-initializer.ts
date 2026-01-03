import { bannerConfig } from "@configs/banner";

export function showBanner(): void {
	if (!bannerConfig.enable) return;

	const banner = document.getElementById("banner");
	if (!banner) {
		console.error("Banner element not found");
		return;
	}

	banner.classList.remove("opacity-0", "scale-105");
}
