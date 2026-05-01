# Second Brain — Agent Guide

This is a **content repository** for authoring and packaging AI agent skills/skills and sub-agents. There is no code, no package manager, no test suite, no CI. The "build" is a bash script that transforms Markdown files into platform-specific output.

## Directory layout

```
skills/<name>/skill.md   — skill source (YAML frontmatter + Markdown body)
sub-agent/<name>.md      — sub-agent source (pure Markdown)
commands/<name>.md       — command source (YAML frontmatter + Markdown body)
templates/skill-template.md  — reference template for new skills
scripts/sync-plugins.sh  — the only build/install tool
dist/                    — generated output (git-ignored: .gitignore)
manifest.yaml            — registry: declares which skills/agents/commands target which platforms
docs/                    — general knowledge docs (Markdown)
```

## Key commands

```bash
./scripts/sync-plugins.sh build     # generate dist/ from manifest + sources
./scripts/sync-plugins.sh install   # symlink dist/ → ~/.config/opencode/skills/ and ~/.claude/
./scripts/sync-plugins.sh all       # build && install
./scripts/sync-plugins.sh clean     # rm -rf dist/*
```

## Workflow for adding a skill

1. Create `skills/<name>/skill.md` — copy from `templates/skill-template.md`
2. Register it in `manifest.yaml`:
   ```yaml
   skills:
     - name: <name>
       platforms: [opencode, claudecode]  # either, or both
   ```
3. Run `./scripts/sync-plugins.sh all`

## Workflow for adding a sub-agent

1. Create `sub-agent/<name>.md`
2. Register in `manifest.yaml` under `sub_agents`:
   ```yaml
   sub_agents:
     - name: <name>
       platforms: [opencode, claudecode]
   ```

## Workflow for adding a command

1. Create `commands/<name>.md` — copy from `templates/command-template.md`
2. Register it in `manifest.yaml`:
   ```yaml
   commands:
     - name: <name>
       platforms: [opencode, claudecode]  # either, or both
   ```
3. Run `./scripts/sync-plugins.sh all`

**Platform output differences for commands**:
- **OpenCode**: copied as-is (YAML frontmatter is meaningful to OpenCode)
- **Claude Code**: frontmatter stripped; output is pure Markdown (Claude Code commands have no frontmatter)

## Skill file format

Every skill source must have YAML frontmatter with `name`, `description`, and `version`:

```yaml
---
name: skill-name
description: one-line summary
version: 1.0.0
---
```

## Platform output differences

| Aspect | OpenCode | Claude Code |
|--------|----------|-------------|
| Output file | `SKILL.md` | `SKILL.md` |
| Transform | Yes (see below) | No (direct copy) |
| Install path | `~/.config/opencode/skills/<name>/` | `~/.claude/skills/<name>/` |

**OpenCode transform**: the build script adds `compatibility: opencode` to frontmatter and moves `version` into a `metadata.version` block. Original `compatibility:` and `version:` lines are stripped from the frontmatter.

**Command output differences**:
| Aspect | OpenCode | Claude Code |
|--------|----------|-------------|
| Output file | `<name>.md` | `<name>.md` |
| Transform | No (copied as-is) | Yes (strips frontmatter) |
| Install path | `~/.config/opencode/commands/` | `~/.claude/commands/` |

## Known limitations

- **No auto-discovery** — every skill/agent must be explicitly listed in `manifest.yaml`.
- **Regex-based YAML parsing** — the bash script parses `manifest.yaml` with regex only. Nested structures, string quoting beyond basic `"` / `'` stripping, or unusual YAML formatting may break parsing.
- **No tests, no lint, no CI** — validate changes manually by running build and inspecting `dist/` output.

## Repository context

This directory lives inside a larger local git monorepo at `/Users/chenmeili/Documents/GitHub/`. The git root is **not** `second-brain/` — it is the parent directory. Sibling projects (e.g., `scan-reviewer/`, `hermes-agent/`, `cua/`) are independent projects under the same repo. Do not assume `second-brain/` is a standalone git repository.
