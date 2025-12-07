import { effectsConfig } from "../configs/effects";

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
			const size = Math.floor(
				Math.random() * effectsConfig.click.sizeRange.max +
					effectsConfig.click.sizeRange.min,
			);
			particle.style.width = `${size}px`;
			particle.style.height = `${size}px`;

			const angle = Math.random() * Math.PI * 2;
			const distance =
				Math.random() *
					(effectsConfig.click.distanceRange.max -
						effectsConfig.click.distanceRange.min) +
				effectsConfig.click.distanceRange.min;
			const transformTo = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`;
			particle.style.setProperty("--transform-to", transformTo);
		} else {
			particle.className = "particle trail-particle";
			particle.style.width = `${effectsConfig.trail.size}px`;
			particle.style.height = `${effectsConfig.trail.size}px`;
		}

		const animationDuration = isClick
			? effectsConfig.click.animationDuration
			: effectsConfig.trail.animationDuration;
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

export function initRippleEffect(): void {
    const applyRipple = (event: MouseEvent) => {
        const button = event.currentTarget as HTMLElement;
        if (!button) return;

        // Ensure button has ripple-container class, if not, add it for styling
        if (!button.classList.add('ripple-container'));

        // Remove any existing ripples to prevent multiple ripples on quick clicks
        const existingRipples = button.querySelectorAll('.ripple');
        existingRipples.forEach(r => r.remove());

        const rect = button.getBoundingClientRect();
        const diameter = Math.max(rect.width, rect.height);
        const radius = diameter / 2;

        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        
        // Position the ripple at the click point
        ripple.style.width = ripple.style.height = `${diameter}px`;
        ripple.style.left = `${event.clientX - rect.left - radius}px`;
        ripple.style.top = `${event.clientY - rect.top - radius}px`;

        button.appendChild(ripple);

        // Remove the ripple after animation ends
        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    };

    // Target elements for ripple effect
    const rippleElements = document.querySelectorAll<HTMLElement>(
        '.btn-regular, .btn-regular-dark, .btn-plain, .btn-card, .link'
    );

    rippleElements.forEach(element => {
        // Prevent ripple effect if the element is disabled
        if (!element.hasAttribute('disabled')) {
            element.addEventListener('mousedown', applyRipple);
        }
    });
}

export function initScrollAnimations(): void {
    if (typeof window === "undefined") return;

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the item is visible
    });

    const elementsToAnimate: Element[] = [];

    // Target elements within post content
    const postContainer = document.getElementById('post-container');
    if (postContainer) {
        // Collect main block-level children of markdown-content, but exclude those with onload-animation
        const markdownContent = postContainer.querySelector('.markdown-content');
        if (markdownContent) {
            Array.from(markdownContent.children).forEach(child => {
                if (!child.classList.contains('onload-animation')) { // Exclude if already animated on load
                    elementsToAnimate.push(child);
                }
            });
        }

        // Collect other animated sections on the post page
        const aiSummary = postContainer.querySelector('.ai-summary');
        if (aiSummary && !aiSummary.classList.contains('onload-animation')) {
             elementsToAnimate.push(aiSummary);
        }
        const licenseContainer = postContainer.querySelector('.license-container');
        if (licenseContainer && !licenseContainer.classList.contains('onload-animation')) {
            elementsToAnimate.push(licenseContainer);
        }
        const shareButtons = postContainer.querySelector('.share-buttons');
        if (shareButtons && !shareButtons.classList.contains('onload-animation')) {
            elementsToAnimate.push(shareButtons);
        }
        const relatedPosts = postContainer.querySelector('.related-posts'); // Assuming a class for RelatedPosts
         if (relatedPosts && !relatedPosts.classList.contains('onload-animation')) {
            elementsToAnimate.push(relatedPosts);
        }

        // Previous/Next post navigation (if they exist)
        const prevNextNav = postContainer.querySelector('.flex.flex-col.md\\:flex-row.justify-between.mb-4.gap-4.overflow-hidden.w-full');
        if (prevNextNav && !prevNextNav.classList.contains('onload-animation')) {
            elementsToAnimate.push(prevNextNav);
        }
    }

    // Also collect elements that still have the `scroll-animate` class manually applied
    document.querySelectorAll('.scroll-animate').forEach(element => {
        if (!elementsToAnimate.includes(element)) { // Avoid duplicates
            elementsToAnimate.push(element);
        }
    });

    elementsToAnimate.forEach(element => {
        // Add scroll-animate class if it's not already there and not part of onload-animation
        if (!element.classList.contains('scroll-animate') && !element.classList.contains('onload-animation')) {
            element.classList.add('scroll-animate');
        }
        observer.observe(element);
    });
}



