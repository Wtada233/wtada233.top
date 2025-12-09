---
title: "论博客魔改的108种方法"
published: 2025-11-27
description: "也是把依托达芬改成依托好看点的达芬了（"
image: "cover.png"
tags: ["博客搭建", "Fuwari", "APlayer", "教程", "魔改"]
category: "Tech"
draft: false
series: "该博客搭建"
ai: "这篇博客没有AI概括因为到处找代码搬并疯狂修bug的我和AI也差不多了，所以我自己写了一个（"
---

这个博客基于 [Fuwari](https://github.com/saicaca/fuwari) 主题，并进行了大量个性化改造。本指南概述了各项功能的实现原理。

**这篇指南只包含核心原理和涉及的文件，不会展示完整的代码。如果你对具体的实现细节感兴趣，请直接查阅本站的 [Git 仓库](https://github.com/Wtada233/wtada233.top)。**
**这个博客的部分功能由大佬编写，我只是优化之后整合，如果你想支持原作者请看仓库README**

## 1. 文章置顶

**原理**：在文章 `frontmatter` 中添加 `order` 字段控制排序（`1` 置顶，`-1` 置底）。文章列表获取时优先根据 `order` 排序，UI 组件根据 `order` 值显示相应标签。

**相关文件**:
*   `src/configs/pinning.ts` (功能开关)
*   `src/content/config.ts` (内容结构定义)
*   `src/utils/content-utils.ts` (排序逻辑)
*   `src/components/PostCard.astro` 和 `src/pages/posts/[...slug].astro` (UI 显示)

## 2. 文章系列

将多篇文章组织成系列，方便连续阅读。

**原理**：
1.  **启用与结构更新**：通过配置文件启用系列功能，并在文章 `frontmatter` 中添加 `series` 字段。
2.  **系列页面**：创建一个专门的页面，通过组件获取所有文章，并按“分类 -> 系列”进行分组展示。
3.  **文章页侧边栏**：在每篇文章页面侧边栏显示当前系列文章列表。

**相关文件**:
*   `src/configs/series.ts` (功能开关)
*   `src/content/config.ts` (内容结构定义)
*   `src/pages/series.astro` (系列列表页面)
*   `src/components/SeriesPanel.astro` (系列列表组件)
*   `src/components/widget/Series.astro` (文章侧边栏系列组件)
*   `src/utils/content-utils.ts` (获取系列文章逻辑)
*   `src/utils/url-utils.ts` (生成系列 URL)

## 3. 评论系统 (Giscus)

**原理**：使用轻量级基于 GitHub Discussions 的 Giscus。
1.  **Giscus 配置**：在配置文件中设置 Giscus 的仓库信息和分类 ID 等参数。
2.  **Giscus 组件**：创建一个 Astro 组件，负责动态加载 Giscus 脚本，并处理亮/暗主题切换时的样式更新。

**相关文件**:
*   `src/configs/giscus.ts` (Giscus 配置)
*   `src/components/misc/Giscus.astro` (Giscus 组件)

## 4. AI 摘要

**原理**：在文章开头显示一段 AI 生成的摘要，并带有打字机效果。
1.  **配置与内容结构**：通过配置文件启用 AI 摘要功能，并在文章 `frontmatter` 中添加 `ai` 字段存储摘要内容。
2.  **AI 摘要组件**：组件负责显示摘要文本，并通过内联脚本实现打字机动画效果。
3.  **样式**：通过 CSS 定义摘要模块的样式和打字机光标动画。

**相关文件**:
*   `src/configs/ai-summary.ts` (功能开关)
*   `src/content/config.ts` (内容结构定义)
*   `src/components/misc/AISummary.astro` (AI 摘要组件及打字机脚本)
*   `src/styles/main.css` (摘要模块样式)

## 5. 字体修改

**原理**：替换默认字体以优化中文阅读体验。
1.  **准备字体文件**：将字体文件放置于 `public/` 目录。
2.  **全局引入**：在全局组件（如 `Navbar.astro`）中通过 `@font-face` 引入字体，并设置 `body` 元素的 `font-family`。

**相关文件**:
*   `public/hk4e_zh-cn.woff2` (字体文件)
*   `src/components/Navbar.astro` (字体引入样式)

## 6. 侧边栏博客信息

**原理**：在侧边栏动态显示博客的统计信息，如文章总数、系列数、标签数、分类数和总字数。
1.  **配置**：通过配置文件控制各统计项的显示。
2.  **数据统计函数**：编写工具函数遍历所有文章，计算各项统计数据。
3.  **UI 组件**：组件调用统计函数获取数据并展示。

**相关文件**:
*   `src/configs/blog-info.ts` (功能开关及显示配置)
*   `src/utils/content-utils.ts` (数据统计函数 `getBlogStats`)
*   `src/components/widget/BlogInfo.astro` (博客信息展示组件)

## 7. 网站运行时间

**原理**：在侧边栏显示网站已运行的时间。
1.  **配置**：配置文件中设置网站的起始运行日期。
2.  **组件**：组件包含一个内联脚本，计算当前时间与起始日期的差值，并每秒更新显示。

**相关文件**:
*   `src/configs/running-time.ts` (启用开关及起始日期配置)
*   `src/components/misc/RunningTime.astro` (运行时间显示组件)

## 8. 相关文章推荐

**原理**：在文章页脚根据当前文章的标签和分类，推荐相似文章。
1.  **配置**：配置文件中启用推荐功能并设置推荐文章数量限制。
2.  **推荐逻辑**：编写工具函数，根据标签和分类的重合度计算文章相似度，并排序后返回推荐文章列表。
3.  **UI 组件**：组件接收推荐文章列表并展示。

**相关文件**:
*   `src/configs/related-posts.ts` (功能开关及数量限制)
*   `src/utils/content-utils.ts` (推荐逻辑 `getRelatedPosts`)
*   `src/components/misc/RelatedPosts.astro` (相关文章展示组件)

## 9. 分享按钮

**原理**：在文章页提供分享到社交媒体和复制链接的功能。
1.  **配置**：配置文件中启用分享按钮。
2.  **组件**：组件包含 Twitter、Facebook 分享按钮和复制链接按钮，通过 JavaScript 构造分享 URL 或复制到剪贴板。

**相关文件**:
*   `src/configs/share-buttons.ts` (功能开关)
*   `src/components/misc/ShareButtons.astro` (分享按钮组件)

## 10. 文章过时提醒

**原理**：当文章发布或更新时间超过一定阈值时，在文章页显示过时提醒。
1.  **配置**：配置文件中启用提醒功能并设置过时阈值（天数）。
2.  **页面逻辑**：在文章详情页面计算文章的发布/更新日期与当前日期的差值，如果超过阈值则显示提醒信息。

**相关文件**:
*   `src/configs/outdated-reminder.ts` (功能开关及阈值配置)
*   `src/pages/posts/[...slug].astro` (文章页内的提醒逻辑)

## 11. 半透明/毛玻璃效果

**原理**：通过 CSS `backdrop-filter` 属性实现 UI 元素的半透明（毛玻璃）效果，并提供用户开关。
1.  **UI 开关**：一个 Svelte 组件提供切换毛玻璃模式的按钮，并通过修改 `documentElement` 的 class 来控制全局样式。
2.  **CSS 样式**：通过 `src/styles/main.css` 和 `src/styles/navbar.css` 定义不同 UI 元素在毛玻璃模式下的样式，利用 CSS 变量实现主题兼容。
3.  **动态导航栏脚本**：`semifull-scroll-detection.ts` 脚本用于处理导航栏在滚动时的透明度变化，实现动态毛玻璃效果。

**相关文件**:
*   `src/components/GlassSwitch.svelte` (毛玻璃模式开关组件)
*   `src/styles/main.css` (卡片和浮动面板的毛玻璃样式)
*   `src/styles/navbar.css` (导航栏在不同状态和设备下的毛玻璃样式)
*   `src/styles/variables.styl` (毛玻璃效果相关的颜色变量)
*   `src/utils/semifull-scroll-detection.ts` (导航栏滚动检测及样式切换逻辑)

---

BTW，说了这么多，代码呢？为了避免跟多人重蹈我的覆辙（）所有详细的实现代码都可以在 Git 仓库中找到。
千万要运行pnpm check和pnpm lint！不然你就会发现改好之后可能有几十个bug(
