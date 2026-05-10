# Claude Code Hooks 完整指南

> 如果你第一次接触 hooks，建议先读 [Claude Code Hooks：从一个例子开始](claude-code-hooks-use.md)。本文定位为完整参考手册，侧重事件模型、配置细节、边界行为和调试方法。

## 前言

如果你已经用 Claude Code 写了一阵子代码，大概率遇到过这些场景：

- Claude 每次写完文件你都要手动跑一遍 lint
- 想禁止 Claude 执行某些危险命令，但权限系统粒度不够
- 希望 Claude 开始工作前自动加载一些项目上下文
- 想在 Claude 每次回复结束后触发自定义逻辑

Hooks 就是解决这些问题的机制——它让你在 Claude Code 生命周期的关键节点插入自定义逻辑，像 Git hooks 之于 Git，像中间件之于 Web 框架。

### 环境准备

Command hook 的脚本依赖以下工具，开始前请确认已安装：

- **jq**：几乎所有 hook 脚本都需要用它解析 stdin 的 JSON 输入（[安装](https://jqlang.github.io/jq/download/)）
- **gh**（可选）：示例3用到 GitHub CLI（[安装](https://cli.github.com/)）
- **bash**：本文示例均为 bash 脚本。Windows 用户需通过 Git Bash、WSL 或 MSYS2 执行

创建 hook 脚本的标准步骤：

```bash
# 1. 在项目根目录下创建 hooks 目录
mkdir -p .claude/hooks/

# 2. 创建脚本文件（以下各示例会给出具体内容）
touch .claude/hooks/my-hook.sh

# 3. 赋予执行权限（Windows Git Bash 下同样需要）
chmod +x .claude/hooks/my-hook.sh

# 4. 在 .claude/settings.json（项目级）或 ~/.claude/settings.json（全局）中添加 hook 配置

# 5. 验证：启动 Claude Code 后输入 /hooks 查看已加载的 hooks
```


## 一、Hooks 是什么

Hooks 是你定义的 shell 命令、HTTP 端点、MCP 工具调用或 LLM prompt，在 Claude Code 生命周期的特定时刻自动执行。

核心概念只有三层：

1. **Hook Event**：生命周期中的触发点（比如"工具调用前"、"回复结束时"）
2. **Matcher**：过滤条件（比如"只在 Bash 工具调用时触发"）
3. **Hook Handler**：实际执行的处理器（你的脚本/URL/prompt）

配置写在 `settings.json` 里（项目级 `.claude/settings.json` 或用户级 `~/.claude/settings.json`，详见第三节），结构长这样：

```json
{
  "hooks": {
    "事件名": [
      {
        "matcher": "过滤条件",
        "hooks": [
          {
            "type": "command",
            "command": "你的脚本"
          }
        ]
      }
    ]
  }
}
```

## 二、所有事件一览

Claude Code 目前支持 28 个 hook 事件，按生命周期阶段分组：

> 下表"能否阻断"列基于官方文档与行为推断；少数事件（如 `SubagentStart`、`TaskCreated/Completed`、`TeammateIdle`、`ConfigChange`、`UserPromptExpansion`）的阻断语义请以官方文档为准。

### 会话级

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `SessionStart` | 会话开始或恢复 | 否 |
| `SessionEnd` | 会话结束 | 否 |

### Prompt 级

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `UserPromptSubmit` | 用户提交 prompt，Claude 处理前 | 是 |
| `UserPromptExpansion` | 斜杠命令展开为 prompt 时 | 是 |
| `Stop` | Claude 完成回复 | 是（阻断 = 让 Claude 继续） |
| `StopFailure` | 因 API 错误结束 | 否 |

### 工具调用级（Agentic Loop 内）

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `PreToolUse` | 工具调用执行前 | 是 |
| `PostToolUse` | 工具调用成功后 | 否（工具已执行） |
| `PostToolUseFailure` | 工具调用失败后 | 否 |
| `PostToolBatch` | 一批并行工具调用全部完成后 | 是 |
| `PermissionRequest` | 权限弹窗出现时 | 是 |
| `PermissionDenied` | auto 模式拒绝工具调用时 | 否（可返回 retry） |

### Sub-agent / Team 级

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `SubagentStart` | 子 agent 启动 | 否 |
| `SubagentStop` | 子 agent 结束 | 是 |
| `TeammateIdle` | 团队成员即将空闲 | 是 |
| `TaskCreated` | 通过 TaskCreate 创建任务 | 是 |
| `TaskCompleted` | 任务被标记完成 | 是 |

### 环境与配置级

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `ConfigChange` | 配置文件变更 | 是 |
| `CwdChanged` | 工作目录切换（如 Claude 执行 `cd`） | 否 |
| `FileChanged` | 被监听的文件发生磁盘变更 | 否 |
| `InstructionsLoaded` | CLAUDE.md 或 rules 文件被加载 | 否 |
| `WorktreeCreate` | 创建 worktree 时 | 是 |
| `WorktreeRemove` | 移除 worktree 时 | 否 |
| `PreCompact` | context 压缩前 | 是 |
| `PostCompact` | context 压缩后 | 否 |
| `Notification` | Claude Code 发送通知时 | 否 |
| `Elicitation` | MCP server 请求用户输入 | 是 |
| `ElicitationResult` | 用户回应 MCP elicitation 后 | 是 |

## 三、配置放在哪

| 位置 | 作用域 | 可提交到仓库 |
|---|---|---|
| `~/.claude/settings.json` | 所有项目 | 否 |
| `.claude/settings.json` | 当前项目 | 是 |
| `.claude/settings.local.json` | 当前项目 | 否（gitignore） |
| 管理策略（Managed Policy） | 组织级 | 是（管理员控制） |
| Plugin `hooks/hooks.json` | 插件启用时 | 是 |
| Skill / Agent frontmatter | 组件活跃期间 | 是 |

一般建议：团队共享的规则放 `.claude/settings.json`，个人偏好放 `~/.claude/settings.json`，敏感或实验性的放 `.claude/settings.local.json`。

## 四、Matcher 匹配规则

Matcher 决定 hook 在什么条件下触发。规则很简洁：

| Matcher 值 | 解释方式 | 示例 |
|---|---|---|
| `"*"`、`""` 或省略 | 匹配所有 | 每次事件都触发 |
| 纯字母/数字/下划线/`\|` | 精确匹配（`\|` 分隔多个） | `Bash`、`Edit\|Write` |
| 含其他字符 | JavaScript 正则 | `^Notebook`、`mcp__memory__.*` |

不同事件匹配的字段不同：

- **工具事件**（PreToolUse 等）：匹配 `tool_name`
- **SessionStart**：匹配启动方式（`startup`/`resume`/`clear`/`compact`）
- **Notification**：匹配通知类型
- **FileChanged**：匹配文件名（字面量，非正则）
- **UserPromptSubmit / Stop** 等：不支持 matcher，每次都触发

### `if` 字段：更细粒度的过滤

在 hook handler 上可以加 `if` 字段，使用权限规则语法做更精确的匹配：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(git push *)",
            "command": "./check-push.sh"
          }
        ]
      }
    ]
  }
}
```

`if` 只在工具相关事件上生效，具体为：`PreToolUse`、`PostToolUse`、`PostToolUseFailure`、`PermissionRequest`、`PermissionDenied`。其他事件即使写了 `if` 也不会被评估，hook 永远不会触发。

对 Bash 工具，它会匹配每个子命令（去掉 `VAR=value` 前缀后），所以 `Bash(git push *)` 能匹配 `FOO=bar git push origin main`；命令复杂到无法解析时，hook 默认会触发。

## 五、Hook Handler 的五种类型

各类型 handler 的默认超时（不设 `timeout` 时）：

| 类型 | 默认超时 | 说明 |
|---|---|---|
| command | 60 秒 | 超时后进程被终止，视为非阻断错误 |
| http | 30 秒 | 超时/非 2xx 均视为非阻断错误 |
| mcp_tool | 60 秒 | 取决于 MCP server 响应 |
| prompt | 30 秒 | 单轮模型调用 |
| agent | 60 秒 | 子 agent 执行 |

> 以上数值基于官方文档与行为推断，具体以你当前版本的文档为准。

### 1. Command Hook（最常用）

```json
{
  "type": "command",
  "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/my-script.sh",
  "timeout": 600
}
```

- 通过 stdin 接收 JSON 输入
- 通过 exit code + stdout/stderr 返回结果
- `$CLAUDE_PROJECT_DIR` 指向项目根目录

### 2. HTTP Hook

```json
{
  "type": "http",
  "url": "http://localhost:8080/hooks/validate",
  "headers": { "Authorization": "Bearer $MY_TOKEN" },
  "allowedEnvVars": ["MY_TOKEN"],
  "timeout": 30
}
```

- POST 请求，body 是 JSON 输入
- 响应 body 使用和 command hook 相同的 JSON 输出格式
- 非 2xx / 超时 = 非阻断错误，继续执行
- `headers` 里的 `$VAR` 不是 shell 展开，而是 Claude Code 在发请求前从 `allowedEnvVars` 列出的环境变量里取值替换

> **⚠ 安全警告**：HTTP hook 会将完整的工具输入（tool_input）作为 POST body 发送到目标 URL，可能包含代码片段、文件内容、路径等敏感信息。请确保目标服务可信且使用 HTTPS 加密传输。避免将包含敏感数据的项目 hook 指向外部第三方服务。

### 3. MCP Tool Hook

```json
{
  "type": "mcp_tool",
  "server": "my_server",
  "tool": "security_scan",
  "input": { "file_path": "${tool_input.file_path}" }
}
```

调用已连接的 MCP server 上的工具，文本输出按 command hook 规则处理。

### 4. Prompt Hook

```json
{
  "type": "prompt",
  "prompt": "检查以下工具调用是否安全：$ARGUMENTS",
  "model": "claude-haiku-4-5-20251001",
  "timeout": 30
}
```

发送 prompt 给 Claude 模型做单轮评估，返回 yes/no 决策。

### 5. Agent Hook（实验性）

```json
{
  "type": "agent",
  "prompt": "验证这个文件修改是否符合项目规范：$ARGUMENTS",
  "timeout": 60
}
```

启动一个可以使用 Read、Grep、Glob 等工具的子 agent 来验证条件。

## 六、输入与输出协议

### Hook 收到什么（stdin / POST body）

所有事件都包含这些公共字段：

```json
{
  "session_id": "abc123",
  "transcript_path": "/home/user/.claude/projects/.../transcript.jsonl",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse"
}
```

工具事件额外包含 `tool_name` 和 `tool_input`：

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "npm test"
  }
}
```

