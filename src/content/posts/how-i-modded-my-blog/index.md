---
title: "博客魔改指南：我是如何实现这些功能的"
published: 2025-12-08
description: "一篇非常详细的指南，讲解了我是如何在这个 Fuwari 主题上实现置顶、系列、评论、AI摘要、自定义字体、半透明等一系列魔改功能的。"
image: "cover.png"
tags: ["博客搭建", "Fuwari", "Astro", "教程", "魔改"]
category: "Tech"
draft: false
series: "该博客搭建"
ai: "本文是一份全面的技术指南，详细阐述了如何对基于Astro的Fuwari博客主题进行深度定制。内容涵盖了文章置顶、内容系列化、Giscus评论系统集成、基于Gemini Pro的AI摘要、自定义字体应用、侧边栏信息统计、网站运行时间显示、相关文章推荐、社交分享按钮、文章过时提醒以及UI半透明（毛玻璃）效果等多个高级功能的实现方法。文章通过代码片段和文件路径指引，为读者提供了从配置到组件实现的一站式解决方案。"
---

# 博客魔改指南 (完整实现版)

这个博客基于 [Fuwari](https://github.com/saicaca/fuwari) 主题，但我对其进行了大量的个性化改造。很多人问这些功能是怎么实现的，所以我决定写一篇完整的指南，把我实现的所有功能都记录下来。

与之前的简介不同，**这篇指南会包含几乎所有功能的完整源代码和实现细节**，希望能帮助你完全理解并应用这些修改。

下面，我将逐一介绍每个功能的实现方法。
> 注意：这个博客中有很多别人的教程中的内容。对于将近一半的内容，我只是优化之后转载，如果你想要支持原作者，请阅读该博客仓库README。

## 1. 文章置顶

文章置顶允许我将重要的文章固定在列表的最上方。

**实现原理**：通过在文章的 frontmatter 中添加一个 `order` 字段来控制排序。`order: 1` 代表置顶，`order: -1` 代表置底，默认为 `0`。

#### 步骤 1: 启用功能开关

首先，创建一个配置文件来控制此功能的开关。

**`src/configs/pinning.ts`**
```typescript
export const pinningConfig = {
	enabled: true,
};
```

#### 步骤 2: 更新内容结构 (Schema)

在 `posts` 的内容集合定义中，加入 `order` 字段。

**`src/content/config.ts`**
```typescript
import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		series: z.string().optional(),
		// --- 添加此字段 ---
		order: z.number().default(0), 
		ai: z.string().optional().default(""),
		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
// ...
```

#### 步骤 3: 修改排序逻辑

修改工具函数 `getRawSortedPosts`，使其在排序时优先考虑 `order` 字段。

**`src/utils/content-utils.ts`**
```typescript
// ...
import { pinningConfig } from "@configs/pinning";

async function getRawSortedPosts(): Promise<CollectionEntry<"posts">[]> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	// 自定义排序逻辑
	const sorted = allBlogPosts.sort((a, b) => {
		// 第一优先级：按 order 字段排序（1 > 0 > -1)
		if (pinningConfig.enabled) {
			if (a.data.order !== b.data.order) {
				return b.data.order - a.data.order; // 降序：置顶(1)在前，置底(-1)在后
			}
		}

		// 第二优先级：order 相同时，按发布日期倒序（新文章在前）
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});

	return sorted;
}
// ...
```

#### 步骤 4: 在 UI 中显示置顶状态

最后，在文章卡片和文章页面中显示“[置顶]”或“[置底]”标签。

**`src/components/PostCard.astro`** (代码片段)
```astro
// ...
<a href={url} class="...">
    {title}
    {pinningConfig.enabled && order === 1 &&
        <span class="text-blue-500 text-2xl ml-2 font-medium">[置顶]</span>
    }
    {pinningConfig.enabled && order === -1 &&
        <span class="text-gray-400 text-2xl ml-2 font-medium">[置底]</span>
    }
    // ...
</a>
```

**`src/pages/posts/[...slug].astro`** (代码片段)
```astro
//...
<div class="transition w-full block font-bold mb-3 ...">
    {entry.data.title}
    {pinningConfig.enabled && entry.data.order === 1 &&
        <span class="text-blue-500 text-2xl ml-2 font-medium">[{i18n(I18nKey.pinned)}]</span>
    }
    {pinningConfig.enabled && entry.data.order === -1 &&
        <span class="text-gray-400 text-2xl ml-2 font-medium">[{i18n(I18nKey.pinnedToBottom)}]</span>
    }
</div>
```

## 2. 文章系列

将多篇文章组织成一个系列，方便读者连续阅读。

#### 步骤 1: 启用功能与更新结构

**`src/configs/series.ts`**
```typescript
export const seriesConfig = {
	enabled: true,
};
```

**`src/content/config.ts`** (代码片段)
```typescript
// ...
const postsCollection = defineCollection({
	schema: z.object({
		//...
		series: z.string().optional(),
	}),
});
```

#### 步骤 2: 创建系列专属页面

创建一个页面用于展示所有系列。

**`src/pages/series.astro`**
```astro
---
import SeriesPanel from "@components/SeriesPanel.astro";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import MainGridLayout from "@layouts/MainGridLayout.astro";
import { seriesConfig } from "../configs/series";
---

<MainGridLayout title={i18n(I18nKey.series)}>
    {seriesConfig.enabled ? (
        <SeriesPanel></SeriesPanel>
    ) : (
        <div class="card-base px-8 py-6">
            <p class="text-center text-red-500 font-bold">Series feature is currently disabled.</p>
        </div>
    )}
</MainGridLayout>
```

**`src/components/SeriesPanel.astro`**
这个组件会获取所有文章，并按“分类 -> 系列”进行分组展示。
```astro
---
import { UNCATEGORIZED } from "@constants/constants";
import { seriesConfig } from "../configs/series";
import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { getSortedPosts } from "../utils/content-utils";
import { getCategoryUrl, getSeriesUrl } from "../utils/url-utils";

interface Props {
	keyword?: string;
	tags?: string[];
	categories?: string[];
}

let posts = await getSortedPosts();

interface Series {
	count: number;
	name: string;
	posts: typeof posts;
}

const groups: { category: string; series: Series[] }[] = (() => {
	if (!seriesConfig.enabled) {
		return [];
	}
	const groupedSeries = posts.reduce(
		(
			grouped: { [category: string]: { [seriesName: string]: Series } },
			post,
		) => {
			const category = post.data.category || UNCATEGORIZED;
			const series = post.data.series || UNCATEGORIZED;
			if (category === UNCATEGORIZED || series === UNCATEGORIZED) {
				return grouped;
			}
			if (!grouped[category]) {
				grouped[category] = {};
			}
			if (!grouped[category][series]) {
				grouped[category][series] = {
					count: 0,
					name: series,
					posts: [],
				};
			}
			grouped[category][series].count++;
			grouped[category][series].posts.push(post);
			return grouped;
		},
		{},
	);

	// convert the object to an array
	const groupedSeriesArray = Object.keys(groupedSeries).map((key) => ({
		category: key,
		series: Object.values(groupedSeries[key]),
	}));

	return groupedSeriesArray;
})();
---

{seriesConfig.enabled && groups.length > 0 &&
  <div class="card-base px-8 py-6">
      {
          groups.map(group => (
              <div>
                  <div class="flex flex-row w-full items-center h-[3.75rem]">
                      <div class="w-[20%] md:w-[15%] transition text-2xl font-bold text-right text-75 flex flex-row justify-end">
                        <a aria-label={group.category} href={getCategoryUrl(group.category)}
                            class="btn-plain scale-animation rounded-lg h-11 font-bold px-2 active:scale-95"
                        >
                            {group.category}
                        </a>
                      </div>
                      <div class="w-[15%] md:w-[10%]">
                          <div class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto -outline-offset-[2px] z-50 outline-3"></div>
                      </div>
                      <div class="w-[65%] md:w-[75%] transition text-left text-50">{i18n(I18nKey.numberOfSeries, { n: group.series.length })}</div>
                  </div>
                  {group.series.map(series => (
                      <a href={getSeriesUrl(series.name)}
                         aria-label={series.name}
                         class="group btn-plain !block h-10 w-full rounded-lg hover:text-[initial]"
                      >
                          <div class="flex flex-row justify-start items-center h-full">
                              <!-- count -->
                              <div class="w-[20%] md:w-[15%] transition text-sm text-right text-50">
                                  {i18n(I18nKey.numberOfArticles, { n: series.count })}
                              </div>
                              <!-- dot and line -->
                              <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                                  <div class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                                  bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                                  outline outline-4 z-50
                                  outline-[var(--card-bg)]
                                  group-hover:outline-[var(--btn-plain-bg-hover)]
                                  group-active:outline-[var(--btn-plain-bg-active)]
                                  "
                                  ></div>
                              </div>
                              <!-- post title -->
                              <div class="w-[65%] md:max-w-[75%] md:w-[75%] text-left font-bold
                                  group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                                  text-75 pr-8 whitespace-nowrap overflow-ellipsis overflow-hidden"
                              >
                                      {series.name}
                              </div>
                          </div>
                      </a>
                  ))}
              </div>
          ))
      }
  </div>
}
```

#### 步骤 3: 在文章页侧边栏显示系列文章

**`src/components/widget/Series.astro`**
```astro
---
import { seriesConfig } from "../../configs/series";
import I18nKey from "../../i18n/i18nKey";
import { i18n } from "../../i18n/translation";
import { getPostSeries } from "../../utils/content-utils";
import { getPostUrlBySlug } from "../../utils/url-utils";
import WidgetLayout from "./WidgetLayout.astro";

const COLLAPSED_HEIGHT = "7.5rem";

interface Props {
	class?: string;
	style?: string;
	series: string;
}
const className = Astro.props.class;
const style = Astro.props.style;
const seriesName = Astro.props.series;

const series = seriesConfig.enabled ? await getPostSeries(seriesName) : [];

const isCollapsed = series.length >= 10;
---
{seriesConfig.enabled && series.length > 0 &&
  <WidgetLayout name={i18n(I18nKey.series) + " - " + series[0].data.series} id="series" isCollapsed={isCollapsed} collapsedHeight={COLLAPSED_HEIGHT} class={className} style={style}>
      <div class="flex flex-col gap-1">
          {series.map(t => (
              <a href={getPostUrlBySlug(t.slug)}
                  aria-label={t.data.title}
                  class="group btn-plain h-10 w-full rounded-lg hover:text-[initial]"
              >
                  <!-- dot and line -->
                  <div class="w-[15%] md:w-[10%] relative dash-line h-full flex items-center">
                      <div class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5
                      bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)]
                      outline outline-4 z-50
                      outline-[var(--card-bg)]
                      group-hover:outline-[var(--btn-plain-bg-hover)]
                      group-active:outline-[var(--btn-plain-bg-active)]
                      "
                      ></div>
                  </div>
                  <!-- post title -->
                  <div class="w-[85%] text-left font-bold
                      group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)]
                      text-75 pr-15 whitespace-nowrap overflow-ellipsis overflow-hidden" title={t.data.title}
                  >
                          {t.data.title}
                  </div>
              </a>
          ))}
      </div>
  </WidgetLayout>
}
```

## 3. 评论系统 (Giscus)

我使用了 [Giscus](https://giscus.app/)，它非常轻量，且基于 GitHub Discussions。

#### 步骤 1: Giscus 配置

**`src/configs/giscus.ts`**
```typescript
import type { GiscusConfig } from "../types/config";

export const giscusConfig: GiscusConfig = {
	enabled: true,
	repo: "Wtada233/fuwari-comments-wtada233.top",
	repoId: "R_kgDOQcCOWQ",
	category: "Announcements",
	categoryId: "DIC_kwDOQcCOWc4Cy2tE",
	mapping: "pathname",
	reactionsEnabled: true,
	emitMetadata: false,
	inputPosition: "bottom",
	lang: "zh-CN",
};
```
> **注意**: 你需要将 `repo`, `repoId`, `category`, `categoryId` 替换为你自己的 Giscus 配置。

#### 步骤 2: Giscus 组件

这个组件负责动态加载 Giscus 脚本，并在亮/暗主题切换时通知 Giscus 更新其样式。

**`src/components/misc/Giscus.astro`**
```astro
---
interface Props {
	repo: string;
	repoId: string;
	category: string;
	categoryId: string;
	mapping?: string;
	reactionsEnabled?: boolean;
	emitMetadata?: boolean;
	inputPosition?: "top" | "bottom";
	lang?: string;
}

const {
	repo,
	repoId,
	category,
	categoryId,
	mapping = "pathname",
	reactionsEnabled = true,
	emitMetadata = false,
	inputPosition = "bottom",
	lang = "zh-CN",
} = Astro.props;
---

<div id="giscus-container"></div>

<script is:inline define:vars={{ repo, repoId, category, categoryId, mapping, reactionsEnabled, emitMetadata, inputPosition, lang }}>
  // Function to send a message to the Giscus iframe
  function sendMessage(message) {
    const iframe = document.querySelector('iframe.giscus-frame');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ giscus: message }, 'https://giscus.app');
    }
  }

  // Function to update the Giscus theme
  function updateGiscusTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';
    sendMessage({ setConfig: { theme } });
  }

  // Function to load the Giscus script
  function loadGiscus() {
    const container = document.getElementById('giscus-container');
    if (!container || container.querySelector('iframe.giscus-frame')) {
      // Already loaded or no container
      return;
    }

    // Clean up any previous script to prevent duplicates
    const oldScript = document.querySelector('script[src^="https://giscus.app/client.js"]');
    if (oldScript) {
      oldScript.remove();
    }
    
    // Set theme based on current mode
    const isDark = document.documentElement.classList.contains('dark');
    const theme = isDark ? 'dark' : 'light';

    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', repo);
    script.setAttribute('data-repo-id', repoId);
    script.setAttribute('data-category', category);
    script.setAttribute('data-category-id', categoryId);
    script.setAttribute('data-mapping', mapping);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', reactionsEnabled ? '1' : '0');
    script.setAttribute('data-emit-metadata', emitMetadata ? '1' : '0');
    script.setAttribute('data-input-position', inputPosition);
    script.setAttribute('data-theme', theme);
    script.setAttribute('data-lang', lang);
    script.setAttribute('data-loading', 'lazy');
    script.crossOrigin = 'anonymous';
    script.async = true;

    // Clear the container before appending
    container.innerHTML = '';
    container.appendChild(script);
  }

  // Initial load and subsequent navigations
  document.addEventListener('astro:page-load', loadGiscus);

  // Listen for theme changes
  window.addEventListener('themechange', updateGiscusTheme);

  // Clean up the event listener before the page is swapped
  document.addEventListener('astro:before-swap', () => {
    window.removeEventListener('themechange', updateGiscusTheme);
  }, { once: true });
</script>
```

## 4. AI 摘要

这个功能非常酷，它会在文章开头用打字机效果显示一段 AI 生成的摘要。

#### 步骤 1: 配置与内容结构

**`src/configs/ai-summary.ts`**
```typescript
export const aiSummaryConfig = {
	enabled: true,
};
```

**`src/content/config.ts`** (代码片段)
```typescript
const postsCollection = defineCollection({
	schema: z.object({
		// ...
		ai: z.string().optional().default(""),
	}),
});
```
你需要在每篇 `.md` 文件的 frontmatter 中手动添加 `ai: "你的摘要内容"`。

#### 步骤 2: AI 摘要组件

这个组件负责显示摘要，并包含了实现打字机效果的内联脚本。

**`src/components/misc/AISummary.astro`**
```astro
--- 
export interface Props {
	content: string;
}

const { content } = Astro.props;

// 如果没有内容，不渲染组件
if (!content || content.trim() === "") {
	return null;
}
---

{content && (
  <div class="ai-summary">
    <div class="ai-title">
      <div class="ai-title-left">
        <img width="25" height="25" src="/gemini-color.png" alt="gemini-ai">
        <span class="ai-title-text">AI 摘要</span>
      </div>
      <div class="ai-tag">Gemini 2.5 Pro</div>
    </div>
    <div class="ai-explanation"></div>
  </div>
)}

<script is:inline define:vars={{ content }}>
  function initAITyping() {
    // Only run on post pages
    if (!window.location.pathname.includes('/posts/')) {
      return;
    }

    const textElement = document.querySelector('.ai-summary .ai-explanation');
    
    if (!textElement) {
      return;
    }

    if (textElement.hasAttribute('data-initialized')) {
      return;
    }

    if (!content) {
      return;
    }

    textElement.setAttribute('data-initialized', 'true');
    textElement.textContent = '';
    textElement.classList.remove('typing-complete');
    
    let index = 0;
    const typeSpeed = 30; // ms
    
    function typeWriter() {
      if (index < content.length) {
        textElement.textContent += content.charAt(index);
        index++;
        setTimeout(typeWriter, typeSpeed);
      } else {
        textElement.classList.add('typing-complete');
      }
    }
    
    setTimeout(typeWriter, 800);
  }

  document.addEventListener('astro:page-load', initAITyping);
  initAITyping();
</script>
```

#### 步骤 3: 添加样式

**`src/styles/main.css`** (代码片段)
```css
/* =================== */
/* 📘 AI 摘要模块样式 */
/* =================== */
.ai-summary {
    background: var(--card-bg);
    border: 1px solid var(--line-divider);
    border-radius: 12px;
    padding: 8px 8px 12px 8px;
    margin-bottom: 16px;
    /* ... 更多样式 ... */
}
/* ✅ 打字机光标动画 */
.ai-summary .ai-explanation::after {
    content: '';
    /* ... */
    animation: blink-underline 1s ease-in-out infinite;
}
/* 打字完成后隐藏光标 */
.ai-summary .ai-explanation.typing-complete::after {
    display: none;
}
@keyframes blink-underline {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
```

## 5. 字体修改

为了更好的中文阅读体验，我将字体替换成了“汉仪文黑 85W”。

1.  **准备字体文件**: 将字体文件（例如 `hk4e_zh-cn.woff2`）放入 `public/` 目录。
2.  **全局引入**: 我选择在 `src/components/Navbar.astro` 中引入字体，因为它是一个全局组件，能确保字体在所有页面加载。

    **`src/components/Navbar.astro`** (代码片段)
    ```astro
    <style>
        @font-face {
            font-family: 'HYWenHei 85W';
            src: url('/hk4e_zh-cn.woff2') format('woff2');
            font-display: swap;
        }
        body {
            /* 屏幕优化版 */
            font-family: "HYWenHei 85W", sans-serif;
        }
    </style>
    ```

## 6. 侧边栏博客信息

在侧边栏动态显示文章总数、系列数、标签数、分类数和总字数。

#### 步骤 1: 配置

**`src/configs/blog-info.ts`**
```typescript
export const blogInfoConfig = {
	enabled: true, // Overall switch to enable/disable the BlogInfo widget
	showTotalArticles: true,
	showTotalSeries: true,
	showTotalTags: true,
	showTotalCategories: true,
	showTotalWords: true,
};
```

#### 步骤 2: 数据统计函数

这个函数会遍历所有文章来计算各项统计数据。

**`src/utils/content-utils.ts`** (代码片段)
```typescript
export async function getBlogStats(): Promise<{
	totalArticles: number;
	totalWords: number;
	totalSeries: number;
	totalTags: number;
	totalCategories: number;
}> {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	let totalArticles = 0;
	let totalWords = 0;
	const uniqueTags = new Set<string>();
	const uniqueCategories = new Set<string>();
	const uniqueSeries = new Set<string>();

	for (const post of allBlogPosts) {
		totalArticles++;
		if (post.data.tags) {
			post.data.tags.forEach((tag: string) => uniqueTags.add(tag));
		}
		if (post.data.category) {
			uniqueCategories.add(post.data.category);
		}
		if (seriesConfig.enabled && post.data.series) {
			uniqueSeries.add(post.data.series);
		}
		const { remarkPluginFrontmatter } = await post.render();
		totalWords += remarkPluginFrontmatter?.words || 0;
	}

	return {
		totalArticles,
		totalWords,
		totalSeries: uniqueSeries.size,
		totalTags: uniqueTags.size,
		totalCategories: uniqueCategories.size,
	};
}
```

#### 步骤 3: UI 组件

**`src/components/widget/BlogInfo.astro`**
```astro
---
import { blogInfoConfig } from "@configs/blog-info";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getBlogStats } from "@utils/content-utils";
import { Icon } from "astro-icon/components";
import WidgetLayout from "./WidgetLayout.astro";

const stats = await getBlogStats();
---

{blogInfoConfig.enabled && (
<WidgetLayout name={i18n(I18nKey.blogInfo)} id="blog-info">
    <div class="flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-400">
        {blogInfoConfig.showTotalArticles && (
        <div class="flex items-center justify-between">
            <span class="flex items-center gap-2">
                <Icon name="material-symbols:article-outline" class="text-lg"></Icon>
                {i18n(I18nKey.totalArticles)}:
            </span>
            <span class="font-bold text-gray-800 dark:text-gray-200">{stats.totalArticles}</span>
        </div>
        )}
        {/* ... 其他统计项 ... */}
    </div>
</WidgetLayout>
)}
```

## 7. 网站运行时间

#### 步骤 1: 配置

**`src/configs/running-time.ts`**
```typescript
export const runningTimeConfig = {
	enableRunningTime: true,
	startDate: "10/24/2025 00:00:00", // 格式: "MM/DD/YYYY HH:mm:ss"
};
```
> **注意**: 这里的日期是我瞎写的，请务必修改为你的建站日期。

#### 步骤 2: 组件

**`src/components/misc/RunningTime.astro`**
```astro
---
import WidgetLayout from "@components/widget/WidgetLayout.astro";
import { runningTimeConfig } from "@configs/running-time";
import I18nKey from "@/i18n/i18nKey";
import { i18n } from "@/i18n/translation";
---

{runningTimeConfig.enableRunningTime && (
    <WidgetLayout id="running-time-widget" name={i18n(I18nKey.runningTime)}>
        <div class="transition text-50 text-sm text-center my-4">
            <p id="runningtime"></p>
        </div>
        <script is:inline type="text/javascript" define:vars={{startDate: runningTimeConfig.startDate}}>
            function runtime(){
                const t=new Date(startDate);
                const n=new Date();
                const s=n-t;
                const e=Math.floor(s/1e3);
                const o=Math.floor(e/86400);
                const i=Math.floor(e%86400/3600);
                const a=Math.floor(e%3600/60);
                const r=e%60;
                document.getElementById("runningtime").innerHTML=`⭐本站已运行: ${o}天${i}小时${a}分${r}秒 ☁️`
            }
            setInterval(runtime,1e3);
            runtime(); // Call once immediately to avoid flicker
        </script>
    </WidgetLayout>
)}
```

## 8. 相关文章推荐

在文章页脚，根据当前文章的标签和分类，推荐内容相似的文章。

#### 步骤 1: 配置

**`src/configs/related-posts.ts`**
```typescript
export const relatedPostsConfig = {
	enabled: true,
	limit: 5, // 推荐文章的数量
};
```

#### 步骤 2: 推荐逻辑

**`src/utils/content-utils.ts`** (代码片段)
```typescript
export async function getRelatedPosts(
	currentPost: CollectionEntry<"posts">,
	allPosts: CollectionEntry<"posts">[],
	limit: number = relatedPostsConfig.limit,
): Promise<CollectionEntry<"posts">[]> {
	if (!relatedPostsConfig.enabled) {
		return [];
	}

	const relatedPosts: { post: CollectionEntry<"posts">; score: number }[] = [];

	for (const post of allPosts) {
		if (post.slug === currentPost.slug) {
			continue;
		}

		let score = 0;

		// 基于共享标签计分
		const sharedTags = (currentPost.data.tags || []).filter((tag: string) =>
			(post.data.tags || []).includes(tag),
		);
		score += sharedTags.length * 2;

		// 基于共享分类计分
		if (
			currentPost.data.category &&
			post.data.category &&
			currentPost.data.category === post.data.category
		) {
			score += 5;
		}

		if (score > 0) {
			relatedPosts.push({ post, score });
		}
	}

	// 按分数和日期排序
	relatedPosts.sort((a, b) => {
		if (b.score !== a.score) {
			return b.score - a.score;
		}
		return b.post.data.published.getTime() - a.post.data.published.getTime();
	});

	return relatedPosts.slice(0, limit).map((item) => item.post);
}
```

#### 步骤 3: UI 组件

**`src/components/misc/RelatedPosts.astro`**
```astro
---
import type { CollectionEntry } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getPostUrlBySlug } from "@utils/url-utils";
import { Icon } from "astro-icon/components";

interface Props {
	posts: CollectionEntry<"posts">[];
}

const { posts } = Astro.props;
---

{posts.length > 0 && (
    <div class="card-base p-6 mb-4 onload-animation">
        <h2 class="flex flex-row items-center font-bold text-lg ...">
            <Icon name="material-symbols:auto-stories-outline-rounded" class="text-xl mr-2"></Icon>
            {i18n(I18nKey.relatedPosts)}
        </h2>
        <ul class="list-none p-0 m-0">
            {posts.map((post) => (
                <li class="mb-2 last:mb-0">
                    <a href={getPostUrlBySlug(post.slug)} class="link text-[var(--primary)] ...">
                        {post.data.title}
                    </a>
                </li>
            ))}
        </ul>
    </div>
)}
```

## 9. 分享按钮

#### 步骤 1: 配置

**`src/configs/share-buttons.ts`**
```typescript
export const shareButtonsConfig = {
	enabled: true,
};
```

#### 步骤 2: 组件

**`src/components/misc/ShareButtons.astro`**
```astro
---
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { Icon } from "astro-icon/components";

interface Props {
	title: string;
	url: string;
	class?: string;
}

const { title, url } = Astro.props;
const className = Astro.props.class;

const encodedUrl = encodeURIComponent(url);
const encodedTitle = encodeURIComponent(title);

const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
---

<div class:list={["share-buttons flex flex-wrap gap-2 onload-animation", className]}>
  <span class="text-50 text-sm font-medium flex items-center pr-2">{i18n(I18nKey.share)}:</span>
  <button
    aria-label={i18n(I18nKey.shareToTwitter)}
    class="btn-regular rounded-lg h-9 px-3 flex items-center justify-center gap-2"
    onclick={`window.open('${twitterShareUrl}', '_blank', 'width=600,height=400');`}
  >
    <Icon name="fa6-brands:twitter" class="text-lg"></Icon>
    {i18n(I18nKey.shareToTwitter)}
  </button>

  <button
    aria-label={i18n(I18nKey.shareToFacebook)}
    class="btn-regular rounded-lg h-9 px-3 flex items-center justify-center gap-2"
    onclick={`window.open('${facebookShareUrl}', '_blank', 'width=600,height=400');`}
  >
    <Icon name="fa6-brands:facebook" class="text-lg"></Icon>
    {i18n(I18nKey.shareToFacebook)}
  </button>

  <button
    aria-label={i18n(I18nKey.copyLink)}
    class="btn-regular rounded-lg h-9 px-3 flex items-center justify-center gap-2 copy-link-btn"
    data-url={url}
  >
    <span class="original-content">
      <Icon name="material-symbols:link" class="text-lg"></Icon>
      {i18n(I18nKey.copyLink)}
    </span>
    <span class="success-content">
      <Icon name="material-symbols:check" class="text-lg"></Icon>
      OK
    </span>
  </button>
</div>
<!-- ... 样式和脚本 ... -->
```

## 10. 文章过时提醒

#### 步骤 1: 配置

**`src/configs/outdated-reminder.ts`**
```typescript
export const outdatedReminderConfig = {
	enabled: true,
	outdatedThresholdDays: 365, // 超过365天则提示
};
```

#### 步骤 2: 在文章页实现逻辑

**`src/pages/posts/[...slug].astro`** (代码片段)
```astro
---
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { outdatedReminderConfig } from "../../configs/outdated-reminder";

dayjs.extend(utc);

// ...
---
<!-- ... -->
  <!-- 上次编辑时间 -->
  {
    outdatedReminderConfig.enabled && (
      <div class="card-base p-6 mb-4">
        <div class="flex items-center gap-2">
          <div class="transition h-9 w-9 rounded-lg ...">
            <Icon
              name="material-symbols:history-rounded"
              class="text-4xl text-[var(--primary)] ..."
            />
          </div>

          {(() => {
            const lastModified = dayjs(
              entry.data.updated || entry.data.published
            );
            const now = dayjs();
            const daysDiff = now.diff(lastModified, "day");
            const dateStr = lastModified.format("YYYY-MM-DD");
            const isOutdated = daysDiff >= outdatedReminderConfig.outdatedThresholdDays;

            return (
              <div class="flex flex-col gap-0.1">
                <div class="text-[1.0rem] ...">
                  {`${i18n(I18nKey.lastModifiedPrefix)}${dateStr}${
                    isOutdated
                      ? `，${i18n(I18nKey.lastModifiedDaysAgo).replace("{days}", daysDiff.toString())}`
                      : ""
                  }`}
                </div>
                {isOutdated && (
                  <p class="text-[0.8rem] ...">
                    {i18n(I18nKey.lastModifiedOutdated)}
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    )
  }
<!-- ... -->
```

## 11. 半透明/毛玻璃效果

#### 步骤 1: UI 开关

**`src/components/GlassSwitch.svelte`**
```svelte
<script lang="ts">
import { onMount } from "svelte";

let isGlassMode = false;

function applyGlassMode() {
	if (isGlassMode) {
		document.documentElement.classList.add("glass-mode");
	} else {
		document.documentElement.classList.remove("glass-mode");
	}
}

function toggleGlassMode() {
	isGlassMode = !isGlassMode;
	localStorage.setItem("glassMode", String(isGlassMode));
	applyGlassMode();
}

onMount(() => {
	isGlassMode = localStorage.getItem("glassMode") === "true";
	applyGlassMode();
});
</script>

<button aria-label="Glass Mode" class="btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90" on:click={toggleGlassMode}>
    <div class="w-full h-full flex items-center justify-center">
    {#if isGlassMode}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5">
            <path fill="currentColor" d="M19.8 22.6L1.4 4.2l1.4-1.4l18.4 18.4zM10 21.5q-.2 0-.35-.15T9.5 21t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m4 0q-.2 0-.35-.15T13.5 21t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15M6 19q-.425 0-.712-.288T5 18t.288-.712T6 17t.713.288T7 18t-.288.713T6 19m4 0q-.425 0-.712-.288T9 18t.288-.712T10 17t.713.288T11 18t-.288.713T10 19m4 0q-.425 0-.712-.288T13 18t.288-.712T14 17t.713.288T15 18t-.288.713T14 19m-4-3.5q-.65 0-1.075-.425T8.5 14t.425-1.075T10 12.5t1.075.425T11.5 14t-.425 1.075T10 15.5M6 15q-.425 0-.712-.288T5 14t.288-.712T6 13t.713.288T7 14t-.288.713T6 15m11.8-.025l-.775-.775q-.1-.5.213-.85T18 13q.425 0 .713.288T19 14q0 .45-.35.763t-.85.212M3 14.5q-.2 0-.35-.15T2.5 14t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m18 0q-.2 0-.35-.15T20.5 14t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m-6.7-3.05L12.55 9.7q.125-.525.5-.862T14 8.5q.65 0 1.075.425T15.5 10q0 .575-.35.963t-.85.487M6 11q-.425 0-.712-.287T5 10t.288-.712T6 9t.713.288T7 10t-.288.713T6 11m12 0q-.425 0-.712-.288T17 10t.288-.712T18 9t.713.288T19 10t-.288.713T18 11m-15-.5q-.2 0-.35-.15T2.5 10t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m18 0q-.2 0-.35-.15T20.5 10t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15M14 7q-.425 0-.712-.288T13 6t.288-.712T14 5t.713.288T15 6t-.288.713T14 7m-4.175-.025l-.8-.8q-.075-.5.225-.837T10 5q.425 0 .712.287T11 6q0 .45-.337.75t-.838.225M18 7q-.425 0-.712-.288T17 6t.288-.712T18 5t.713.288T19 6t-.288.713T18 7m-8-3.5q-.2 0-.35-.15T9.5 3t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m4 0q-.2 0-.35-.15T13.5 3t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15"/>
        </svg>
    {:else}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-5 h-5">
            <path fill="currentColor" d="M3 14.5q-.2 0-.35-.15T2.5 14t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m0-4q-.2 0-.35-.15T2.5 10t.15-.35T3 9.5t.35.15t.15.35t-.15.35t-.35.15M6 19q-.425 0-.712-.288T5 18t.288-.712T6 17t.713.288T7 18t-.288.713T6 19m0-4q-.425 0-.712-.288T5 14t.288-.712T6 13t.713.288T7 14t-.288.713T6 15m0-4q-.425 0-.712-.288T5 10t.288-.712T6 9t.713.288T7 10t-.288.713T6 11m0-4q-.425 0-.712-.288T5 6t.288-.712T6 5t.713.288T7 6t-.288.713T6 7m4 8.5q-.625 0-1.062-.437T8.5 14t.438-1.062T10 12.5t1.063.438T11.5 14t-.437 1.063T10 15.5m0-4q-.625 0-1.062-.437T8.5 10t.438-1.062T10 8.5t1.063.438T11.5 10t-.437 1.063T10 11.5m0 7.5q-.425 0-.712-.288T9 18t.288-.712T10 17t.713.288T11 18t-.288.713T10 19m0-12q-.425 0-.712-.288T9 6t.288-.712T10 5t.713.288T11 6t-.288.713T10 7m0 14.5q-.2 0-.35-.15T9.5 21t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m0-18q-.2 0-.35-.15T9.5 3t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m4 12q-.625 0-1.062-.437T12.5 14t.438-1.062T14 12.5t1.063.438T15.5 14t-.437 1.063T14 15.5m0-4q-.625 0-1.062-.437T12.5 10t.438-1.062T14 8.5t1.063.438T15.5 10t-.437 1.063T14 11.5m0 7.5q-.425 0-.712-.288T13 18t.288-.712T14 17t.713.288T15 18t-.288.713T14 19m0-12q-.425 0-.712-.288T13 6t.288-.712T14 5t.713.288T15 6t-.288.713T14 7m0 14.5q-.2 0-.35-.15T13.5 21t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m0-18q-.2 0-.35-.15T13.5 3t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15M18 19q-.425 0-.712-.288T17 18t.288-.712T18 17t.713.288T19 18t-.288.713T18 19m0-4q-.425 0-.712-.288T17 14t.288-.712T18 13t.713.288T19 14t-.288.713T18 15m0-4q-.425 0-.712-.288T17 10t.288-.712T18 9t.713.288T19 10t-.288.713T18 11m0-4q-.425 0-.712-.288T17 6t.288-.712T18 5t.713.288T19 6t-.288.713T18 7m3 7.5q-.2 0-.35-.15T20.5 14t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15m0-4q-.2 0-.35-.15T20.5 10t.15-.35t.35-.15t.35.15t.15.35t-.15.35t-.35.15"/>
        </svg>
    {/if}
    </div>
</button>
```

#### 步骤 2: CSS 样式

**`src/styles/main.css`**
```css
@tailwind components;

@layer components {
    /* ... */
    html.glass-mode .card-base {
        @apply bg-[var(--card-bg-glass)] backdrop-blur-2xl;
    }
    /* ... */
    html.glass-mode .float-panel {
        @apply bg-[var(--float-panel-bg-glass)] backdrop-blur-2xl;
    }
    /* ... */
}
```

-   **`src/styles/navbar.css`**: 这个文件包含了大量针对导航栏在不同页面（主页/非主页）、不同设备、不同透明模式下的样式，是实现动态透明效果的关键。

    ```css
    .glass-mode #navbar > div {
        background: var(--card-bg);
        border: 1px solid transparent;
        border-radius: 0 0 0.75rem 0.75rem;
        transition: all var(--duration-medium) var(--ease-standard);
    }

    @media (min-width: 1024px) {
        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semi"] > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semi"] > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="full"] > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="full"] > div {
            backdrop-filter: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"] > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"] > div {
            backdrop-filter: none !important;
            background: transparent !important;
            border: 1px solid transparent !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"].scrolled > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"].scrolled > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
    }

    @media (min-width: 1024px) {
        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semi"] > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="full"] > div {
            backdrop-filter: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"] > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"].scrolled > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
    }

    @media (max-width: 1023px) {
        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semi"][data-is-home="true"] > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semi"][data-is-home="true"] > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="full"][data-is-home="true"] > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="full"][data-is-home="true"] > div {
            backdrop-filter: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"][data-is-home="true"] > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"][data-is-home="true"] > div {
            backdrop-filter: none !important;
            background: transparent !important;
            border: 1px solid transparent !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"][data-is-home="true"].scrolled > div,
        .glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"][data-is-home="true"].scrolled > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
    }

    @media (max-width: 1023px) {
        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semi"][data-is-home="true"] > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="full"][data-is-home="true"] > div {
            backdrop-filter: none !important;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"][data-is-home="true"] > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"][data-is-home="true"].scrolled > div {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(242, 242, 247, 0.8) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-55)) !important;
            border-radius: 0 0 0.75rem 0.75rem !important;
            box-shadow: var(--shadow-navbar) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
    }

    @media (min-width: 1024px) {
        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semi"] > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semi"] > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }

        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="full"] > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="full"] > div {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"] > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"] > div {
            background: transparent !important;
            border: 1px solid transparent !important;
            box-shadow: none !important;
        }

        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"].scrolled > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"].scrolled > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
    }

    @media (min-width: 1024px) {
        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semi"] > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }

        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="full"] > div {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"] > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }

        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"].scrolled > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
    }

    @media (max-width: 1023px) {
        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semi"][data-is-home="true"] > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semi"][data-is-home="true"] > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }

        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="full"][data-is-home="true"] > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="full"][data-is-home="true"] > div {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"][data-is-home="true"] > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"][data-is-home="true"] > div {
            background: transparent !important;
            border: 1px solid transparent !important;
            box-shadow: none !important;
        }

        :root.dark.glass-mode #banner-wrapper ~ * #navbar[data-transparent-mode="semifull"][data-is-home="true"].scrolled > div,
        :root.dark.glass-mode body:has(#banner-wrapper) #navbar[data-transparent-mode="semifull"][data-is-home="true"].scrolled > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
    }

    @media (max-width: 1023px) {
        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semi"][data-is-home="true"] > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }

        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="full"][data-is-home="true"] > div {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
        }

        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"][data-is-home="true"] > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }

        :root.dark.glass-mode body.wallpaper-transparent #navbar[data-transparent-mode="semifull"][data-is-home="true"].scrolled > div {
            background: rgba(44, 44, 46, 0.8) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-55)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
    }

    @media (min-width: 768px) and (max-width: 1279px) {
        .glass-mode #navbar > div {
            border-radius: 0 0 1rem 1rem !important;
        }
        
        .glass-mode #navbar .dropdown-container > .btn-plain .navbar-icon,
        .glass-mode #navbar .dropdown-container > a.btn-plain .navbar-icon {
            display: none !important;
        }
    }

    @media (max-width: 480px) {
        .glass-mode #navbar > div {
            border-radius: 0 0 0.5rem 0.5rem !important;
            margin: 0 !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            max-width: none !important;
            width: 100% !important;
        }
    }

    @media (max-width: 768px) {
        .glass-mode #navbar > div {
            max-width: none !important;
            width: 100% !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
        }
        
        .glass-mode #navbar > div > div:nth-child(2) {
            display: none !important;
        }
        
        .glass-mode #navbar #nav-menu-switch {
            display: flex !important;
        }
    }

    @media (min-width: 1024px) {
        .glass-mode .dropdown-content {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #display-setting {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #wallpaper-mode-panel .float-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #theme-mode-panel .float-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #nav-menu-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #search-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
    }

    @media (max-width: 1023px) {
        .glass-mode #navbar[data-is-home="true"] .dropdown-content {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #navbar[data-is-home="true"] ~ * #display-setting,
        .glass-mode #navbar[data-is-home="true"] #display-setting {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #navbar[data-is-home="true"] #wallpaper-mode-panel .float-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #navbar[data-is-home="true"] #theme-mode-panel .float-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #navbar[data-is-home="true"] #nav-menu-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
        
        .glass-mode #navbar[data-is-home="true"] #search-panel {
            backdrop-filter: blur(var(--blur-2xl)) !important;
            background: rgba(255, 255, 255, var(--opacity-90)) !important;
            border: 1px solid rgba(255, 255, 255, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar) !important;
        }
    }

    @media (min-width: 1024px) {
        :root.dark.glass-mode .dropdown-content {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #display-setting {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #wallpaper-mode-panel .float-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #theme-mode-panel .float-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #nav-menu-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #search-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
    }

    @media (max-width: 1023px) {
        :root.dark.glass-mode #navbar[data-is-home="true"] .dropdown-content {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #navbar[data-is-home="true"] ~ * #display-setting,
        :root.dark.glass-mode #navbar[data-is-home="true"] #display-setting {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #navbar[data-is-home="true"] #wallpaper-mode-panel .float-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #navbar[data-is-home="true"] #theme-mode-panel .float-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #navbar[data-is-home="true"] #nav-menu-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
        
        :root.dark.glass-mode #navbar[data-is-home="true"] #search-panel {
            background: rgba(0, 0, 0, var(--opacity-90)) !important;
            border: 1px solid rgba(0, 0, 0, var(--opacity-90)) !important;
            box-shadow: var(--shadow-navbar-dark) !important;
        }
    }
    ```



**`src/styles/variables.styl`**
这里定义了毛玻璃效果所需的颜色变量。
```stylus
define({
  //...
  --card-bg-glass: rgba(255, 255, 255, 0.8) rgba(44, 44, 46, 0.8) // for glass mode
  --float-panel-bg-glass: rgba(255, 255, 255, 0.9) rgba(44, 44, 46, 0.9) // less transparent
  //...
})
```

#### 步骤 3: 动态导航栏脚本 (semifull 模式)

**`src/utils/semifull-scroll-detection.ts`**
```typescript
// Function to initialize semifull scroll detection
export function initSemifullScrollDetection(): void {
	const navbar = document.getElementById("navbar");
	if (!navbar) return;

	const transparentMode = navbar.getAttribute("data-transparent-mode");
	if (transparentMode !== "semifull") return;

	const isHomePage = document.body.classList.contains("is-home");

	// If not on the homepage, remove scroll listener and set to scrolled state
	if (!isHomePage) {
		if (window.semifullScrollHandler) {
			window.removeEventListener("scroll", window.semifullScrollHandler);
			window.semifullScrollHandler = undefined;
		}
		navbar?.classList.add("scrolled");
		return;
	}

	navbar?.classList.remove("scrolled");

	let ticking = false;

	function updateNavbarState() {
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const threshold = 50;
		if (scrollTop > threshold) {
			navbar?.classList.add("scrolled");
		} else {
			navbar?.classList.remove("scrolled");
		}
		ticking = false;
	}

	function requestTick() {
		if (!ticking) {
			requestAnimationFrame(updateNavbarState);
			ticking = true;
		}
	}

	if (window.semifullScrollHandler) {
		window.removeEventListener("scroll", window.semifullScrollHandler);
	}

	window.semifullScrollHandler = requestTick;
	window.addEventListener("scroll", requestTick, { passive: true });
	updateNavbarState();
}
```

## 总结

以上就是我对这个博客进行的所有主要魔改功能的完整实现。希望这份详尽的指南能对同样喜欢折腾的你有所帮助！
