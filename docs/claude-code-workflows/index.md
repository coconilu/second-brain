# Claude Code 的 `.claude/workflows`：把复杂 AI 任务写成可复用流程

很多人用 Claude Code 时，最先接触的是 `CLAUDE.md`、`settings.json`、自定义 agent 或 slash command。

但在 Claude Code 官方文档里，`.claude/` 目录已经不只是“放配置和提示词”的地方，而是逐渐变成了一个项目级 AI 协作系统的入口。

其中最容易被忽略，但潜力很大的，是：

```txt
.claude/workflows/*.js
```

它不是普通提示词，也不是普通 command，而是一种可以用 JavaScript 编排多个 agent 的动态工作流。

## 官方文档里的 `.claude/` 目录全家福

按照 Claude Code 官方文档，一个项目里的 `.claude/` 目录大致包括这些内容：

| 路径 | 用途 |
| --- | --- |
| `.claude/settings.json` | 项目级配置，可提交到 git |
| `.claude/settings.local.json` | 个人本地配置，通常 gitignore |
| `.claude/agents/*.md` | 自定义子 agent 定义 |
| `.claude/commands/*.md` | 自定义 slash commands |
| `.claude/skills/*/SKILL.md` | 自定义 skills |
| `.claude/workflows/*.js` | 可复用的动态 workflow 脚本 |
| `.claude/CLAUDE.md` | 项目级持久化指令 |
| `.claude/rules/` | 规则定义 |

可以先用一句话理解它们的分工：

> commands 和 skills 是“告诉 Claude 怎么做”，agents 是“定义不同角色的人”，workflows 是“用脚本编排这些人一起做事”。

更具体一点：

| 类型 | 文件 | 本质 |
| --- | --- | --- |
| `commands/*.md` | Markdown | 一段可复用提示词 |
| `skills/*/SKILL.md` | Markdown + frontmatter | 更结构化的可复用能力包 |
| `agents/*.md` | Markdown + frontmatter | 定义一个专门的子 agent |
| `workflows/*.js` | JavaScript | 编排多个 agent 的脚本 |

也就是说：

- command/skill 更像“操作说明书”
- agent 更像“团队成员角色说明”
- workflow 更像“项目经理写好的执行流程”

## workflows 解决的是什么问题？

普通 Claude Code 对话适合这种任务：

```txt
帮我修复这个 bug
```

或者：

```txt
帮我重构这个组件
```

但当任务变复杂时，单轮对话会遇到几个问题：

1. 上下文太长
2. 子任务太多
3. 每一步都要 Claude 临时判断下一步
4. 过程不可复用
5. 很难稳定地批量执行

比如：

```txt
扫描整个代码库，找出所有老 API 的使用方式，
分类、迁移、补测试、生成报告。
```

这个任务不是一个简单 prompt 能稳定完成的。

这时 workflows 的价值就出来了：

> workflow 把“任务编排逻辑”从对话里拿出来，写成一个可重复运行的 JavaScript 脚本。

## `.claude/workflows/` 目录是怎么用的？

官方约定中，workflow 文件是 JavaScript 文件：

```txt
.claude/workflows/
  migrate-api.js
  audit-security.js
  deep-code-review.js
```

每一个 workflow 保存后，都会变成一个可以调用的 slash command。

例如：

```txt
.claude/workflows/audit-security.js
```

保存后可以通过：

```txt
/audit-security
```

来运行。

如果 workflow 支持参数，也可以这样：

```txt
/audit-security src/api
```

从使用体验看，它像一个 slash command；但从执行机制看，它更像一段会调度 agent 的脚本。

## workflows 和普通 slash command 的区别

很多人会问：既然 workflow 保存后也能通过 `/xxx` 调用，那它和 `.claude/commands/*.md` 有什么区别？

区别很关键。

### commands 是 Markdown

例如：

```txt
.claude/commands/review.md
```

内容可能是：

```md
请对当前 diff 做 code review，重点关注：
- 可维护性
- 安全问题
- 测试覆盖
```

它本质上还是一段 prompt。Claude 读完之后，再自己决定怎么做。

### workflows 是 JavaScript

例如：

```txt
.claude/workflows/review-large-codebase.js
```

它不是简单提示词，而是一段脚本。脚本可以控制：

- 分几个阶段执行
- 每阶段启动哪些 subagent
- 如何收集中间结果
- 如何汇总报告
- 如何限制并发
- 如何让任务可重复运行

所以 workflow 更适合大规模、结构化、可复用的任务。

## 一个最小心智模型

可以这样理解 workflow：

```txt
Claude 对话：临时开会
command/skill：会议模板
agent：不同岗位的人
workflow：项目执行 SOP
```

比如你要做一次大型代码审计。

不用 workflow 时，你可能会这样反复提示：

```txt
先扫描 API 层。
再扫描组件层。
再检查测试。
再总结风险。
再给我迁移计划。
```

用 workflow 后，这些步骤可以固化成一个脚本：

```txt
/audit-codebase
```

以后每次运行同一个流程即可。

## workflows 适合什么场景？

workflows 特别适合大规模、分阶段、需要并行 agent 的任务。

### 大规模代码库审计

例如：

```txt
/audit-security
```

让多个 subagent 分别检查：

- API 安全
- 权限边界
- 数据校验
- 依赖风险
- 日志泄露

最后由 workflow 汇总结果。

### 大规模迁移

例如：

