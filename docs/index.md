# 知识库索引

这里收录 AI Agent 工具链、写作方法、工程实践和月度追踪文档。建议从“从一个例子开始”的教程读起，再按需查阅完整参考和对比分析。 按时间浏览：[文档创建时间线](timeline.md)

## 工具操作指南

- [tmux：从一个例子开始](tmux/index.md) — 用会话、窗口、面板搭建稳定的终端工作台。
- [Claude Code Hooks：从一个例子开始](claude-code-hooks/claude-code-hooks-use.md) — 从自动 lint 入门 hooks。
- [Claude Code Hooks 完整指南](claude-code-hooks/claude-code-hooks-guide.md) — 系统梳理事件、matcher、退出码和调试方法。
- [OpenCode 插件：从一个通知开始](opencode-plugins-tutorial/index.md) — 用最小插件理解 OpenCode 扩展机制。
- [Claude Code Plugin：从打包到分发](claude-plugin/claude-plugin.md) — 把 hooks、agents、skills 打包成可复用插件。
- [Claude Code 会话机制](claude-session/claude-code-session-mechanism.md) — 理解 session、上下文与工作流边界。
- [Claude Code 实战指南：给不爱看文档的你](claude-best-practices/claude-code-best-practices.md) — 面向日常使用的 Claude Code 最佳实践速查。
- [Claude Code 实战：Harness 工程之道教学扩展稿](claude-code-harness-engineering/) `HTML`{target="_self"} — 用交互式单页串联记忆、技能、子智能体、Hooks、MCP、CI/CD、SDK 和插件化落地。
- [Harness Engineering 深度教案 · 从提示词到工程化](harness-engineering-lesson-plan/) `HTML`{target="_self"} — 用交互式单页串讲从提示词到工程化的完整教学体系。

## Agent 架构与协作

- [Agent 设计模式互动教学稿](agent-design-patterns/) `HTML`{target="_self"} — 用交互式单页讲解感知、记忆、推理、行动、反思、协作六类 Agent 模式。
- [从 sub-agent 到 agent-team：三个台阶，三套心智模型](claude-sub-agent/sub-agent-and-agent-team.md) — 偏概念和心智模型。
- [Sub-agent 和 Agent-team：从一个例子开始](claude-sub-agent/sub-agent-and-agent-team-guide.md) — 偏操作和落地模板。
- [Hermes Agent 课程](hermes-agent-course/index.md) — 面向课程/培训场景的系统化讲义。

## 对比与选型

- [OpenCode vs Claude Code](opencode-vs-claudecode/index.md) — 终端 AI 编程助手的功能、生态和体验对比。
- [scan-reviewer 与开源社区同类方案的对比](scan-reviewer/comparison.md) — 对比 repo map、RAG、代码图谱等上下文方案。
- [Scanning Strategy](scan-reviewer/scanning-strategy.md) — scan-reviewer 的可复用代码扫描策略。

## AI 工具生态

- [CodeGraph：给 AI 编程助手的本地代码知识图谱](codegraph/index.md) — 用本地知识图谱和 MCP 帮助 Agent 理解代码库、追踪调用链和分析影响范围。
- [前端工程师的 AI 工具兵器谱：Skills、MCP、Agent、Plugin 全解析](ai-toolkit-for-frontend/index.md) — 面向 Claude Code/OpenCode 的深度工具指南，含完整配置示例。
- [前端 AI 工具速查手册](ai-toolkit-for-frontend/cheatsheet.md) — 四层模型速查、MCP 安装命令表、场景工具映射、最小可用配置。

## 前端框架学习

- [React 框架系统学习：架构、运行机制、核心数据结构与面试资料](react-deep-dive/) `HTML`{target="_self"} — 系统梳理 React 架构、运行机制、核心数据结构和面试要点。
- [Vue 框架深度解析 · 面试通关手册](vue-deep-dive/) `HTML`{target="_self"} — 面向 Vue 原理、响应式机制和面试复盘的深度学习资料。
- [Next.js 系统精讲 · 架构 · 运行 · 数据结构 · 数据流](nextjs-complete-guide/) `HTML`{target="_self"} — 从架构、运行时、数据结构和数据流理解 Next.js。
- [Nuxt 框架深度教学 · 架构 / 运行时 / 数据结构 / 数据流](nuxt-guide/) `HTML`{target="_self"} — 围绕 Nuxt 架构、运行时和数据流展开的系统讲义。

## 思考与趋势

- [AI 时代，我们不要想好再做，而是边做边想边改](ai-era-think-by-doing/index.md) — 关于提示词焦虑、AI 协作和迭代式思考的感悟。
- [AI 时代，什么才是稀缺能力](ai-era-scarce-abilities/index.md) — 关于判断力、提问能力和结构化能力的长文。
- [从 Human Interface 到 Agent Interface](from_human_interface_to_agent_interface/index.md) — 讨论 AI 时代软件行业从人机界面到代理界面的范式转移。
- [DeepSeek 演进](deepseek-evolution/index.md) — DeepSeek 相关演进观察。

## 月度追踪

- [Top 20 Agent Skills — 2026 年 4 月](skills-monthly/2026-04_top20.md)
- [GitHub AI Trending Top 12（2026-05-19 至 2026-05-25）](github-ai-trending/2026-05-19_to_2026-05-25.md)
- [GitHub AI Trending Top 10（2026-05-12 至 2026-05-18）](github-ai-trending/2026-05-12_to_2026-05-18.md)
- [GitHub AI Trending Top 10（2026-05-05 至 2026-05-11）](github-ai-trending/2026-05-05_to_2026-05-11.md)
- [GitHub AI Trending Top 10（2026-04-28 至 2026-05-04）](github-ai-trending/2026-04-28_to_2026-05-04.md)
- [Top 20 AI 开源项目 — 2026 年 4 月](ai-monthly/2026-04_top20.md)

## 独立 HTML 页面（自动生成）

> 以下列表由 `scripts/update-docs-index.mjs` 自动维护，按创建时间排序。

<!-- BEGIN_AUTO_HTML -->
- [Next.js 系统精讲 · 架构 · 运行 · 数据结构 · 数据流](nextjs-complete-guide/) `HTML`{target="_self"}
- [Nuxt 框架深度教学 · 架构 / 运行时 / 数据结构 / 数据流](nuxt-guide/) `HTML`{target="_self"}
- [React 框架系统学习：架构、运行机制、核心数据结构与面试资料](react-deep-dive/) `HTML`{target="_self"}
- [Vue 框架深度解析 · 面试通关手册](vue-deep-dive/) `HTML`{target="_self"}
- [蒸馏人技术 · 教案 LP-2026-04](蒸馏人技术教案/) `HTML`{target="_self"}
- [Harness Engineering 深度教案 · 从提示词到工程化](harness-engineering-lesson-plan/) `HTML`{target="_self"}
- [Agent 设计模式教学文案](agent-design-patterns/) `HTML`{target="_self"}
- [Claude Code 实战：Harness 工程之道｜教学扩展稿](claude-code-harness-engineering/) `HTML`{target="_self"}
<!-- END_AUTO_HTML -->
