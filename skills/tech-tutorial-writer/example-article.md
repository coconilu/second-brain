# Claude Code Hooks：从一个例子开始

## 一个真实的烦恼

你用 Claude Code 写 TypeScript，每次 Claude 改完文件，你都要手动跑一遍 `eslint --fix`。改三个文件就跑三次。烦了。

Hooks 能解决这个问题：**让 Claude 每次写完文件后，自动帮你跑 lint。**

下面我们从零开始把这件事跑通。

## 第一步：写 hook 脚本

在项目根目录下创建脚本：

```bash
mkdir -p .claude/hooks
```

然后创建 `.claude/hooks/auto-lint.sh`：

```bash
#!/bin/bash
FILE_PATH=$(jq -r '.tool_input.file_path')

if [[ "$FILE_PATH" == *.ts || "$FILE_PATH" == *.tsx ]]; then
  npx eslint --fix "$FILE_PATH" 2>&1
fi
exit 0
```

赋予执行权限：

```bash
chmod +x .claude/hooks/auto-lint.sh
```

这个脚本做了什么？

1. 从 stdin 读取 JSON，用 `jq` 提取 Claude 刚操作的文件路径
2. 如果是 `.ts` 或 `.tsx` 文件，跑 eslint
3. `exit 0` 表示成功，不阻断 Claude 继续工作

> **前置依赖**：脚本依赖 [jq](https://jqlang.github.io/jq/download/) 解析 JSON。Windows 用户需通过 Git Bash 或 WSL 执行 bash 脚本。

## 第二步：告诉 Claude Code 何时触发

在 `.claude/settings.json`（项目级配置）中添加：

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

搞定。启动 Claude Code，输入 `/hooks` 确认加载成功，然后让 Claude 改一个 `.ts` 文件试试——lint 会自动跑。

## 回过头看：刚才发生了什么

整个配置只有三层，对应三个问题：

```
"PostToolUse"          ← 什么时候触发？工具调用完成后
  "matcher": "Edit|Write"  ← 哪些工具调用？只有 Edit 和 Write
    "type": "command"      ← 触发后干什么？跑一个 shell 脚本
```

这就是 Hooks 的全部模型：**事件 × 过滤 × 动作**。

### 事件（Event）：Claude 生命周期中的关键节点

你可以把 Claude Code 的一次工作想象成这样的流程：

```
会话开始 → 用户输入 prompt → Claude 思考 → 调用工具 → 调用工具 → … → 回复完成 → 会话结束
```

Hooks 能插入的点就是这条流程上的各个节点。我们刚用的 `PostToolUse` 是"工具调用完成后"。最常用的几个：

| 事件 | 什么时候 | 典型用法 |
|---|---|---|
| `PreToolUse` | 工具调用**前** | 拦截危险命令、修改参数 |
| `PostToolUse` | 工具调用**后** | 自动 lint、日志记录 |
| `UserPromptSubmit` | 用户提交 prompt 后、Claude 处理前 | 输入校验、自动补充上下文 |
| `Stop` | Claude 完成回复时 | 触发后续流程、强制 Claude 继续 |
| `SessionStart` | 会话启动时 | 加载项目上下文、设置环境变量 |

完整列表有 28 个事件，但日常开发最常用的就这几个。

### 过滤（Matcher）：不是每次都触发

如果不设 matcher，`PostToolUse` 会在**所有**工具调用后触发——Read、Grep、Bash、Edit、Write……全部。但自动 lint 只关心文件写入，所以用 `"Edit|Write"` 过滤。

matcher 的规则很简单：

| 写法 | 含义 | 例子 |
|---|---|---|
| 省略或 `"*"` | 匹配所有 | 每次都触发 |
| 纯文本，`|` 分隔 | 精确匹配工具名 | `"Bash"`、`"Edit|Write"` |
| 含特殊字符 | JavaScript 正则 | `"^mcp__"` 匹配所有 MCP 工具 |

### 动作（Handler）：触发后干什么

我们用的是 `command` 类型——跑一个 shell 脚本。实际上有五种：

| 类型 | 一句话说明 |
|---|---|
| `command` | 跑 shell 脚本（最常用） |
| `http` | POST 请求到一个 URL |
| `mcp_tool` | 调用 MCP server 上的工具 |
| `prompt` | 让另一个 Claude 模型做单轮判断 |
| `agent` | 启动一个能用工具的子 agent 来验证 |

绝大多数场景用 `command` 就够了。

## Hook 脚本的输入和输出

### 输入：从 stdin 读 JSON

每次触发时，Claude Code 会通过 stdin 传一段 JSON 给你的脚本。内容因事件不同而异，但工具相关事件一定包含：

```json
{
  "session_id": "abc123",
  "cwd": "/home/user/my-project",
  "hook_event_name": "PostToolUse",
  "tool_name": "Edit",
  "tool_input": {
    "file_path": "/home/user/my-project/src/index.ts",
    "old_string": "...",
    "new_string": "..."
  }
}
```

所以 `jq -r '.tool_input.file_path'` 就能拿到被编辑的文件路径。

### 输出：用 exit code 表态

| Exit Code | 含义 |
|---|---|
| `0` | 成功，不影响 Claude 继续工作 |
| `2` | **阻断**——阻止这次操作（仅对 `PreToolUse` 等可阻断事件有效） |
| 其他 | 非阻断错误，stderr 会记录到 debug log，但不影响 Claude |

**关键**：exit 1 **不会**阻断！这和 Unix 惯例不同。要阻断必须 exit 2。

如果你想返回更精细的控制，stdout 可以输出 JSON：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "不允许这个操作"
  }
}
```

## 第二个例子：拦截危险命令

现在你想阻止 Claude 执行 `rm -rf` 之类的删除操作。

这次用 `PreToolUse`——工具调用**前**触发，可以阻断。

`.claude/hooks/block-rm.sh`：

```bash
#!/bin/bash
COMMAND=$(jq -r '.tool_input.command')

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

