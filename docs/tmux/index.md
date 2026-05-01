# tmux：从一个例子开始

## 一个真实的烦恼

凌晨两点，你 SSH 到服务器排查问题，`tail -f` 正盯着日志，突然 Wi-Fi 断了。重连上去，刚才的 `tail`、`vim`、`htop` 全没了——SSH 断开意味着远程 shell 进程被 kill。你重新打开三个终端窗口，重新 `cd` 到对应目录，重新跑每条命令。

更难受的是，这是**第三次**了。

tmux 能解决这个问题：**让远程程序在 SSH 断开后继续运行，随时重连回来，连窗口布局都不变。**

下面我们从零开始把这件事跑通。

## 第一步：安装

macOS 用 Homebrew 一步到位：

```bash
brew install tmux
```

Linux (Debian/Ubuntu)：

```bash
sudo apt install tmux
```

装完验证：

```bash
tmux -V
# tmux 3.5a
```

> Windows 用户：tmux 是 Unix 工具，不直接运行在 Windows 上。通过 WSL 安装 Ubuntu，然后在 WSL 里 `sudo apt install tmux`，用 Windows Terminal 连接。

## 第二步：创建会话，断开，重连

进到你的项目目录，创建一个命名会话：

```bash
cd ~/my-project
tmux new -s dev
```

你会进入一个看起来"没什么变化"的终端——底部多了一条绿色状态栏。这就是 tmux 里了。

在里面随便做点事：`vim main.ts` 或 `tail -f /var/log/syslog`。

现在模拟"断线"——按 `Ctrl-b` 然后按 `d`（detach 的缩写）。你会回到普通终端，状态栏消失，tmux 退到后台。

但刚才的程序没死。用 `tmux ls` 看一眼：

```bash
tmux ls
# dev: 1 windows (created Wed Apr 29 22:15:00 2026)
```

重新连回去：

```bash
tmux attach -t dev
```

搞定。`vim` 还是那个 `vim`，`tail -f` 还在滚动，什么都没丢。

## 回过头看：刚才发生了什么

整个 tmux 有三层结构，对应三个问题：

```
Session "dev"            ← 你的工作在哪？一个独立的工作空间
  Window 0: editor       ← 做什么？每个窗口像一个"虚拟桌面"
    Pane 0: vim          ← 怎么看？窗口里的每个分屏
    Pane 1: npm test     ←
  Window 1: logs         ← 切到另一个窗口，干另一件事
    Pane 0: tail -f
```

这就是 tmux 的全部模型：**Session × Window × Pane**。

### Session：工作的"边界"

Session 是 tmux 最顶层的容器。把 session 想象成一个**一直活着的终端工作区**——你可以随时"走进来"（attach），也可以随时"走出去"（detach），里面的程序一直运行。

| 命令 | 作用 |
|---|---|
| `tmux new -s <name>` | 创建命名会话 |
| `tmux ls` | 列出所有会话 |
| `tmux attach -t <name>` | 重新连入会话 |
| `tmux kill-session -t <name>` | 删除会话 |

### Window：在 session 里切"虚拟桌面"

一个 session 可以装多个 window。每个 window 占满整个屏幕，互相隔离。类比浏览器的标签页——一个查文档，一个写代码，一个跑测试，互不干扰。

| 快捷键 | 作用 |
|---|---|
| `Ctrl-b c` | 创建新窗口 |
| `Ctrl-b ,` | 重命名当前窗口 |
| `Ctrl-b n` | 下一个窗口 |
| `Ctrl-b p` | 上一个窗口 |
| `Ctrl-b 0~9` | 跳到第 N 个窗口 |

### Pane：把屏幕切成多块

一个 window 可以切分成多个 pane。每个 pane 是独立的 shell，都能跑不同命令。类比 IDE 里的分屏——左边写代码，右边跑终端。

| 快捷键 | 作用 |
|---|---|
| `Ctrl-b %` | 左右分屏 |
| `Ctrl-b "` | 上下分屏 |
| `Ctrl-b 方向键` | 在 pane 之间切换 |
| `Ctrl-b x` | 关闭当前 pane |
| `Ctrl-b Ctrl-方向键` | 调整 pane 大小 |

### 一句收束

所有 tmux 操作都在这个模型里：**找到 session → 进入窗口 → 切分面板 → 干活 → detach 走人**。

