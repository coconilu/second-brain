# Claude Code 实战指南：给不爱看文档的你
> 基于 Claude Code 官方 [Best Practices](https://code.claude.com/docs/en/best-practices) 与 [Common Workflows](https://code.claude.com/docs/en/common-workflows) 提炼。
> 面向已经在用 Claude Code，但还没完全发挥它能力的开发者。**5分钟抓心法，随时当手册查。**
---
## 🎯 核心心法（理解它们，剩下都是变奏）
1. **上下文窗口是最宝贵的资源**。每条消息、读的每个文件、每次命令输出都在吃上下文。空间越满，Claude 越笨。**只让有用的信息进入，任务切换时痛快地 `/clear`**。
2. **给 Claude 自我验证的方式**——测试、Lint、截图对比、`tsc --noEmit`……有了客观反馈，它能自己迭代到对，你才有时间摸鱼。
3. **顺序是 Explore → Plan → Code**。先让它读懂上下文，再确认方案，最后再写。改一行的小活（改 typo、加 log）可以直接动手，改多个文件或不熟悉的代码，**一定要先规划**。
---
## 🔄 推荐工作流：标准四步法
```text
Plan Mode 探索 → Plan Mode 出方案 → Normal Mode 实现 → 跑测试 + 提PR
```
| 阶段 | 模式 | 你说的话（示例） |
|---|---|---|
| **Explore** | Plan Mode（`Shift+Tab` 切换） | "读一下 `/src/auth`，搞清楚 session 和登录怎么处理的，顺便看看环境变量里密钥是怎么管的" |
| **Plan** | Plan Mode | "我想加 Google OAuth。要改哪些文件？session 流程是什么？给我一份详细计划" |
| **Implement** | Normal Mode | "按你的计划实现 OAuth 流程，给 callback handler 写测试，跑完测试并修掉失败的" |
| **Commit** | Normal Mode | "用一个有信息量的 commit message 提交，并开一个 PR" |
> 💡 **编辑计划**：plan 出来后按 `Ctrl+G`，会用默认编辑器打开，可以直接润色。
---
## 🛠️ 9 大抄作业级 Prompt（直接拿去改）
### 1. 摸新代码库
```text
1. cd /path/to/project
2. claude
3. "给我这个代码库的整体概览"
4. "讲讲这里用的主要架构模式"
5. "认证是怎么处理的？"
```
### 2. 修 Bug
```text
"跑 npm test 时报错了：<粘贴完整 stack trace>"
"user.ts 里的 @ts-ignore，给我列几种修法"
"按你建议的方案，给 user.ts 加上空值检查"
```
> **把复现命令 + 完整 stack trace 一起喂给它，能省下无数回合。**
### 3. 重构旧代码
```text
"找一下代码库里用到的过期 API"
"给点建议：怎么把 utils.js 重构成用现代 JS 特性"
"用 ES2024 特性重构 utils.js，保持原有行为不变"
"跑一下重构后代码的测试"
```
### 4. 写测试
```text
"找出 NotificationsService.swift 里没被测试覆盖的函数"
"给 notification service 加测试，覆盖边界场景，不要用 mock"
"跑新加的测试，失败的修掉"
```
### 5. 开 PR
```text
"总结一下我对认证模块做的改动"
"开个 PR"
"PR 描述里再补一些关于安全改进的上下文"
```
> 用 `gh pr create` 创建后，会话会自动绑定 PR，下次 `claude --from-pr 123` 直接接回去。
### 6. 写文档
```text
"找出 auth 模块里缺 JSDoc 注释的函数"
"给 auth.js 里没注释的函数补上 JSDoc"
"把生成的文档润色一下，加点上下文和示例"
```
### 7. 处理图片 / 截图
把图拖进窗口、`Ctrl+V` 粘贴、或 `"分析这张图：/path/to/image.png"`。
```text
"这是报错截图，是什么原因？"
"[贴设计稿] 按这个设计实现，完成后截图对比，列出差异并修复"
```
### 8. 用 `@` 精准投喂上下文
```text
"解释一下 @src/utils/auth.js 里的逻辑"
"@src/components 的结构是怎样的？"
```
### 9. 当 Unix 工具用（CI / 脚本里）
```bash
# 管道分析
cat build-error.txt | claude -p '简明地解释这个构建错误的根本原因' > out.txt
# 结构化输出
cat code.py | claude -p '分析这段代码里的 bug' --output-format json > analysis.json
```
---
## ⚙️ 环境配置（一次配好，长期受益）
### 1. CLAUDE.md：项目的持久记忆
运行 `/init` 生成骨架。位置可以是 `./CLAUDE.md`（团队共享）、`./CLAUDE.local.md`（个人，加进 .gitignore）或 `~/.claude/CLAUDE.md`（全局）。
| ✅ 必须写 | ➖ 不要写 |
|---|---|
| Claude 猜不到的 bash 命令 | 看代码就能推出来的内容 |
| 偏离默认的代码风格 / 测试命令 | 详细 API 文档（放链接就行） |
| 仓库礼仪（分支命名、PR 规范） | 频繁变化的信息 / "写干净代码" |
| 容易踩到的 gotcha | 文件级的冗长描述 |
> ⚠️ **文件太长 Claude 会忽略一半**。自检技巧：删掉这行会不会让它犯错？不会就删。重点加 `IMPORTANT:` 前缀。支持 `@docs/git-instructions.md` 导入。
### 2. 权限配置：减少点 Yes 的疲惫
| 方式 | 一句话 | 适用场景 |
|---|---|---|
| **Auto mode** | 分类器把关，只拦危险动作 | 日常大多数任务，**首选** |
| **Allowlist** | `/permissions` 把 `npm run lint` 等加白 | 反复使用的安全命令 |
| **Sandbox** | `/sandbox` 启用 OS 级隔离 | 需要更大自由度又想兜底 |
```bash
# 用 auto mode 跑
claude --permission-mode auto -p "fix all lint errors"
```
### 3. 给 Claude 装上更多翅膀
| 工具 | 何时用 |
|---|---|
| **CLI 工具**（`gh`, `aws`） | 调外部服务最省 token 的方式，装上就行 |
| **MCP servers** | `claude mcp add` 接 Notion、Figma、数据库 |
| **Hooks** | **确定性触发**（如 edit 后自动跑 eslint，阻止写入 migrations） |
| **Skills** | **按需加载**的领域知识，放在 `.claude/skills/<name>/SKILL.md` |
---
## 🚀 进阶玩法：规模化与隔离
### Subagents：保护主对话的上下文
研究任务委托给子代理，它们在**独立上下文**里跑，只返回摘要。
```text
"用 subagent 调查我们的认证系统如何处理 token 刷新，有没有现成 OAuth 工具"
```
### Git Worktrees：多个 Claude 互不干扰
```bash
claude --worktree feature-auth
claude --worktree bugfix-123
```
记得把 `.claude/worktrees/` 加到 `.gitignore`。
### Fan Out：跨文件批量执行
```bash
for file in $(cat files.txt); do
  claude -p "把 $file 从 React 迁移到 Vue。返回 OK 或 FAIL。" \
  --allowedTools "Edit,Bash(git commit *)"
done
```
> **先在 2-3 个文件上测试 prompt，再全量跑！**
### Writer / Reviewer 模式
| Session A (Writer) | Session B (Reviewer) |
|---|---|
| "实现 API 限流中间件" | |
| | "Review @src/middleware/rateLimiter.ts 的限流实现，找边界情况、竞态条件" |
| "处理 review 反馈：[B 的输出]" | |
---
## 🧹 会话与上下文管理
### 跑偏了怎么办
- **`Esc`**：立刻打断，上下文保留。
- **`Esc + Esc` / `/rewind`**：打开回退菜单，恢复之前的对话和代码状态。
- **纠正 2 次还不对？** 上下文已被污染，`/clear` 重写更具体的 prompt 重新开始。
### 上下文清理
- `/clear`：任务切换时**必用**，重置上下文。
- `/compact 聚焦 API 变更`：手动压缩，保留指定重点。
- `/btw 这个函数干嘛的`：弹层问答，答案不进历史，极其省上下文。
### 恢复会话
```bash
claude --continue          # 恢复最近的对话
claude --resume            # 从历史会话中选择
claude -n auth-refactor    # 给会话命名
claude --resume auth-refactor # 按名字恢复
```
---
## 🚨 常见反模式（避开这些坑）
| 反模式 | 症状 | 解法 |
|---|---|---|
| **厨房水槽会话** | 一个会话里做不相关任务，上下文充满噪音 | 不同任务之间 `/clear` |
| **反复纠正** | 纠正两三次还是不对 | `/clear`，用更具体的 prompt 重新开始 |
| **CLAUDE.md 膨胀** | 规则太长，Claude 忽略一半 | 无情修剪，能转 Hook 的就转 Hook |
| **信任但不验证** | 代码看起来对，但跑起来没处理边界 | 始终提供验证手段（测试、脚本、截图） |
| **无限探索** | "你研究下…" → 它读了几百个文件 | 限定调查范围，或用 subagent 隔离 |
---
## 📋 速查卡
### 实用快捷键
| 快捷键 | 作用 |
|---|---|
| `Shift+Tab` | 切换模式（Normal → Auto-Accept → Plan） |
| `Esc` | 停止当前动作 |
| `Esc + Esc` | 打开回退菜单 |
| `Ctrl+G` | 在编辑器中打开/编辑计划 |
| `Ctrl+O` | 切换 verbose 模式（查看思考过程） |
| `Alt+T` | 切换 thinking mode |
### 常用命令
```bash
# 启动
claude                              # 正常启动
claude --permission-mode plan       # 直接进 Plan Mode
claude --permission-mode auto       # Auto Mode
claude --worktree feature-x         # 隔离 worktree 启动
# 会话内
/init       # 生成 CLAUDE.md 骨架
/clear      # 清空上下文
/compact    # 压缩上下文
/rewind     # 回退到检查点
/btw        # 侧边快速提问（不入上下文）
/rename X   # 重命名当前会话
```
### 💡 附加：长任务跑后台时叫你一声
往 `~/.claude/settings.json` 加通知 Hook：
```json
{
  "hooks": {
    "Notification": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "osascript -e 'display notification \"Claude 需要你的关注\" with title \"Claude Code\"'"
      }]
    }]
  }
}
```
*(Linux 换 `notify-send`，Windows 用 PowerShell 弹窗)*
