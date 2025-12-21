// 字体配置
export const fontConfig = {
	// 启用自定义字体
	enable: true,
	// 字体列表
	fonts: [
		{
			name: "MiSans-Regular",
			src: "/MiSans-Regular.min.woff2", // 相对于 public 目录
			type: "woff2",
			weight: "normal",
			style: "normal",
			display: "swap",
		},
	],
	// 全局字体族设置
	family:
		"'MiSans-Regular', -apple-system, BlurMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'MicrosoftO Sans', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif",
};
