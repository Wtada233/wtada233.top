let _cachedScrollHeight = 0;
let _cachedClientHeight = 0;

export function updateReadingProgressBar(): void {
	const progressBar = document.getElementById("reading-progress-bar");
	if (!progressBar) return;

	const isPostPage = window.location.pathname.includes("/posts/");
	if (!isPostPage) {
		progressBar.style.transform = "scaleX(0)";
		return;
	}

	const { scrollTop } = document.documentElement;

	// Refresh layout values if they are 0 (first time or reset)
	if (_cachedScrollHeight === 0) {
		_cachedScrollHeight = document.documentElement.scrollHeight;
		_cachedClientHeight = document.documentElement.clientHeight;
	}

	const scrollRange = _cachedScrollHeight - _cachedClientHeight;
	const scrollPercent = scrollRange > 0 ? scrollTop / scrollRange : 0;

	progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, scrollPercent))})`;
}

// Reset cache on resize or content change
if (typeof window !== "undefined") {
	window.addEventListener(
		"resize",
		() => {
			_cachedScrollHeight = 0;
		},
		{ passive: true },
	);
}
