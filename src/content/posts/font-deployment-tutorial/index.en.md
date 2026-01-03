---
title: "Tutorial: Deploying Chinese Fonts and Compressing with Font-Spider"
og_theme: dark
published: 2025-12-23
description: "A detailed guide on how to deploy Chinese fonts in an Astro blog project and use Font-Spider for intelligent compression, solving the issue of slow loading due to large font sizes."
image: ""
tags: ["Tutorial", "Font", "Astro", "Font-Spider", "Frontend Optimization"]
category: "Tech"
draft: false
series: "Building This Blog"
ai: "This article details how to use Font-Spider to subset and compress Chinese fonts in an Astro project. It covers everything from preparing font files and configuring global styles to writing automation scripts, with special emphasis on using the `--map` parameter to solve web path mapping challenges."
---

## I guarantee this is the most useful tutorial I've made—it's dummy-proof. If you don't understand, check GitHub.

Chinese fonts are usually massive (several MBs), and using them directly on a webpage leads to slow loading and a poor user experience. This article introduces how to use [Font-Spider](https://github.com/aui/font-spider) to subset and compress Chinese fonts, keeping only the characters actually used on your site, reducing the size to just a few dozen KB.

### Actually, I have another goal: to fix the mess of Font-Spider tutorials online. Most don't teach the `--map` parameter, use manual HTML, or only work for static sites with no generators. I have to ask: can those actually be used in a real project?

> Note: This tutorial is based on Fuwari. If you don't use Fuwari, you can still use it as a reference. The scripts are written in Node.js.
> Replace MiSans-Regular with your own font!

## Preparation: Understanding Font-Spider

Font-Spider hasn't been updated in a while, so ignoring pnpm warnings about outdated dependencies is fine.

This tool scans specified files/folders (usually HTML), extracts `@font-face` tags from CSS, identifies the font, and based on the usage scope, extracts all characters and repacks the font.

The main issue is: what about web paths?

For example, I need to specify the font path as `/MiSans-Regular.ttf` so all pages can find it, but Font-Spider doesn't recognize this and tries to find the font at the system root.

In this case, we need the `--map` parameter. The format is `--map "original_path,replacement_path"`, such as `--map "/foobar.ttf,dist/foobar.ttf"`. This solves the problem.

## Step 1: Prepare Font Files

First, prepare your font file (`.ttf` format). To make it accessible after Astro builds the site, put it in the `public` directory.

```text
/public
  ├── MiSans-Regular.ttf
  └── ...
```

Then, create `src/configs/font.ts` to manage font configuration:

```typescript
export const fontConfig = {
    enable: true,
    fonts: [
        {
            name: "MiSans-Regular",
            src: "/MiSans-Regular.ttf",
            type: "truetype",
            weight: "normal",
            style: "normal",
            display: "swap",
        },
    ],
    family: "'MiSans-Regular', sans-serif",
};
```

## Step 2: Add Font-Spider Dependency

Install `font-spider` as a dev dependency:

```bash
pnpm add -D font-spider
```

## Step 3: Configure Global Styles (Critical)

For Font-Spider to recognize font usage, you must explicitly declare `@font-face` and apply `font-family`.

In Astro, use `<style is:global>` in your layout file (e.g., `src/layouts/Layout.astro`). The `is:global` attribute ensures the style applies to the `body` and can be crawled by Font-Spider.

```astro
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
```

## Step 4: Write Automation Script

Create `scripts/compress-font.js` to automatically run Font-Spider after building:

(Refer to the original post for the full script content).

Finally, update `package.json`:

```json
"scripts": {
  "build": "astro build && pagefind --site dist && node scripts/compress-font.js"
}
```

Now, every time you run `pnpm build`, your fonts will be automatically optimized!
