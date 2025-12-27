let cachedScrollRange = 0;

export function refreshReadingProgressCache(): void {
	const isPostPage = window.location.pathname.includes("/posts/");
	if (!isPostPage) {
		cachedScrollRange = 0;
		return;
	}
	const { scrollHeight, clientHeight } = document.documentElement;
	cachedScrollRange = scrollHeight - clientHeight;
}

export function updateReadingProgressBar(): void {
	const progressBar = document.getElementById("reading-progress-bar");
	if (!progressBar) return;

	// Check if the current page is a post page
	const isPostPage = window.location.pathname.includes("/posts/");

	if (!isPostPage) {
		progressBar.style.transform = "scaleX(0)";
		return;
	}

	if (cachedScrollRange <= 0) {
		refreshReadingProgressCache();
	}

	const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

	// Calculate scroll percentage
	const scrollPercent = cachedScrollRange > 0 ? scrollTop / cachedScrollRange : 0;
	progressBar.style.transform = `scaleX(${scrollPercent})`;
}
