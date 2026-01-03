---
title: "Goodbye Font-Spider: Precise Font Subsetting with Custom Scripts"
og_theme: dark
published: 2025-12-26
description: "A record of migrating from the outdated Font-Spider to a modern subset-font based solution, solving issues with massive font sizes and path mapping."
image: ""
tags: ["Tutorial", "Astro", "Frontend Optimization", "Font", "TypeScript"]
category: "Tech"
draft: false
series: "Building This Blog"
ai: "This post documents the transition from Font-Spider to a custom TypeScript subsetting script. By using the subset-font library, the new solution automates character extraction and font pruning directly from the build output, overcoming long-standing maintenance and pathing issues."
---

## Why Migrate?

In an Astro blog, multi-megabyte Chinese fonts are the primary culprits behind slow first-paint times. Previously, I used [Font-Spider](https://github.com/aui/font-spider), but as the project grew more complex, several issues emerged:

1.  **Maintenance**: `font-spider` hasn't been updated in years and lacks support for modern CSS.
2.  **Pathing Hell**: It struggles with absolute paths in the build output (e.g., `/MiSans-Regular.ttf`), requiring complex `--map` arguments.
3.  **Black Box**: Hard to integrate into modern TypeScript workflows with vague error reporting.

To solve this once and for all, I decided to write a custom script based on `subset-font`. (Actually, AI did most of the heavy lifting; I'm just documenting it.)

---

## Migration Steps

### Step 1: Clean House

First, remove the obsolete tools and old scripts.

```bash
pnpm remove font-spider
rm scripts/compress-font.js
```

### Step 2: Install Modern Dependencies

We need a few core libraries:
-   `subset-font`: The core subsetting engine.
-   `he`: For handling HTML entities.
-   `tsx`: To run TypeScript scripts directly.

```bash
pnpm add -D subset-font he tsx
```

### Step 3: The `font-subset.ts` Script

Create `scripts/font-subset.ts`. The logic is simple:
1.  **Scan** the `dist/` folder for HTML files.
2.  **Extract** and deduplicate all visible text.
3.  **Read** the source font.
4.  **Subset** using `subset-font` and overwrite the original file.

(Refer to the original post for the implementation details).

### Step 4: Build Integration

Update `package.json` to trigger the script after building:

```json
{
  "scripts": {
    "build": "pnpm run validate-config && astro build && tsx scripts/font-subset.ts"
  }
}
```

Now, every build will automatically prune your fonts from MBs to KBs based on your site's actual content.