```txt
/migrate-api v1 v2
```

可以拆成：

1. 找出所有旧 API 使用点
2. 分类影响范围
3. 分批修改
4. 更新测试
5. 汇总无法自动迁移的地方

这种任务靠单个 prompt 很容易遗漏，但 workflow 可以把步骤固定下来。

### 多 agent 并行研究

例如：

```txt
/research "React Server Components migration strategy"
```

workflow 可以同时启动多个研究方向：

- 官方文档研究
- GitHub 实战案例搜索
- 当前项目影响分析
- 迁移风险总结

最后合成一个报告。

## 开源项目里的 workflow 实践案例

目前公开使用 `.claude/workflows/*.js` 的项目还不算多，但已经能看到一些真实实践。其中比较有代表性的是 Socket.dev 的 `socket-cli` 仓库。

项目地址：

```txt
https://github.com/SocketDev/socket-cli
```

它里面有一个 workflow：

```txt
.claude/workflows/reconcile-fleet-lockfiles.js
```

这个 workflow 的作用是：

> 在一组相关仓库中并行协调 `pnpm-lock.yaml`，处理依赖或 catalog 变更后带来的 lockfile 更新。

这个案例很适合说明 workflows 的价值。

如果用传统 shell 脚本处理，可能会写成：

```sh
for repo in repo-a repo-b repo-c; do
  cd "$repo"
  pnpm install
  git commit -am "Update lockfile"
done
```

但这种方式在多仓库、多 worktree、多并发任务里容易遇到问题：

- 并发控制困难
- 错误结果不好汇总
- 某个仓库失败后恢复麻烦
- 多个任务可能互相踩 worktree
- 中间状态难以结构化记录

Socket.dev 选择用 Claude Code workflow 来做这件事。它的 workflow 会把每个仓库作为一个独立任务，让 agent 分别处理：

1. 创建或进入对应 worktree
2. 执行 `pnpm install`
3. 判断 lockfile 是否变化
4. 如有变化则提交并推送
5. 清理临时状态
6. 最后汇总所有仓库的处理结果

这就是 workflow 和普通脚本的区别：

> shell 脚本更擅长“执行命令”，workflow 更擅长“编排多个 AI agent 完成带判断、带恢复、带汇总的复杂任务”。

这个案例说明，`.claude/workflows/` 并不是为了替代所有自动化脚本，而是适合那些传统脚本写起来很脆弱、但 AI agent 又能参与判断和修复的流程。

换句话说：

```txt
如果任务只是固定命令序列，用 shell 就够了；
如果任务需要拆分、判断、并发、修复、汇总，就可以考虑 workflow。
```

除了 Socket.dev，也有一些项目开始探索类似实践，例如：

- `crowi/crowi`：用 workflow 编排多 feature 的并行开发与合并流程
- `ruvnet/ruflo`：用 workflow 做插件 contract audit 和完整系统测试
- `jasonkneen/tiny-world-builder`：用 workflow 拆分大型单文件模块

这些案例都指向同一个趋势：

> workflow 更适合“项目级 AI 自动化流程”，而不是简单的个人快捷命令。

## 什么时候不该用 workflows？

workflow 很强，但不是所有任务都需要它。

如果只是：

```txt
帮我改一个按钮样式
```

或者：

```txt
解释一下这个函数
```

那直接问 Claude 就够了。

如果是：

```txt
每次都要重复执行的一组复杂步骤
```

或者：

```txt
需要多个 agent 并行处理的大任务
```

这时才值得抽成 workflow。

一个简单判断标准：

> 如果这个任务你已经手动提示 Claude 做过三次，而且每次步骤都差不多，就可以考虑写成 workflow。

## 推荐的 `.claude/` 组织方式

一个比较清晰的项目级组织方式是：

```txt
.claude/
  CLAUDE.md
  settings.json
  settings.local.json
  agents/
    code-reviewer.md
    test-agent.md
    docs-writer.md
  skills/
    review/
      SKILL.md
    migration-plan/
      SKILL.md
  commands/
    quick-review.md
  workflows/
    audit-codebase.js
    migrate-api.js
    release-check.js
```

对应职责：

- `CLAUDE.md`：长期项目背景和编码规范
- `settings.json`：项目级权限与工具配置
- `agents/`：定义专业角色
- `skills/`：定义可复用能力
- `commands/`：定义轻量快捷指令
- `workflows/`：定义复杂任务编排

## 总结

`.claude/workflows/` 的出现，说明 Claude Code 正在从“AI 聊天工具”变成“AI 编排系统”。

过去我们主要写 prompt：

```txt
请帮我做 A、B、C
```

现在可以把复杂流程固化成 workflow：

```txt
/audit-codebase
/migrate-api
/release-check
```

它的核心价值不是“少打一行命令”，而是：

1. 让复杂任务可复用
2. 让多 agent 协作可控
3. 让大型代码库任务更稳定
4. 让团队共享同一套 AI 工作流

如果说 `CLAUDE.md` 是项目的“长期记忆”，`agents/` 是项目的“AI 团队成员”，那么：

> `.claude/workflows/` 就是项目的 AI 自动化流水线。

## 参考资料

- [Explore the .claude directory](https://code.claude.com/docs/en/claude-directory)
- [Orchestrate subagents at scale with dynamic workflows](https://code.claude.com/docs/en/workflows)
- [SocketDev/socket-cli](https://github.com/SocketDev/socket-cli)