## 第二个例子：开发中的多面板工位

例 1 只解决了"断线不丢"的问题。现在引入对比维度——**用一个 tmux session 把开发时需要的所有命令行整合到一个窗口里**。

场景：你在写一个 Node.js 后端，日常需要同时看四个东西：
- vim 编辑器
- `npm run dev` 的开发服务器
- `npm test -- --watch` 的测试监视
- 一个随时可用的 git 命令行

不用 tmux：四个终端标签页，来回切，切多了就搞混哪个是哪个。

用 tmux 做到"一眼尽收"。创建脚本 `~/dev-layout.sh`：

```bash
#!/bin/bash
tmux new -s backend -d

# 左右分屏：左半给 vim，右半给 dev server
tmux split-window -h -t backend:0
# 向刚创建的右 pane（编号 1）发命令
tmux send-keys -t backend:0.1 'npm run dev' Enter

# 左边上下分屏：上半 vim 不动，下半跑测试
tmux split-window -v -t backend:0.0
tmux send-keys -t backend:0.1 'npm test -- --watch' Enter

# 右下再切一块给 git
tmux split-window -v -t backend:0.2
# 此时右下 pane 的编号是 3
tmux send-keys -t backend:0.3 'git status' Enter

tmux attach -t backend
```

执行 `bash ~/dev-layout.sh`，你会看到：

```
┌─────────────────────┬─────────────────────┐
│ Pane 0: vim         │ Pane 1: npm run dev │
│ （主编辑区）          │ （开发服务器输出）     │
├─────────────────────┼─────────────────────┤
│ Pane 2: npm test    │ Pane 3: git shell   │
│ （测试监视）          │ （随时 git 操作）     │
└─────────────────────┴─────────────────────┘
```

`Ctrl-b 方向键` 在四个 pane 之间走动。Vim 里改一行代码，右边 dev server 自动重载，下面测试自动跑——全在同一屏上。

如果 session 还在后台跑着，`tmux attach -t backend` 回来后布局完好；结束工作时 `Ctrl-b d` 脱离即可。

> 这个脚本演示的是 tmux 的脚本化能力——布局不需要每次都手动切。你可以为不同项目各保存一份布局脚本。

### 单窗口 vs tmux 多面板

| 维度 | 四个终端标签页 | tmux 多面板 |
|------|--------------|------------|
| 屏幕利用 | 同时只能看一个 | 四块同屏，尽收眼底 |
| 断线恢复 | 全部丢失 | 布局 + 进程都在 |
| 复制粘贴 | 需要鼠标选中 | `Ctrl-b [` 进入复制模式，键盘操作 |
| 脚本化 | 做不到 | 布局脚本一行 `bash` 搞定 |
| 启动速度 | 手动打开四个标签 | 一行脚本，秒开 |

## 第三个例子：用 tmux 搭建 Agent-team 驾驶舱

前两个例子是 tmux 自身的用法。第三个例子拓宽到一个完全不同的维度：**用 tmux 编排多个 Claude Code agent session，搭一面实时监控墙**。

### 为什么需要驾驶舱

Agent-team 模式下，你同时跑着 3-5 个 teammate——lead 派任务、teammate-A 查日志、teammate-B 读代码、teammate-C 写测试。每个 teammate 是独立的 Claude Code session，有自己的 context window。

最大的风险不是 token 消耗，而是 **"指挥不当"——一个 teammate 朝错误方向跑了两小时，而你在另一个 tab 里完全没看见**。等你切回来看，它已经烧掉几万个 token 了。

用 tmux 把每个 teammate 放到一个独立 pane 里，一眼扫过去就知道谁在产出、谁卡住了、谁跑偏了。

### 搭一面 Agent-team 墙壁

先确保 agent-team 实验模式已开启：

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

建一个脚本 `~/agent-cockpit.sh`：

