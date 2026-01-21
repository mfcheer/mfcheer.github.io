# 极客风格个人Portfolio网站

一个现代化、科技感十足的单页面个人介绍网站，采用极客/终端风格设计。

## 🎨 设计特点

### 核心风格
- **极客终端风格** - 仿Linux终端界面设计
- **绿色霓虹色** - 经典黑客电影风格配色 (#00ff00 主色)
- **单页面布局** - 所有内容在一页内展示
- **矩阵背景** - Canvas实现的动画矩阵背景效果

### 主要组件
- **顶部Header** - Logo和系统状态指示器
- **双栏布局** - 左侧个人信息，右侧技能展示
- **终端窗口** - 模拟Mac/Linux终端的视觉效果
- **项目展示** - 列表式项目展示
- **快速联系** - 一键联系方式

## 📁 文件结构

```
github-pages/
├── index.html      # 主页面（HTML结构）
├── styles.css      # 样式表（极客风格CSS）
├── script.js       # JavaScript脚本（矩阵动画+交互）
└── README.md       # 本文件
```

## 🚀 快速开始

### 1. 本地测试
直接在浏览器中打开 `index.html` 即可看到效果。

### 2. 部署到GitHub Pages

#### 方法一：创建个人页面仓库
```bash
# 创建名为 username.github.io 的仓库
git clone https://github.com/username/username.github.io.git
cd username.github.io

# 复制所有文件
cp /Users/mfcheer/CodeDevelopment/github-pages/* .

# 提交和推送
git add .
git commit -m "Add geek-style portfolio"
git push origin main
```

访问：`https://username.github.io`

#### 方法二：使用项目页面
在现有仓库的 `gh-pages` 分支中添加这些文件。

### 3. 自定义内容

#### 修改个人信息
编辑 `index.html` 中的终端内容：
```html
<p><span class="output">一个热爱编码的极客开发者</span></p>
<p><span class="output">5年+ 开发经验 | 全栈工程师</span></p>
```

#### 修改技能和技术栈
在技能部分和技术栈部分更新内容：
```html
<div class="skill-row">
    <span class="skill-name">你的技能名</span>
    <div class="skill-bar">
        <div class="skill-fill" style="width: 你的百分比%"></div>
    </div>
    <span class="skill-level">你的百分比%</span>
</div>
```

#### 修改项目
更新项目展示部分：
```html
<div class="project-item">
    <div class="project-title">
        <span class="folder">📁</span> 项目名称
        <span class="lang-badge">技术</span>
    </div>
    <p>项目描述</p>
</div>
```

#### 修改联系方式
更新联系链接：
```html
<a href="mailto:你的邮箱" class="contact-btn">
    <span class="contact-icon">✉</span>
    <span>Email</span>
</a>
```

## 🎯 色彩方案

| 类型 | 颜色代码 | 用途 |
|------|---------|------|
| 主色 | `#00ff00` | 文本、边框、强调 |
| 次色 | `#00d4ff` | Logo、标题 |
| 强调色 | `#ff00ff` | 心形、特殊效果 |
| 背景 | `#0a0e27` | 深蓝黑色背景 |
| 文本 | `#e0e0e0` | 次级文本 |

在 `styles.css` 中的 `:root` 部分修改这些变量：
```css
:root {
    --primary-color: #00ff00;
    --secondary-color: #00d4ff;
    --accent-color: #ff00ff;
    /* ... */
}
```

## 📱 响应式适配

- **桌面** (>1024px): 两列网格布局
- **平板** (768px-1024px): 单列布局，适应屏幕
- **手机** (<768px): 完全垂直堆叠

## ⚙️ 技术栈

- **HTML5** - 语义化标签
- **CSS3** - Grid布局、渐变、动画
- **Vanilla JavaScript** - Canvas矩阵效果
- **字体** - JetBrains Mono（极客风字体）

## 🎬 动画效果

- ✨ **Logo闪烁** - 持续的呼吸效果
- 🎨 **技能进度条** - 平滑填充动画
- 💚 **边框发光** - 悬停时的霓虹效果
- 🔢 **矩阵背景** - Canvas实时动画
- ❤️ **心形跳动** - 页脚装饰动画

## 🔧 自定义建议

### 添加自己的项目
1. 在项目展示部分添加新的 `project-item`
2. 更新项目标题、描述和技术标签
3. 可以添加链接指向GitHub或在线演示

### 调整布局
- 修改 `content-grid` 的 `grid-template-columns` 改变两列布局
- 调整 `container` 的 `max-width` 改变最大宽度
- 修改 `padding` 值调整内边距

### 更改字体
在 `body` 中替换 `font-family`：
```css
body {
    font-family: 'Fira Code', 'Courier New', monospace;
}
```

## 📝 SEO优化建议

1. 添加 meta 标签：
```html
<meta name="description" content="你的描述">
<meta name="keywords" content="开发者, 全栈, 极客">
```

2. 添加结构化数据
3. 优化页面加载速度

## 🎓 学习资源

- [CSS Grid 布局](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [CSS 动画](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)

## 💡 进阶定制

### 添加深色/浅色主题切换
```javascript
const toggleTheme = () => {
    document.body.classList.toggle('dark-mode');
};
```

### 集成联系表单
使用 Formspree、EmailJS 或 Netlify Forms

### 添加博客部分
创建新的终端窗口显示最近的文章

### 集成GitHub数据
使用GitHub API动态显示项目

## 🐛 常见问题

**Q: 矩阵背景不显示？**
A: 检查浏览器是否支持Canvas。使用现代浏览器（Chrome、Firefox、Safari等）。

**Q: 字体不是等宽的？**
A: 确保系统中安装了 JetBrains Mono，或在 `styles.css` 中修改字体。

**Q: 移动端显示不正常？**
A: 检查视口元标签是否存在：`<meta name="viewport">`

## 📄 许可证

自由使用和修改。如果你用了这个模板，欢迎给我反馈！

## 🙏 致谢

感谢使用本极客风格Portfolio模板！祝你的网站闪闪发光！🚀

---

**最后更新**: 2026年1月7日
**版本**: 2.0 (Geek Style)

