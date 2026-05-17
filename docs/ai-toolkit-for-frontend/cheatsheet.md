# 前端 AI 工具速查手册

> Claude Code / OpenCode · 2026 年 5 月 · 收藏即用

---

## 四层模型一图懂

```
L4  Skills    "怎么做" → Markdown 指令文件，零依赖
L3  Agent     "谁来做" → Claude Code / OpenCode
L2  Plugin    "一键装" → Skills+Commands+Hooks 全家桶
L1  MCP       "手在哪" → 连接外部工具的标准化协议
```

| 你要… | 先看 | 原因 |
|--------|------|------|
| 连接外部服务 | **MCP** | 所有扩展的基础 |
| 标准化工作流 | **Skill** | 轻量 Markdown，零运行时 |
| 一键装整套 | **Plugin** | 打包 MCP+Skill+Hook |
| 换模型/平台 | **Agent** | Claude Code ↔ OpenCode |

---

## MCP 服务器速查

### 设计 → 代码

| MCP | 安装命令 | 场景 |
|-----|---------|------|
| Figma | `npx -y @anthropic/mcp-figma` | 读设计稿属性，精确还原 |
| ShadCN | `npx -y @shadcn/mcp` | 生成 React+Tailwind 组件 |
| ReactBits | `npx -y @reactbits/mcp` | 135+ 动画组件参考 |
| 21st.dev | `npx -y @21st-dev/mcp` | 百万级组件库 |

### 浏览器 & 调试

| MCP | 安装命令 | 场景 |
|-----|---------|------|
| Playwright | `npx -y @playwright/mcp@latest` | 无头浏览器：截图、表单、点击 |
| Chrome DevTools | `npx -y chrome-devtools-mcp@latest` | Google 官方：实时 DOM/网络/性能 |
| Puppeteer | `npx -y @anthropic/mcp-puppeteer` | Playwright 替代方案 |

### 文档 & 上下文

| MCP | 安装命令 | 场景 |
|-----|---------|------|
| Context7 | `npx -y @context7/mcp@latest` | #1 MCP：注入最新版本文档，消除幻觉 |
| Fetch | `npx -y @anthropic/mcp-fetch` | 网页→Markdown |
| Brave Search | `npx -y @anthropic/mcp-brave-search` | 联网搜索 |
| DeepWiki | 远程 | 代码库智能文档 |

### 部署 & 后端

| MCP | 安装命令 | 场景 |
|-----|---------|------|
| Vercel | `npx -y @vercel/mcp` | 一键部署+预览 |
| Cloudflare | `npx -y @cloudflare/mcp` | Workers/Pages/KV/R2 |
| Supabase | `npx -y @supabase/mcp` | 认证+数据库+存储 |
| Neon | `npx -y @neon/mcp` | Serverless Postgres |

### 效率工具

| MCP | 安装命令 | 场景 |
|-----|---------|------|
| GitHub | `npx -y @anthropic/mcp-github` | PR/Issue/代码搜索 |
| Sequential Thinking | `npx -y @anthropic/mcp-sequential-thinking` | 强制分步推理 |
| Memory | `npx -y @anthropic/mcp-memory` | 知识图谱记忆 |
| Notion | `npx -y @anthropic/mcp-notion` | 读写 Notion 文档 |

---

## Skills 速查

### Claude Code 安装方式

```bash
# 方式 1：git clone
git clone <repo> ~/.claude/skills/<skill-name>

# 方式 2：claude 命令
claude install-skill <url>

# 方式 3：手动
mkdir -p ~/.claude/skills/<name>/ && cp SKILL.md 到该目录
```

### OpenCode 安装方式

```bash
# 方式 1：复用 Claude Code skills（自动读取）
cp -r ~/.claude/skills/<name> ~/.config/opencode/skills/

# 方式 2：项目级
mkdir -p .opencode/skills/<name>/ && cp SKILL.md 到该目录

# 方式 3：通过 Plugin（推荐）
# opencode.json → "plugin": ["opencode-power-pack"]
```

### 前端必装

| Skill | 触发场景 | 获取 |
|-------|---------|------|
| frontend-design | 生成 UI 组件、页面 | Anthropic 官方 plugin |
| vercel-react-best-practices | React/Next.js 开发 | vercel/react-best-practices |
| cloudflare | Workers/Pages/D1 开发 | Cloudflare 官方 |
| webapp-testing | 写 E2E 测试 | Anthropic 官方 plugin |
| feature-dev | 从需求到交付 | Anthropic 官方 plugin |
| code-review | PR 审查 | Anthropic 官方 plugin |
| security-review | 安全审计 | Anthropic 官方 |
| superpowers | 完整工程纪律 | obra/superpowers |
| impeccable | UI 设计审查 | pbakaus/impeccable |

---

## Plugin 速查

### OpenCode Plugin（npm 安装，在 opencode.json 中配置）

