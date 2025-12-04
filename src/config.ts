import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";
import { seriesConfig } from "./configs/series";

export const siteConfig: SiteConfig = {
	title: "Wtada233's Blog",
	subtitle: "_LFW_",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 280, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
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

    waves: {
      enable: true,
      performance: {
        quality: "high",
        hardwareAcceleration: true,
      },
    },
    navbar: {
      transparentMode: "semi", // 导航栏透明模式："semi" 半透明加圆角，"full" 完全透明，"semifull" 动态透明
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

};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		...(seriesConfig.enabled ? [LinkPreset.Series] : []),
                {
                        name: "别人的网页..?",
                        url: "/sites/",
                        external: false, // Show an external link icon and will open in a new tab
                },
                {
                        name: "QQ交流群",
                        url: "https://qm.qq.com/cgi-bin/qm/qr?k=L1oKGqOXks5BfCnmXICVHK12fp6idgXJ&jump_from=webapi&authKey=0wKKiYFigxhrOpUAvWu4DzoU8oEc7U6JSnBF3rMGo5Zq8PgxPKppLb+pe0Z4GByD",
                        external: true, // Show an external link icon and will open in a new tab
                },
	],
};

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

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
