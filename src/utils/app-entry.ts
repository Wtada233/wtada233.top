import { BANNER_HEIGHT, BANNER_HEIGHT_EXTEND, BANNER_HEIGHT_HOME, MAIN_PANEL_OVERLAPS_BANNER_HEIGHT } from "@constants/constants";
import { initRippleEffect } from "@utils/animations/ripple";
import { initScrollAnimations } from "@utils/animations/scroll";
import { showBanner } from "@utils/banner-display-initializer";
import { initGithubCards } from "@utils/github-card";
import { registerGlobalClickOutsideHandler } from "@utils/global-click-handler";
import { initPhotoSwipe } from "@utils/photoswipe-setup";
import { updateReadingProgressBar } from "@utils/reading-progress";
import { initCustomScrollbar } from "@utils/scrollbar-initializer";
import { setupSwupEvents } from "@utils/swup-initializer";
import { loadTheme } from "@utils/theme-initializer";
import { fetchUmamiStats } from "@utils/umami-utils";

import "@/styles/animations/ripple.css";
import "@/styles/animations/scroll.css";

const bannerEnabled = !!document.getElementById("banner-wrapper");

let backToTopBtn = document.getElementById("back-to-top-btn");
let navbar = document.getElementById("navbar-wrapper");

export function initApp(): void {
	loadTheme();
	initCustomScrollbar();
	showBanner();

	initRippleEffect(); // Initialize ripple effect
	initScrollAnimations(); // Initialize scroll-triggered animations
	fetchUmamiStats(); // Fetch Umami stats on initial load
	registerGlobalClickOutsideHandler(); // Register global click outside handler
	initGithubCards(); // Initialize GitHub cards
}

function scrollFunction(currentScrollTop?: number) {
	const bannerHeightPercent = document.body.classList.contains("is-home") ? BANNER_HEIGHT_HOME : BANNER_HEIGHT;
	const bannerHeightPx = window.innerHeight * (bannerHeightPercent / 100);
	const scrollTop = currentScrollTop !== undefined ? currentScrollTop : document.documentElement.scrollTop || document.body.scrollTop;

	if (backToTopBtn) {
		if (scrollTop > bannerHeightPx) {
			backToTopBtn.classList.remove("hide");
		} else {
			backToTopBtn.classList.add("hide");
		}
	}

	if (!bannerEnabled) return;
	if (navbar) {
		const NAVBAR_HEIGHT = 72;
		const MAIN_PANEL_EXCESS_HEIGHT = MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16;

		const threshold = bannerHeightPx - NAVBAR_HEIGHT - MAIN_PANEL_EXCESS_HEIGHT - 16;
		if (scrollTop >= threshold) {
			navbar.classList.add("navbar-hidden");
		} else {
			navbar.classList.remove("navbar-hidden");
		}
	}
}

// Re-query DOM elements that might be lost after swap
function refreshElements() {
	backToTopBtn = document.getElementById("back-to-top-btn");
	navbar = document.getElementById("navbar-wrapper");
}

let scrollHandler: (() => void) | undefined;
let resizeHandler: (() => void) | undefined;
let initialized = false;

export function setupEventListeners(): void {
	if (initialized) return;
	initialized = true;

	/* Load settings when entering the site */
	initApp();
	initPhotoSwipe();

	if (window?.swup?.hooks) {
		setupSwupEvents();
	} else {
		document.addEventListener("swup:enable", setupSwupEvents);
	}

	// Hook into Swup replace to refresh elements references
	if (window.swup) {
		window.swup.hooks.on("content:replace", refreshElements);
	}

	let isTicking = false;
	scrollHandler = () => {
		if (!isTicking) {
			window.requestAnimationFrame(() => {
				const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
				scrollFunction(scrollTop);
				updateReadingProgressBar(); // This also reads but we've optimized internally
				isTicking = false;
			});
			isTicking = true;
		}
	};
	window.addEventListener("scroll", scrollHandler, { passive: true });

	resizeHandler = () => {
		// calculate the --banner-height-extend, which needs to be a multiple of 4 to avoid blurry text
		let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
		offset = offset - (offset % 4);
		document.documentElement.style.setProperty("--banner-height-extend", `${offset}px`);
	};
	window.addEventListener("resize", resizeHandler);

	// Initial update on DOMContentLoaded
	document.addEventListener("DOMContentLoaded", updateReadingProgressBar);
}