| Plugin | 安装 | 一句话 |
|--------|------|--------|
| everything-opencode | `"plugin": ["everything-opencode"]` | 全家桶：16 Agent+25 命令+24 Skill |
| opencode-power-pack | `"plugin": ["opencode-power-pack"]` | Claude Code 11 个官方 Skill 移植 |
| open-mem | `"plugin": ["open-mem"]` | 跨会话持久记忆 |
| opencode-claude-commands | `"plugin": ["opencode-claude-commands"]` | 复用 .claude/ 命令和 skills |
| opencode-toolbox | `"plugin": ["opencode-toolbox@1.x"]` | MCP 工具懒加载，省 token |
| opencode-skill-creator | `"plugin": ["opencode-skill-creator"]` | 创建+测试+优化 Skills |
| opencode-helicone-session | `"plugin": ["opencode-helicone-session"]` | 用量监控 |
| opencode-wakatime | `"plugin": ["opencode-wakatime"]` | 编码时长统计 |

### Claude Code Plugin

| Plugin | 安装 | 一句话 |
|--------|------|--------|
| frontend-design | `claude plugins install anthropics/...` | 96K+ 安装，生产级 UI |
| feature-dev | 同上 | 7 阶段功能开发 |
| pr-review-toolkit | 同上 | PR 审查工具包 |
| commit-commands | 同上 | Git 工作流自动化 |
| superpowers | `git clone obra/superpowers` | 完整方法论框架 |

---

## Claude Code vs OpenCode 选型

| 维度 | Claude Code | OpenCode |
|------|------------|----------|
| 模型 | Claude 系列 | **75+ 厂商**，含本地 Ollama |
| 价格 | $20/月起 | **免费**，API 费自付 |
| Skills | 60K+ 社区贡献 | 兼容 Claude Code 格式 |
| Hooks | 8 事件 | **20+ 事件**（插件更灵活） |
| LSP | ❌ | ✅ 实时代码智能 |
| 多 Agent | 子代理并行 | 原生多会话并行 |
| 隐私 | 代码经 API | 支持**本地模型零泄露** |
| 前段优势 | UI 质量高 | 模型自由切换 |

**推荐组合：** Claude Code（主力开发）+ OpenCode（换模型对比 / 本地模型省钱 / LSP 代码智能）

---

## 最小可用配置（复制即用）

### OpenCode 版（opencode.json）

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "claude-sonnet-4-5",
  "mcp": {
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "context7": { "command": "npx", "args": ["-y", "@context7/mcp@latest"] },
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] },
    "github": {
      "command": "npx", "args": ["-y", "@anthropic/mcp-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    },
    "vercel": { "command": "npx", "args": ["-y", "@vercel/mcp"] }
  },
  "plugin": ["opencode-power-pack"],
  "permission": { "skill": { "*": "allow" } }
}
```

### Claude Code 版（.claude.json 或 settings.json）

```json
{
  "mcpServers": {
    "playwright": { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "context7": { "command": "npx", "args": ["-y", "@context7/mcp@latest"] },
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] },
    "github": {
      "command": "npx", "args": ["-y", "@anthropic/mcp-github"],
      "env": { "GITHUB_TOKEN": "ghp_xxx" }
    },
    "vercel": { "command": "npx", "args": ["-y", "@vercel/mcp"] }
  }
}
```

---

## 场景 → 工具速查

| 场景 | MCP | Skill | Plugin |
|------|-----|-------|--------|
| 设计稿→代码 | Figma + ShadCN | frontend-design | opencode-power-pack |
| 组件开发 | ShadCN + ReactBits | frontend-design | — |
| 全栈项目 | Supabase + Cloudflare | feature-dev + cloudflare | everything-opencode |
| 调试样式 | Chrome DevTools + Playwright | — | — |
| 写测试 | Playwright | webapp-testing | — |
| PR 审查 | GitHub | code-review | opencode-power-pack |
| 部署上线 | Vercel / Cloudflare | — | — |
| 技术调研 | Context7 + Brave Search + Fetch | — | — |
| UI 审查 | Playwright（截图） | impeccable | — |
| 学习新库 | Context7 | — | — |

---

## 调试速查

```bash
# MCP 状态检查
opencode mcp list        # OpenCode
claude mcp list          # Claude Code

# Skills 列表
ls ~/.config/opencode/skills/   # OpenCode 全局
ls .opencode/skills/            # OpenCode 项目
ls ~/.claude/skills/            # Claude Code 全局

# 插件验证
opencode plugin list     # OpenCode（如果支持）

# 常见坑
# 1. SKILL.md 没有 name/description → 不会被发现
# 2. MCP command 忘了 -y → npx 交互式确认卡住
# 3. npm 插件不写版本号 → 每次启动重新解析 latest
# 4. MCP 太多 → 上下文窗口爆炸，用 toolbox 懒加载
```

---

## 资源索引

| 资源 | 链接 | 用途 |
|------|------|------|
| MCP Radar | mcpradar.com | MCP 服务器搜索引擎，1500+ |
| FastMCP | fastmcp.me | 最大 MCP 注册表，1,800+ |
| MCP Directory | mcpdirectory.app | 2,500+ MCP + Skills |
| ClaudSkills | claudskills.com | 62,000+ Skills 目录 |
| Skills Playground | skillsplayground.com | 8,600+ Skills + 5,000+ MCP |
| Anthropic 官方 Skills | github.com/anthropics/skills | 官方参考实现 |
| MCP 官方服务器 | github.com/modelcontextprotocol/servers | 官方+社区 MCP |
| OpenCode 文档 | opencode.ai/docs | OpenCode 完整文档 |
| OpenCode Guide | opencodeguide.com | 社区文档 |

---

*手册更新：2026 年 5 月 · 工具生态变化快，建议每月复查*
