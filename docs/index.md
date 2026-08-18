# 知识库索引

这里收录 AI Agent 工具链、写作方法、工程实践和月度追踪文档。建议从“从一个例子开始”的教程读起，再按需查阅完整参考和对比分析。 按时间浏览：[文档创建时间线](timeline.md)

## 工具操作指南

- [Warp：当 Rust、GPU 与 AI Agent 重塑开发者终端](warp-tech-blog/) `HTML`{target="_self"} — 拆解 Warp 终端的 Rust/GPU 架构、AI Agent 能力和团队协作工作流。
- [Qoder CLI 完全指南：从零开始的 AI 编程助手之旅](qoder-cli-overview/) `HTML`{target="_self"} — 介绍 Qoder CLI 的安装、TUI、权限系统和 AI 编程助手使用流程。
- [从 Cursor 到 Qoder：AI 编程界面的四次范式迁移](ide-evolution/) `HTML`{target="_self"} — 梳理 AI 编程界面从补全、聊天、Agent 到工程化 IDE 的演进路径。
- [LM Studio 开发者文档 · 教案](lmstudio-teaching/) `HTML`{target="_self"} — 面向开发者系统讲解本地模型加载、API 调用、结构化输出和工具调用等 LM Studio 工作流。
- [2026 终端工具选型：Ghostty、cmux、tmux、Zellij、Warp 怎么选](terminal-tools-2026/index.md) — 按终端模拟器、复用器、AI agent 工作台和进程管理四层梳理终端工具组合。
- [tmux：从一个例子开始](tmux/index.md) — 用会话、窗口、面板搭建稳定的终端工作台。
- [Claude Code Hooks：从一个例子开始](claude-code-hooks/claude-code-hooks-use.md) — 从自动 lint 入门 hooks。
- [Claude Code Hooks 完整指南](claude-code-hooks/claude-code-hooks-guide.md) — 系统梳理事件、matcher、退出码和调试方法。
- [Claude Code 的 `.claude/workflows`：把复杂 AI 任务写成可复用流程](claude-code-workflows/index.md) — 理解项目级 workflows 目录、动态工作流机制和开源实践案例。
- [OpenCode 插件：从一个通知开始](opencode-plugins-tutorial/index.md) — 用最小插件理解 OpenCode 扩展机制。
- [Claude Code Plugin：从打包到分发](claude-plugin/claude-plugin.md) — 把 hooks、agents、skills 打包成可复用插件。
- [Claude Code 会话机制](claude-session/claude-code-session-mechanism.md) — 理解 session、上下文与工作流边界。
- [Claude Code 实战指南：给不爱看文档的你](claude-best-practices/claude-code-best-practices.md) — 面向日常使用的 Claude Code 最佳实践速查。
- [Claude Code 实战：Harness 工程之道教学扩展稿](claude-code-harness-engineering/) `HTML`{target="_self"} — 用交互式单页串联记忆、技能、子智能体、Hooks、MCP、CI/CD、SDK 和插件化落地。
- [Harness Engineering 深度教案 · 从提示词到工程化](harness-engineering-lesson-plan/) `HTML`{target="_self"} — 用交互式单页串讲从提示词到工程化的完整教学体系。

## Agent 架构与协作