在子 agent 内触发时，还会有 `agent_id` 和 `agent_type` 字段。

### Hook 怎么回话（exit code + stdout）

**Exit 0**：成功。stdout 如果是合法 JSON 则按结构化输出处理，否则作为纯文本上下文。

**Exit 2**：阻断错误。stderr 内容反馈给 Claude。对 `PreToolUse` 意味着阻止工具调用，对 `UserPromptSubmit` 意味着拒绝 prompt。

**其他 exit code**：非阻断错误，stderr 第一行显示在 transcript 中，执行继续。

> 注意：exit 1 不会阻断！这和 Unix 惯例不同。要阻断必须用 exit 2。

### JSON 输出格式

exit 0 时，stdout 可以输出 JSON 来做更精细的控制：

```json
{
  "continue": true,
  "suppressOutput": false,
  "systemMessage": "警告信息（显示给用户）",
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "不允许删除操作"
  }
}
```

**通用字段：**

| 字段 | 默认值 | 说明 |
|---|---|---|
| `continue` | `true` | 设为 `false` 则 Claude 完全停止 |
| `stopReason` | 无 | `continue: false` 时显示给用户的消息 |
| `suppressOutput` | `false` | 设为 `true` 则不写入 debug log |
| `systemMessage` | 无 | 显示给用户的警告 |

