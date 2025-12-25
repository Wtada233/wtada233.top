import "overlayscrollbars/overlayscrollbars.css";
import { BANNER_HEIGHT, BANNER_HEIGHT_EXTEND, BANNER_HEIGHT_HOME, MAIN_PANEL_OVERLAPS_BANNER_HEIGHT } from "../constants/constants";
import { initRippleEffect } from "./animations/ripple";
import { initScrollAnimations } from "./animations/scroll";
import { showBanner } from "./banner-display-initializer";
import { initGithubCards } from "./github-card";
import { registerGlobalClickOutsideHandler, unregisterGlobalClickOutsideHandler } from "./global-click-handler";
import { initPhotoSwipe } from "./photoswipe-setup";
import { updateReadingProgressBar } from "./reading-progress";
import { initCustomScrollbar } from "./scrollbar-initializer";
import { setupSwupEvents } from "./swup-initializer";
import { loadHue, loadTheme } from "./theme-initializer";
import { fetchUmamiStats } from "./umami-utils";

import "../styles/animations/ripple.css";
import "../styles/animations/scroll.css";

const bannerEnabled = !!document.getElementById("banner-wrapper");

let backToTopBtn = document.getElementById("back-to-top-btn");
let navbar = document.getElementById("navbar-wrapper");

export function initApp(): void {
	loadTheme();
	loadHue();
	initCustomScrollbar();
	showBanner();

	initRippleEffect(); // Initialize ripple effect
	initScrollAnimations(); // Initialize scroll-triggered animations
	fetchUmamiStats(); // Fetch Umami stats on initial load
	registerGlobalClickOutsideHandler(); // Register global click outside handler
	initGithubCards(); // Initialize GitHub cards
}

function scrollFunction() {
	const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);

	if (backToTopBtn) {
		if (document.body.scrollTop > bannerHeight || document.documentElement.scrollTop > bannerHeight) {
			backToTopBtn.classList.remove("hide");
		} else {
			backToTopBtn.classList.add("hide");
		}
	}

	if (!bannerEnabled) return;
	if (navbar) {
		const NAVBAR_HEIGHT = 72;
		const MAIN_PANEL_EXCESS_HEIGHT = MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16; // The height the main panel overlaps the banner

		let bannerHeight = BANNER_HEIGHT;
		if (document.body.classList.contains("is-home")) {
			bannerHeight = BANNER_HEIGHT_HOME;
		}
		const threshold = window.innerHeight * (bannerHeight / 100) - NAVBAR_HEIGHT - MAIN_PANEL_EXCESS_HEIGHT - 16;
		if (document.body.scrollTop >= threshold || document.documentElement.scrollTop >= threshold) {
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

export function setupEventListeners(): void {
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
	window.addEventListener("scroll", () => {
		if (!isTicking) {
			window.requestAnimationFrame(() => {
				scrollFunction();
				updateReadingProgressBar();
				isTicking = false;
			});
			isTicking = true;
		}
	});

	window.onresize = () => {
		// calculate the --banner-height-extend, which needs to be a multiple of 4 to avoid blurry text
		let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
		offset = offset - (offset % 4);
		document.documentElement.style.setProperty("--banner-height-extend", `${offset}px`);
	};

	// Initial update on DOMContentLoaded
	document.addEventListener("DOMContentLoaded", updateReadingProgressBar);

	document.addEventListener("astro:before-swap", () => {
		const twikooScript = document.querySelector('script[src="/twikoo/twikoo.min.js"]');
		if (twikooScript) {
			twikooScript.remove();
		}
		if (window.twikoo) {
			delete window.twikoo;
		}
		unregisterGlobalClickOutsideHandler(); // Unregister global click outside handler
	});
}
