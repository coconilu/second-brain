# 像 Git 一样思考你的 Claude Code 会话

## 前言

大多数人第一次打开 Claude Code，把它当成终端里的 ChatGPT：问一句、答一句、关掉。

但用了一阵子你会发现：它退出后能 `-c` 回来，它能 `/rewind` 撤回刚才的对话，它能 `--fork-session` 像分支一样复制一条会话，它有 `--worktree` 跟 git 直接打通。这些不是孤立的功能——背后是一套经过设计的**会话机制**。

理解这套机制，你在日常开发中就能从「跟 AI 聊天」升级到「管理 AI 的工作线」。

## 一、Session 的最小心智模型

一个 session 就是一段**可命名、可持久化、可分支的对话线**。

具体来说：

- 每个 session 有唯一 ID,对应一个 JSONL 文件,存在 `~/.claude/projects/` 下
- 你和 Claude 的每一轮消息、每一次工具调用、每一个结果,都以追加(append-only)方式写入这个文件
- Session 绑定当前工作目录——Claude Code 把对话和项目视为一体
- 在 Claude 编辑文件之前,它会先给相关文件拍快照(用于后续的 rewind)
- 默认保留 30 天,可配置

最关键的一句话:**session 是一条对话线,不是一次对话窗口的打开。**

你 `Ctrl+D` 退出,隔天 `claude -c` 回来,写新消息——同一个 session、同一个文件、同一条线。只有当你重开 `claude`、敲 `/clear`、或 `/branch` 时,才算新 session。

## 二、从 Git 的视角看它

Claude Code 在很多命名和行为上都借用了 git 的语义。这不是巧合——会话机制的设计就是「把版本控制思想搬到对话历史上」。

| Git 概念 | Claude Code 对应 | 触发方式 |
|---|---|---|
| commit | 每轮对话追加到 JSONL | 自动 |
| checkout 某次 commit | 会话内回溯 | `/rewind` 或 `Esc Esc` |
| branch | fork session | `/branch` 或 `--fork-session` |
| worktree | 原样借用 | `--worktree <名字>` |
| reset | 恢复代码/对话到某个 checkpoint | `/rewind` → Restore |
| log | 列出历史 session | `/resume` 的选择器 |
| checkout <branch> | 恢复指定会话 | `claude --resume <id>` |

熟悉 git 的人会发现,这几乎可以一一对应。`claude --continue --fork-session` 读起来就像 `git checkout HEAD && git checkout -b new-branch`——**在当前位置创建一条新路径,原路径原封不动**。

## 三、但它不是 Git:几个关键差异

类比虽好,把 session 完全按 git 理解会踩坑。差异主要有四点。

### 3.1 历史是线性 append-only,没有 DAG

> **DAG(Directed Acyclic Graph,有向无环图)**:节点之间的连接有方向、且不会形成循环的图结构。Git 的提交历史就是典型的 DAG——每个 commit 指向它的父 commit(有向),不会出现「A 是 B 的祖先,同时 B 又是 A 的祖先」(无环)。merge commit 有两个父节点,这正是 DAG 比线性结构强的地方:**多条路径可以汇合**。

Git 的 commit 图是 DAG,可以 merge。Claude session 的历史则是**纯线性的链表**——每条消息只追加到末尾,每个节点只有一个前驱、一个后继,没有合并操作。

这意味着:**两条 fork 出来的 session 不能合回去。** 如果你 fork 了两条都跑出了有用的东西,你得手动把想要的结论复制出来,不能 `git merge`。

形象地说,git 的历史像一棵可以汇流的河网,而 Claude session 的历史是若干条平行的、永不相交的支流。

### 3.2 Fork 只分叉对话,不分叉文件系统

`--fork-session` 复制的是 JSONL 对话历史。两条 fork 在同一个工作目录里操作时,**改的是同一套文件**。

想让文件也隔离?必须配合 `--worktree`:

```bash
claude --continue --fork-session --worktree try-oauth
```

**Fork 管对话分叉,worktree 管文件分叉,两者正交。** 这个心智模型很重要,两条 fork 不加 worktree 一起跑,很容易互相踩脚。

### 3.3 Rewind 不改写历史

Rewind 容易和 fork 混淆,但本质不同:它是在**当前 session 内**往回倒,不创建新 session。

触发方式:连按两下 `Esc`,或敲 `/rewind`(别名 `/checkpoint`)。弹出当前 session 的 user prompt 列表,选一个点后给五个选项:

| 选项 | 作用 |
|---|---|
| Restore code and conversation | 代码和对话都退回到那个点 |
| Restore conversation | 只退对话,代码保留现状 |
| Restore code | 只退代码,对话保留 |
| Summarize from here | 该点之后的对话压缩为摘要(不改文件) |
| Never mind | 什么都不动 |

其中 "Summarize from here" 是隐藏招数——比 `/compact` 更精准,context 吃紧时尤其管用(详见后文场景三)。

