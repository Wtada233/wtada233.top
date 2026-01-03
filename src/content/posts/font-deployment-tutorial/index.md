---
title: 中文字体部署与字蛛(Font-Spider)压缩教程
og_theme: dark
published: 2025-12-23
description: "详细介绍如何在 Astro 博客项目中部署中文字体，并通过 Font-Spider 进行智能压缩，解决中文字体体积过大导致加载缓慢的问题。"
image: ""
tags: ["教程", "字体", "Astro", "Font-Spider", "前端优化"]
category: "Tech"
draft: false
series: "该博客搭建"
ai: "这篇文章详细介绍了如何在 Astro 项目中通过 Font-Spider 对中文字体进行子集化压缩，从而解决中文字体体积过大导致的加载缓慢问题。教程涵盖了从字体文件准备、全局样式配置到自动化压缩脚本编写的全过程，并特别强调了如何利用 `--map` 参数解决 Web 路径映射难题，实现生产环境下的自动化字体优化流程。"
---

## 我敢保证这是我做的最有用的教程了，堪称保姆级，如果你看不懂请自行Github
中文字体通常体积巨大（动辄几 MB），直接在网页中使用会导致加载缓慢，严重影响用户体验。本文将介绍如何使用 [Font-Spider (字蛛)](https://github.com/aui/font-spider) 对中文字体进行子集化压缩，只保留网页中实际用到的字符，从而将字体体积缩减到几十 KB。

#### 其实我做这个教程还有一个目的：彻底解决网上各种font-spider教程的乱象，--map参数是不教的，html是手动写的，网页全是静态的，静态到页面生成器都没有只有手写html，我就想问真实项目能用吗？

> 注意这个教程基于Fuwari，你要是不用Fuwari也可以参考，脚本使用NodeJS编写。
> MiSans-Regular换自己字体！

## 准备：了解font-spider原理

font-spider很久没有更新，所以pnpm提示过时依赖没事。

这个工具会先查找指定的文件/文件夹中的所有指定的文件（一般是html），然后把html中的style中的font-face标签提取，找到字体，并根据style标签中字体的应用范围查找所有文字并从字体提取然后重新打包

所以其原理就是只保留用的文字，简称子集化。

当然，还有个大问题：web路径怎么办？

举个我遇到的例子，我需要指定字体为/MiSans-Regular.ttf这个路径才能让所有页面都读取到我的字体，但是font-spider不认，去系统根目录找字体（我不知道Windows下会怎样）

这种情况下，我们就需要用到后文的--map参数。这个参数格式为--map "原路径,替换路径"，如--map "/foobar.ttf,dist/foobar.ttf"，这样就能解决这令人绝望的问题。

## 环节一：准备字体文件

首先，需要准备好你的字体文件（ `.ttf` 格式）。为了让 Astro 构建后的站点能够直接访问到字体，我们需要将其放入 `public` 目录。

例如，将 `MiSans-Regular.ttf` 放入 `public/` 根目录：

```text
/public
  ├── MiSans-Regular.ttf
  └── ...
```

同时，我们需要一个配置文件来管理字体信息。创建 `src/configs/font.ts`：

```typescript
// src/configs/font.ts
// 字体配置
export const fontConfig = {
    // 启用自定义字体
    enable: true,
    // 字体列表
    fonts: [
        {
            name: "MiSans-Regular",
            src: "/MiSans-Regular.ttf", // 相对于 public 目录
            type: "truetype",
            weight: "normal",
            style: "normal",
            display: "swap",
        },
    ],
    // 全局字体族设置
    family:
        "'MiSans-Regular', -apple-system, BlurMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'MicrosoftO Sans', 'Microsoft YaHei', 'WenQuanYi Micro Hei', sans-serif",
};
```

## 环节二：添加 Font-Spider 依赖

我们需要安装 `font-spider` 作为开发依赖。（不然你觉得呢，我遇见一堆教程都是npm install -g，看得我都想问作者换电脑怎么办）

它可以分析本地 HTML 文件，提取其中使用的文字，并从原始字体中删除未使用的字符。

在项目根目录下运行：

```bash
pnpm add -D font-spider
```

或者在 `package.json` 中手动添加并安装：（不建议）

```json
// package.json
"devDependencies": {
  "font-spider": "^1.3.5",
  // ...
}
```

## 环节三：配置全局样式 (关键步骤)

为了让 Font-Spider 正确识别 HTML 中的字体用法，我们需要在页面中显式声明 `@font-face` 并应用 `font-family`。

在 Astro 中，我们在全局布局文件 `src/layouts/Layout.astro` 中使用 `<style is:global>` 来注入这些样式。关键在于 `is:global` 属性，它确保样式不会被 Astro 作用域隔离，从而能应用到 `body` 上并被 Font-Spider 爬取到。

修改 `src/layouts/Layout.astro`，引入 `fontConfig` 并在 `<style is:global>` 中动态生成 CSS：

```astro
---
// src/layouts/Layout.astro
import { fontConfig } from "@configs/font";
// ... 其他 import
---

<!-- ... 其他 head 内容 ... -->

<style is:global set:html={`
${fontConfig.enable ? fontConfig.fonts.map((font) => `
    @font-face {
        font-family: '${font.name}';
        src: url('${font.src}') format('${font.type}');
        font-weight: ${font.weight};
        font-style: ${font.style};
        font-display: ${font.display};
    }
`).join('') : ''}
    body {
        font-family: ${fontConfig.family};
    }
`}></style>

<!-- ... body 内容 ... -->
```

**原理解析：**
1.  `@font-face` 声明了自定义字体，`src` 指向我们放在 `public` 目录下的字体文件（构建后会在根目录）。
2.  `body { font-family: ... }` 将该字体应用到全局。
3.  Font-Spider 扫描 HTML 时，会查找这两个声明，并匹配页面文本中使用了该 `font-family` 的字符。

## 环节四：编写自动压缩脚本

最后，我们需要一个脚本在项目构建完成后自动运行 Font-Spider。

创建 `scripts/compress-font.js`，以下是完整的脚本代码：

```javascript
// scripts/compress-font.js
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const DIST_DIR = 'dist';
const CONFIG_PATH = 'src/configs/font.ts';

function main() {
    console.log('\x1b[36m%s\x1b[0m', '>> Starting intelligent font-spider compression...');

    // 1. Check Config Existence
    if (!fs.existsSync(CONFIG_PATH)) {
        console.warn(`Config file not found at ${CONFIG_PATH}, skipping font compression.`);
        return;
    }
    
    // 2. Read and Parse Config
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
    
    // Check if enabled
    const enableMatch = configContent.match(/enable:\s*(true|false)/);
    if (enableMatch && enableMatch[1] === 'false') {
        console.log('Custom fonts are disabled in config. Skipping.');
        return;
    }

    // Extract fonts
    const fontSrcs = [];
    // Match the fonts array block
    const fontsMatch = configContent.match(/fonts:\s*\[([\s\S]*?)\]/);
    if (fontsMatch) {
        const fontsBlock = fontsMatch[1];
        // Match src properties: src: "..." or src: '...'
        const srcMatches = fontsBlock.matchAll(/src:\s*["']([^"']+)["']/g);
        for (const match of srcMatches) {
            fontSrcs.push(match[1]);
        }
    }

    if (fontSrcs.length === 0) {
        console.log('No custom fonts found in config to compress.');
        return;
    }

    console.log(`Found ${fontSrcs.length} font(s) to compress: ${fontSrcs.join(', ')}`);

    // 3. Find HTML files recursively
    if (!fs.existsSync(DIST_DIR)) {
        console.error(`Dist directory '${DIST_DIR}' not found. Did you run build?`);
        process.exit(1);
    }

    // recursive: true requires Node 20.1.0+
    let htmlFiles = [];
    try {
        const files = fs.readdirSync(DIST_DIR, { recursive: true });
        htmlFiles = files
            .filter(file => file.endsWith('.html'))
            .map(file => path.join(DIST_DIR, file));
    } catch (e) {
        // Fallback for older Node versions if necessary (though package.json says >=20)
        console.warn('fs.readdir recursive failed, falling back to manual recursion.');
        htmlFiles = findFilesRecursive(DIST_DIR);
    }

    if (htmlFiles.length === 0) {
        console.log('No HTML files found in dist directory.');
        return;
    }
    console.log(`Found ${htmlFiles.length} HTML files.`);

    // 4. Construct Arguments
    // --map '/url/path,local/path'
    const mapArgs = fontSrcs.map(src => {
        // Remove leading slash for local path construction
        const relativePath = src.startsWith('/') ? src.slice(1) : src;
        const localPath = path.join(DIST_DIR, relativePath);
        // Map format: '/web/path,local/fs/path'
        return `--map '${src},${localPath}'`;
    }).join(' ');

    // 5. Execute font-spider
    // We pass the list of files. 
    // If the list is too long for the shell, we might need to handle it differently, 
    // but for a blog site, it should be fine.
    const fileListStr = htmlFiles.map(f => `"${f}"`).join(' ');
    const command = `npx font-spider ${fileListStr} ${mapArgs}`;
    
    console.log('Executing font-spider...');
    try {
        execSync(command, { stdio: 'inherit', maxBuffer: 1024 * 1024 * 50 });
        console.log('\x1b[32m%s\x1b[0m', '>> Font compression completed successfully.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '>> Font compression failed.');
        process.exit(1);
    }
}

function findFilesRecursive(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findFilesRecursive(fullPath));
        } else {
            if (fullPath.endsWith('.html')) results.push(fullPath);
        }
    });
    return results;
}

main();
```

最后，修改 `package.json` 的 `build` 命令，在 `astro build` 之后运行这个脚本：

```json
// package.json
"scripts": {
  "build": "astro build && pagefind --site dist && node scripts/compress-font.js",
  // ...
}
```

这样，每次执行 `pnpm build` 时，系统会自动：
1.  构建静态站点到 `dist` 目录。
2.  `compress-font.js` 扫描 `dist` 中的所有 HTML。
3.  Font-Spider 分析 HTML 内容，压缩 `dist` 目录下的字体文件。

现在，你的博客就拥有了体积小巧且加载迅速的中文字体了！如果你遇到其他问题，可以体验下我新部署的Twikoo评论区或者Email我。
