function createParticle(x: number, y: number, type: "click" | "trail") {
	const particle = document.createElement("div");
	document.body.appendChild(particle);

	const size = Math.random() * 4 + 2; // size between 2px and 6px
	particle.style.width = `${size}px`;
	particle.style.height = `${size}px`;
	particle.style.left = `${x}px`;
	particle.style.top = `${y}px`;

	if (type === "click") {
		particle.className = "particle click-particle";
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * 50 + 30; // radius between 30 and 80
		const transformToX = Math.cos(angle) * radius;
		const transformToY = Math.sin(angle) * radius;
		particle.style.setProperty(
			"--transform-to",
			`translate(${transformToX}px, ${transformToY}px)`,
		);
	} else {
		// trail
		particle.className = "particle trail-particle";
		particle.style.width = "3px";
		particle.style.height = "3px";
	}

	particle.addEventListener("animationend", () => {
		if (particle.parentNode) {
			particle.parentNode.removeChild(particle);
		}
	});
}

let isInitialized = false;

export function initMouseEffects(): void {
	if (isInitialized || window.matchMedia("(pointer: coarse)").matches) {
		return;
	}

	const handleClick = (e: MouseEvent) => {
		if ((e.target as HTMLElement).closest('a, button, .btn, [role="button"]')) {
			return;
		}

		for (let i = 0; i < 10; i++) {
			createParticle(e.clientX, e.clientY, "click");
		}
	};

	let lastTrailTime = 0;
	const trailInterval = 40; // ms

	const handleMouseMove = (e: MouseEvent) => {
		// No trail effect when dragging/selecting
		if (e.buttons > 0) {
			return;
		}
		const now = Date.now();
		if (now - lastTrailTime > trailInterval) {
			lastTrailTime = now;
			createParticle(e.clientX, e.clientY, "trail");
		}
	};

	document.addEventListener("click", handleClick);
	document.addEventListener("mousemove", handleMouseMove);

	isInitialized = true;
}
