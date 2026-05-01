# 技术栈简化与重构计划

## 目标
移除第三方 Swup 库，迁移至 Astro 原生 View Transitions，以降低维护成本、减少 Bundle 体积并提升框架兼容性。

## 待办事项

### 1. 移除 Swup 依赖
- [ ] 卸载 `@swup/astro` 包
- [ ] 移除 `src/utils/swup-initializer.ts`
- [ ] 检查并移除 `transition.css` 中与 Swup 相关的 CSS 类

### 2. 启用 Astro View Transitions
- [ ] 在 `src/layouts/Layout.astro` 中引入 `<ViewTransitions />` 组件
- [ ] 将 `<ViewTransitions />` 添加到 `<head>` 中

### 3. 重构生命周期事件
当前项目大量使用了 `swup:content:replace` 等事件，需要迁移到 Astro 的生命周期事件：
- [ ] 全局搜索 `swup` 关键字
- [ ] 将 `swup:content:replace` 替换为 `astro:page-load`
- [ ] 将 `swup:enable` 相关的初始化逻辑迁移到 `astro:page-load`
- [ ] 检查 `src/utils/app-entry.ts` 中的事件监听器逻辑

### 4. 修复组件状态持久化
- [ ] 检查组件在跳转后的重新初始化逻辑，音乐播放器等换原生实现

### 5. 清理类型定义
- [ ] 移除 `src/global.d.ts` 中关于 `window.swup` 的错误类型定义

### 6. 测试
- [ ] 测试页面跳转动画是否平滑
- [ ] 测试音乐播放器是否跨页面持续播放
- [ ] 测试评论区 (Twikoo) 是否在跳转后正确加载
- [ ] 测试其他是否正常且不出现资源泄露


## 暂时不考虑的，重构完成再说

### 1. 性能与体验优化
- [ ] **图片懒加载优化**：实现 BlurHash 或 LQIP (Low Quality Image Placeholders)，提升图片加载时的视觉体验。
