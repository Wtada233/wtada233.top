import { adaptiveThemeConfig } from "@configs/adaptive-theme";
import { effectsConfig } from "@configs/effects";

let _rippleDelegateHandler: ((event: MouseEvent) => void) | undefined;
let lastClickX = 0;
let lastClickY = 0;

// Track last click coordinates globally
if (typeof window !== "undefined") {
	document.addEventListener(
		"mousedown",
		(e) => {
			lastClickX = e.clientX;
			lastClickY = e.clientY;
		},
		{ capture: true },
	);
}

export function createFullScreenRipple(x: number, y: number, hue: string): void {
	const ripple = document.createElement("span");
	ripple.classList.add("ripple-screen");
	ripple.style.backgroundColor = `oklch(0.70 0.14 ${hue})`;

	const w = window.innerWidth;
	const h = window.innerHeight;

	const distX = Math.max(x, w - x);
	const distY = Math.max(y, h - y);
	const radius = Math.sqrt(distX * distX + distY * distY);
	const diameter = radius * 2;

	ripple.style.width = ripple.style.height = `${diameter}px`;
	ripple.style.left = `${x - radius}px`;
	ripple.style.top = `${y - radius}px`;

	document.body.appendChild(ripple);

	ripple.addEventListener("animationend", () => {
		ripple.remove();
	});
}

export function triggerPostIndexRipple(): void {
	if (typeof window !== "undefined" && lastClickX !== 0 && lastClickY !== 0) {
		const postContainer = document.getElementById("post-container");
		const hue = postContainer?.dataset.hue;
		if (hue) {
			createFullScreenRipple(lastClickX, lastClickY, hue);
			// Reset coordinates to prevent re-triggering on the same spot accidentally
			lastClickX = 0;
			lastClickY = 0;
		}
	}
}

export function initRippleEffect(): void {
	const isPostPage = window.location.pathname.includes("/posts/");
	let pageAllowsEffects = true;

	if (isPostPage && typeof window.postEffects !== "undefined") {
		pageAllowsEffects = window.postEffects;
	}

	if (!effectsConfig.enable || !effectsConfig.ripple.enable || !pageAllowsEffects) return;

	// Remove existing delegate handler if any, to prevent duplicates
	if (_rippleDelegateHandler) {
		document.body.removeEventListener("mousedown", _rippleDelegateHandler);
	}

	_rippleDelegateHandler = (event: MouseEvent) => {
		const target = event.target as HTMLElement;

		// Check for hue switch trigger first
		const hueTrigger = target.closest("[data-hue]") as HTMLElement;
		if (hueTrigger?.dataset.hue) {
			if (hueTrigger.id === "post-container") {
				// Do nothing
			} else if (adaptiveThemeConfig.animation) {
				const hue = hueTrigger.dataset.hue;
				createFullScreenRipple(event.clientX, event.clientY, hue);
				return;
			}
		}
		// ... rest of the function

		const button = target.closest(".btn-regular, .btn-regular-dark, .btn-plain, .btn-card, .link") as HTMLElement;

		if (!button || button.hasAttribute("disabled")) return;

		// Ensure button has ripple-container class, if not, add it for styling
		button.classList.add("ripple-container");

		// Remove any existing ripples to prevent multiple ripples on quick clicks
		const existingRipples = button.querySelectorAll(".ripple");
		existingRipples.forEach((r) => {
			r.remove();
		});

		const rect = button.getBoundingClientRect();
		const diameter = Math.max(rect.width, rect.height);
		const radius = diameter / 2;

		const ripple = document.createElement("span");
		ripple.classList.add("ripple");

		// Position the ripple at the click point
		ripple.style.width = ripple.style.height = `${diameter}px`;
		ripple.style.left = `${event.clientX - rect.left - radius}px`;
		ripple.style.top = `${event.clientY - rect.top - radius}px`;

		button.appendChild(ripple);

		// Remove the ripple after animation ends
		ripple.addEventListener("animationend", () => {
			ripple.remove();
		});
	};

	// Attach the single delegated listener to document.body
	document.body.addEventListener("mousedown", _rippleDelegateHandler);
}

export function destroyRippleEffect(): void {
	if (_rippleDelegateHandler) {
		document.body.removeEventListener("mousedown", _rippleDelegateHandler);
		_rippleDelegateHandler = undefined;
	}
	// Also clean up any lingering ripple elements that might not have finished their animation
	document.querySelectorAll(".ripple").forEach((r) => {
		r.remove();
	});
}
