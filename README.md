# 🍥Fuwari  
![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen) 
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue) 
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari?ref=badge_shield&issueType=license)

一个用 [Astro](https://astro.build) 构建的静态博客模板。

## 🛠️ 魔改功能 (Custom Features)

本项目在 Fuwari 主题的基础上进行了多项自定义功能增强：

### 原创作者链接：

#### 音乐播放器（我魔改过）：

https://blog.pljzy.top/posts/astrofuwai/astrofuwai%E5%8D%9A%E5%AE%A2%E9%83%A8%E7%BD%B2%E6%95%99%E7%A8%8B/

#### 系列：

https://ikamusume7.org/posts/frontend/add_series_field/

#### 置顶：

https://blog.yang233.eu.org/posts/post-pinning-feature/

#### 字体修改：

https://lanke-seven.vercel.app/posts/107368/#%E8%87%AA%E5%AE%9A%E4%B9%89%E5%AD%97%E4%BD%93

#### AI摘要（原作者写错了代码，entry.data.description改成entry.data.ai，另外做了一些优化）

https://blog.fis.ink/posts/35/

- **文章置顶系统**：通过在文章的 frontmatter 中添加 `order` 字段，你可以将文章置顶 (`order: 1`) 或沉底 (`order: -1`)。文章列表将首先根据此 `order` 值进行排序。另外，我自己写了魔改版本的显示功能，可以在置顶文章标题右边显示置顶标签。

- **文章系列功能**：通过在 frontmatter 中添加 `series` 字段，将多篇文章归入一个系列。同一系列的文章将显示在侧边栏的“系列”小部件中，并拥有一个专门的系列聚合页面。

- **全局音乐播放器**：集成了 APlayer.js 作为全局背景音乐播放器。该播放器在 Astro 页面切换时保持其播放状态，并可在 `src/config.ts` 文件中启用或禁用。播放列表和音乐文件在 `public/lib/MasterMusic.js` 和 `public/music/` 中配置。

- **Giscus 评论系统**：文章页面集成了基于 GitHub Discussions 的 [Giscus](https://giscus.app/) 评论系统。访问者可以使用他们的 GitHub 账户轻松发表评论和互动。

- **AI概括**：魔改的fishcpy AI概括，静态的，生成好概括复制到文章信息ai字段中。

## 如何使用

```
git clone https://github.com/Wtada233/wtada233.top
vim wtada233.top/src/config.ts
#自定义
pnpm install
npm run build
```

## 📄 许可证

本项目采用 MIT 许可证。

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari?ref=badge_large&issueType=license)
