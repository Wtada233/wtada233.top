export function updateReadingProgressBar(): void {
	const progressBar = document.getElementById("reading-progress-bar");
	if (!progressBar) return;

	// Check if the current page is a post page (to avoid showing the bar on non-article pages)
	const isPostPage = window.location.pathname.includes("/posts/");

	if (!isPostPage) {
		progressBar.style.width = "0%";
		return;
	}

	// Use document.documentElement for full page scrolling
	const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

	// Calculate scroll percentage, ensuring we don't divide by zero
	const scrollRange = scrollHeight - clientHeight;
	const scrollPercent = scrollRange > 0 ? (scrollTop / scrollRange) * 100 : 0;
	progressBar.style.width = `${scrollPercent}%`;
}