**决策控制（因事件而异）：**

| 事件 | 决策方式 | 关键字段 |
|---|---|---|
| UserPromptSubmit / Stop / PostToolUse 等 | 顶层 `decision` | `decision: "block"`, `reason` |
| PreToolUse | `hookSpecificOutput` | `permissionDecision`: allow/deny/ask/defer |
| PermissionRequest | `hookSpecificOutput` | `decision.behavior`: allow/deny |
| PermissionDenied | `hookSpecificOutput` | `retry: true` 允许模型重试 |

> 注意：`permissionDecision: "defer"` 只在非交互模式（`claude -p ...`）下有效。普通交互式会话里设了 `defer` 行为会退化，不要依赖它。

**PreToolUse 的 `hookSpecificOutput` 还支持两个常用字段：**

| 字段 | 用途 |
|---|---|
| `updatedInput` | 替换 `tool_input`，常用于自动规范化（比如把命令里的相对路径改成绝对路径） |
| `additionalContext` | 在工具调用前注入额外上下文给 Claude（比如"当前在 CI 环境中") |

多个 hook 返回不同 `permissionDecision` 时，优先级是 **deny > defer > ask > allow**。

> **多 hook 并行执行的注意事项**：同一 matcher 下的多个 handler 是并行执行的（见第九节要点4）。`permissionDecision` 有明确的优先级合并规则，但 `updatedInput` 没有——如果多个 hook 同时返回不同的 `updatedInput`，最终生效的结果不可预测。因此，**同一事件下应避免多个 hook 同时修改 `updatedInput`**。如果确实需要多步改写，考虑拆成不同粒度的 matcher 或使用单一 hook 脚本内部串行处理。

