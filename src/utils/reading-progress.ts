export function updateReadingProgressBar() {
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

	// Calculate scroll percentage
	const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
	progressBar.style.width = `${scrollPercent}%`;
}
