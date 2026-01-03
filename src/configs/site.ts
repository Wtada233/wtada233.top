import type { SiteConfig } from "@/types/config";

export const siteConfig: SiteConfig = {
	title: "Wtada233's Blog",
	subtitle: "_LFW_",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	keywords: "Wtada233, 折腾Linux, 技术分享, 博客搭建",
	description: "Wtada233的个人博客，内容很杂。主要是折腾Linux相关。本站使用Fuwari搭建，欢迎在Github提交PR！| 在线状态：uptime.wtada233.top",
	themeColor: {
		hue: 280, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
	},
	showLastModified: true, // 文章页底部的"上次编辑时间"卡片开关
};