## 七、实战示例

### 示例 1：阻止危险的 rm 命令

> **⚠ 安全提示**：正则匹配命令字符串只能做基础防护，无法覆盖所有绕过手法（`rm -r -f`、长选项 `--recursive --force`、变量间接 `$CMD /`、管道构造 `echo "rm -rf /" | bash` 等）。生产环境如需严格拦截危险操作，建议结合 prompt hook 让模型判断命令意图，而非仅依赖正则。以下示例仅作为 hook 机制的演示。

`.claude/hooks/block-rm.sh`：

```bash
#!/bin/bash
# 依赖：jq（从 stdin 读取 hook 传入的 JSON）
COMMAND=$(jq -r '.tool_input.command')

# 基础检测：覆盖常见的 rm 危险用法（仍无法防住所有变体，见上方安全提示）
if echo "$COMMAND" | grep -qE 'rm\s+(-[a-zA-Z]*r[a-zA-Z]*f|--recursive|--force)'; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "rm 递归强制删除被 hook 禁止"
    }
  }'
else
  exit 0
fi
```

配置：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(rm *)",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/block-rm.sh"
          }
        ]
      }
    ]
  }
}
```

> 补充：`if` 字段提供了第一层过滤（只在命令匹配 `rm *` 时才触发 hook），但 `if` 同样基于命令解析，文档第四节提到"命令复杂到无法解析时，hook 默认会触发"——这意味着复杂命令不会被漏掉，但也可能产生误触发。

### 示例 2：写文件后自动 lint

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/auto-lint.sh"
          }
        ]
      }
    ]
  }
}
```

`auto-lint.sh`：

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  npx eslint --fix "$FILE_PATH" 2>&1
fi
exit 0
```

> **性能提示**：上面的方式会在每次 Edit/Write 后启动一个 eslint 进程。如果 Claude 在一个回合内连续编辑多个文件，每次都有 Node.js 冷启动 + 配置解析的开销。更高效的做法是用 `PostToolBatch` 在一批工具调用完成后批量 lint：

```json
{
  "hooks": {
    "PostToolBatch": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/batch-lint.sh"
          }
        ]
      }
    ]
  }
}
```

`batch-lint.sh`（从 batch 输入中提取所有被修改的 ts/tsx 文件，一次性 lint）：

```bash
#!/bin/bash
FILES=$(jq -r '[.tool_results[]? | select(.tool_name == "Edit" or .tool_name == "Write") | .tool_input.file_path // empty] | unique | map(select(test("\\.(ts|tsx)$"))) | .[]')

if [ -n "$FILES" ]; then
  echo "$FILES" | xargs npx eslint --fix 2>&1
fi
exit 0
```

### 示例 3：会话启动时注入项目上下文

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup",
        "hooks": [
          {
            "type": "command",
            "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/load-context.sh"
          }
        ]
      }
    ]
  }
}
```

`load-context.sh`：

