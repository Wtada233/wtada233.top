import { effectsConfig } from "@configs/effects";

let _scrollAnimationObserver: IntersectionObserver | undefined;

export function initScrollAnimations(): void {
	const isPostPage = window.location.pathname.includes("/posts/");
	let pageAllowsEffects = true;

	if (isPostPage && typeof window.postEffects !== "undefined") {
		pageAllowsEffects = window.postEffects;
	}

	if (typeof window === "undefined" || !effectsConfig.enable || !effectsConfig.scrollAnimation.enable || !pageAllowsEffects) return;

	// Disconnect existing observer if any
	if (_scrollAnimationObserver) {
		_scrollAnimationObserver.disconnect();
	}

	const observer = new IntersectionObserver(
		(entries, _observer) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("show");
					_observer.unobserve(entry.target);
				}
			});
		},
		{
			root: null, // viewport
			rootMargin: "0px",
			threshold: 0.1, // Trigger when 10% of the item is visible
		},
	);

	// Store the observer instance
	_scrollAnimationObserver = observer;

	const elementsToAnimate: Element[] = [];

	// Target elements within post content
	const postContainer = document.getElementById("post-container");
	if (postContainer) {
		const markdownContent = postContainer.querySelector(".markdown-content");
		const isMobile = window.matchMedia("(max-width: 768px)").matches;
		if (markdownContent && !isMobile) {
			// Only animate major blocks to save performance on long articles
			const selector = "h1, h2, h3, h4, h5, h6, img, .expressive-code, table, blockquote, .admonition";
			Array.from(markdownContent.querySelectorAll(selector)).forEach((child) => {
				if (!child.classList.contains("onload-animation")) {
					elementsToAnimate.push(child);
				}
			});
		}

		// Collect other animated sections on the post page
		const aiSummary = postContainer.querySelector(".ai-summary");
		if (aiSummary && !aiSummary.classList.contains("onload-animation")) {
			elementsToAnimate.push(aiSummary);
		}
		const licenseContainer = postContainer.querySelector(".license-container");
		if (licenseContainer && !licenseContainer.classList.contains("onload-animation")) {
			elementsToAnimate.push(licenseContainer);
		}
		const shareButtons = postContainer.querySelector(".share-buttons");
		if (shareButtons && !shareButtons.classList.contains("onload-animation")) {
			elementsToAnimate.push(shareButtons);
		}
		const relatedPosts = postContainer.querySelector(".related-posts"); // Assuming a class for RelatedPosts
		if (relatedPosts && !relatedPosts.classList.contains("onload-animation")) {
			elementsToAnimate.push(relatedPosts);
		}

		// Previous/Next post navigation (if they exist)
		const prevNextNav = postContainer.querySelector(".flex.flex-col.md\\:flex-row.justify-between.mb-4.gap-4.overflow-hidden.w-full");
		if (prevNextNav && !prevNextNav.classList.contains("onload-animation")) {
			elementsToAnimate.push(prevNextNav);
		}
	}

	// Also collect elements that still have the `scroll-animate` class manually applied
	document.querySelectorAll(".scroll-animate").forEach((element) => {
		if (!elementsToAnimate.includes(element)) {
			// Avoid duplicates
			elementsToAnimate.push(element);
		}
	});

	elementsToAnimate.forEach((element) => {
		// Add scroll-animate class if it's not already there and not part of onload-animation
		if (!element.classList.contains("scroll-animate") && !element.classList.contains("onload-animation")) {
			element.classList.add("scroll-animate");
		}
		observer.observe(element);
	});
}

export function destroyScrollAnimations(): void {
	if (_scrollAnimationObserver) {
		_scrollAnimationObserver.disconnect();
		_scrollAnimationObserver = undefined;
	}
}
