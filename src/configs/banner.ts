import type { BannerConfig } from "@/types/config";

export const bannerConfig: BannerConfig = {
	enable: true,
	src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
	credit: {
		enable: true, // Display the credit text of the banner image
		text: "Firewatch", // Credit text to be displayed
		url: "https://store.steampowered.com/app/383870/Firewatch/", // (Optional) URL link to the original artwork or artist's page
	},
	text: {
		enable: true, // Enable text banner
	},
	waves: {
		enable: true,
	},
};
