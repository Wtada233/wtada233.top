import { umamiConfig } from "@configs/umami";

export function trackUmamiPageview(): void {
	if (!umamiConfig.enabled || typeof window.umami === "undefined") return;

	const currentUrl = window.location.href;
	const now = Date.now();

	if (currentUrl === window.lastTrackedUrl && typeof window.lastTrackTimestamp !== "undefined" && now - window.lastTrackTimestamp < 1000) {
		return;
	}

	window.lastTrackedUrl = currentUrl;
	window.lastTrackTimestamp = now;

	try {
		window.umami.track();
	} catch (error) {
		console.error("Manual Umami tracking failed:", error);
	}
}
