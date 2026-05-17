---
name: docs-site-maintainer
description: Use when maintaining the local docs website, docs/index.md, docs/timeline.md, VitePress config, or docs preview images in this project.
---

# Docs Site Maintainer

Use this skill when the user asks to maintain this repository's `docs/` knowledge-base website, especially when adding, renaming, or reorganizing documents.

## Project rules

- The local documentation website is powered by VitePress from `docs/`.
- Markdown documents are rendered by VitePress.
- Standalone HTML pages stay in their original source paths under `docs/<name>/index.html` and are served as clean URLs like `/<name>/`.
- The homepage is `docs/index.md`.
- The creation timeline is `docs/timeline.md`.
- Only `preview.png` is treated as the document preview image; ignore `preview2.png`, `cover.png`, or other names.
- There is no draft concept. Do not hide files only because their filename contains `draft`.
- Build output under `docs/.vitepress/dist/` and cache under `docs/.vitepress/cache/` are ignored and should not be committed.

## Common commands

```bash
pnpm docs:dev          # run the local docs website
pnpm docs:build        # build the docs website
pnpm docs:preview      # preview the built docs website
pnpm docs:update-index # update docs/index.md and docs/timeline.md
```

## Updating index and timeline

When documents are added, renamed, moved, or retitled:

1. Run `pnpm docs:update-index`.

2. **Verify and manually curate `docs/index.md`** — this step is **not optional**.
   The script updates `docs/timeline.md` fully, but for `docs/index.md` it only touches metadata
   (header/footer). **The category sections under `##` headings are hand-maintained.** The script
   will never add new entries to those sections, regardless of what the output says.

   After the script runs, do this exact check:
   - Open `docs/index.md` and visually confirm every newly added document appears under at least
     one category section (e.g. `## 工具操作指南`, `## AI 工具生态`).
   - If a new document is missing, add a bullet link in the right category. If no existing category
     fits, create a new `##` section.
   - **Do not skip this check because the script printed "Done."**

3. Review `docs/timeline.md` to ensure creation-time ordering is reasonable.

4. Run `pnpm docs:build` before finishing.

**Common failure pattern:** The script says `✅ All done.` so you assume `index.md` is fully
updated. It is not — only `timeline.md` is automatically complete. The category index is your
responsibility. Missing this check means new documents are invisible from the docs homepage.

`docs/timeline.md` is sorted by Git first-added time, newest first. If Git does not know a file yet, the update script falls back to filesystem timestamps.

## Links

- Prefer clean VitePress links for Markdown pages: `/tmux/`, `/claude-code-hooks/claude-code-hooks-use`.
- Prefer clean links for standalone HTML pages: `/agent-design-patterns/`, `/claude-code-harness-engineering/`.
- In Markdown source files, relative links are acceptable, but avoid exposing `index.html` when linking to standalone HTML pages from `docs/index.md`.

## OpenCode note

This is a project-level OpenCode skill at `.opencode/skills/docs-site-maintainer/SKILL.md`. After editing project skills, quit and restart OpenCode so the new skill definition is loaded.
