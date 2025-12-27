export function updateReadingProgressBar(): void {
	const progressBar = document.getElementById("reading-progress-bar");
	if (!progressBar) return;

	// Check if the current page is a post page
	const isPostPage = window.location.pathname.includes("/posts/");

	if (!isPostPage) {
		progressBar.style.transform = "scaleX(0)";
		return;
	}

	const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

	// Calculate scroll percentage
	const scrollRange = scrollHeight - clientHeight;
	const scrollPercent = scrollRange > 0 ? scrollTop / scrollRange : 0;
	progressBar.style.transform = `scaleX(${scrollPercent})`;
}
