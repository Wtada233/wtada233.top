import type { SiteConfig } from "@/types/config";

export const siteConfig: SiteConfig = {
	title: "Wtada233's Blog",
	subtitle: "_LFW_",
	lang: "en", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	keywords: "Wtada233, 折腾Linux, 技术分享, 博客搭建",
	description: "Wtada233的个人博客，内容很杂。主要是折腾Linux相关。本站使用Fuwari搭建，欢迎在Github提交PR！| 在线状态：uptime.wtada233.top",
	themeColor: {
		hue: 280, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
	},
	banner: {
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
	},

	showLastModified: true, // 文章页底部的"上次编辑时间"卡片开关
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
	seo: {
		twitterId: "@Wtada233", // 你的 Twitter ID
		googleSiteVerification: "", // Google 站长验证
		bingSiteVerification: "", // Bing 站长验证
		baiduSiteVerification: "", // 百度站长验证
	},
};
