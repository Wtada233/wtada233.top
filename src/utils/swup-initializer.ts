import { destroyRippleEffect, initRippleEffect, triggerPostIndexRipple } from "@utils/animations/ripple";
import { destroyScrollAnimations, initScrollAnimations } from "@utils/animations/scroll";
import { initGithubCards } from "@utils/github-card";
import { registerGlobalClickOutsideHandler, unregisterGlobalClickOutsideHandler } from "@utils/global-click-handler";
import { updateReadingProgressBar } from "@utils/reading-progress";
import { initCustomScrollbar } from "@utils/scrollbar-initializer";
import { loadHue } from "@utils/theme-initializer";
import { trackUmamiPageview } from "@utils/umami-tracker";
import { isHomePage } from "@utils/url-utils";

let swupEventsInitialized = false;

export function setupSwupEvents(): void {
	if (!window.swup || swupEventsInitialized) return;
	swupEventsInitialized = true;

	window.swup.hooks.on("link:click", () => {
		// Remove the delay for the first time page load
		document.documentElement.style.setProperty("--content-delay", "0ms");
	});

	window.swup.hooks.before("content:replace", () => {
		// --- Cleanup previous page's effects ---
		destroyRippleEffect();
		destroyScrollAnimations();
		unregisterGlobalClickOutsideHandler();
		// --- End Cleanup ---
	});

	window.swup.hooks.on("content:replace", () => {
		// --- Sync Home Page States ---
		const bodyElement = document.querySelector("body");
		const isHome = isHomePage(window.location.pathname);

		if (isHome) {
			bodyElement?.classList.add("is-home");
		} else {
			bodyElement?.classList.remove("is-home");
		}

		const bannerTextOverlay = document.querySelector(".banner-text-overlay");
		if (bannerTextOverlay) {
			if (isHome) {
				bannerTextOverlay.classList.remove("banner-text-hidden");
			} else {
				bannerTextOverlay.classList.add("banner-text-hidden");
			}
		}

		// Control mobile banner visibility
		const isMobile = window.innerWidth < 1024;
		const bannerWrapper = document.getElementById("banner-wrapper");
		if (isMobile && bannerWrapper) {
			if (isHome) {
				bannerWrapper.classList.remove("mobile-hide-banner");
			} else {
				bannerWrapper.classList.add("mobile-hide-banner");
			}
		}
		// --- End Sync ---

		initCustomScrollbar();
		loadHue();

		updateReadingProgressBar();
		initRippleEffect();
		triggerPostIndexRipple();
		initScrollAnimations();
		trackUmamiPageview();
		registerGlobalClickOutsideHandler();
		initGithubCards();
	});
}