- [AI Agent 框架如何演进：从工具调用到应用运行时](agent-framework-evolution-blog/) `HTML`{target="_self"} — 面向普通技术读者梳理 Agent 框架从工具调用、RAG、多智能体到持久运行时和协议化的演进主线。
- [OpenHands 深度解析：开源 AI 软件工程师的崛起](openhands-tech-blog/) `HTML`{target="_self"} — 从架构、工具生态和工作流角度解析 OpenHands 这类开源 AI 软件工程师。
- [OpenHands 完全教程 · AI 软件开发智能体](openhands-tutorial/) `HTML`{target="_self"} — 从安装、配置、运行和实践场景系统讲解 OpenHands 的使用方式。
- [Agent 知识库全景图 · 2026](agent-memory-landscape/) `HTML`{target="_self"} — 从记忆类型、知识库形态和工程落地维度梳理 Agent 长期记忆生态。
- [动态工作流：当一个 Agent 学会指挥一支舰队](dynamic-workflows/) `HTML`{target="_self"} — 讨论单 Agent 如何动态规划、委派、回收上下文，并协同一组专门化子 Agent 完成复杂任务。
- [从 Prompt 工程到 Agent Loop：Agent 工程范式的六层演进](agent-loop-engineering/) `HTML`{target="_self"} — 梳理 Prompt、上下文、MCP、Skills、Harness 与 Agent Loop 的递进关系。
- [验收驱动开发，在 Harness + Loop Engineering 时代为什么更重要](acceptance-harness-loop-blog/) `HTML`{target="_self"} — 解释如何用验收标准、Harness 和 Loop 把 Agent 交付从生成结果收敛为可验证流程。
- [Claude Code Agent Loops 与 SKILL.md 自检工程指南](claude-code-agent-loops-skill-doc/) `HTML`{target="_self"} — 图解四种智能体循环，并给出可复制的 SKILL.md 端到端自检模板。
- [Flue 技术解读：把大模型装进 Agent Harness](flue-agent-harness/) `HTML`{target="_self"} — 从使用方式、工具、沙箱和持久化执行角度解读 Flue 的 Agent Harness 架构。
- [Deep Agents 实战 — 从零构建生产级 AI Agent 的完整指南](https://datawhalechina.github.io/deepagents-in-action/) `外链` — Datawhale 的 Deep Agents 实战教程，讲解生产级 AI Agent 的构建方法。
- [Claude Code 的 `.claude/workflows`：把复杂 AI 任务写成可复用流程](claude-code-workflows/index.md) — 从 Claude Code 项目目录视角理解 workflow 如何编排多个 agent。
- [Superpowers v6.0.3 架构与流程编排图解](superpowers-architecture-flow/) `HTML`{target="_self"} — 解析 Superpowers 的技能注入、会话启动、流程编排和质量门设计。
- [AutoResearch 启示录：把长任务 Agent 写成可运行协议](autoresearch-agent-protocol/) `HTML`{target="_self"} — 从 AutoResearch 框架提炼长任务 Agent 的状态落盘、反停滞、验证闭环与 Skill 协议化方法。
- [Agent 设计模式互动教学稿](agent-design-patterns/) `HTML`{target="_self"} — 用交互式单页讲解感知、记忆、推理、行动、反思、协作六类 Agent 模式。
- [从 sub-agent 到 agent-team：三个台阶，三套心智模型](claude-sub-agent/sub-agent-and-agent-team.md) — 偏概念和心智模型。
- [Sub-agent 和 Agent-team：从一个例子开始](claude-sub-agent/sub-agent-and-agent-team-guide.md) — 偏操作和落地模板。
- [Hermes Agent 课程](hermes-agent-course/index.md) — 面向课程/培训场景的系统化讲义。

## 对比与选型

- [Phaser、PixiJS 与 Cocos Creator：休闲小游戏技术选型指南](game-stack-blog/) `HTML`{target="_self"} — 对比三种休闲小游戏技术栈的定位、替代关系、选型流程和落地架构。
- [2026 前端 UI 方案对决：Radix Themes + Mantine vs shadcn/ui + Tailwind CSS](ui-framework-comparison/) `HTML`{target="_self"} — 对比两类前端 UI 技术栈的设计哲学、工程成本和适用场景。
- [2026 终端工具选型：Ghostty、cmux、tmux、Zellij、Warp 怎么选](terminal-tools-2026/index.md) — 对比 Ghostty、cmux、tmux、Zellij、Warp、WezTerm、Kitty、Solo 等工具的定位和适用场景。
- [OpenCode vs Claude Code](opencode-vs-claudecode/index.md) — 终端 AI 编程助手的功能、生态和体验对比。
- [scan-reviewer 与开源社区同类方案的对比](scan-reviewer/comparison.md) — 对比 repo map、RAG、代码图谱等上下文方案。
- [Scanning Strategy](scan-reviewer/scanning-strategy.md) — scan-reviewer 的可复用代码扫描策略。

## AI 工具生态

- [模型的一生｜训练与推理交互实验室](https://coconilu.github.io/model-lifecycle-lab/) `可交互网站` — 通过交互实验串联数据、预训练、后训练、评估、量化、部署、Prefill、Decode 与反馈全流程。
- [Page Agent 技术解读：把浏览器自动化放进页面内部](page-agent-technical-blog/) `HTML`{target="_self"} — 拆解 Alibaba Page Agent 的页面内 DOM Agent 架构、差异化价值和产品落地方式。
- [Weave Router、CC Switch、LiteLLM、OpenRouter：本地 AI 编程 CLI 路由怎么选](weave-router-cli-routing-blog/) `HTML`{target="_self"} — 比较本地 AI 编程 CLI 路由、控制平面、通用网关和模型市场的定位与选型路径。
- [LiteLLM 官方文档工程导览](litellm-docs-guide/) `HTML`{target="_self"} — 梳理 LiteLLM SDK、AI Gateway、Providers、治理能力、Agents/MCP 与运维路径。
- [我们真的需要自己搭一个 OpenRouter 吗？](openrouter-local-build-blog/) `HTML`{target="_self"} — 讨论自建 LLM 网关与复刻 OpenRouter 的取舍、替代方案和渐进落地路线。
- [ComfyUI 官方文档导读：从第一张图到自动化工作流](comfyui-docs-blog/) `HTML`{target="_self"} — 基于 ComfyUI 官方文档梳理入门生成、界面、工作流模板、API、Cloud 与 Custom Nodes。
- [HyperFrames 是什么？HTML 生成视频框架科普](hyperframes-explainer/) `HTML`{target="_self"} — 介绍用 HTML/CSS/JS 定义视频、Chrome 逐帧渲染、FFmpeg 输出文件的开源视频生成框架。
- [Claude Cowork:把 Claude Code 的 Agent 能力搬进桌面](claude-cowork-blog/) `HTML`{target="_self"} — 介绍 Claude Cowork 如何把 Claude Code 的 Agent 协作能力迁移到桌面工作流。
- [读懂大模型榜单：一张能力地图的使用说明](llm-leaderboard-guide/) `HTML`{target="_self"} — 从评测维度和能力地图角度解读大模型榜单的正确使用方式。
- [大模型术语图鉴](llm-glossary/) `HTML`{target="_self"} — 以可检索图鉴形式解释大模型基础术语、训练推理概念和工程实践关键词。
- [CodeGraph：给 AI 编程助手的本地代码知识图谱](codegraph/index.md) — 用本地知识图谱和 MCP 帮助 Agent 理解代码库、追踪调用链和分析影响范围。
- [前端工程师的 AI 工具兵器谱：Skills、MCP、Agent、Plugin 全解析](ai-toolkit-for-frontend/index.md) — 面向 Claude Code/OpenCode 的深度工具指南，含完整配置示例。
- [前端 AI 工具速查手册](ai-toolkit-for-frontend/cheatsheet.md) — 四层模型速查、MCP 安装命令表、场景工具映射、最小可用配置。

## 前端框架学习

- [React 框架系统学习：架构、运行机制、核心数据结构与面试资料](react-deep-dive/) `HTML`{target="_self"} — 系统梳理 React 架构、运行机制、核心数据结构和面试要点。
- [Vue 框架深度解析 · 面试通关手册](vue-deep-dive/) `HTML`{target="_self"} — 面向 Vue 原理、响应式机制和面试复盘的深度学习资料。
- [Next.js 系统精讲 · 架构 · 运行 · 数据结构 · 数据流](nextjs-complete-guide/) `HTML`{target="_self"} — 从架构、运行时、数据结构和数据流理解 Next.js。
- [Nuxt.js 深度解析 — 从架构到数据流](nuxt-deep-dive/) `HTML`{target="_self"} — 系统拆解 Nuxt.js 的架构、渲染模式、路由、数据获取和运行机制。
- [Nuxt.js 面试速查卡片](nuxt-interview-cards/) `HTML`{target="_self"} — 用可翻转卡片快速复盘 Nuxt 架构、SSR、数据流、性能和实践问题。
- [Nuxt 4 相对于 Nuxt 3 的提升](nuxt4-vs-nuxt3/) `HTML`{target="_self"} — 对比 Nuxt 4 与 Nuxt 3 在目录结构、数据层和工程体验上的变化。
- [Nuxt 框架深度教学 · 架构 / 运行时 / 数据结构 / 数据流](nuxt-guide/) `HTML`{target="_self"} — 围绕 Nuxt 架构、运行时和数据流展开的系统讲义。

## 前端工程实践

- [前端团队接入 Visual Regression Review：从一个最小流程开始](visual-regression-review/visual-regression-review-guide.md) — 用 Playwright 截图、像素对比和 PR 评论搭建最小可落地的视觉回归审查流程。

## 思考与趋势

- [当 Agent 开始生产网站：从分类法到设计决策链](agent-web-design-chain/index.md) — 从网站分类法和 UI 风格/设计系统之分，拆解 Agent 建站的四步决策链。
- [当 Agent 开始生产网站：从分类法到设计决策链（交互版）](agent-web-design-chain-demo/) `HTML`{target="_self"} — 上文的可交互版本，含同骨架换肤演示、风格时间轴和决策链模拟器。
- [SIA：当 Agent 开始改写自己 —— 一篇关于自改进循环的实践笔记](self-improving-ai/) `HTML`{target="_self"} — 讨论自改进 AI 的闭环、实践路径和工程含义。
- [用 Issue 驱动开发：当瓶颈从 Agent 转向人](issue-driven-development/index.md) — 从 Symphony 看 issue tracker 如何成为 agent 协作的控制平面。
- [AI 工程师的核心竞争力：从抽卡到可验证交付](ai-engineer-methodology/) `HTML`{target="_self"} — 讨论 AI 工程师如何把不确定生成收敛成可运行、可评估、可维护的交付。
- [当代码不再由你来写：工程师角色的一次硬着陆](engineer-role-shift/index.md) — 讨论 Harness engineering 下工程师从写代码转向造环境的角色变化。
- [AI 时代，我们不要想好再做，而是边做边想边改](ai-era-think-by-doing/index.md) — 关于提示词焦虑、AI 协作和迭代式思考的感悟。
- [AI 时代，什么才是稀缺能力](ai-era-scarce-abilities/index.md) — 关于判断力、提问能力和结构化能力的长文。
- [从 Human Interface 到 Agent Interface](from_human_interface_to_agent_interface/index.md) — 讨论 AI 时代软件行业从人机界面到代理界面的范式转移。
- [DeepSeek 演进](deepseek-evolution/index.md) — DeepSeek 相关演进观察。

## 月度追踪

- [Top 20 Agent Skills — 2026 年 4 月](skills-monthly/2026-04_top20.md)
- [GitHub AI 编程开源项目聚合（2026-06-03 至 2026-06-09）](github-ai-trending/2026-06-03_to_2026-06-09.md)
- [GitHub AI Trending Top 10（2026-05-26 至 2026-06-01）](github-ai-trending/2026-05-26_to_2026-06-01.md)
- [GitHub AI Trending Top 12（2026-05-19 至 2026-05-25）](github-ai-trending/2026-05-19_to_2026-05-25.md)
- [GitHub AI Trending Top 10（2026-05-12 至 2026-05-18）](github-ai-trending/2026-05-12_to_2026-05-18.md)
- [GitHub AI Trending Top 10（2026-05-05 至 2026-05-11）](github-ai-trending/2026-05-05_to_2026-05-11.md)
- [GitHub AI Trending Top 10（2026-04-28 至 2026-05-04）](github-ai-trending/2026-04-28_to_2026-05-04.md)
- [Top 20 AI 开源项目 — 2026 年 4 月](ai-monthly/2026-04_top20.md)

## 独立 HTML 页面（自动生成）

> 以下列表由 `scripts/update-docs-index.mjs` 自动维护，按创建时间排序。

<!-- BEGIN_AUTO_HTML -->
- [当 Agent 开始生产网站：从分类法到设计决策链（交互版）](agent-web-design-chain-demo/) `HTML`{target="_self"}
- [AI Agent 框架如何演进：从工具调用到应用运行时](agent-framework-evolution-blog/) `HTML`{target="_self"}
- [Page Agent 技术解读：把浏览器自动化放进页面内部](page-agent-technical-blog/) `HTML`{target="_self"}
- [Claude Code Agent Loops 与 SKILL.md 自检工程指南](claude-code-agent-loops-skill-doc/) `HTML`{target="_self"}
- [Weave Router、CC Switch、LiteLLM、OpenRouter：本地 AI 编程 CLI 路由怎么选](weave-router-cli-routing-blog/) `HTML`{target="_self"}
- [验收驱动开发，在 Harness + Loop Engineering 时代为什么更重要](acceptance-harness-loop-blog/) `HTML`{target="_self"}
- [LiteLLM 官方文档工程导览](litellm-docs-guide/) `HTML`{target="_self"}
- [我们真的需要自己搭一个 OpenRouter 吗？](openrouter-local-build-blog/) `HTML`{target="_self"}
- [Phaser、PixiJS 与 Cocos Creator：休闲小游戏技术选型指南](game-stack-blog/) `HTML`{target="_self"}
- [ComfyUI 官方文档导读：从第一张图到自动化工作流](comfyui-docs-blog/) `HTML`{target="_self"}
- [HyperFrames 是什么？HTML 生成视频框架科普](hyperframes-explainer/) `HTML`{target="_self"}
- [Flue 技术解读：把大模型装进 Agent Harness](flue-agent-harness/) `HTML`{target="_self"}
- [从 Prompt 工程到 Agent Loop：Agent 工程范式的六层演进](agent-loop-engineering/) `HTML`{target="_self"}
- [AI 工程师的核心竞争力：从抽卡到可验证交付](ai-engineer-methodology/) `HTML`{target="_self"}
- [Superpowers v6.0.3 架构与流程编排图解](superpowers-architecture-flow/) `HTML`{target="_self"}
- [AutoResearch 启示录：把长任务 Agent 写成可运行协议](autoresearch-agent-protocol/) `HTML`{target="_self"}
- [从 Cursor 到 Qoder：AI 编程界面的四次范式迁移](ide-evolution/) `HTML`{target="_self"}
- [Nuxt 4 相对于 Nuxt 3 的提升](nuxt4-vs-nuxt3/) `HTML`{target="_self"}
- [OpenHands 完全教程 · AI 软件开发智能体](openhands-tutorial/) `HTML`{target="_self"}
- [OpenHands 深度解析：开源 AI 软件工程师的崛起](openhands-tech-blog/) `HTML`{target="_self"}
- [Warp：当 Rust、GPU 与 AI Agent 重塑开发者终端](warp-tech-blog/) `HTML`{target="_self"}
- [Claude Cowork:把 Claude Code 的 Agent 能力搬进桌面](claude-cowork-blog/) `HTML`{target="_self"}
- [读懂大模型榜单：一张能力地图的使用说明](llm-leaderboard-guide/) `HTML`{target="_self"}
- [Qoder CLI 完全指南：从零开始的 AI 编程助手之旅](qoder-cli-overview/) `HTML`{target="_self"}
- [Agent 知识库全景图 · 2026](agent-memory-landscape/) `HTML`{target="_self"}
- [Nuxt.js 深度解析 — 从架构到数据流](nuxt-deep-dive/) `HTML`{target="_self"}
- [Nuxt.js 面试速查卡片](nuxt-interview-cards/) `HTML`{target="_self"}
- [2026 前端 UI 方案对决：Radix Themes + Mantine vs shadcn/ui + Tailwind CSS](ui-framework-comparison/) `HTML`{target="_self"}
- [SIA：当 Agent 开始改写自己 —— 一篇关于自改进循环的实践笔记](self-improving-ai/) `HTML`{target="_self"}
- [动态工作流：当一个 Agent 学会指挥一支舰队](dynamic-workflows/) `HTML`{target="_self"}
- [大模型术语图鉴](llm-glossary/) `HTML`{target="_self"}
- [LM Studio 开发者文档 · 教案](lmstudio-teaching/) `HTML`{target="_self"}
- [Next.js 系统精讲 · 架构 · 运行 · 数据结构 · 数据流](nextjs-complete-guide/) `HTML`{target="_self"}
- [Nuxt 框架深度教学 · 架构 / 运行时 / 数据结构 / 数据流](nuxt-guide/) `HTML`{target="_self"}
- [React 框架系统学习：架构、运行机制、核心数据结构与面试资料](react-deep-dive/) `HTML`{target="_self"}
- [Vue 框架深度解析 · 面试通关手册](vue-deep-dive/) `HTML`{target="_self"}
- [蒸馏人技术 · 教案 LP-2026-04](蒸馏人技术教案/) `HTML`{target="_self"}
- [Harness Engineering 深度教案 · 从提示词到工程化](harness-engineering-lesson-plan/) `HTML`{target="_self"}
- [Agent 设计模式教学文案](agent-design-patterns/) `HTML`{target="_self"}
- [Claude Code 实战：Harness 工程之道｜教学扩展稿](claude-code-harness-engineering/) `HTML`{target="_self"}
<!-- END_AUTO_HTML -->
