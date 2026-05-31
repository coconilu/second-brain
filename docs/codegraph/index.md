# CodeGraph：给 AI 编程助手的本地代码知识图谱

[CodeGraph](https://github.com/colbymchenry/codegraph) 是一个开源、本地运行的代码知识图谱工具，主要面向 Claude Code、Cursor、Codex CLI、OpenCode、Hermes Agent、Gemini CLI 等 AI 编程助手。

它会用 tree-sitter 静态解析代码，把函数、类、方法、调用关系、导入关系、路由映射等信息存进本地 SQLite 数据库，让 AI Agent 可以直接查询代码结构，而不是反复用 `grep`、`glob` 和 `Read` 扫文件。

一句话概括：**CodeGraph 给 AI Agent 提供一个预先构建好的代码地图，用更少的 token 和工具调用理解代码库。**

## 它解决什么问题

AI 编程助手在大型代码库里经常会遇到这些问题：

- 为了理解一个问题，需要反复搜索文件。
- 调用链分散在多个模块里，很难一次看清。
- 大量 token 消耗在探索阶段，而不是解决问题本身。
- 多个 Agent 会话重复做相同的代码结构扫描。
- 修改一个函数前，不容易知道会影响哪些调用方和测试。

CodeGraph 的思路是先把项目解析成图谱，之后让 Agent 直接查询：

- “这个函数在哪里？”
- “谁调用了它？”
- “它又调用了谁？”
- “从入口请求到数据库查询的路径是什么？”
- “改这个符号会影响哪些地方？”

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 本地知识图谱 | 在项目的 `.codegraph/codegraph.db` 中保存符号、边、文件和全文索引。 |
| MCP 接入 | 作为 MCP Server 暴露给 Claude Code、Cursor、OpenCode 等工具。 |
| 语义搜索 | 按符号名、函数名、类名搜索代码结构。 |
| 调用关系 | 查询 callers、callees、trace 和 impact。 |
| 上下文构建 | 根据任务一次性返回相关入口点、符号和代码片段。 |
| 自动同步 | MCP Server 启动后监听文件变更，默认约 2 秒消抖后增量同步。 |
| 框架路由识别 | 识别 Django、Flask、FastAPI、Express、NestJS、Laravel、Rails、Spring、Gin 等框架路由。 |
| 跨语言桥接 | 对 Swift/Objective-C、React Native、Expo Modules 等混合项目提供启发式关系连接。 |
| 零配置 | 基于文件扩展名识别语言，默认遵守 `.gitignore`。 |

## 支持的 Agent

安装器可以自动检测并配置这些工具：

- Claude Code
- Cursor
- Codex CLI
- OpenCode
- Hermes Agent
- Gemini CLI
- Antigravity
- Kiro

## 支持的语言

CodeGraph 支持 20 多种语言，包括：

- TypeScript / JavaScript
- Python
- Go
- Rust
- Java
- C#
- PHP
- Ruby
- C / C++
- Swift
- Objective-C
- Kotlin
- Scala
- Dart
- Vue
- Svelte
- Lua / Luau
- Liquid
- Pascal / Delphi

Objective-C 是部分支持，尤其是 `.mm` Objective-C++ 文件可能解析不完整。

## 安装

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
```

### Windows PowerShell

```powershell
irm https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.ps1 | iex
```

### 使用 npm

如果已经安装 Node.js，也可以用 npm：

```bash
npx @colbymchenry/codegraph
```

或者全局安装：

```bash
npm i -g @colbymchenry/codegraph
```

CodeGraph 的官方分发包自带运行时，通常不需要额外安装 Node.js，也不需要 native 编译步骤。

## 基本使用流程

### 1. 安装并配置 Agent

运行交互式安装器：

```bash
codegraph install
```

或：

```bash
npx @colbymchenry/codegraph
```

安装器会检测本机已有的 AI Agent，并写入对应的 MCP Server 配置。

### 2. 在项目中初始化索引

进入你的代码项目：

```bash
cd your-project
```

初始化并立即建立索引：

```bash
codegraph init -i
```

这会创建本地索引目录：

```text
.codegraph/
```

如果初始化时没有加 `-i`，可以之后再手动建立索引：

```bash
codegraph index
```

### 3. 重启 AI Agent

重启 Claude Code、Cursor、OpenCode 等工具后，MCP Server 会被加载。

当项目中存在 `.codegraph/` 时，Agent 就可以调用 CodeGraph 工具查询项目结构。

## 常用 CLI 命令

| 命令 | 作用 |
| --- | --- |
| `codegraph install` | 安装并配置 Agent。 |
| `codegraph uninstall` | 从已配置的 Agent 中移除 CodeGraph。 |
| `codegraph init [path]` | 在项目中初始化 `.codegraph/`。 |
| `codegraph init -i` | 初始化并立即建立索引。 |
| `codegraph uninit [path]` | 移除项目中的 CodeGraph 索引。 |
| `codegraph index [path]` | 全量建立索引。 |
| `codegraph sync [path]` | 增量同步索引。 |
| `codegraph status [path]` | 查看索引统计和健康状态。 |
| `codegraph query <search>` | 搜索符号。 |
| `codegraph files [path]` | 查看已索引文件结构。 |
| `codegraph context <task>` | 为任务构建 AI 上下文。 |
| `codegraph callers <symbol>` | 查找调用某符号的地方。 |
| `codegraph callees <symbol>` | 查找某符号调用了什么。 |
| `codegraph impact <symbol>` | 分析修改某符号的影响范围。 |
| `codegraph affected [files]` | 找出变更文件可能影响的测试文件。 |
| `codegraph serve --mcp` | 启动 MCP Server。 |

## MCP 工具

当 CodeGraph 作为 MCP Server 运行时，Agent 可以使用这些工具：

| 工具 | 用途 |
| --- | --- |
| `codegraph_search` | 按名称搜索符号。 |
| `codegraph_context` | 根据任务构建相关代码上下文。 |
| `codegraph_trace` | 追踪两个符号之间的调用路径。 |
| `codegraph_callers` | 查找某个函数或方法的调用者。 |
| `codegraph_callees` | 查找某个函数或方法调用了谁。 |
| `codegraph_impact` | 分析修改某符号的影响范围。 |
| `codegraph_node` | 获取某个符号的详细信息，可包含源码。 |
| `codegraph_explore` | 一次性探索多个相关符号及关系。 |
| `codegraph_files` | 获取已索引文件结构。 |
| `codegraph_status` | 查看索引状态。 |

## 典型使用场景

假设你问 AI：

> 登录请求是如何从 API route 走到数据库查询的？

没有 CodeGraph 时，Agent 可能需要：

1. 搜索 `login`。
2. 找到 route 文件。
3. 读取 controller。
4. 搜索 service。
5. 读取 repository。
6. 再读 model 或数据库访问层。

有 CodeGraph 后，Agent 可以直接用：

- `codegraph_context` 找到相关区域。
- `codegraph_trace` 追踪调用链。
- `codegraph_explore` 返回相关符号和代码片段。

这能把探索成本从“多次文件搜索和阅读”变成“几次图查询”。

## 手动 MCP 配置示例

如果不使用自动安装器，也可以手动配置 MCP Server。例如 Claude Code：

```json
{
  "mcpServers": {
    "codegraph": {
      "type": "stdio",
      "command": "codegraph",
      "args": ["serve", "--mcp"]
    }
  }
}
```

## `codegraph affected` 示例

`affected` 可以根据变更文件追踪受影响的测试文件：

```bash
codegraph affected src/utils.ts src/api.ts
```

也可以配合 Git：

```bash
git diff --name-only | codegraph affected --stdin --quiet
```

在测试脚本中可以这样用：

```bash
#!/usr/bin/env bash
AFFECTED=$(git diff --name-only HEAD | codegraph affected --stdin --quiet)
if [ -n "$AFFECTED" ]; then
  npx vitest run $AFFECTED
fi
```

## 注意事项

- CodeGraph 默认遵守 `.gitignore`。
- 默认跳过 `node_modules`、`vendor`、`dist`、`build`、`target`、`.venv`、`Pods`、`.next` 等目录。
- 默认跳过超过 1 MB 的文件。
- Objective-C 是部分支持，`.mm` 文件可能解析不完整。
- WSL2 的 `/mnt`、网络盘或某些挂载文件系统可能遇到 SQLite WAL 或文件监听问题。
- 文件变更通常会自动同步，但在禁用 watcher、脚本化使用或异常场景下，可以手动运行 `codegraph sync`。
- 跨语言桥接大量依赖启发式规则，适合辅助理解，但关键判断仍应结合源码确认。

## 适合什么时候用

CodeGraph 特别适合：

- 大型代码库。
- 多语言项目。
- AI Agent 经常需要理解调用链的项目。
- 需要影响分析的重构场景。
- 希望减少 AI 搜索文件、读取文件和消耗 token 的团队。

如果是很小的项目，现代 AI Agent 原生搜索已经足够快，CodeGraph 的收益可能没有大型项目明显。

## 最短路径

如果只是想快速试用：

```bash
curl -fsSL https://raw.githubusercontent.com/colbymchenry/codegraph/main/install.sh | sh
cd your-project
codegraph init -i
```

然后重启 Claude Code、Cursor 或 OpenCode，让 Agent 通过 MCP 使用 CodeGraph。
