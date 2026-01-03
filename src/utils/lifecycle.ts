type Callback = () => void;

const registeredComponents = new Set<string>();

/**
 * Standardized lifecycle management for Astro components in a Swup environment.
 *
 * @param componentId A unique string ID for the component (e.g., 'ArchivePanel', 'TOC').
 *                    Prevents duplicate event listener registrations.
 * @param init The initialization function. Runs immediately when called, and after every Swup content replacement.
 * @param cleanup (Optional) The cleanup function. Runs before Swup replaces content.
 *                Use this to remove event listeners attached to specific DOM elements that are about to be destroyed.
 */
export function setupComponent(componentId: string, init: Callback, cleanup?: Callback): void {
	// 1. Run initialization immediately (for the current page load)
	init();

	// 2. Prevent duplicate registration of Swup hooks for the same component type
	if (registeredComponents.has(componentId)) return;
	registeredComponents.add(componentId);

	const registerHooks = () => {
		if (!window.swup) return;

		// Register init hook
		window.swup.hooks.on("content:replace", init);

		// Register cleanup hook if provided
		if (cleanup) {
			window.swup.hooks.before("content:replace", cleanup);
		}
	};

	// 3. Register hooks
	if (window.swup) {
		registerHooks();
	} else {
		document.addEventListener("swup:enable", registerHooks);
	}
}
