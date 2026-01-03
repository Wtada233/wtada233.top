---
title: "告别 Font-Spider：使用自定义脚本实现 Astro 博客字体精准子集化"
og_theme: dark
published: 2025-12-26
description: "详细记录如何从过时的 Font-Spider 迁移到基于 subset-font 的现代手写脚本方案，解决中文字体体积过大与路径映射难题。"
image: ""
tags: ["教程", "Astro", "前端优化", "字体", "TypeScript"]
category: "Tech"
draft: false
series: "该博客搭建"
ai: "本文记录了作者将博客字体压缩方案从 Font-Spider 迁移至自定义 TypeScript 脚本的过程。针对 Font-Spider 停止维护、路径映射困难等痛点，新方案通过 subset-font 库实现了对构建后 HTML 的全自动文字提取与字体裁剪。文章详细介绍了依赖更新、旧代码清理、核心裁剪脚本编写以及与 package.json 构建流集成的全过程，为静态站点提供了更稳定、现代化的中文字体优化思路。"
---

## 为什么要迁移？

在 Astro 博客中，中文字体动辄几 MB 的体积是影响首屏加载速度的“元凶”。之前我一直使用 [Font-Spider (字蛛)](https://github.com/aui/font-spider) 来进行子集化裁剪，但随着项目的深度魔改，一些难以调和的矛盾开始显现：

1.  **停止维护**：`font-spider` 已经多年未更新，对现代 CSS 特性支持较弱。
2.  **路径映射地狱**：在处理构建后的绝对路径（如 `/MiSans-Regular.ttf`）时，`font-spider` 常找不到文件，必须依赖复杂的 `--map` 参数。（这也是许多教程没有介绍的，虽然我之前写的脚本解决了这个问题但是毕竟这个项目都不知道多少年没更新了）
3.  **黑盒操作**：难以集成到现代 TypeScript 脚本流中，报错信息模糊。

为了彻底解决这些问题，我决定手动编写一个基于 `subset-font` 的裁剪脚本。（才怪，AI是主力，我只是记录一下过程）

---

## 迁移步骤

### 第一步：清理门户

首先，为了避免更多问题，需要移除已经过时的工具和旧脚本。（不要在没有git仓库或备份时执行，这是危险行为！）在你的终端执行：

```bash
# 移除旧依赖
pnpm remove font-spider

# 移除之前的旧脚本文件（如果有）
rm scripts/compress-font.js
```

### 第二步：引入现代动力

我们需要几个核心库来驱动新的裁剪脚本：
-   `subset-font`：真正的字体裁剪核心，支持 TTF/OTF/WOFF。
-   `he`：用于处理 HTML 中的实体字符（如 `&nbsp;` 解码回空格）。
-   `tsx`：让我们直接运行 TypeScript 编写的脚本。

```bash
pnpm add -D subset-font he tsx
```

### 第三步：编写核心裁剪脚本 `font-subset.ts`

在 `scripts/` 目录下创建 `font-subset.ts`。这个脚本的逻辑非常清晰：
1.  **扫描** `dist/` 目录下的所有 HTML 文件。
2.  **提取** 页面中所有可见的文字，并进行去重。
3.  **读取** 原始字体文件。
4.  **裁剪** 使用 `subset-font` 根据提取的文字集生成新的字体文件并覆盖。

以下是实现：

```typescript
// scripts/font-subset.ts
import fs from 'node:fs';
import path from 'node:path';
import subsetFont from 'subset-font';
import * as cheerio from 'cheerio';
import { fontConfig } from '../src/configs/font';
import { getFilesRecursive } from "./utils";

const DIST_DIR = 'dist';

/**
 * 从 HTML 中提取所有可见文本，自动移除脚本、样式并解码实体
 */
function extractTextFromHtml(html: string): string {
    const $ = cheerio.load(html);
    $("script, style").remove();

    let text = $("body").text();

    // 同时提取常见属性中的文字
    $("[alt], [placeholder], [title]").each((_, el) => {
        text += $(el).attr("alt") || "";
        text += $(el).attr("placeholder") || "";
        text += $(el).attr("title") || "";
    });

    return text;
}

async function main() {
    console.log('\x1b[36m%s\x1b[0m', '>> Starting modern font subsetting (replacement for font-spider)...');

    if (!fontConfig.enable || fontConfig.fonts.length === 0) {
        console.log('Font subsetting disabled or no fonts configured in src/configs/font.ts.');
        return;
    }

    // 1. 收集所有 HTML 中的文字
    const htmlFiles = getFilesRecursive(DIST_DIR, [".html"]);
    if (htmlFiles.length === 0) {
        console.warn(`Dist directory '${DIST_DIR}' not found or contains no HTML files. Did you run build?`);
        return;
    }

    const charSet = new Set<string>();
    // 添加一些基础字符保证渲染（标点、数字等基本需求）
    for (const c of "0123456789.+-:()[]{} ".split("")) {
        charSet.add(c);
    }

    for (const file of htmlFiles) {
        const html = fs.readFileSync(file, 'utf-8');
        const text = extractTextFromHtml(html);
        for (const char of text) {
            // 过滤掉不可见字符和空白，保留有意义的字符
            if (char.trim() || char === ' ') charSet.add(char);
        }
    }

    const allChars = Array.from(charSet).sort().join('');
    console.log(`Extracted ${charSet.size} unique characters from ${htmlFiles.length} files:`);
    console.log(`\x1b[90m${allChars}\x1b[0m`); // 使用灰色输出详细字符集内容内容

    // 2. 遍历配置进行子集化
    for (const font of fontConfig.fonts) {
        const relativePath = font.src.startsWith('/') ? font.src.slice(1) : font.src;
        const fontPath = path.join(DIST_DIR, relativePath);

        if (!fs.existsSync(fontPath)) {
            console.error(`Font file not found in dist: ${fontPath}`);
            continue;
        }

        console.log(`Processing font: ${font.name} (${fontPath})`);
        
        try {
            const originalBuffer = fs.readFileSync(fontPath);
            
            // 执行子集化
            // subset-font 默认会根据输入 buffer 自动识别格式 (TTF/OTF/WOFF)
            // targetFormat 设为 'truetype' 对应 .ttf 格式
            const subsetBuffer = await subsetFont(originalBuffer, allChars, {
                targetFormat: 'truetype' 
            });

            // 检查压缩效果
            const oldSize = (originalBuffer.length / 1024).toFixed(2);
            const newSize = (subsetBuffer.length / 1024).toFixed(2);
            
            fs.writeFileSync(fontPath, subsetBuffer);
            console.log(`\x1b[32m  ✔ ${font.name}: ${oldSize}KB -> ${newSize}KB (Reduced by ${((1 - subsetBuffer.length / originalBuffer.length) * 100).toFixed(1)}%)\x1b[0m`);
        } catch (err) {
            console.error(`  ✘ Failed to subset ${font.name}:`, err);
        }
    }

    console.log('\x1b[32m%s\x1b[0m', '>> Font subsetting completed successfully.');
}

main().catch(err => {
    console.error('Fatal error during font subsetting:', err);
    process.exit(1);
});
```

### 第四步：集成到构建

最后一步，修改 `package.json`，让脚本在 `astro build` 完成后自动触发。

找到 `scripts` 部分，更新 `build` 命令：

```json
{
  "scripts": {
    "build": "pnpm run validate-config && astro build && tsx scripts/font-subset.ts"
  }
}
```

诶之前清理的时候好像没更新package.json？不管了现在没事了，如果你在清理之后构建失败可以检查下。

还有一件事：validate-config是我自己加的基于ZOD的配置检验，你的博客可能没有，如果没有就去掉这个脚本执行。一切以你自己的博客为准，在最后添加tsx执行脚本就行了。

现在，每次执行 `pnpm build`，系统都会：
1.  验证配置。
2.  构建 Astro 站点。
3.  生成搜索索引。
4.  **自动提取全站文字并把几 MB 的字体裁剪到几十 KB。**

---

现在你可以刷新一下你的博客，测试字体了。如果你在迁移过程中遇到问题，欢迎在下方评论区交流。
