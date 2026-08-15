---
name: docs-site-maintainer
description: 维护本仓库 docs/ 知识库网站时使用——新增、重命名、移动 Markdown 文章或 standalone HTML 页面，登记外链，更新 docs/index.md 目录与 docs/timeline.md 时间线。
whenToUse: 当用户在 docs/ 下添加、重命名、移动、删除文章或 HTML 页面，要登记外链、更新目录/时间线，或构建、预览、部署文档站时
---

# Docs Site Maintainer

本仓库的 `docs/` 是由 VitePress 驱动的知识库网站。凡是 `docs/` 下的内容变更，都必须按本文的流程维护索引，否则新内容在文档站首页不可见。

## 项目规则

- Markdown 文档由 VitePress 渲染；standalone HTML 页面保留在 `docs/<name>/index.html` 原路径，以 `/<name>/` 这样的 clean URL 访问。
- 首页是 `docs/index.md`，创建时间线是 `docs/timeline.md`。
- 只有 `preview.png` 被当作文档预览图；忽略 `preview2.png`、`cover.png` 等其他命名。
- 没有草稿概念，不要因为文件名含 `draft` 而隐藏文件。
- `docs/.vitepress/dist/` 和 `docs/.vitepress/cache/` 是构建产物，不要提交。

## 内容变更后的固定流程

添加、重命名、移动或删除任何文档（Markdown / HTML）或外链后，依次执行：

1. **外链登记**：外链不在文件系统里，需要先登记到 `scripts/update-docs-index.mjs` 顶部的 `EXTERNAL_DOCS` 数组（`title`、`url`、`tag`、`addedAt` 四个字段），脚本才会收录它。

2. **运行脚本**：

   ```bash
   pnpm docs:update-index
   ```

   脚本会完整重写 `docs/timeline.md`（按 Git 首次提交时间倒序），并更新 `docs/index.md` 的头部信息和 `<!-- BEGIN_AUTO_HTML -->` 标记之间的 standalone HTML 列表。

3. **手工归类 `docs/index.md`（不可省略）**：脚本**不会**往 `##` 栏目（如 `## 工具操作指南`、`## AI 工具生态`）里添加新条目，无论它输出什么都一样。脚本跑完后必须：
   - 打开 `docs/index.md`，确认每篇新文档都出现在至少一个栏目下；
   - 缺失就补一条链接到合适的栏目；没有合适栏目就新建一个 `##` 小节；
   - 不要因为脚本打印了 `✅ All done.` 就跳过这一步。

4. **检查 `docs/timeline.md`** 的时间排序是否合理（未提交到 Git 的新文件会回退到文件系统时间戳）。

5. **验证构建**：`pnpm docs:build`。Markdown 可先用 Vale 检查：

   ```bash
   vale --config="docs/.vale.ini" --output=JSON "docs/**/*.md"
   ```

## 链接规范

- Markdown 页面用 clean VitePress 链接，如 `/tmux/`。
- standalone HTML 页面用 clean 目录链接，如 `/agent-design-patterns/`；在 `docs/index.md` 中不要暴露 `index.html`，条目格式为 `- [标题](路径/) \`HTML\`{target="_self"}`。
- Markdown 源文件内部可以用相对链接。

## 自动化边界

- 推送到 `main` 且 `docs/**` 有变更时，GitHub Actions（`.github/workflows/deploy-docs.yml`）会自动运行 `pnpm docs:update-index` 并把机械刷新部分（时间线、HTML 列表）提交回仓库，然后构建部署。
- CI 只能做机械刷新；`docs/index.md` 的 `##` 栏目归类是语义工作，必须在提交推送之前由你（或本 skill）完成，CI 不会代劳。

## 常用命令

```bash
pnpm docs:dev          # 本地预览文档站
pnpm docs:build        # 构建文档站
pnpm docs:preview      # 预览构建产物
pnpm docs:update-index # 刷新 docs/index.md 与 docs/timeline.md
pnpm deploy:prod       # 构建并部署到 Vercel 生产环境
```