```bash
#!/bin/bash
PROJECT_DIR="$HOME/my-project"
SESSION="agent-team"

# 创建 session，第一个窗口给 lead
tmux new -s "$SESSION" -c "$PROJECT_DIR" -d
tmux rename-window -t "$SESSION":0 "lead"
tmux send-keys -t "$SESSION":0 'claude' Enter

# 新建窗口，切分为 3 个 pane，每个跑一个 teammate
tmux new-window -t "$SESSION" -n "teammates"

# 先上下分屏：下半给 teammate-C
tmux split-window -v -t "$SESSION":1
tmux send-keys -t "$SESSION":1.1 'cd '"$PROJECT_DIR"' && claude' Enter

# 上半再左右分屏：左 teammate-A，右 teammate-B
tmux split-window -h -t "$SESSION":1.0
tmux send-keys -t "$SESSION":1.0 'cd '"$PROJECT_DIR"' && claude' Enter
tmux send-keys -t "$SESSION":1.1 'cd '"$PROJECT_DIR"' && claude' Enter

tmux select-layout -t "$SESSION":1 tiled
tmux attach -t "$SESSION"
```

跑完 `bash ~/agent-cockpit.sh`，你看到的是：

```
Window 0: "lead" — 主指挥官，负责派任务、收结论
┌──────────────────────────────────────────────────┐
│ lead                                             │
│ $ claude                                         │
│ > 派 3 个 teammate 并行调查偶发 500 错误…         │
└──────────────────────────────────────────────────┘

Window 1: "teammates" — 三个 worker 的实时动态
┌───────────────────────┬──────────────────────────┐
│ teammate-A (DB 连接池)  │ teammate-B (上游超时)      │
│ $ claude               │ $ claude                  │
│ > 检查连接池配置…        │ > 抓取上游响应时间…        │
├───────────────────────┴──────────────────────────┤
│ teammate-C (缓存踩踏)                              │
│ $ claude                                          │
│ > 分析 Redis 命中率…                               │
└──────────────────────────────────────────────────┘
```

### 驾驶舱的操作节奏

1. **在 lead 窗口**（`Ctrl-b 0`）下指令，用自然语言派任务，指定每个 teammate 做什么、输出什么格式。
2. **切换到 teammates 窗口**（`Ctrl-b 1`），用 `Ctrl-b 方向键` 在三个 pane 之间扫视：
   - 哪个 pane 几分钟没输出新内容 → 可能卡住了，切进去追问
   - 哪个 pane 滚动速度明显偏快 → 大概率在读代码贴代码，警告一下"只要摘要"
   - 哪个 pane 已经出了结论 → 切进去让 teammate 通过 `SendMessage` 发给 lead
3. **回到 lead 窗口**收汇总。teammate 发来的消息会出现在 lead 的对话里，格式统一，lead 综合输出最终结论。

这个工作流的价值不在"看着 AI 干活的快感"，而在 **纠偏按分钟计、不按小时计**。

### 进阶：给驾驶舱配上"监控自动化"

纯靠人眼扫屏还是累。可以用 `tmux capture-pane` 做基础监控——写一个脚本定时抓每个 pane 的最后几行，用 grep 检测关键信号：

```bash
#!/bin/bash
# ~/agent-monitor.sh —— 每 30 秒扫一遍所有 teammate pane

check_pane() {
  local pane="$1"
  local name="$2"
  local last_line=$(tmux capture-pane -t "$pane" -p | tail -5)

  if echo "$last_line" | grep -q "Error\|Failed\|blocked"; then
    echo "$(date): [$name] 检测到异常信号"
    echo "$last_line"
  fi
}

# lead session 命名为 "agent-team"
check_pane "agent-team:1.0" "teammate-DB"
check_pane "agent-team:1.1" "teammate-HTTP"
check_pane "agent-team:1.2" "teammate-Cache"
```

把这个脚本挂到定时任务或另一个 tmux pane 里跑，异常出现时你能第一时间看到，不需要瞪着眼睛盯每一个 pane。

> `tmux capture-pane -t <target> -p` 抓取指定 pane 的文本内容。更多抓取参数（起止行、历史缓冲区）见 `man tmux`。

### 驾驶舱 vs 单终端窗口：一表对比

| 维度 | 多个终端窗口 | tmux 驾驶舱 |
|------|-----------|------------|
| 实时可见 | 每次只能看一个 teammate | 3-5 个同屏，一眼扫尽 |
| 切换成本 | Alt-Tab / 鼠标点，打断心流 | `Ctrl-b 方向键`，低摩擦 |
| 断网恢复 | 所有 session 丢失 | 一个 `tmux attach` 全部回来 |
| 布局复用 | 每次手动排列 | 脚本一键重建 |
| 程序化监控 | 做不到 | `capture-pane` 可抓取文本做自动化检查 |
| Token 浪费风险 | 高——没人盯着的 teammate 可能跑偏两小时 | 低——偏航分钟级被发现 |

