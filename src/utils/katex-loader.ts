/**
 * 动态加载 KaTeX 并渲染指定元素中的数学公式
 */
export async function renderMath(element: HTMLElement): Promise<void> {
	if (!element) return;

	try {
		// 动态导入 自动渲染扩展
		// @ts-expect-error
		const { default: renderMathInElement } = await import("katex/dist/contrib/auto-render.js");

		renderMathInElement(element, {
			delimiters: [
				{ left: "$$", right: "$$", display: true },
				{ left: "$", right: "$", display: false },
				{ left: "\\(", right: "\\)", display: false },
				{ left: "\\[", right: "\\]", display: true },
			],
			throwOnError: false,
		});
	} catch (e) {
		console.error("Failed to load or render KaTeX:", e);
	}
}
