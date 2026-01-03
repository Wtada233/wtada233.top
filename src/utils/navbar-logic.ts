export function updateActiveLink(): void {
	const currentPath = window.location.pathname;
	const navLinks = document.querySelectorAll("#navbar a[href]");
	navLinks.forEach((link) => {
		if (link.id === "nav-logo") return;
		const href = link.getAttribute("href");
		if (!href || href.startsWith("http") || href.startsWith("//")) return;

		const normalize = (p: string) => {
			let res = p;
			if (res !== "/" && res.endsWith("/")) res = res.slice(0, -1);
			return res || "/";
		};

		const normCurrent = normalize(currentPath);
		const normLink = normalize(href);

		if (normCurrent === normLink) {
			link.classList.add("active");
		} else {
			link.classList.remove("active");
		}
	});
}

export function loadMenuButtonScript(): void {
	const menuBtn = document.getElementById("nav-menu-switch");
	if (menuBtn) {
		menuBtn.onclick = () => {
			const menuPanel = document.getElementById("nav-menu-panel");
			if (menuPanel) {
				menuPanel.classList.toggle("float-panel-closed");
			}
		};
	}
}

export function initNavbar(): void {
	loadMenuButtonScript();
	updateActiveLink();
}
