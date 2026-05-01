# Comparison with Similar Projects

## OpenAgentsControl (OAC) — 3.8k stars

**Approach**: User manually defines coding patterns via `/add-context` wizard. Agents load these patterns before generating code. Has a `CodeReviewer` sub-agent and structured workflow.

**Overlap**: Both aim to make AI-generated code match project patterns. Both use sub-agents for review.

**Difference**: OAC relies on **user-provided context** (manual entry). scan-reviewer **automatically discovers** reusable components by scanning the codebase. OAC is a full development workflow framework; scan-reviewer is a focused post-generate review tool.

**Complementary**: Could work together — OAC provides the coding style context, scan-reviewer provides the reusable component catalog.

---

## Agentic — 501 stars

**Approach**: Structured six-phase workflow (Research → Plan → Execute → Commit → Review). Uses "thoughts" directory for knowledge persistence. Task decomposition and context compression.

**Overlap**: Both have a review phase. Both use sub-agents for specialized tasks.

**Difference**: Agentic is a full workflow replacement — it wants to manage the entire development process. scan-reviewer is a single-purpose tool that plugs into any workflow. Agentic's review is manual/general; scan-reviewer's review is specifically about reusability against a pre-built catalog.

---

## KDCO Workspace — 392 stars

**Approach**: Bundled multi-agent orchestration (researcher, coder, scribe, reviewer). Has `/review` command and code-review skill. Permission boundaries between agents.

**Overlap**: Both use a reviewer sub-agent. Both define review criteria in skills.

**Difference**: KDCO reviewer does general code review (quality, style, security). scan-reviewer reviewer specifically checks for **reusability duplication** against a scanned index. KDCO has no automatic component catalog generation.

---

## Anthropic SWE Agent (Claude Code)

**Approach**: Multi-phase pipeline: Explore (search codebase) → Plan → Implement → Verify. The agent searches the codebase extensively before generating code.

**Overlap**: Both emphasize "search/understand the codebase before/after writing code." Both use sub-agents for focused tasks.

**Difference**: Anthropic's approach is **reactive** — the agent searches on-demand each time. scan-reviewer is **proactive** — it pre-builds a catalog that persists across sessions. The catalog is a form of "compiled knowledge" about the codebase that reduces repetitive search work.

**Key insight**: Anthropic's agents "re-learn" the codebase on every session. scan-reviewer's catalog is like a cache — it trades a one-time scan cost for faster, more reliable future reviews.

---

## Summary Table

| Feature | OAC | Agentic | KDCO WS | SWE Agent | scan-reviewer |
|---------|-----|---------|---------|-----------|---------------|
| Auto-discovers reusable components | No | No | No | On-demand only | **Yes, proactive** |
| Persistent catalog | No (context files) | No | No | No | **Yes (catalog.md)** |
| Post-generate review | Yes (general) | Yes (general) | Yes (general) | Yes (verify) | **Yes (reusability-focused)** |
| Sub-agent based | Yes | Yes | Yes | Yes | **Yes** |
| Skill-defined criteria | Yes | No | Yes | No | **Yes** |
| Dual-platform (OC + CC) | Yes (partial) | No | No | No | **Yes** |
| Auto-trigger on session.idle | No | No | No | No | **Yes** |
| Full workflow framework | Yes | Yes | Yes | No | **No (single-purpose)** |

## Unique Value Proposition

scan-reviewer occupies a distinct niche: **automated, proactive reusable component discovery with persistent cataloging**. No existing project does exactly this:

1. OAC/Agentic/KDCO are workflow frameworks with manual or general review.
2. SWE agent does search-as-context but doesn't persist findings.
3. No project automatically scans the codebase to build a reusable component index.

The catalog (`catalog.md`) is the key innovation — it converts the codebase's "reusable surface area" into a compact, agent-friendly format that survives across sessions.
