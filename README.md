# ResumeApp · 简历编辑器

> A local-first resume builder with drag-and-drop modules, multiple templates, and A4 print-ready export.  
> 纯前端、本地优先的简历编辑器：模块化排版、多模板、A4 打印/导出 PDF。

**English** | [简体中文](#简体中文)

### Preview

| Editor workbench | Clean Navy template |
|------------------|---------------------|
| ![Editor](docs/screenshots/editor-workbench.png) | ![Navy](docs/screenshots/template-clean-navy.png) |

| Steady Classic | Minimal Black |
|----------------|---------------|
| ![Steady](docs/screenshots/template-steady.png) | ![Minimal](docs/screenshots/template-minimal.png) |

### 界面预览

| 工作台 | 简约横幅 |
|--------|----------|
| ![工作台](docs/screenshots/editor-workbench.png) | ![横幅](docs/screenshots/template-clean-navy.png) |

| 稳重单页 | 极简黑白 |
|----------|----------|
| ![稳重](docs/screenshots/template-steady.png) | ![极简](docs/screenshots/template-minimal.png) |

---

## English

### Features

- **Multiple resume archives** — create, rename, duplicate, and switch documents (stored locally)
- **Drag-and-drop layout** — reorder modules with the grip handle; move across pages
- **Section editing** — basic info, education, work, projects, skills, summary, custom blocks
- **Editable content blocks** — bold prefixes (e.g. 工作职责 / 项目成果), add or remove freely
- **Photo upload & crop** — zoom/pan crop, 1:1 frame, stored in IndexedDB
- **Date pickers** — year–month ranges including up to **+2 years** in the future
- **Three templates** inspired by Chinese resume styles:
  - Steady Classic（稳重单页）
  - Clean Navy（简约横幅）
  - Minimal Black（极简黑白）
- **A4 overflow handling** — content past A4 is clipped; non-blocking “Add page?” prompt (max 3 pages)
- **Autosave** — 15s / 30s / 60s / off; manual save + restore after refresh
- **Print / PDF** — browser print styles; choose “Save as PDF”

### Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173/

Or double-click `start-dev.bat` (Windows).

```bash
npm run build   # production build → dist/
```

### Stack

| Layer | Tech |
|------|------|
| App | React 18 + TypeScript + Vite |
| State | Zustand |
| Storage | IndexedDB (`idb`) |
| DnD | @dnd-kit |
| UI | CSS Modules + design tokens |

### Project layout

```
src/
  domain/       # types, layout math, A4 measure
  storage/      # IndexedDB repositories
  stores/       # archive / settings (Zustand)
  modules/      # section forms + canvas previews
  features/     # canvas, palette, cropper, autosave…
  styles/       # tokens, print, templates
```

### A4 rules

- Page size: **794×1122 px** screen / **210×297 mm** print
- Max pages: **3**
- When content exceeds A4: page clips, toast/banner asks **Add page?** — editing stays enabled

### License

Private / personal use unless you add a license later.

---

## 简体中文

### 功能

- **多份简历档案** — 新建、重命名、复制、切换（全部存在浏览器本地）
- **拖拽排版** — 按 ⠿ 调整模块顺序，支持跨页
- **模块编辑** — 个人信息、教育、工作、项目、技能、自我评价、自定义
- **内容板块** — 粗体前缀标题（如工作职责 / 项目成果），可增删
- **证件照** — 上传、拖拽缩放裁剪、存本地
- **年月时间** — 可选未来最多 **+2 年**
- **三套模板**：稳重单页 / 简约横幅 / 极简黑白
- **A4 超出** — 截断显示 + 非阻塞「是否加一页」；最多 3 页
- **自动保存** — 15s / 30s / 60s / 关闭；刷新后仍在
- **打印 / PDF** — 导出 PDF 走浏览器打印

### 快速开始

```bash
npm install
npm run dev
```

打开 http://localhost:5173/

Windows 也可双击 `start-dev.bat`。

```bash
npm run build   # 产物在 dist/
```

### 技术栈

| 层 | 选型 |
|----|------|
| 应用 | React 18 + TypeScript + Vite |
| 状态 | Zustand |
| 存储 | IndexedDB（`idb`） |
| 拖拽 | @dnd-kit |
| 样式 | CSS Modules + 设计 Token |

### 使用提示

1. 左侧点击或画布按钮添加模块  
2. 点画布模块 → 右侧编辑；拖 ⠿ 改顺序  
3. 个人信息里上传证件照并裁剪  
4. 顶栏切换模板、档案、自动保存间隔  
5. **导出 PDF** → 系统打印对话框选「另存为 PDF」  

### 目录

```
src/domain|storage|stores|modules|features|styles
docs/       设计文档
start-dev.bat
```

---

<p align="center">
  Built for practical Chinese resume layouts · 为中文简历排版而做
</p>