## tmux 的输入和输出

tmux 有两套交互界面：**快捷键**（在 tmux 里用）和**命令行**（在普通 shell 里用）。

### 命令行接口

所有 tmux 操作都可以从普通 shell 触发，不需要先进入 tmux：

| 命令格式 | 用途 | 例子 |
|---|---|---|
| `tmux new -s <name>` | 创建会话 | `tmux new -s dev` |
| `tmux attach -t <name>` | 接入已有会话 | `tmux attach -t dev` |
| `tmux ls` | 列出会话 | `tmux ls` |
| `tmux kill-session -t <name>` | 删除会话 | `tmux kill-session -t old-project` |
| `tmux send-keys -t <target> <keys>` | 向 pane 发送按键 | `tmux send-keys -t dev:0.1 'npm test' Enter` |
| `tmux capture-pane -t <target> -p` | 抓取 pane 文本 | `tmux capture-pane -t dev:0.0 -p` |
| `tmux split-window -h -t <target>` | 水平分屏 | `tmux split-window -h -t dev:0` |

### 快捷键（默认前缀：`Ctrl-b`）

进入 tmux 后，所有快捷键以 `Ctrl-b` 开头（先按 `Ctrl-b`，松开，再按下一个键）：

| 快捷键 | 类别 | 作用 |
|---|---|---|
| `Ctrl-b d` | 会话 | detach，脱离当前会话 |
| `Ctrl-b $` | 会话 | 重命名当前会话 |
| `Ctrl-b s` | 会话 | 列出所有会话，可切换 |
| `Ctrl-b c` | 窗口 | 创建新窗口 |
| `Ctrl-b ,` | 窗口 | 重命名当前窗口 |
| `Ctrl-b n` / `p` | 窗口 | 下一个 / 上一个窗口 |
| `Ctrl-b 0~9` | 窗口 | 跳到第 N 个窗口 |
| `Ctrl-b &` | 窗口 | 关闭当前窗口（需确认） |
| `Ctrl-b %` | 面板 | 左右分屏 |
| `Ctrl-b "` | 面板 | 上下分屏 |
| `Ctrl-b 方向键` | 面板 | 在面板间切换 |
| `Ctrl-b x` | 面板 | 关闭当前面板（需确认） |
| `Ctrl-b Ctrl-方向键` | 面板 | 调整面板大小 |
| `Ctrl-b z` | 面板 | 当前面板全屏 / 还原 |
| `Ctrl-b {` / `}` | 面板 | 面板左右互换位置 |
| `Ctrl-b Space` | 面板 | 循环切换布局样式 |
| `Ctrl-b [` | 其他 | 进入滚动 / 复制模式（`q` 退出） |
| `Ctrl-b ?` | 其他 | 查看所有快捷键 |

### tmux 命令模式

在 tmux 里按 `Ctrl-b :` 进入命令模式，可以输入任何 tmux 命令（不用加 `tmux` 前缀）：

```
Ctrl-b :
:new-window -n logs
:split-window -h
:resize-pane -L 10
```

> 所有在 shell 里 `tmux xxx` 的命令，在命令模式里去掉 `tmux` 直接用。适合快捷键记不住或需要加参数的操作。

## 配置放在哪

tmux 的配置只有一个文件：

| 路径 | 作用域 | 是否进 Git |
|------|--------|-----------|
| `~/.tmux.conf` | 当前用户，所有会话 | 可以（用 dotfiles 仓库管理） |
| `~/.config/tmux/tmux.conf` | 同上（XDG 风格） | 可以 |

如果两个文件都存在，tmux 优先读 `~/.tmux.conf`。

**经验法则**：`.tmux.conf` 放通用配置（键位、外观、鼠标）。**不要在这里写项目特定的会话脚本**——那些放各自的 `~/project-layout.sh` 里，只跟项目走。

## 进阶：几个值得知道的细节

### 鼠标支持

默认情况下 tmux 支持鼠标点击切换 pane 和拖拽调整分隔线。如果没有，在 `~/.tmux.conf` 里加：

