---
title: Fuwari 屎山修复记录
og_theme: dark
published: 2026-05-01
description: "可恶啊！可恶的屎山！不许崩溃！"
image: "./cover.jpg"
tags: ["屎山", "技术"]
category: Tech
draft: false
series: 该博客搭建
ai: "本文揭秘了 Fuwari 主题因 ImageWrapper 组件全量扫描导致的隐性 CSS 依赖 Bug，记录了通过显式引入重构的过程，提升了架构稳健性与构建性能。"
---

> 这个博客用的是Fuwari模板...

> 当然，是魔改过的。

## 开始修复屎山

在开始前，大家得先知道这是个怎么样的屎山吧...

事情的起因是我尝试优化原版Fuwari的ImageWrapper组件，注意到一个TODO，似乎是动态import资源的临时实现，十分暴力，直接在项目根目录遍历所有文件强制触碰一遍，但是这临时实现在github挂了一年了。我不敢删这东西，只敢优化一下——我从在项目根目录疯狂遍历改为了在src/下遍历后缀为.jpeg .jpg .png .webp...这些图片格式的

### 结果没想到！直接！把站点样式干报废了！

我对比前后dist，注意到少了一个CSS引入——让整个站点坏得这么彻底，大概是main.css。

然后我就运行了`grep -r main.css`，这令我大吃一惊：啊？根本没有引入啊！！！

所以问题来了，之前博客样式到底是怎么渲染的呢？我查看了我修改的ImageWrapper源码。

```
// ...

// TODO temporary workaround for images dynamic import
// https://github.com/withastro/astro/issues/3373
// biome-ignore lint/suspicious/noImplicitAnyLet: <check later>
let img;
if (isLocal) {
	const files = import.meta.glob<ImageMetadata>("../../**", {
		import: "default",
	});
	let normalizedPath = path
		.normalize(path.join("../../", basePath, src))
		.replace(/\\/g, "/");
	const file = files[normalizedPath];
	if (!file) {
		console.error(
			`\n[ERROR] Image file not found: ${normalizedPath.replace("../../", "src/")}`,
		);
	}
	img = await file();
}
// ...
```

所以...这东西在......暴力import.meta.glob时触发了某种特性，加载了遍历到的main.css？虽然这很猎奇，但是我试了一下给扩展名匹配加上.css，居然真的成了...但是很显然这就是屎，不可能一直用。

所以Layout.astro是必改的，加入

```
import "@/styles/main.css";
```

然后修改ImageWrapper消除屎山：

```
const files = import.meta.glob<ImageMetadata>("/src/{assets,content}/**/*.{jpg,jpeg,png,gif,webp,avif}", { import: "default" });
```

这里做了后缀名和扫描路径限制，显著加快构建。

至此屎山修复完成。

## 后记

我复盘了一下，整件事最离谱的地方在于：由于 MainGridLayout.astro 全局引用了背景 Banner，而 Banner 又恰好包裹在 ImageWrapper 里，导致这个“全盘扫描”成了维持全站样式的唯一呼吸机。

这意味着：

 - 隐性耦合：魔改者以为只是在修一个图片组件，实际上是在修整个项目的“生命维持系统”。
 - 性能债：Vite 每次构建都要被迫扫描成百上千个无关文件，仅仅是为了在混乱中“偶遇”那一个 main.css。
 - 架构隐患：万一哪天我想搞个极简模式把 Banner 关了，整个博客就会瞬间退化回原始人时代。

实在是太猎奇了...不过好歹这屎山也是被删掉了，对吧？

好吧，还有高手。别的css也是这样！特大好消息！（误）

总之就写到这里了，我去改Layout.astro了，bye
