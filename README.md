# FZX · 方舟星系

> **浪漫与科技的交汇 · Where Romanticism Meets Technology**

一款为 [Halo](https://halo.run) 2.x 打造的现代博客主题，以深邃宇宙为背景，融合浪漫主义美学与科技感设计，让你的博客如繁星般耀眼夺目。

---

## ✦ 特色功能

| 功能 | 说明 |
|------|------|
| 🌌 星空动画 | Canvas 动态星空背景 + 流星效果 |
| 💎 玻璃拟态 | Glassmorphism 卡片设计，层次分明 |
| 🎨 浪漫渐变 | 靛蓝 → 紫罗兰 → 玫瑰粉三色渐变系统 |
| 📖 阅读进度 | 顶部彩色进度条，随滚动实时更新 |
| 📝 自动目录 | 文章页自动生成锚点目录并高亮当前章节 |
| 📋 代码复制 | 所有代码块一键复制按钮 |
| 🔍 搜索支持 | 全站搜索覆盖层（Ctrl+K 快捷键） |
| 🖼️ 图片灯箱 | 点击文章图片放大查看 |
| 📱 响应式 | 完整移动端适配，触摸友好 |
| 🗂️ 归档/分类/标签 | 完整的内容组织页面 |
| 💬 评论系统 | 兼容 Halo 内置评论插件 |
| ↑ 回到顶部 | 滚动超过 500px 自动显示 |

## 🎨 设计语言

- **背景**：深邃宇宙黑（#080c14）带动态星空
- **主色调**：靛紫 `#818cf8` · 紫罗兰 `#a78bfa` · 玫瑰 `#f472b6`
- **强调色**：科技青 `#22d3ee`
- **字体**：Playfair Display（浪漫衬线）+ Inter（科技无衬线）+ JetBrains Mono（代码等宽）
- **效果**：毛玻璃卡片、霓虹光晕、平滑过渡动画

## 📦 安装方法

### 方式一：从压缩包安装（推荐）

1. 在 [Releases](https://github.com/x1-explore/halo-fzx/releases) 页面下载最新的 `.zip` 文件
2. 登录 Halo 后台 → **外观** → **主题** → **安装**
3. 上传下载的 zip 文件，等待安装完成
4. 启用主题即可

### 方式二：从本仓库安装

1. 克隆本仓库并打包为 zip：
   ```bash
   git clone https://github.com/x1-explore/halo-fzx.git
   cd halo-fzx
   zip -r theme-fzx.zip . -x "*.git*" -x "README.md"
   ```
2. 在 Halo 后台安装上传的 zip 文件

## ⚙️ 主题设置

安装并启用主题后，在 **外观 → 主题 → 设置** 中可配置：

- **全局**：页脚版权信息、建站时间、返回顶部开关
- **首页横幅**：自定义标题、副标题、横幅样式
- **文章**：目录开关、点赞按钮开关

## 🛠️ 目录结构

```
theme.yaml          # 主题元数据
settings.yaml       # 主题设置模板
templates/
├── index.html      # 首页
├── post.html       # 文章详情
├── page.html       # 独立页面
├── archives.html   # 归档
├── categories.html # 分类列表
├── category.html   # 单个分类
├── tags.html       # 标签云
├── tag.html        # 单个标签
├── search.html     # 搜索结果
├── error/
│   └── error.html  # 错误页面
├── modules/
│   ├── layout.html    # 主布局
│   ├── base-head.html # head 模块
│   ├── header.html    # 导航栏
│   ├── footer.html    # 页脚
│   ├── sidebar.html   # 侧边栏
│   ├── post-card.html # 文章卡片
│   └── pagination.html# 分页
└── assets/
    ├── css/style.css  # 主样式表
    ├── js/main.js     # 交互脚本
    └── images/logo.svg# 主题图标
```

## 📋 兼容性

- Halo `>= 2.0.0`
- 现代浏览器（Chrome 90+、Firefox 88+、Safari 14+、Edge 90+）

## 📄 许可证

[MIT License](LICENSE) · 自由使用、修改和分发