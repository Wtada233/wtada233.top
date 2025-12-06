export function initNavbarPanelToggles(): void {
	const settingBtn = document.getElementById("display-settings-switch");
	if (settingBtn) {
		settingBtn.onclick = () => {
			const settingPanel = document.getElementById("display-setting");
			if (settingPanel) {
				settingPanel.classList.toggle("float-panel-closed");
			}
		};
	}

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