```
set -g mouse on
```

加了之后：鼠标滚轮翻历史输出、左键点 pane 切换焦点、拖拽分隔条调整大小。

### 把前缀改成更顺手的键

`Ctrl-b` 对很多人来说手指跨度大。改成 `Ctrl-a`（GNU Screen 用户熟悉这个）或反引号 `` ` ``（伸手即得）：

```
# ~/.tmux.conf
set -g prefix C-a
unbind C-b
bind C-a send-prefix
```

改完之后，本文所有 `Ctrl-b` 换成你的新前缀。

### 复制粘贴（不依赖鼠标）

tmux 有内置的复制模式，完全键盘操作：

1. `Ctrl-b [` 进入复制模式
2. 方向键移动光标到起始位置
3. `Ctrl-Space` 开始选中（v3.4+；老版本用 `Space`）
4. 方向键选中区域
5. `Enter` 复制并退出
6. `Ctrl-b ]` 粘贴

如果想把 tmux 里复制的内容同步到系统剪贴板，需要装 `reattach-to-user-namespace`（macOS）或 `xclip`（Linux）：

```
# macOS: ~/.tmux.conf
bind -T copy-mode-vi Enter send-keys -X copy-pipe-and-cancel "pbcopy"

# Linux: ~/.tmux.conf
bind -T copy-mode-vi Enter send-keys -X copy-pipe-and-cancel "xclip -selection clipboard"
```

### 嵌套 tmux：在一个 tmux 里连到另一台机器上的 tmux

场景：本地开了 tmux，SSH 到服务器上也开了 tmux。两个 `Ctrl-b` 冲突。

解法：把内层 tmux 的前缀按键发给外层，按两次 `Ctrl-b`：

```
bind -T prefix C-b send-keys C-b
```

第一次 `Ctrl-b` 被外层捕获，第二次 `Ctrl-b` 作为普通按键发给内层。

### 列出所有 pane 并做批量操作

```bash
# 列出当前 session 所有 pane 的 ID 和路径
tmux list-panes -t dev -F "#{pane_id} #{pane_current_path}"

# 向所有 pane 发送同一条命令
tmux list-panes -t dev -F "#{pane_id}" | xargs -I {} tmux send-keys -t {} 'echo hello' Enter
```

这在 agent-team 驾驶舱里尤其有用——比如你想让 3 个 teammate 同时切换到同一分支，一个命令搞定。

## 调试

- `tmux ls` — 最基础的排错命令。如果 attach 失败，先看会话是不是还在
- `tmux info` — 查看当前 tmux 服务器信息（版本、socket 路径、活跃 session 数）
- `tmux show-options -g` — 查看所有全局配置，确认你的 `.tmux.conf` 改动是否生效
- 快捷键没反应：八成是前缀冲突或被其他终端快捷键拦截了。用 `tmux show-options -g | grep prefix` 确认当前前缀
- `Ctrl-b :` 然后输入 `display-message "hello"` 验证前缀是否正常工作
- 配置文件改了没生效：`tmux source-file ~/.tmux.conf` 手动加载，或者在 tmux 里 `Ctrl-b :` 然后 `source-file ~/.tmux.conf`

## 速查

```
# 会话
tmux new -s <name>          # 新建命名会话
tmux attach -t <name>       # 重连会话
tmux ls                     # 列出会话
Ctrl-b d                    # 脱离当前会话

# 窗口
Ctrl-b c                    # 新建窗口
Ctrl-b 0~9                  # 跳到第 N 个窗口
Ctrl-b ,                    # 重命名窗口

# 面板
Ctrl-b %                    # 左右分屏
Ctrl-b "                    # 上下分屏
Ctrl-b 方向键                # 切换面板
Ctrl-b z                    # 全屏 / 还原
Ctrl-b x                    # 关闭面板

# 复制粘贴
Ctrl-b [  → 方向键 → Space  → 方向键选中 → Enter 复制
Ctrl-b ]                    # 粘贴

# Agent-team 驾驶舱
tmux send-keys -t <pane> 'command' Enter   # 远程向 pane 发命令
tmux capture-pane -t <pane> -p             # 抓取 pane 文本内容

# .tmux.conf 必加
set -g mouse on             # 鼠标支持
set -g prefix C-a           # 改前缀（可选）
```
