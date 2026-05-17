# 前端工程师的 AI 工具兵器谱：Skills、MCP、Agent、Plugin 全解析

> 面向 Claude Code 与 OpenCode 用户，覆盖 2026 年 2 月—5 月最热工具。
> 读完你会知道：该装什么、怎么配、什么时候用哪个。

---

## 一个真实的烦恼

你用 Claude Code 写一个 React 组件。描述需求很顺畅，代码也写得不错。

但接下来才是噩梦的开始：

- Claude 生成的 UI 永远是那个蓝白渐变——同事说"一看就是 AI 写的"。
- 你要查 Next.js 15 的某个 API，Claude 自信满满地编了一个不存在的参数。
- 组件写完了，你手动打开 Chrome DevTools 调试样式，截图发给 Claude，它说"我看不到你的屏幕"。
- 改完代码想部署，又要切到 Vercel 控制台，手动点来点去。
- 想让 Claude 帮你审查 PR，它只看了你打开的那两个文件，完全不知道整个 repo 的上下文。

**这些痛点背后是同一个问题：你的 AI 编程助手缺了"手"和"脑"。**

这篇文章帮你装上它们。下面我们从零开始，把 Claude Code / OpenCode 配成一台真正的"前端工程机器"。

---

## 先看清地图：四层模型

Claude Code 和 OpenCode 的扩展体系不是一堆散装插件，而是一个**四层架构**。理解这四层，你就不会装一堆冲突的工具。

```
┌──────────────────────────────────────────┐
│  L4  Skills（技能）                       │
│  "怎么做"——标准化工作流的指令文件          │
│  例：/frontend-design、/code-review       │
├──────────────────────────────────────────┤
│  L3  Agent（智能体）                      │
│  "谁来做"——自主执行任务的 AI 代理          │
│  例：Claude Code、OpenCode、Cursor Agent  │
├──────────────────────────────────────────┤
│  L2  Plugin（插件）                        │
│  "一键装"——Skills + Commands + Hooks 全家桶│
│  例：everything-opencode、opencode-power-pack│
├──────────────────────────────────────────┤
│  L1  MCP（模型上下文协议）                 │
│  "手在哪"——连接外部工具的标准化协议         │
│  例：GitHub MCP、Figma MCP、Playwright MCP │
└──────────────────────────────────────────┘
```

**一句话记清：**
- MCP 给 AI **手**（操作外部工具）
- Skill 给 AI **脑**（知道怎么做）
- Agent 是 AI **本体**（谁来执行）
- Plugin 是**全家桶**（把上面三样打包）

**选型口诀：**

| 你需要 | 先看 | 原因 |
|--------|------|------|
| 连接外部服务（数据库、API、GitHub） | **MCP** | 底层协议，所有扩展的基础 |
| 标准化重复工作流（审查、测试、部署） | **Skill** | 轻量 Markdown 文件，零依赖 |
| 一键安装整套能力 | **Plugin** | 打包了 Skill + MCP + Hook |
| 换一个执行主体 / 换模型 | **Agent** | Claude Code ↔ OpenCode 切换 |

---

## L1: MCP 服务器——装上 AI 的"手"

MCP 是 Anthropic 在 2024 年底开源的标准协议。到 2026 年 5 月，MCP 服务器数量已突破 **8000+**，日均新增数十个。前端工程师最值得装的，按场景分成 5 类。

### 1. 设计 → 代码

#### Figma Dev Mode MCP

```json
// ~/.config/opencode/opencode.json 或 ~/.claude.json
{
  "mcp": {
    "figma": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-figma"],
      "env": {
        "FIGMA_ACCESS_TOKEN": "figd_xxxxxxxxxxxxx"
      }
    }
  }
}
```

**它能做什么：** 直接读取 Figma 设计稿的组件层级、样式属性、间距数值。你说"按这个设计稿实现导航栏"，AI 不会瞎猜 padding 是 16px 还是 24px。

