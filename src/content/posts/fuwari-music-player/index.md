---
title: "魔改 Fuwari：从零开始为博客添加音乐播放器"
published: 2025-11-27
description: "一篇完整的教程，教你如何将 APlayer.js 音乐播放器无缝集成到你的 Fuwari 主题博客中，包括状态保持和样式美化。"
image: ""
tags: ["博客搭建", "Fuwari", "APlayer", "教程", "魔改"]
category: "Tech"
draft: false
series: "该博客搭建"
---

# 该教程由AI编写
Fuwari 是一个设计简洁、注重性能的 Astro 博客主题。但简洁不代表我们不能对其进行扩展和“魔改”。一个常见的需求就是为博客添加一个背景音乐播放器，以增强氛围感。

本教程将详细介绍如何从零开始，将强大的 [APlayer.js](https://github.com/DIYgod/APlayer) 音乐播放器集成到 Fuwari 博客中。我们将实现以下目标：

-   一个可配置的开关，随时启用或禁用播放器。
-   在 Astro 页面切换（SPA 模式）时保持播放状态不中断。
-   与 Fuwari 主题风格（特别是深色模式）完美融合的播放器样式。

### 第一步：添加 APlayer 库文件

首先，我们需要获取 APlayer 的核心库文件。

1.  **下载 APlayer**:
    访问 [APlayer 的 GitHub 仓库](https://github.com/DIYgod/APlayer)。在项目的 `dist` 目录中，找到并下载 `APlayer.min.js` 和 `APlayer.min.css` 这两个文件。

2.  **放置文件**:
    将下载的 `APlayer.min.js` 和 `APlayer.min.css` 文件放入您项目的 `public/` 目录下。这能确保它们可以像静态资源一样被直接访问。

### 第二步：添加功能开关

为了方便管理，我们在博客的配置文件中添加一个开关来控制播放器是否加载。

1.  **更新类型定义**:
    打开 `src/types/config.ts` 文件，在 `SiteConfig` 类型中添加 `musicPlayer` 属性：

    ```typescript
    export type SiteConfig = {
        // ... 其他类型
        favicon: Favicon[];

        musicPlayer: { // <-- 添加这部分
            enable: boolean;
        };
    };
    ```

2.  **更新主配置**:
    打开 `src/config.ts` 文件，在 `siteConfig` 对象中添加 `musicPlayer` 配置，并将其设置为 `true` 来启用它。

    ```typescript
    export const siteConfig: SiteConfig = {
        title: "Wtada233's Blog",
        // ... 其他配置
        toc: {
            // ...
        },
        favicon: [
            // ...
        ],
        musicPlayer: { // <-- 添加这部分
            enable: true,
        },
    };
    ```

### 第三步：配置播放列表 (`MasterMusic.js`)

这是定义播放器行为和歌曲列表的核心文件。

1.  **创建文件**:
    在 `public/` 目录下创建一个 `lib` 文件夹，然后在其中新建一个 `MasterMusic.js` 文件。

2.  **编写配置**:
    将以下代码复制到 `public/lib/MasterMusic.js` 中。这是一个包含了歌曲信息、APlayer 基础设置和状态恢复逻辑的完整模板。

    ```javascript
    (() => {
        // 确保 APlayer 已加载
        if (typeof APlayer === "undefined") {
            console.error("APlayer 未加载");
            return;
        }

        // 避免重复初始化
        if (window.musicPlayerInitialized) {
            return;
        }
        window.musicPlayerInitialized = true;

        try {
            // 创建音乐播放器实例
            const musicPlayer = new APlayer({
                container: document.getElementById("player"),
                fixed: false, // 不启用吸底模式
                autoplay: true,
                theme: "#04112d",
                loop: "all",
                order: "random",
                volume: 1.0,
                mutex: true,
                listFolded: false,
                listMaxHeight: 90,
                lrcType: 1, // 使用内联歌词
                audio: [
                    {
                        name: "Lemon",
                        artist: "米津玄師",
                        url: "/music/lemon/lemon.mp3",
                        cover: "/music/lemon/lemon.jpg",
                        lrc: "[00:00.000]Lemon - 米津玄師...",
                    },
                    {
                        name: "让风告诉你",
                        artist: "花玲,喵☆酱,宴宁,kinsen",
                        url: "/music/demo/demo.mp3",
                        cover: "/music/demo/demo.jpg",
                        lrc: "[00:00.000] 作词 : ChiliChill...",
                    },
                ],
            });

            // 将播放器实例保存到全局
            window.musicPlayer = musicPlayer;

            // 恢复页面切换前保存的播放状态
            if (window.musicPlayerState) {
                const state = window.musicPlayerState;
                musicPlayer.on("loadeddata", () => {
                    if (state.currentIndex !== undefined) {
                        musicPlayer.list.switch(state.currentIndex);
                    }
                    if (state.currentTime) {
                        musicPlayer.seek(state.currentTime);
                    }
                    if (!state.paused) {
                        musicPlayer.play().catch(() => {
                            // 自动播放失败，等待用户交互
                        });
                    }
                    window.musicPlayerState = null;
                });
            }
        } catch (error) {
            console.error("音乐播放器初始化失败:", error);
        }
    })();
    ```

3.  **放置音乐文件**:
    根据您在 `audio` 数组中配置的 `url` 和 `cover` 路径，将音乐和封面文件放置到 `public/` 目录下。例如，创建 `public/music/` 文件夹来存放它们。

### 第四步：集成到主布局 (`Layout.astro`)

这是最关键的一步。我们需要修改博客的全局布局文件 `src/layouts/Layout.astro`，以加载播放器的 HTML、CSS 和 JavaScript。

打开 `src/layouts/Layout.astro` 并添加以下代码块：

1.  **在 `<head>` 中引入 APlayer 样式**:
    在 `</head>` 标签之前，加入以下代码。它会根据配置决定是否加载 CSS。

    ```astro
    {/* 音乐播放器样式 */}
    {siteConfig.musicPlayer.enable && (
        <link href="/APlayer.min.css" rel="stylesheet">
    )}
    ```

2.  **在 `<body>` 中添加播放器容器和加载脚本**:
    在 `</body>` 标签之前，加入播放器的 HTML 容器和核心的加载与状态管理脚本。

    ```astro
    {/* 音乐播放器容器 */}
    {siteConfig.musicPlayer.enable && (
        <div id="player" class="aplayer"></div>
    )}

    {/* 音乐播放器脚本 */}
    {siteConfig.musicPlayer.enable && (
        <script is:inline>
            // 防止重复加载脚本
            if (!window.aplayerLoaded) {
                window.aplayerLoaded = true;

                // 定义全局加载函数
                window.loadMasterMusic = function() {
                    if (window.musicPlayerInitialized) return;
                    const script = document.createElement('script');
                    script.src = '/lib/MasterMusic.js';
                    document.head.appendChild(script);
                };

                // 加载 APlayer 库，加载完成后回调 loadMasterMusic
                const aplayerScript = document.createElement('script');
                aplayerScript.src = '/APlayer.min.js';
                aplayerScript.onload = window.loadMasterMusic;
                document.head.appendChild(aplayerScript);
            }

            // 监听 Astro 页面导航事件，确保容器存在
            document.addEventListener('astro:page-load', function() {
                if (!document.getElementById('player')) {
                    const playerContainer = document.createElement('div');
                    playerContainer.id = 'player';
                    playerContainer.className = 'aplayer';
                    document.body.appendChild(playerContainer);
                }
                // 重新加载播放器逻辑
                if (window.loadMasterMusic) {
                    window.loadMasterMusic();
                }
            });

            // 页面卸载前保存播放状态
            document.addEventListener('astro:before-swap', function() {
                if (window.musicPlayer) {
                    window.musicPlayerState = {
                        currentTime: window.musicPlayer.audio.currentTime,
                        paused: window.musicPlayer.audio.paused,
                        currentIndex: window.musicPlayer.list.index
                    };
                    // 标记播放器需要重新初始化
                    window.musicPlayerInitialized = false;
                }
            });
        </script>
    )}
    ```
    **脚本解释**:
    -   它首先加载 `APlayer.min.js`，成功后再加载我们的配置文件 `MasterMusic.js`。
    -   通过监听 `astro:before-swap` 事件，在页面切换前将当前播放进度、播放状态和歌曲索引保存到 `window.musicPlayerState` 中。
    -   通过监听 `astro:page-load` 事件，在页面切换后重新加载 `MasterMusic.js`，该文件内的逻辑会读取 `window.musicPlayerState` 并恢复播放，从而实现无缝播放。

3.  **添加播放器自定义样式**:
    将以下 CSS 代码块添加到 `src/layouts/Layout.astro` 文件末尾的 `<style is:global>` 标签内。这些样式能让播放器完美融入主题。

    ```css
    @layer components {
        /* ... 其他组件样式 ... */

        /* 音乐播放器样式 */
        #player.aplayer {
            margin: 0;
            border-radius: var(--radius-large);
            border: 1px solid var(--line-divider);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            position: fixed;
            bottom: 20px;
            left: 20px;
            z-index: 999;
            width: 300px;
            transition: all 0.3s ease;
            overflow: hidden;
        }
        
        @media (max-width: 768px) {
            #player.aplayer {
                bottom: 10px;
                left: 10px;
                right: 10px;
                width: auto;
            }
        }
        
        :root.dark #player.aplayer {
            background: var(--card-bg);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
            border-color: var(--line-divider);
        }

        :root.dark #player.aplayer .aplayer-info {
            border-bottom-color: var(--line-divider);
        }

        :root.dark #player.aplayer .aplayer-info .aplayer-music .aplayer-title {
            color: rgb(255 255 255 / 0.9);
        }

        :root.dark #player.aplayer .aplayer-info .aplayer-music .aplayer-author,
        :root.dark #player.aplayer .aplayer-info .aplayer-controller .aplayer-time {
            color: rgb(255 255 255 / 0.5);
        }

        :root.dark #player.aplayer .aplayer-list {
            background-color: var(--card-bg);
        }

        :root.dark #player.aplayer .aplayer-list ol li {
            color: rgb(255 255 255 / 0.7);
            border-top-color: var(--line-divider);
        }

        :root.dark #player.aplayer .aplayer-list ol li:hover {
            background: var(--btn-plain-bg-hover);
        }
        
        :root.dark #player.aplayer .aplayer-list ol li.aplayer-list-light {
            background: var(--btn-plain-bg-hover);
        }
    }
    ```

### 总结

恭喜！通过以上步骤，您已经成功地为您的 Fuwari 博客添加了一个功能完善且外观精美的音乐播放器。现在，每当访问者在您的站点中浏览时，都可以享受不间断的音乐了。

您可以进一步探索 APlayer 的[官方文档](https://aplayer.js.org/)，解锁更多高级功能，例如歌词滚动、多播放列表等，尽情发挥您的创造力吧！
