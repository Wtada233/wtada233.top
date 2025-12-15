# 该仓库是一个Fuwari的Fork
## 🍥Fuwari  
![Node.js >= 20](https://img.shields.io/badge/node.js-%3E%3D20-brightgreen) 
![pnpm >= 9](https://img.shields.io/badge/pnpm-%3E%3D9-blue) 
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari?ref=badge_shield&issueType=license)

一个用 [Astro](https://astro.build) 构建的静态博客模板。

# 注意
我是Wtada233，在继续之前，你需要知道：
这不适合做一个模板。
1. 这个仓库包含很多我的个性化设置，如我的博客，音乐播放器播放列表，以及关于等，改起来比较费力
2. 这个仓库包含很多别人的配置，是我按照教程配置的。虽然或多或少魔改了，但是毕竟没有版权，所以尽量少复制，如果你想要可以参考下面的原作者链接和我改的地方。
3. 这个仓库AI含量极高，虽然看着可能还行，但是我也不知道究竟有多少bug，所以可以借鉴但是不建议直接使用。

#### 而且由于实在是太难以维护，我准备迁移到Firefly了

## 🛠️ 魔改功能 (Custom Features)

本项目在 Fuwari 主题的基础上进行了多项自定义功能增强：

### 原创作者链接：

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

- **评论系统**：文章页面集成了基于 Twikoo 的评论系统。访问者可以轻松发表评论和互动。

- **AI概括**：魔改的fishcpy AI概括，静态的，生成好概括复制到文章信息ai字段中。

- **网站统计 (Umami Analytics)**: 集成了 Umami V2 进行网站流量统计，并在侧边栏显示统计小部件。

## 如何使用

大部分配置项都已模块化并移至 `src/configs` 目录下，可以很方便地进行修改。

主要的站点配置在 `src/config.ts`。

```
git clone https://github.com/Wtada233/wtada233.top
# 根据需要修改 src/config.ts 和 src/configs/ 目录下的配置文件
pnpm install
pnpm build
```

## 📄 许可证

本项目采用 MIT 许可证。

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari.svg?type=large&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2Fsaicaca%2Ffuwari?ref=badge_large&issueType=license)
