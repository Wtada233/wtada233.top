import { effectsConfig } from '../configs/effects';

function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
	func: T,
	limit: number,
): T {
	let inThrottle: boolean;
	return function (
		this: ThisParameterType<T>,
		...args: Parameters<T>
	): ReturnType<T> {
		if (!inThrottle) {
			const result = func.apply(this, args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
			return result;
		}
		return undefined as ReturnType<T>; // Return undefined during throttling for consistency
	} as T;
}

export function initEffects(): void {
	if (typeof window === "undefined" || !effectsConfig.enable) return;

	// Don't run on devices that likely have touch as primary input to save performance.
	if (window.matchMedia("(pointer: coarse)").matches) {
		return;
	}

	const createParticle = (x: number, y: number, isClick: boolean) => {
		const particle = document.createElement("div");
		document.body.appendChild(particle);

		// Use absolute positioning to respect page scroll.
		particle.style.position = "absolute";
		particle.style.left = `${x}px`;
		particle.style.top = `${y}px`;

		if (isClick) {
			particle.className = "particle click-particle";
			const size = Math.floor(Math.random() * effectsConfig.click.sizeRange.max + effectsConfig.click.sizeRange.min);
			particle.style.width = `${size}px`;
			particle.style.height = `${size}px`;

			const angle = Math.random() * Math.PI * 2;
			const distance = Math.random() * (effectsConfig.click.distanceRange.max - effectsConfig.click.distanceRange.min) + effectsConfig.click.distanceRange.min;
			const transformTo = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
			particle.style.setProperty("--transform-to", transformTo);
		} else {
			particle.className = "particle trail-particle";
			particle.style.width = `${effectsConfig.trail.size}px`;
			particle.style.height = `${effectsConfig.trail.size}px`;
		}

		const animationDuration = isClick ? effectsConfig.click.animationDuration : effectsConfig.trail.animationDuration;
		setTimeout(() => {
			if (particle.parentNode) {
				particle.parentNode.removeChild(particle);
			}
		}, animationDuration);
	};

	document.addEventListener("click", (e) => {
		// Use pageX/pageY to get the position relative to the whole page
		const x = e.pageX;
		const y = e.pageY;
		for (let i = 0; i < effectsConfig.click.particleCount; i++) {
			createParticle(x, y, true);
		}
	});

	document.addEventListener(
		"mousemove",
		throttle((e: MouseEvent) => {
			const x = e.pageX;
			const y = e.pageY;
			createParticle(x, y, false);
		}, effectsConfig.throttleLimit),
	);
}