这里多了一个 `if` 字段——它提供比 matcher 更细的过滤。`"Bash(rm *)"` 意思是"只有 Bash 工具且命令匹配 `rm *` 时才触发这个 hook"。这样 Claude 跑 `npm test`、`git status` 时根本不会触发这个脚本。

> **注意**：正则匹配命令字符串只能做基础防护，无法覆盖所有绕过手法（`rm -r -f`、变量间接、管道构造等）。如需严格拦截，考虑结合 `prompt` 类型 hook 让模型判断命令意图。

### PreToolUse vs PostToolUse 的关键区别

| | PreToolUse | PostToolUse |
|---|---|---|
| 触发时机 | 工具执行**前** | 工具执行**后** |
| 能否阻断 | 能（exit 2 或返回 deny） | 不能（工具已经跑完了） |
| 典型用法 | 拦截、审批、修改参数 | lint、日志、通知 |

## 第三个例子：会话启动时加载上下文

每次启动 Claude Code，你都要说一遍"我们在做 XX 项目，最近在处理 YY 问题"。用 `SessionStart` hook 自动注入：

`.claude/hooks/load-context.sh`：

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

配置：

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

`SessionStart` 的 matcher 匹配的是启动方式：`startup`（新会话）、`resume`（恢复旧会话）、`clear`、`compact`。这里只在新会话时注入。

这个例子还展示了 `additionalContext` 字段——它不会阻断任何操作，而是把信息悄悄塞进 Claude 的上下文，让 Claude 知道当前有哪些活跃 issue。

## 配置放在哪

| 位置 | 作用域 | 能提交到 Git 吗 |
|---|---|---|
| `.claude/settings.json` | 当前项目，团队共享 | 能 |
| `.claude/settings.local.json` | 当前项目，仅自己 | 不能（加到 .gitignore） |
| `~/.claude/settings.json` | 所有项目 | 不能 |

经验法则：团队约定（比如禁止 `rm -rf`）放项目级，个人偏好（比如自动 lint）放全局或 local。

## 进阶：几个值得知道的细节

### 同一事件的多个 hook 并行执行

如果你在 `PreToolUse` 上挂了两个 hook，它们会同时跑，不是串行。多个 hook 返回不同的权限决策时，优先级是 **deny > ask > allow**——任何一个说 deny，就是 deny。

### 异步 hook

有些检查很慢（比如跑完整测试），你不想让 Claude 干等：

```json
{
  "type": "command",
  "command": "./run-slow-check.sh",
  "asyncRewake": true
}
```

`asyncRewake: true`：后台运行，不阻塞 Claude。如果脚本 exit 2，结果会作为提醒推送给 Claude。

### 用 `updatedInput` 修改工具参数

`PreToolUse` 的 hook 可以在 JSON 输出中返回 `updatedInput`，替换原始的 `tool_input`。比如自动把相对路径转成绝对路径：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "allow",
    "updatedInput": {
      "command": "/absolute/path/to/script.sh"
    }
  }
}
```

### Hook 故障时的行为

如果你的脚本不存在、没有执行权限、或者崩溃了，Claude Code 的策略是 **fail-open**——故障时放行，不会阻断工具调用。所以不要把 hook 当作唯一的安全防线。

## 调试

- `/hooks`：查看当前加载了哪些 hooks
- `claude --debug`：启动时看完整的 hook 执行日志
- 脚本的 stdout 必须是合法 JSON（如果你要返回 JSON 的话）。shell profile 打印的欢迎信息会干扰解析
- 用 `echo "debug info" >&2` 输出调试信息到 stderr，不会干扰 JSON 输出

## 速查

```
事件（何时触发）→ matcher（过滤哪些）→ handler（干什么）

脚本输入：stdin JSON（包含 tool_name、tool_input 等）
脚本输出：exit 0 = 成功 | exit 2 = 阻断 | 其他 = 非阻断错误

阻断只对 PreToolUse、UserPromptSubmit 等"事前"事件有效
PostToolUse 不能阻断——工具已经跑完了

$CLAUDE_PROJECT_DIR 指向项目根目录，用它引用脚本路径
```
