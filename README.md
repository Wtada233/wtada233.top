# Wtada233's Blog - Fuwari 极致工程化魔改版

本项目是基于 [Fuwari](https://github.com/saicaca/fuwari) 的深度定制版本。不仅在视觉上引入了毛玻璃特效和自适应色彩，更在工程化层面实现了“极致静态化”方案，致力于打造一个能够对抗时间侵蚀、具备极强“离线生存能力”的数字空间。

## 🌟 项目核心优势 (Why this fork?)

### 1. 极致静态化 (Extreme Staticization)
为了对抗“链接腐烂 (Link Rot)”，本项目实现了 100% 的外部资源脱钩：
- **图片本地化**：构建时自动下载 Markdown 中的外链图片并改写为本地路径，防止图床失效。
- **GitHub 静态快照**：自动抓取仓库元数据（Star/Fork/头像）并直接持久化到源码，不再依赖实时 API。
- **动态字体裁剪**：基于 `subset-font` 自动扫描全站 HTML 字符，将数 MB 的中文字体裁剪至几十 KB 的子集包，极大提升加载速度。
- **零外部图标依赖**：所有图标在构建时内联为 SVG 字符串，彻底弃用外部 CDN 图标库。

### 2. 稳健的自动化流水线 (Robust Pipeline)
- **配置校验**：引入 `Zod` 对全站配置进行 Schema 校验，防止任何配置错误导致构建或线上故障。
- **自动化构建**：集成了从主色提取、OG 分享图生成到完整性检查的全自动化流程。
- **完整性防护**：构建最后阶段会自动检查死链和外部资源泄露，确保产物 100% 离线可用。

### 3. 流畅的用户体验 (Smooth UX)
- **无刷新交互**：集成 `Swup` 配合自定义生命周期管理（`lifecycle.ts`），实现 SPA 般的流畅转场并防止脚本失效。
- **动态主题色**：基于 **Sharp** 提取封面图主色，为每篇文章自动生成独特的配色氛围。
- **原生轻量组件**：纯原生 JS 编写的音乐播放器，完美兼容无刷新跳转，无冗余第三方依赖。

---

## 🛠️ 魔改功能 (Custom Features)

- **文章置顶系统**：支持 `order` 字段控制置顶（1）或沉底（-1），带专属 UI 标签显示。
- **自动化系列文章**：通过 `series` 字段自动生成系列聚合页及侧边栏快速导航。
- **AI 摘要生成**：集成 Gemini AI 摘要展示，支持打字机动画动态效果。
- **Umami 统计挂件**：实时展示网站访问量，支持构建时静态快照回退。
- **毛玻璃模式 (Glass Mode)**：支持用户手动切换细腻的半透明视觉风格。

---

## 🚀 构建流程 (Build Workflow)

本项目拥有一套严谨的自动化构建流水线，执行 `pnpm build` 时将依次触发：

1. **validate-config**: 验证 `src/configs` 下的所有配置文件是否符合规范。
2. **staticize-github-cards**: 抓取 GitHub 数据并重写 Markdown 指令源码。
3. **localize-external-images**: 扫描 Markdown AST，自动下载外链图片。
4. **astro build**: 调用 Astro 核心生成静态站点产物。
5. **generate-og-images**: 为每篇文章自动合成高质量的 OG 社交分享图。
6. **font-subset**: 动态提取全站文字，生成极简中文字体子集。
7. **check-integrity**: 最终检查死链及外部资源泄露，确保产物完美。

---

## 📦 快速开始

```bash
# 克隆仓库
git clone https://github.com/Wtada233/wtada233.top

# 安装依赖
pnpm install

# 预览开发环境
pnpm dev

# 执行完整构建流水线
pnpm build
```

---

## 🤝 原创致谢 (Credits)

本项目的功能参考并集成了以下开发者的优秀代码，并在此基础上进行了重构与优化：

- **文章系列功能**：参考自 [ikamusume7](https://ikamusume7.org/posts/frontend/add_series_field/)
- **文章置顶功能**：参考自 [yang233](https://blog.yang233.eu.org/posts/post-pinning-feature/)
- **自定义字体方案**：参考自 [lanke-seven](https://lanke-seven.vercel.app/posts/107368/)
- **AI 摘要逻辑**：参考自 [fishcpy](https://blog.fis.ink/posts/35/) (已修正逻辑错误并进行适配优化)
- **基础主题**：基于优秀的 [Fuwari](https://github.com/saicaca/fuwari)
- **音乐播放器**：参考自 [Mizuki](https://github.com/LyraVoid/Mizuki) (参考其UI和设计，但是完全重写，移植到astro并修改部分功能)

---

## 📄 许可证

本项目采用 **MIT** 许可证。
