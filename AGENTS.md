# Second Brain — Agent Guide

This is a **content repository** centered on a VitePress docs site (`docs/`) for browsing the knowledge base locally or on Vercel. Cross-platform agent skills (Kimi Code, Codex) live directly in `.agents/skills/` — both tools scan that directory, so no packaging step is needed for them. The legacy OpenCode/Claude Code packaging pipeline (`manifest.yaml` + `scripts/sync-plugins.sh`) is retained but currently has no registered entries. There is no application runtime or test suite; the only CI/CD is the docs deployment workflow at `.github/workflows/deploy-docs.yml`, which also auto-refreshes the docs index. Markdown docs can be checked with Vale using the local config under `docs/`; standalone HTML teaching pages may also live under `docs/`.

## Directory layout

```
.agents/skills/<name>/SKILL.md — cross-platform skills (Kimi Code + Codex scan this dir)
commands/<name>.md       — command sources for the packaging pipeline (currently empty)
templates/               — reference templates for packaged skills/commands
scripts/sync-plugins.sh  — legacy plugin build/install tool (OpenCode/Claude Code)
scripts/update-docs-index.mjs — refresh docs/index.md and docs/timeline.md; external links are registered in its EXTERNAL_DOCS array
dist/                    — generated output (git-ignored: .gitignore)
manifest.yaml            — packaging registry (currently no entries)
docs/                    — general knowledge docs (Markdown and standalone HTML)
docs/.vitepress/         — VitePress config/theme and generated site output
.github/workflows/deploy-docs.yml — refresh docs index, then deploy docs to Vercel on relevant `main` branch pushes
.opencode/skills/        — local OpenCode helper skills for this repo; not packaged via manifest.yaml
package.json             — plugin/docs-site scripts and docs-site dependencies
vercel.json              — Vercel deployment config for the docs site
```

## Key commands

```bash
./scripts/sync-plugins.sh build                        # generate dist/ from manifest + sources
./scripts/sync-plugins.sh install [opencode|claudecode] # symlink dist/ to platform config dirs
./scripts/sync-plugins.sh uninstall [opencode|claudecode] # remove symlinks from config dirs
./scripts/sync-plugins.sh update [opencode|claudecode]  # uninstall && clean && build && install
./scripts/sync-plugins.sh all                          # build && install (both platforms)
./scripts/sync-plugins.sh clean                        # rm -rf dist/*
pnpm plugins:build                                     # package-script alias for sync-plugins build
pnpm plugins:install                                   # package-script alias for sync-plugins install
pnpm plugins:uninstall                                 # package-script alias for sync-plugins uninstall
pnpm plugins:update                                    # package-script alias for sync-plugins update
pnpm plugins:all                                       # package-script alias for sync-plugins all
pnpm plugins:clean                                     # package-script alias for sync-plugins clean
pnpm docs:dev                                          # run the local VitePress docs site
pnpm docs:build                                        # build the VitePress docs site
pnpm docs:preview                                      # preview the built VitePress docs site
pnpm docs:update-index                                 # refresh docs/index.md and docs/timeline.md
pnpm deploy                                            # deploy the docs site with Vercel
pnpm deploy:preview                                    # build docs site, then deploy with Vercel
pnpm deploy:prod                                       # build docs site, then deploy to Vercel production
vale --config="docs/.vale.ini" --output=JSON "docs/**/*.md" # lint docs Markdown
```

Without a platform argument, install/uninstall/update defaults to both platforms.

## Plugin packaging pipeline (OpenCode / Claude Code)

`manifest.yaml` + `scripts/sync-plugins.sh` transform Markdown sources into platform-specific output under `dist/`. All registries are currently empty — the former `skills/` and `sub-agent/` directories were removed; cross-platform skills live in `.agents/skills/` instead. To package something again:

1. Create the source (e.g. `commands/<name>.md`, copied from `templates/`), register it in `manifest.yaml` with target `platforms: [opencode, claudecode]` (either or both), then run `./scripts/sync-plugins.sh all`.
2. **Output differences** — skills: the OpenCode transform adds `compatibility: opencode` and moves `version` into a `metadata.version` block; Claude Code copies as-is. Commands: OpenCode copies as-is; Claude Code strips frontmatter. Install paths: `~/.config/opencode/{skills,commands}/` and `~/.claude/{skills,commands}/`.

## Workflow for updating the docs site

1. Add or edit Markdown/HTML content under `docs/`. The VitePress sidebar is auto-generated from `docs/index.md` `##` sections — add a link for the new page under the relevant heading; no need to manually edit `config.ts`. External links are not files: register them in the `EXTERNAL_DOCS` array in `scripts/update-docs-index.mjs`.
2. Run `pnpm docs:update-index` to refresh `docs/timeline.md` and the auto-generated standalone HTML pages section in `docs/index.md`. The `##` category sections in `docs/index.md` are hand-maintained — the script never adds entries there; curate them manually before committing.
3. Run `pnpm docs:dev` for local preview, or `pnpm docs:build` to validate the VitePress build.
4. Pushes to `main` that touch `docs/**`, Vercel config, or docs dependencies deploy production through `.github/workflows/deploy-docs.yml`. The workflow runs `pnpm docs:update-index` first and commits any mechanical refresh (timeline, HTML list) back to the branch before deploying. It requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, and `VERCEL_PROJECT_ID` GitHub Secrets. For manual deployment, run `pnpm deploy:preview`, `pnpm deploy`, or `pnpm deploy:prod`.
5. Do not commit generated `docs/.vitepress/dist/` or cache output.

## Skill file format

Skills in `.agents/skills/<name>/SKILL.md` follow the cross-tool Agent Skills convention — YAML frontmatter with `name` and `description` (Kimi Code additionally supports `whenToUse`; both scan `.agents/skills/` at project level):

```yaml
---
name: skill-name
description: one-line summary
whenToUse: when this skill should trigger
---
```

Sources for the legacy packaging pipeline additionally require a `version` field (see `templates/skill-template.md`).

## Known limitations

- **No auto-discovery in the packaging pipeline** — every skill/agent/command must be explicitly listed in `manifest.yaml`.
- **Regex-based YAML parsing** — the bash script parses `manifest.yaml` with regex only. Nested structures, string quoting beyond basic `"` / `'` stripping, or unusual YAML formatting may break parsing.
- **No automated tests** — validate packaging manually by running build and inspecting `dist/` output. Docs Markdown has a local Vale check, and the docs site can be validated with `pnpm docs:build`.

## Post-generation documentation review

After every conversation where files have been generated or modified, invoke the `docs-maintainer` sub-agent using the Task tool. This sub-agent will:

1. Inspect the changes via `git diff` and `git status`
2. Check whether `manifest.yaml` needs updating to register any new skills, sub-agents, or commands
3. Check whether `AGENTS.md` needs updating for new workflows, commands, or structural changes
4. Check whether `README.md` needs updating for directory structure or quick-start changes
5. Report findings and apply necessary edits

## Repository context

This directory lives inside a larger local git monorepo at `/Users/chenmeili/Documents/GitHub/`. The git root is **not** `second-brain/` — it is the parent directory. Sibling projects (e.g., `scan-reviewer/`, `hermes-agent/`, `cua/`) are independent projects under the same repo. Do not assume `second-brain/` is a standalone git repository.