而和 git `reset --hard` 不同,rewind **不会删消息**——它只是在当前状态上「回滚」,原始消息依然留在 transcript 里,Claude 后续还能引用到。所以你可以放心退回去换思路,不用担心丢掉探索细节。

### 3.4 Checkpoint 只追踪 Claude 的编辑工具

这点容易踩坑。Claude 的文件编辑工具(Write/Edit)做的改动,都有 checkpoint 保护,`/rewind` 能退回。但:

- Claude 跑 `rm`、`mv`、`cp` 改的文件**不被跟踪**
- 你自己在编辑器里改的文件**不被跟踪**
- 其他并行 session 改的文件**不被跟踪**

所以它是「session 级别的 undo」,**不替代 git**。Git 管永久历史,session checkpoint 管对话过程中的临时回滚。两层保护,分工明确。

## 四、这套机制能给日常开发带来什么

理解机制只是开始,真正的价值在于——你可以把这些原语组合成新的工作方式。

### 场景一:探索性编程不再焦虑

以前你让 AI 试一个方案,走到一半觉得不对,要么硬着头皮继续,要么全部 rollback 重来。现在:

```
/branch try-redis-cache
```

一行命令,fork 出一条新对话线。在 fork 里折腾 redis 方案,效果不好就回到原 session,原来的思路完整保留。

这是 AI 辅助开发里最反直觉、但最改变习惯的一点:**「保留退路」不再需要心理成本**。你会开始愿意尝试那些「可能没用但值得看看」的方向。

### 场景二:并行跑两种实现(真 A/B)

从同一个起点 fork 两次,配合 worktree,两条 session 各跑一个实现方案:

```bash
# 终端 1
claude --continue --fork-session --worktree impl-a
# 终端 2
claude --continue --fork-session --worktree impl-b
```

两条线共享起点的完整上下文(所以公平对比),但文件完全隔离。跑完各自出一个 PR,人工看谁更好。

这点在架构决策的早期特别有用——不用纸上谈兵,直接让两套方案跑出来看,再拍板。

### 场景三:Context 精准瘦身

长 session 最头疼的是 context 吃满。`/compact` 太粗暴——它会把整条对话都压缩掉,早期的重要约束可能丢。

`/rewind` 有个低调但很强的选项叫 **"Summarize from here"**:选一个中间点,前半保留完整细节,后半压缩成摘要。

典型场景:debug 到一半 context 快满了,但最初的任务描述和架构约束绝对不能丢。从中间 debug 段开始摘要,头部完整保留,空间立马腾出来。

### 场景四:PR 评审时「重新穿上」写代码时的脑子

如果你用 `gh pr create` 从 Claude session 里开 PR,session ID 会自动关联到 PR。几天后评审意见回来,你用:

```bash
claude --from-pr <PR号>
```

写这段代码时 Claude 读过什么文件、权衡过什么 tradeoff、被哪些约束卡过——全回来。这比「自己硬想三天前为什么这么写」省脑子太多,也比在 PR 评论里来回扯皮更高效。

### 场景五:聊着聊着才发现要隔离

这是相对新的能力,很多人不知道。你正在一个 session 里改代码,突然意识到:「糟糕,这些改动应该先隔离到分支里」。不用退出,直接对话框里说:

> 帮我把当前 session 切到一个叫 feature-xxx 的 worktree

Claude 会创建 worktree 并把 session 切过去。对话延续,文件从此开始隔离。这比 `/exit` → `git worktree add` → `cd` → `claude --resume` 顺滑太多。

### 场景六:出错恢复不用重头再来

Claude 理解偏了,改了一堆不对的代码?不用沮丧:

```
Esc Esc
```

选到偏离前的那个 prompt,点 "Restore code and conversation"。代码回到干净状态,对话回到那个节点,原 prompt 还留在输入框里——你可以改一下措辞重新发。

**这比很多人习惯的 `git checkout . && /clear` 要精细得多**——你不是推倒重来,而是回到决策错误的那一步重新选择。

## 五、小结

Claude Code 的会话机制,本质上是把「版本控制思维」带进了人机对话:

- **Append-only 的 JSONL** 让对话可持久化、可追溯
- **Fork** 让你在不确定时保留多条路径
- **Worktree** 让对话和文件各自独立隔离
- **Rewind + Summarize** 让长 session 也能管理得动

熟悉 git 的人学起来几乎零成本——但要记住,它**不是** git:历史不能 merge、fork 不自动隔离文件、bash 改的东西不被 checkpoint。

把这套机制用熟,你会发现自己不是在跟一个 AI 聊天,而是在**并发地指挥多条工作线**。这可能才是 Claude Code 这类工具的真正形态:一个版本化的对话工作空间,而不是一个放大版的聊天框。

---

*参考文档:*

- [Claude Code - Checkpointing](https://code.claude.com/docs/en/checkpointing)
- [Claude Code - How Claude Code works](https://code.claude.com/docs/en/how-claude-code-works)
- [Claude Code - Common workflows](https://code.claude.com/docs/en/common-workflows)
