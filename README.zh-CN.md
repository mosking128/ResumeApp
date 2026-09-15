# ResumeApp

[English](./README.md) | [简体中文](./README.zh-CN.md)

> 纯前端、本地优先的简历编辑器：模块化排版、多模板、A4 打印 / 导出 PDF。

### 界面预览

| 工作台 | 简约横幅 |
|:------:|:--------:|
| ![工作台](docs/screenshots/editor-workbench.png) | ![简约横幅](docs/screenshots/template-clean-navy.png) |
| **稳重单页** | **极简黑白** |
| ![稳重单页](docs/screenshots/template-steady.png) | ![极简黑白](docs/screenshots/template-minimal.png) |

---

## 功能

- **多份简历档案** — 新建、重命名、复制、切换，数据存在浏览器本地
- **拖拽排版** — 按 ⠿ 调整模块顺序，支持跨页
- **模块编辑** — 个人信息、教育、工作、项目、技能、自我评价、自定义
- **内容板块** — 粗体前缀标题（如「工作职责」「项目成果」），可增删
- **证件照** — 上传、拖拽缩放裁剪，本地存储
- **年月时间** — 可选未来最多 **+2 年**
- **三套模板**：稳重单页 / 简约横幅 / 极简黑白
- **A4 超出** — 截断显示 + 非阻塞「是否加一页」；最多 3 页
- **自动保存** — 15s / 30s / 60s / 关闭；刷新后仍在
- **打印 / PDF** — 浏览器打印，选择「另存为 PDF」

---

## 快速开始

```bash
npm install
npm run dev
```

浏览器打开 http://localhost:5173/

Windows 可双击 `start-dev.bat`。

```bash
npm run build   # 产物在 dist/
```

---

## 使用提示

1. 左侧点击或画布按钮 **添加模块**
2. 点画布模块 → **右侧编辑**；拖 ⠿ **改顺序**
3. 在「个人信息」里 **上传证件照** 并裁剪
4. 顶栏切换 **模板 / 档案 / 自动保存**
5. **导出 PDF** → 系统打印对话框选「另存为 PDF」

---

## 技术栈

| 层 | 选型 |
|----|------|
| 应用 | React 18 + TypeScript + Vite |
| 状态 | Zustand |
| 存储 | IndexedDB（`idb`） |
| 拖拽 | @dnd-kit |
| 样式 | CSS Modules + 设计 Token |

---

## 目录结构

```
src/
  domain/       # 类型、布局计算、A4 测量
  storage/      # IndexedDB 仓储
  stores/       # 档案 / 设置（Zustand）
  modules/      # 各模块表单 + 画布预览
  features/     # 画布、模块库、裁剪器、自动保存…
  styles/       # token、打印、模板样式
docs/
  screenshots/  # README 截图
  框架设计.md
  工程设计.md
```

---

## A4 规则

| 项 | 值 |
|----|-----|
| 屏幕 | 794 × 1122 px |
| 打印 | 210 × 297 mm |
| 最大页数 | 3 |
| 超出 | 画布截断 + 「是否加一页」提示（不锁编辑） |

---

## License

个人使用，未添加开源 License 前请勿当作公开可商用软件分发。