> 获取 Figma Access Token：Figma → Settings → Personal Access Tokens

#### ShadCN MCP

```json
{
  "mcp": {
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@shadcn/mcp"]
    }
  }
}
```

**它能做什么：** 直接生成 React + Tailwind CSS 组件代码。你说"给我一个带搜索的表格组件"，它输出的是可以直接 `import` 的 shadcn/ui 组件，不是一堆裸 `<div>`。

#### ReactBits MCP

FastMCP 排名 #4（4,800+ views），包含 **135+ 个动画 React 组件**的参考库。前端开发者拿来即用的组件灵感源。

```json
{
  "mcp": {
    "reactbits": {
      "command": "npx",
      "args": ["-y", "@reactbits/mcp"]
    }
  }
}
```

### 2. 浏览器自动化 & 调试

#### Playwright MCP（必装）

FastMCP 排名 #2（5,600+ views）。让 AI 直接操控无头浏览器：截图、填表单、点击按钮、验证页面。

```json
{
  "mcp": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

**典型用法：**

```text
# 在 Claude Code / OpenCode 中直接说：
"打开 http://localhost:3000，截个图，检查导航栏的 padding 是不是 16px。
如果不是，改 CSS 然后刷新页面再确认。"
```

AI 会自己打开浏览器、截图、分析、改代码、刷新验证——全程不需要你碰鼠标。

#### Chrome DevTools MCP（Google 官方出品，2025.11 发布）

比 Playwright 更进一步：**直接接入 Chrome DevTools 协议**。可以实时调试 DOM、分析网络请求、检查控制台错误、跑性能追踪。

```json
{
  "mcp": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

**前端调试的革命性场景：**

```text
"打开 localhost:3000/about 页面，看看控制台有没有报错。
有的话分析原因，修复代码，然后刷新验证。"
```

以前你需要：打开 DevTools → 截图 → 粘贴给 AI → 等回复 → 改代码 → 刷新 → 再截图。现在一句话搞定。

### 3. 文档 & 上下文

#### Context7（下载量第一，11,000+ views）

解决 AI 的"文档幻觉"问题。Context7 把**最新版本文档**注入到你的 prompt 上下文中——Next.js 15、React 19、Tailwind CSS 4，全是最新版。

```json
{
  "mcp": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp@latest"]
    }
  }
}
```

**为什么这个排名第一？** 因为训练数据截止后发布的新 API，AI 默认是编造的。Context7 让 AI 写出来的是**真的能跑的代码**。

| 没有 Context7 | 有 Context7 |
|--------------|------------|
| `useOptimistic` 参数顺序搞反 | 按最新文档传参 |
| Next.js 14 的 API 写到 15 项目里 | 精准匹配当前版本 |
| 编一个不存在的 Tailwind class | 只推荐真实存在的 class |

### 4. 部署 & 基础设施

#### Vercel MCP

```json
{
  "mcp": {
    "vercel": {
      "command": "npx",
      "args": ["-y", "@vercel/mcp"]
    }
  }
}
```

**你能做什么：** 在聊天窗口里说"把这个项目部署到 Vercel，生成预览链接"，AI 执行 `vercel deploy`、返回 URL。你还可以让 AI 自动设置环境变量、配置域名。

#### Cloudflare MCP

```json
{
  "mcp": {
    "cloudflare": {
      "command": "npx",
      "args": ["-y", "@cloudflare/mcp"]
    }
  }
}
```

**面向场景：** Workers / Pages 边缘部署、KV / R2 存储管理、DNS 配置。全栈前端特别实用。

#### Supabase MCP

```json
{
  "mcp": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp"]
    }
  }
}
```

**面向场景：** 认证、数据库（Postgres）、存储、实时订阅——完整 BaaS 后端。你说"帮我创建 users 表，加 email + password 字段，配好 RLS 策略"，AI 通过 MCP 直接操作 Supabase。

### 5. 效率工具

#### GitHub MCP

```json
{
  "mcp": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-github"],
      "env": {
        "GITHUB_TOKEN": "ghp_xxxxxxxxxxxxx"
      }
    }
  }
}
```

搜索代码仓库、读取 PR diff、查看 Issue 内容、创建分支。**让 AI 的视野从"你打开的几个文件"扩展到"整个 GitHub 仓库"。**

#### Fetch MCP（网页抓取）

```json
{
  "mcp": {
    "fetch": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-fetch"]
    }
  }
}
```

把任意网页转成 Markdown 喂给 AI。调研竞品、读文档、抓取博客文章，一条指令搞定。

#### Sequential Thinking MCP

```json
{
  "mcp": {
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-sequential-thinking"]
    }
  }
}
```

强制 AI 做结构化推理。面对复杂架构决策时，这个 MCP 让 AI 一步步思考而非跳结论。

### MCP 速查表

| 场景 | MCP 名称 | 安装量/热度 | 一句总结 |
|------|----------|-------------|---------|
| 设计稿→代码 | Figma MCP | 18K+ installs | 读 Figma 设计稿，精确还原 |
| UI 组件 | ShadCN MCP | Trending | 生成 React+Tailwind 组件 |
| 组件参考 | ReactBits MCP | 4,800+ views | 135+ 动画组件库 |
| 浏览器测试 | Playwright MCP | 5,600+ views | 无头浏览器自动化 |
| 实时调试 | Chrome DevTools MCP | 20K+ installs | Google 官方，DevTools 协议 |
| 文档注入 | Context7 | 11,000+ views | 消除 API 幻觉，#1 MCP |
| 部署 | Vercel MCP | 高 | 一键部署+预览环境 |
| 边缘部署 | Cloudflare MCP | 高 | Workers/Pages/KV/R2 |
| 后端 | Supabase MCP | 高 | 认证+数据库+存储 |
| 代码仓库 | GitHub MCP | 30K+ stars | PR/Issue/代码搜索 |
| 网页抓取 | Fetch MCP | 官方 | URL → Markdown |
| 推理 | Sequential Thinking | 官方 | 结构化分步推理 |

---

## L2: Skills——装上 AI 的"脑"

Skill 是一个包含 `SKILL.md` 的文件夹。它告诉 AI **在什么情况下、按什么流程、做什么事**。Skills 是 Markdown 文件，零运行时依赖，放在 `~/.claude/skills/` 或 `.opencode/skills/` 下即可生效。

### Claude Code / OpenCode 共用 Skills

两个平台使用**相同的 SKILL.md 格式**。OpenCode 原生读取 Claude Code 的 skills 目录。你把 skill 放在一个地方，两个平台都能用。

> **目录对应关系：**
>
> | Claude Code | OpenCode |
> |------------|----------|
> | `~/.claude/skills/` | `~/.config/opencode/skills/` |
> | `.claude/skills/`（项目级） | `.opencode/skills/`（项目级） |

### 前端必装 Skills Top 8

#### 1. Frontend Design（Anthropic 官方，96K+ 安装）

告别"一看就是 AI 写的"UI。

```bash
# Claude Code 安装
git clone https://github.com/anthropics/claude-code.git /tmp/cc-tmp
cp -r /tmp/cc-tmp/plugins/frontend-design/skills/frontend-design ~/.claude/skills/
```

**它能做什么：** 每次生成 UI 前，先选择一个美学方向（瑞士风格、野兽派、玻璃态等），然后在此约束下写组件。生成的界面有独特的字体、配色、间距系统，不再是千篇一律的蓝白卡片。

```text
# 在 Claude Code 中直接喊：
/frontend-design 帮我做一个个人博客首页，瑞士风格，极简主义
```

#### 2. Superpowers（144K+ ⭐，社区最火）

一套完整的软件工程方法论。不是单个 skill，而是一个技能框架。

```bash
# Claude Code
git clone https://github.com/obra/superpowers ~/.claude/skills/

# OpenCode（通过 opencode-power-pack 插件）
# 在 opencode.json 中添加：
# "plugin": ["opencode-power-pack"]
```

**核心 Skills：** brainstorm → plan → tdd → execute → review。让 AI 从"你说一句它写一段"变成"你说需求它走完一整套工程流程"。

#### 3. Feature Dev（Anthropic 官方，7 阶段工作流）

```text
/feature-dev 帮我给这个项目加一个用户权限系统
```

执行流程：discovery（发现上下文）→ exploration（探索代码库）→ questions（澄清需求）→ architecture（设计架构）→ implementation（编码实现）→ review（自查审查）→ summary（交付总结）。

#### 4. Vercel React Best Practices

Vercel 工程团队的 React/Next.js 最佳实践。当 AI 写 React 代码时自动注入性能规则。

```bash
# 安装
claude install-skill vercel/react-best-practices
```

**涵盖：** Server Components 使用时机、Suspense 边界策略、图片优化、字体加载、bundle 分析。

#### 5. Cloudflare Skills

Workers、D1、R2、Vectorize、Workers AI、Wrangler 的全栈开发指南。如果你用 Cloudflare 做全栈，必装。

#### 6. Webapp Testing（Anthropic 官方）

配合 Playwright MCP 使用。告诉 AI 如何写可靠的 E2E 测试——等待策略、选择器优先级、避免 flaky test。

```text
/webapp-testing 给这个登录页面写自动化测试，覆盖正常登录、密码错误、网络超时三个场景
```

#### 7. Code Review（多 Agent 交叉审查）

```text
/code-review 审查这个 PR 的代码质量
```

**流程：** 两个独立 Agent 分别审查 → 交叉验证发现 → 过滤低置信度问题 → 输出可复现的审查报告。

#### 8. Skill Creator（自己造轮子）

教你怎么写一个好的 SKILL.md。渐进式披露结构、触发性描述写作、eval 验证。

```text
/skill-creator 帮我创建一个「Tailwind CSS 响应式断点审查」的 skill
```

### Skills 速查表

| Skill | 一句话场景 | 安装方式 |
|-------|-----------|---------|
| Frontend Design | "UI 太丑了，全是 AI 审美" | Anthropic 官方 plugin |
| Superpowers | "想要完整的工程纪律" | obra/superpowers |
| Feature Dev | "从需求到交付的完整流程" | Anthropic 官方 |
| Vercel React Best Practices | "React/Next.js 性能优化" | 社区 |
| Cloudflare Skills | "Workers/D1/R2 全栈" | Cloudflare 官方 |
| Webapp Testing | "自动写 E2E 测试" | Anthropic 官方 |
| Code Review | "多 Agent 交叉审查 PR" | Anthropic 官方 |
| Skill Creator | "创建自己的 skill" | Anthropic 官方 |

---

## L3: Agent——选择你的执行主体

### Claude Code vs OpenCode：前端工程师怎么选

| 维度 | Claude Code | OpenCode |
|------|------------|----------|
| **界面** | 终端 CLI | 终端 TUI + 桌面 App + VS Code 插件 |
| **模型** | Claude 系列（Opus 4.7 / Sonnet 4.6） | **75+ 厂商**：Claude、GPT、Gemini、本地 Ollama |
| **价格** | $20/月 Pro（含额度），超出按量 | **免费开源**，API 费自付，可用 Copilot 免费额度 |
| **Skills** | 完整生态，6 万+ 社区贡献 | 兼容 Claude Code 格式 + 自有插件生态 |
| **MCP** | 原生支持 | 原生支持 + LSP 语言服务器 |
| **Hooks** | 8 个事件类型 | 20+ 事件类型（插件系统更丰富）|
| **多 Agent** | 2026.5 支持子代理并行 | 原生多会话并行 |
| **前段优势** | UI 生成质量高（Frontend Design skill 加持） | 可切换模型做对比，可白嫖免费模型 |
| **隐私** | 代码经 Anthropic API | 代码不存储，支持本地模型零泄露 |

**推荐组合策略：**

```
早上：Claude Code（架构决策、重构、写测试）
下午：Cursor（前端迭代、UI 调优、视觉验证）
周末原型：OpenCode + Ollama 本地模型（零成本实验）

日常 CLi 为主：Claude Code（主力）+ OpenCode（换模型对比）
没钱但有卡：OpenCode + Ollama（DeepSeek/千问/本地模型）
```

### OpenCode 配置要点

OpenCode 的配置文件是 `opencode.json`，支持全局（`~/.config/opencode/`）和项目级（项目根目录）：

```jsonc
// opencode.json
{
  "$schema": "https://opencode.ai/config.json",
  // 模型配置
  "model": "claude-sonnet-4-5",
  // MCP 服务器
  "mcp": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  },
  // npm 插件
  "plugin": [
    "opencode-power-pack",
    "opencode-wakatime"
  ],
  // Skills 权限控制
  "permission": {
    "skill": {
      "*": "allow",
      "internal-*": "deny"
    }
  }
}
```

> **OpenCode 独有特性：** LSP 语言服务器集成。AI 在写 TypeScript 时可以直接跳转定义、查看类型、检查诊断——这些是 Claude Code 不具备的实时代码智能。

---

## L4: Plugin——一键装全家桶

Plugin 把 Skills、Commands、Agents、Hooks、MCP 配置打包成一个可安装的单元。省去手动创建目录、复制文件的繁琐。

### Claude Code 插件生态

```bash
# Claude Code 插件安装命令
claude plugins install anthropics/claude-code/plugins/frontend-design
claude plugins install obra/superpowers
```

### OpenCode 插件生态（npm 安装，零配置）

OpenCode 的插件通过 npm 分发，在 `opencode.json` 中一行声明即可：

#### everything-opencode（100K+ ⭐）

```jsonc
// opencode.json
{
  "plugin": ["everything-opencode"]
}
```

**装完一键获得：** 16 个 Agent + 25 个 Slash 命令 + 24 个 Skills + 9 套 Rules + 智能 Hooks。

用 `/code-review` 审查代码，`/plan` 生成实现计划，`/tdd` 走测试驱动流程。

#### opencode-power-pack

```jsonc
{
  "plugin": ["opencode-power-pack"]
}
```

Claude Code 11 个官方 Skill 移植到 OpenCode。包括 code-review、security-review、feature-dev、frontend-design 等。

#### open-mem（跨会话持久记忆）

```jsonc
{
  "plugin": ["open-mem"]
}
```

自动捕获 AI 的每一次操作，AI 压缩成结构化观察。下次会话自动注入摘要。**你不会再说"上回我们讨论到哪了"。**

#### opencode-claude-commands（兼容桥）

```jsonc
{
  "plugin": ["opencode-claude-commands"]
}
```

让 OpenCode 直接读取 `.claude/commands/` 和 `.claude/skills/` 目录。**你有 Claude Code 的现有配置？不用迁移，直接复用。**

### 插件速查表

| 插件 | 平台 | 核心价值 | 安装命令 |
|------|------|---------|---------|
| everything-opencode | OpenCode | 全家桶：16 Agent + 25 命令 + 24 Skill | `"plugin": ["everything-opencode"]` |
| everything-claude-code | Claude Code | 同上，28 Agent + 60 命令 + 125 Skill | git clone |
| opencode-power-pack | OpenCode | Claude Code 11 个官方 Skill 移植 | `"plugin": ["opencode-power-pack"]` |
| open-mem | 双平台 | 跨会话持久记忆 | `"plugin": ["open-mem"]` |
| opencode-claude-commands | OpenCode | 复用 Claude Code 命令和 Skill | `"plugin": ["opencode-claude-commands"]` |
| frontend-design | Claude Code | 生产级 UI 生成 | `claude plugins install ...` |

---

## 实战串联：三个场景的完整配置

### 场景 1：从设计稿到上线，一人一 AI

**任务：** Figma 上有个着陆页设计稿，用 Next.js 15 + Tailwind CSS 4 实现，部署到 Vercel。

**需要的工具链：**

```jsonc
// opencode.json（OpenCode 为例，Claude Code 对应 .claude.json 的 mcpServers）
{
  "model": "claude-sonnet-4-5",
  "mcp": {
    "figma": {
      "command": "npx", "args": ["-y", "@anthropic/mcp-figma"],
      "env": { "FIGMA_ACCESS_TOKEN": "figd_xxx" }
    },
    "context7": {
      "command": "npx", "args": ["-y", "@context7/mcp@latest"]
    },
    "playwright": {
      "command": "npx", "args": ["-y", "@playwright/mcp@latest"]
    },
    "vercel": {
      "command": "npx", "args": ["-y", "@vercel/mcp"]
    }
  },
  "plugin": ["opencode-power-pack"]
}
```

**对话流程：**

```text
# Step 1: 读设计稿
/frontend-design 读一下这个 Figma 链接 [url]，确认设计风格，开始实现

# Step 2: AI 自动通过 Context7 拉 Next.js 15 + Tailwind CSS 4 最新文档
# Step 3: AI 生成代码后，自动用 Playwright 打开 localhost:3000 截图验证

# Step 4: 发现不对直接说
"导航栏和设计稿对不上，看 Figma 里 padding 是 24px 不是 16px，改一下"

# Step 5: 部署
"部署到 Vercel，给我预览链接"
```

### 场景 2：全栈项目，前端 + 数据库 + 部署

**任务：** 做一个带用户注册登录的个人博客，Next.js 前端 + Supabase 后端 + Cloudflare 部署。

```jsonc
{
  "mcp": {
    "supabase": {
      "command": "npx", "args": ["-y", "@supabase/mcp"]
    },
    "cloudflare": {
      "command": "npx", "args": ["-y", "@cloudflare/mcp"]
    },
    "playwright": {
      "command": "npx", "args": ["-y", "@playwright/mcp@latest"]
    },
    "context7": {
      "command": "npx", "args": ["-y", "@context7/mcp@latest"]
    },
    "chrome-devtools": {
      "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

**对话流程：**

```text
# Step 1: 架构设计
/feature-dev 用 Next.js 15 + Supabase + Cloudflare 做一个博客应用，
有用户注册、登录、文章 CRUD、评论功能

# Step 2: 后端搭建
AI 通过 Supabase MCP 创建 users 表、posts 表、comments 表，
设置 RLS 策略，配好认证

# Step 3: 前端实现
AI 通过 Context7 拉最新文档，写 Server Components 页面，
Frontend Design skill 把控 UI 质量

# Step 4: 调试
AI 通过 Chrome DevTools MCP 检查网络请求、控制台报错，自动修复

# Step 5: 测试
/webapp-testing 给注册流程写 E2E 测试

# Step 6: 部署
AI 通过 Cloudflare MCP 部署 Pages + Workers
```

### 场景 3：代码审查 + 自动化 PR

**任务：** 审查一个同事的 PR，自动发现问题、生成修复建议。

```jsonc
{
  "mcp": {
    "github": {
      "command": "npx", "args": ["-y", "@anthropic/mcp-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    }
  },
  "plugin": ["opencode-power-pack"]
}
```

```text
# 在 Claude Code / OpenCode 中：
/code-review 审查 PR #42

# AI 自动流程：
# 1. 通过 GitHub MCP 读取 PR diff
# 2. 两个 Agent 独立审查（代码质量 + 安全）
# 3. 交叉验证，过滤误报
# 4. 输出：发现 3 个高优先级问题、5 个建议优化
# 5. 每个问题附复现步骤和修复代码
```

---

## 进阶：几个值得知道的细节

### MCP 太多怎么办？工具搜索模式

装了 10 个 MCP 后，每个 MCP 暴露的工具 schema 都会塞进 AI 的上下文窗口，造成 token 浪费。解决方案：

- **Claude Code：** 用 `MCP Tool Search` 插件，工具按需搜索、懒加载，减少 95% 上下文占用
- **OpenCode：** 用 `opencode-toolbox` 或 `opencode-mcp-tool-search` 插件，只暴露搜索工具，具体工具按需调用

### 跨平台 Skills 复用

OpenCode 原生读取 `.claude/skills/` 目录。你的 skill 维护一份 `SKILL.md`，两个平台自动生效。项目级 skills 覆盖全局级，同名 skill 项目级优先。

### 渐进式披露：Skill 的核心设计模式

一个高质量的 SKILL.md 分三层：
1. **元数据（description）** —— AI 用来判断该不该触发，<500 tokens
2. **主体指令** —— 触发后才加载的详细工作流
3. **参考文件** —— AI 按需读取的补充材料（模板、示例、规范）

**写出好 skill 的关键：** description 要具体到"什么时候用"，而不是笼统的"帮助写代码"。

```yaml
# ❌ 坏例子
description: 帮助前端开发的 skill

# ✅ 好例子
description: 当用户要求创建新的 React 页面组件、使用 Tailwind CSS 实现响应式布局、
或对现有组件做性能优化时使用。包含 React 19 最佳实践和 Tailwind CSS 4 类名参考。
```

### OpenCode 权限控制

通过 `opencode.json` 的 `permission` 字段控制 skill 和工具的访问权限：

```jsonc
{
  "permission": {
    "skill": {
      "*": "allow",           // 所有 skill 允许
      "internal-*": "deny",   // 内部 skill 禁止
      "experimental-*": "ask" // 实验性 skill 询问
    },
    "tool": {
      "browser": "ask",       // 浏览器操作需确认
      "bash": "allow"
    }
  }
}
```

---

## 调试

- **MCP 不生效：** `opencode mcp list` 或 `claude mcp list` 检查连接状态；查看 `mcpServers` 配置中的 command 是否需要 `npx -y`
- **Skill 不触发：** 检查 `SKILL.md` 的 `description` 是否太笼统；确认文件名为 `SKILL.md`（全大写）
- **插件启动慢：** npm 插件指定精确版本号（如 `"opencode-toolbox@1.2.3"`），避免每次解析 `latest`
- **Token 消耗过高：** 检查是否装了太多 MCP 服务器；考虑用工具搜索插件（toolbox / mcp-tool-search）懒加载
- **OpenCode 读不到 Claude Code skills：** 确认 skills 在 `~/.claude/skills/` 或 `.claude/skills/` 下，且 `SKILL.md` 有有效的 `name` 和 `description` frontmatter

---

## 速查

```text
# 前端工程师最小可用配置（OpenCode 版）

## MCP（5 个必装）
playwright       : npx -y @playwright/mcp@latest     # 浏览器自动化
context7         : npx -y @context7/mcp@latest        # API 文档去幻觉
chrome-devtools  : npx -y chrome-devtools-mcp@latest   # 实时调试
github           : npx -y @anthropic/mcp-github        # 代码仓库
vercel           : npx -y @vercel/mcp                  # 部署

## Plugin（1 个全家桶）
opencode-power-pack  # code-review + feature-dev + frontend-design 等 11 个

## Skills（按需加载）
frontend-design      # 高质量 UI 生成
vercel-react-best-practices  # React/Next.js 性能规则

## 工作流
写组件  → /frontend-design + ShadCN MCP + Playwright MCP 截图验证
全栈开发 → /feature-dev + Supabase MCP + Cloudflare MCP
代码审查 → /code-review + GitHub MCP
调试     → Chrome DevTools MCP + Playwright MCP
部署     → Vercel MCP 或 Cloudflare MCP
```

---

*最后更新：2026 年 5 月。工具生态变化快，建议关注 [MCP Radar](https://mcpradar.com)、[ClaudSkills](https://claudskills.com)、[Skills Playground](https://skillsplayground.com) 获取最新动态。*
