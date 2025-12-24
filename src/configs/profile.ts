import type { ProfileConfig } from "../types/config";

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Wtada233",
	bio: "我不生产屎山，我只是屎山的搬运工😀",
	links: [
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili", // Visit https://icones.js.org/ for icon codes
			// You will need to install the corresponding icon set if it's not already included
			// `pnpm add @iconify-json/<icon-set-name>`
			url: "https://space.bilibili.com/28700427",
		},
		{
			name: "Youtube",
			icon: "fa6-brands:youtube",
			url: "https://youtube.com/@LinuxFirmware",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Wtada233",
		},
	],
};
