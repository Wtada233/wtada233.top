export const effectsConfig = {
	enable: true, // Master switch for all effects
	ripple: {
		enable: true, // Enable/disable ripple effect
	},
	scrollAnimation: {
		enable: true, // Enable/disable scroll-triggered entrance animations
	},
	click: {
		sizeRange: {
			min: 5,
			max: 15,
		},
		distanceRange: {
			min: 50,
			max: 100, // 50 + 50 from original code
		},
		animationDuration: 600,
		particleCount: 10,
	},
	trail: {
		size: 5,
		animationDuration: 500,
	},
	tilt: {
		enable: true,
		intensity: 75,
	},
	throttleLimit: 50,
};

export type EffectsConfig = typeof effectsConfig;
