import { effectsConfig } from "../../configs/effects";

let _rippleDelegateHandler: ((event: MouseEvent) => void) | undefined;

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
