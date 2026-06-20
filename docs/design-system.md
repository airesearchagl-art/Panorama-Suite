# Panorama Suite Design System

Version 1.0

## Design Concept

Panorama Suite is designed as a Professional Panorama Workspace, not just a collection of tools.
It supports architects, designers, construction managers, and clients who handle 360-degree panorama projects.

## Design Keywords

- Information First: prioritize information and remove unnecessary decoration.
- Workspace Style: present the product as a working environment.
- Dashboard Driven: make status visible at a glance.
- Professional Tool: design for architectural and project workflows.
- Calm UI: use calm colors and avoid excessive animation.

## Layout

Common structure:

```text
Header
Sidebar | Main Workspace
Footer
```

### Header

- Logo
- Tool Name
- Version
- Status
- Toolbar
- Manual
- Help
- Local Processing

### Sidebar

- Dashboard
- Filter
- List
- Groups
- Saved Sets
- Guide

### Main Workspace

The primary working area. It should reserve the maximum possible area for the active tool.

Examples:

- ArchView360: 360 Viewer
- Panorama QA: Quality Report
- Panorama Converter: Conversion Workspace

### Footer

- Version
- Security
- Copyright
- Local Processing

## Color Palette

| Token | Value |
| --- | --- |
| Background | `#111827` |
| Panel | `#1f2937` |
| Card | `#374151` |
| Accent | `#4f7cff` |
| Success | `#10b981` |
| Warning | `#f59e0b` |
| Error | `#ef4444` |

## Typography

Base font:

```text
Inter, "Segoe UI", "Noto Sans JP", sans-serif
```

Rules:

- Headings should be large and clear.
- Body text should be restrained.
- File names, numbers, and status labels should be readable.
- Japanese UI text should be natural and concise.

## Card Design

Common card rules:

- Rounded corners
- Subtle shadow
- High contrast
- Information first
- Clear status display

Examples:

- Project Card
- Tool Card
- QA Result Card
- Converter Item Card
- Packager File Card

## Button Design

- Primary: blue
- Secondary: gray
- Danger: red

Buttons should use icon plus text where appropriate.

Examples:

- 📁 開く
- 💾 保存
- 🔄 更新
- 📦 ZIP出力
- 🧪 QA実行
- 🖼 画像変換

## Dashboard Rules

Dashboards must be present in every primary tool.

Examples:

- Portal: Tools, Released, MVP, Planned
- Panorama QA: Images, Warnings, Errors, Pass Rate
- Project Packager: Panoramas, Floorplans, Missing Files, QA Status
- Panorama Converter: Input Images, Converted, Failed, Output Format

## Empty State Rules

Do not leave an empty area blank. Empty states must include:

- Icon
- State description
- Next action

Example:

```text
📂
画像がありません
ドラッグ＆ドロップ、またはファイル選択してください
```

## Security

Always show:

```text
🔒 Local Processing
```

Meaning:

- Image processing runs in the browser.
- Images are not sent to external APIs.
- There is no cloud upload in the MVP tools.

## Manual / Help

All tools expose:

- 📖 Manual
- ❔ Help

Manual links to `/docs`.
Help links to `/help`.

## UX Principles

1. Reduce clicks.
2. Allow direct action from lists.
3. Prefer drag and drop.
4. Visualize state.
5. Make the UI usable for beginners.
6. Keep advanced workflows fast.
