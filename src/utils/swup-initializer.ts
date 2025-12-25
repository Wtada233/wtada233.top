import { destroyRippleEffect, initRippleEffect } from "./animations/ripple";
import { destroyScrollAnimations, initScrollAnimations } from "./animations/scroll";
import { initGithubCards } from "./github-card";
import { registerGlobalClickOutsideHandler } from "./global-click-handler";
import { updateReadingProgressBar } from "./reading-progress";
import { initCustomScrollbar } from "./scrollbar-initializer";
import { trackUmamiPageview } from "./umami-tracker";
import { fetchUmamiStats } from "./umami-utils";
import { pathsEqual, url } from "./url-utils";

export function setupSwupEvents(): void {
	if (!window.swup) return;

	window.swup.hooks.on("link:click", () => {
		// Remove the delay for the first time page load
		document.documentElement.style.setProperty("--content-delay", "0ms");

		// prevent elements from overlapping the navbar
		const bannerEnabled = !!document.getElementById("banner-wrapper");
		if (!bannerEnabled) {
			return;
		}

		const navbar = document.getElementById("navbar-wrapper");
		if (!navbar || !document.body.classList.contains("lg:is-home")) {
			return;
		}
	});

	window.swup.hooks.on("content:replace", () => {
		// --- Cleanup previous page's effects ---
		destroyRippleEffect();
		destroyScrollAnimations();
		// --- End Cleanup ---

		initCustomScrollbar();

		updateReadingProgressBar();
		initRippleEffect();
		initScrollAnimations();
		trackUmamiPageview();
		fetchUmamiStats();
		registerGlobalClickOutsideHandler();
		initGithubCards();
	});

	window.swup.hooks.on("visit:start", (visit: { to: { url: string } }) => {
		// change banner height immediately when a link is clicked
		const bodyElement = document.querySelector("body");
		const isHomePage = pathsEqual(visit.to.url, url("/"));

		if (isHomePage) {
			bodyElement?.classList.add("is-home");
		} else {
			bodyElement?.classList.remove("is-home");
		}

		// Control banner text visibility based on page
		const bannerTextOverlay = document.querySelector(".banner-text-overlay");
		if (bannerTextOverlay) {
			if (isHomePage) {
				bannerTextOverlay.classList.remove("hidden");
			} else {
				bannerTextOverlay.classList.add("hidden");
			}
		}

		// Control mobile banner visibility based on page
		const isMobile = window.innerWidth < 1024;
		const bannerWrapper = document.getElementById("banner-wrapper");
		if (isMobile && bannerWrapper) {
			if (isHomePage) {
				bannerWrapper.classList.remove("mobile-hide-banner");
			} else {
				bannerWrapper.classList.add("mobile-hide-banner");
			}
		}

		// increase the page height during page transition to prevent the scrolling animation from jumping
		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}
	});

	window.swup.hooks.on("page:view", () => {
		// hide the temp high element when the transition is done
		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}
		updateReadingProgressBar();
		fetchUmamiStats();
	});

	window.swup.hooks.on("visit:end", (_visit: { to: { url: string } }) => {
		setTimeout(() => {
			const heightExtend = document.getElementById("page-height-extend");
			if (heightExtend) {
				heightExtend.classList.add("hidden");
			}
		}, 200);
	});
}
