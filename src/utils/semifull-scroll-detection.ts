// Function to initialize semifull scroll detection
export function initSemifullScrollDetection(): void {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	const transparentMode = navbar.getAttribute("data-transparent-mode");
	if (transparentMode !== "semifull") return;

	const isHomePage = document.body.classList.contains("is-home");

	// If not on the homepage, remove scroll listener and set to scrolled state
	if (!isHomePage) {
		if (window.semifullScrollHandler) {
			window.removeEventListener("scroll", window.semifullScrollHandler);
			window.semifullScrollHandler = undefined;
		}
		navbar?.classList.add("scrolled");
		return;
	}

	navbar?.classList.remove("scrolled");

	let ticking = false;

	function updateNavbarState() {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const threshold = 50;
		if (scrollTop > threshold) {
			navbar?.classList.add("scrolled");
		} else {
			navbar?.classList.remove("scrolled");
		}
		ticking = false;
	}

	function requestTick() {
		if (!ticking) {
			requestAnimationFrame(updateNavbarState);
			ticking = true;
		}
	}

	if (window.semifullScrollHandler) {
		window.removeEventListener("scroll", window.semifullScrollHandler);
	}

	window.semifullScrollHandler = requestTick;
	window.addEventListener("scroll", requestTick, { passive: true });
	updateNavbarState();
}
