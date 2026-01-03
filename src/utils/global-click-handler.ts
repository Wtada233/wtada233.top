let globalClickOutsideHandler: ((event: MouseEvent) => void) | undefined;

export function registerGlobalClickOutsideHandler(): void {
	if (globalClickOutsideHandler) {
		document.removeEventListener("click", globalClickOutsideHandler);
	}
	globalClickOutsideHandler = (event: MouseEvent) => {
		const target = event.target as Node;
		const panels = [
			{ id: "nav-menu-panel", ignoreSwitches: ["nav-menu-switch"] },
			{
				id: "search-panel",
				ignoreSwitches: ["search-panel", "search-bar", "search-switch"],
			},
			{ id: "language-panel", ignoreSwitches: ["language-switch"] },
			{ id: "light-dark-panel", ignoreSwitches: ["scheme-switch"] },
		];

		for (const panelConfig of panels) {
			const panelDom = document.getElementById(panelConfig.id);
			if (!panelDom || panelDom.classList.contains("float-panel-closed")) continue;

			let shouldIgnore = false;
			if (target === panelDom || panelDom.contains(target)) {
				shouldIgnore = true; // Clicked inside the panel
			} else {
				for (const switchId of panelConfig.ignoreSwitches) {
					const switchDom = document.getElementById(switchId);
					if (switchDom && (target === switchDom || switchDom.contains(target))) {
						shouldIgnore = true; // Clicked on the switch button
						break;
					}
				}
			}

			if (!shouldIgnore) {
				panelDom.classList.add("float-panel-closed");
			}
		}
	};
	document.addEventListener("click", globalClickOutsideHandler);
}

export function unregisterGlobalClickOutsideHandler(): void {
	if (globalClickOutsideHandler) {
		document.removeEventListener("click", globalClickOutsideHandler);
		globalClickOutsideHandler = undefined;
	}
}