```bash
#!/bin/bash
RECENT_ISSUES=$(gh issue list --limit 5 --json title,number --jq '.[] | "#\(.number) \(.title)"' 2>/dev/null)

if [ -n "$RECENT_ISSUES" ]; then
  jq -n --arg ctx "当前活跃 issues:\n$RECENT_ISSUES" '{
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: $ctx
    }
  }'
fi
exit 0
```

### 示例 4：用 SessionStart 持久化环境变量

```bash
#!/bin/bash
if [ -n "$CLAUDE_ENV_FILE" ]; then
  echo 'export NODE_ENV=development' >> "$CLAUDE_ENV_FILE"
  echo 'export DEBUG=true' >> "$CLAUDE_ENV_FILE"
fi
exit 0
```

`CLAUDE_ENV_FILE` 仅在 `SessionStart`、`CwdChanged`、`FileChanged` 事件中可用。写入的变量在整个会话的后续 Bash 命令中生效。

### 示例 5：异步 hook（后台运行）

```json
{
  "type": "command",
  "command": "./run-slow-check.sh",
  "async": true
}
```

- `async: true`：hook 在后台运行，不阻塞 Claude，结果不回流
- `asyncRewake: true`：隐含 `async: true`，所以单写这个就够了；hook 后台运行，**exit 2** 时把 stderr（stderr 为空则 stdout）作为 system reminder 推给 Claude，让它感知后台结果

> **异步 hook 的投递语义**：`asyncRewake` 的结果投递是 best-effort 的——如果 hook 完成时 Claude 正在处理其他请求，唤醒消息会排队等待当前轮次结束后注入。多个 async hook 同时完成时，各自的 system reminder 会按完成顺序依次投递，不会合并。如果 hook 在会话结束后才完成，结果会被丢弃。

## 八、调试与排查

### Hook 故障处理

Hook 自身可能出故障（脚本不存在、缺少执行权限、依赖工具未安装、OOM 等）。Claude Code 对此的处理原则是 **fail-open**（故障时放行）：

- 脚本不存在或不可执行：视为非阻断错误（等同于非 0 非 2 的 exit code），stderr 信息写入 debug log，执行继续
- 脚本崩溃（segfault、未捕获异常等）：同上，非阻断错误
- 超时：超过 `timeout` 设定后进程被终止，视为非阻断错误

这意味着：**不要依赖 command hook 作为唯一的安全屏障**。如果 hook 脚本因任何原因未正常执行，工具调用会照常进行。需要强安全保证时，应同时配合权限模式（permission mode）和管理策略（managed policy）。

### 常见排查手段

- 输入 `/hooks` 可以查看当前所有已配置的 hooks，包括来源和详情
- 使用 `--debug` 启动 Claude Code 可以看到完整的 hook 执行日志
- stdout 必须是纯 JSON（如果你要返回 JSON 的话）。shell profile 打印的欢迎信息会干扰 JSON 解析
- hook 输出过长时会被截断或转存（具体阈值以你当前版本的官方文档为准）
- 想临时关掉所有 hooks 时，查阅当前版本 settings 文档里的关闭开关（管理策略级别的 hooks 不受用户设置影响）

## 九、要点速查

1. **exit 2 才能阻断**，exit 1 只是非阻断错误
2. **matcher 为空或 `*` 表示匹配所有**，不是不匹配
3. **`if` 字段只在工具事件上生效**，其他事件加了会被忽略
4. **同一 matcher 下的多个 handler 并行执行**，相同的会自动去重
5. **用 `$CLAUDE_PROJECT_DIR` 引用脚本路径**，避免工作目录变化导致找不到文件
6. **PostToolUse 不能阻断**——工具已经执行了，你只能把 stderr 反馈给 Claude
7. **Skill 和 Agent 的 frontmatter 也能定义 hooks**，作用域限定在组件生命周期内

---

*参考文档：*

- [Hooks reference - Claude Code Docs](https://code.claude.com/docs/en/hooks)
- [Automate workflows with hooks](https://code.claude.com/docs/en/hooks-guide)

## 相关阅读

- [Claude Code Hooks：从一个例子开始](claude-code-hooks-use.md)
- [从 sub-agent 到 agent-team：三个台阶，三套心智模型](../claude-sub-agent/sub-agent-and-agent-team.md)
