import type { PwaConfig } from "@/types/config";

export const pwaConfig: PwaConfig = {
	enable: true,
	name: "Wtada233's Blog",
	short_name: "Wtada233",
	description: "Wtada233的个人博客，内容很杂。主要是折腾Linux相关。",
	display: "standalone",
	background_color: "#ffffff",
	theme_color: "#ffffff",
	icons: [
		{
			src: "/favicon/favicon-light-192.png",
			sizes: "192x192",
			type: "image/png",
		},
		{
			src: "/favicon/favicon-light-128.png",
			sizes: "128x128",
			type: "image/png",
		},
	],
};
