---
title: "博客功能集成测试：长公式与多媒体排版"
published: 2025-12-24
description: "这是一篇用于测试博客各项功能的示例文章，涵盖了 KaTeX 数学公式、灯箱图片、Admonition 提示框以及 GitHub 卡片等组件。"
image: "https://picsum.photos/1200/600"
tags: ["测试", "LaTeX", "Astro", "灯箱"]
category: "Tech"
draft: false
series: "功能测试"
ai: "本文是一篇综合性的测试文章，展示了博客对复杂数学公式（KaTeX）的支持，包括麦克斯韦方程组和矩阵运算。同时，文中演示了灯箱图片效果、GitHub 仓库卡片引用、以及多种样式的警告提示框。通过这篇测试文章，可以全面验证博客在处理技术文档时的排版表现与交互体验。"
---

## 1. 数学公式测试 (KaTeX)

博客支持通过 KaTeX 渲染数学公式。

### 行内公式
这是一个行内公式测试：$E = mc^2$，以及勾股定理 $a^2 + b^2 = c^2$。

### 块级公式
以下是著名的**麦克斯韦方程组**的积分形式：

$$
\begin{aligned}
\oint_{\partial \Omega} \mathbf{E} \cdot d\mathbf{S} &= \frac{1}{\varepsilon_0} \iiint_{\Omega} \rho \, dV \\
\oint_{\partial \Omega} \mathbf{B} \cdot d\mathbf{S} &= 0 \\
\oint_{\partial \Sigma} \mathbf{E} \cdot d\mathbf{l} &= -\frac{d}{dt} \iint_{\Sigma} \mathbf{B} \cdot d\mathbf{S} \\
\oint_{\partial \Sigma} \mathbf{B} \cdot d\mathbf{l} &= \mu_0 \iint_{\Sigma} \mathbf{J} \cdot d\mathbf{S} + \mu_0 \varepsilon_0 \frac{d}{dt} \iint_{\Sigma} \mathbf{E} \cdot d\mathbf{S}
\end{aligned}
$$

### 复杂矩阵运算
测试一个 $3 \times 3$ 的矩阵：

$$
\mathbf{A} = \begin{pmatrix}
a_{11} & a_{12} & a_{13} \\
a_{21} & a_{22} & a_{23} \\
a_{31} & a_{32} & a_{33}
\end{pmatrix}, \quad
\det(\mathbf{A}) = \sum_{\sigma \in S_n} \text{sgn}(\sigma) \prod_{i=1}^n a_{i, \sigma(i)}
$$

---

## 2. 图片灯箱测试

点击下方图片即可触发 Photoswipe 灯箱效果。

![随机风景图 1](https://picsum.photos/800/600?random=1)
*图 1：随机生成的风景图 1 (Picsum)*

![随机风景图 2](https://picsum.photos/1000/800?random=2)
*图 2：随机生成的风景图 2 (Picsum)*

---

## 3. Admonition 组件测试

博客集成了自定义的提示框组件。

:::tip
这是一个 **Tip** 提示框。用于提供有用的建议或小技巧。
:::

:::note
这是一个 **Note** 提示框。用于补充说明一些相关信息。
:::

:::important
这是一个 **Important** 提示框。请务必注意其中的内容。
:::

:::warning
这是一个 **Warning** 警告框。提醒用户可能存在的风险。
:::

:::caution
这是一个 **Caution** 注意框。警告用户需要特别小心。
:::

---

## 4. GitHub 卡片测试

使用自定义指令引用 GitHub 仓库：

::github{repo="saicaca/fuwari"}

---

## 5. 代码块测试

```typescript
interface BlogPost {
  title: string;
  date: Date;
  content: string;
}

const testArticle: BlogPost = {
  title: "测试文章",
  date: new Date(),
  content: "这是一段测试内容..."
};

console.log(`正在查看：${testArticle.title}`);
```

---

## 6. 总结

本测试文章成功演示了：
1. **KaTeX** 的行内和块级公式渲染。
2. **Photoswipe** 图片灯箱。
3. **Admonition** 警告框。
4. **GitHub Card** 动态仓库信息。
5. **代码高亮**。

如果您能看到正确的渲染效果，说明博客功能一切正常！
