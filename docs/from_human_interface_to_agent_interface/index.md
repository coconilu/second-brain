# 从 Human Interface 到 Agent Interface

# 从 Human Interface 到 Agent Interface：AI 时代软件行业的范式转移

> **摘要：** 当 AI Agent 从玩具变为生产力工具，软件行业正在经历一场根本性的设计范式转移——核心用户从人类变为 AI Agent。本文系统性地分析这一趋势的底层驱动、技术架构、行业案例与开发者应对策略，全文约 9000 字。

---

## 目录

1. [为什么这是一个值得认真对待的问题](#1-为什么这是一个值得认真对待的问题)
2. [Human Interface 的最后四十年](#2-human-interface-的最后四十年)
3. [Agent Interface：重新定义「谁是你的用户」](#3-agent-interface重新定义谁是你的用户)
4. [基础设施变迁：从 REST 到 MCP 再到 Agent-native 协议](#4-基础设施变迁从-rest-到-mcp-再到-agent-native-协议)
5. [实战模式：设计与实现一个 Agent-first 的 API](#5-实战模式设计与实现一个-agent-first-的-api)
6. [行业案例深度剖析](#6-行业案例深度剖析)
7. [三层生态：能力层、协调层与体验层](#7-三层生态能力层协调层与体验层)
8. [安全性：Agent 时代的权限与信任模型](#8-安全性agent-时代的权限与信任模型)
9. [开发者的新技能树](#9-开发者的新技能树)
10. [创业者窗口：哪些赛道值得做](#10-创业者窗口哪些赛道值得做)
11. [展望：2027 年会是什么样子](#11-展望2027-年会是什么样子)

---

## 1. 为什么这是一个值得认真对待的问题

2025 年 12 月，Sam Altman 在一次内部访谈中说了一句话，当时没太多人注意，但回头看，它像一枚钉子：

> "下一个十年，AI Agent 消耗的 API 调用量将超过人类通过浏览器触发的 HTTP 请求。"

这段话背后有一个更冷酷的推论：**当 Agent 成为你软件的主要消费者时，一套为人类视网膜设计的 GUI 对他的价值为零。**

这不是科幻。我们已经在早期数据中看到信号：

- **Stripe 2025 年 Q4 财报电话会**提到，AI Agent 驱动的 API 调用在 Stripe 总交易量中的占比已超过 8%，且季度环比增长 40%+
- **Zapier** 的 AI Actions 功能上线 6 个月内，Agent 发起的自动化任务数超过人类手动创建的 Zap
- **GitHub Copilot** 在 2026 年初的 Agent Mode 使用量超过了传统的补全模式

这不是边缘趋势。它是一个结构性的迁移。

而它的底层逻辑很简单：**当 AI 推理成本指数级下降、Agent 可靠性持续提升，每一家 SaaS 公司都会面临一个选择——为人类设计，还是为 Agent 设计？** 答案将决定它们的 API 设计哲学、产品架构、甚至商业模型。

---

## 2. Human Interface 的最后四十年

要理解 Agent Interface 的独特性，必须先清楚地界定过去四十年的主流范式到底意味着什么。

### 2.1 基本假设

Human Interface（以下简称 HI）的设计基于一个基本假设：**最终用户是具备视觉感知、逻辑推理与手动操作能力的人类个体。**

这个假设看似理所当然，但它实际上定义了整个软件行业的产品逻辑：

```
人类的交互模式        软件系统的响应
─────────────────────────────────
看到屏幕按钮    →    点击触发事件
阅读菜单列表    →    选择某个操作
填写表单字段    →    提交结构化数据
拖拽视觉元素    →    触发状态变更
```

所有这些交互都依赖于一条默认路径：**人类用眼睛看 → 大脑理解 → 手操作 → 系统响应 → 人类验证结果。**

### 2.2 被 UI 封装的信息

在这个范式下，大部分业务逻辑和信息被封装在 UI 背后。一个典型的 CRUD 应用的架构看起来是这样的：

```
浏览器 / 移动端 App
     ↓ 可视化 UI (HTML + CSS + JS)
API Gateway (认证、限流、路由)
     ↓ 内部 API (REST / GraphQL)
微服务层 (业务逻辑)
     ↓ ORM / Query
数据库
```

注意这里的关键：**外部 API（给客户端用的）是内部 API 的封装和简化，承载了「人类友好」的设计决策**——比如把多个步骤合并成一个端点、省略一些底层字段、做数据格式化。

这种设计对于人类用户是合理的。但对于 Agent，它带来了致命的损耗：**Agent 无法「看到」UI 下的完整信息，你的封装对它来说是黑盒。**

### 2.3 HI 范式的天花板

当软件生态变得庞大时，HI 范式面临三个根本性矛盾：


| 矛盾         | 描述               | 量化影响                                       |
| ---------- | ---------------- | ------------------------------------------ |
| **注意力天花板** | 人类同时使用 SaaS 数量有限 | 平均企业员工使用 16 个 SaaS，但每天活跃切换不超过 5 个          |
| **认知负担**   | 每个工具都需要学习        | 一个中级开发者的工具栈学习周期约 3-6 个月                    |
| **速度瓶颈**   | 人类操作速度远低于机器      | 一个熟练操作员完成跨系统操作约需 2-5 分钟，Agent 可在 5-10 秒内完成 |


注意：**这些不是效率问题，是结构性问题。** 即使 UI 做得再好，人类一天也只有 24 小时、一次只能聚焦一件事、记住快捷键的数量是有限的。

---

## 3. Agent Interface：重新定义「谁是你的用户」

Agent Interface（以下简称 AIF）的转变，最核心的一点是：**把「终端用户」的定义从「人类」扩展到「AI Agent」。**

这个看似微小的语义变化，产生了连锁的结构性影响。

### 3.1 核心设计原则对比

我们先看一个具体的对比，以「创建一个订单」这个基本操作为例：

```
Human Interface:
  ┌─────────────────────────────────────┐
  │ 🛒 新建订单                          │
  │                                     │
  │ 客户姓名: [________________]         │
  │ 商品 SKU:  [______]  [📋 选择]     │
  │ 数量:      [___]                    │
  │ 折扣代码:  [______]  [✅ 验证]      │
  │                                     │
  │ [ 保存草稿 ]  [ 提交订单 ] [ 取消 ] │
  └─────────────────────────────────────┘

Agent Interface:
  POST /api/v2/orders
  {
    "customer_id": "cus_xxx",
    "line_items": [
      {"sku": "SKU001", "qty": 2, "discount_code": "WELCOME10"}
    ],
    "source": "agent:shopping-assistant-v3",
    "idempotency_key": "req_abc123"
  }
```

这不仅仅是接口形式不同，隐藏的设计哲学差异更加深刻：


| 维度       | Human Interface | Agent Interface                |
| -------- | --------------- | ------------------------------ |
| **假设**   | 用户会逐字段填写        | Agent 会构造完整的结构化请求              |
| **错误处理** | 前端校验 + Toast 提示 | 结构化错误码 + 可恢复策略                 |
| **幂等性**  | 不要求——人类不会重复提交   | 必须——Agent 可能因超时重试              |
| **批处理**  | 不支持——人类一次处理一个   | 高优——Agent 能处理千级并发              |
| **速率限制** | 基于 IP/用户维度      | 基于 Agent 身份 + 上下文维度            |
| **返回体**  | 渲染所需的最小字段       | 完整上下文，减少后续查询                   |
| **认证**   | OAuth 2.0 授权码流  | 设备授权流 + API Key + Scope        |
| **文档形式** | 开发者文档 + UI 规范   | OpenAPI Spec + Tool Definition |


### 3.2 AX (Agent Experience)：一个新的设计维度

如果说 UX 是 Human Interface 的「最后一公里」，那么 AX 就是 Agent Interface 的「第一公里」。

**UX 关心的是：** 用户能不能快速找到按钮？动效是否流畅？表单布局是否合理？

**AX 关心的是：** 你的 API 在 Agent 的「推理图」上是否能被准确理解？返回的错误是否包含 Agent 可自主修复的信息？你的 Tool 定义是否能让 Agent 正确推断参数？

AX 的具体指标包括：

#### 3.2.1 发现性（Discoverability）

Agent 如何知道你的服务存在、能做什么？目前的标准路径是：

1. **MCP 服务器注册**：通过 `mcp.json` 定义工具集，Agent 在初始化时加载
2. **OpenAPI Spec 静态分析**：Agent 读取 Spec，提取可调用的端点
3. **Function Calling Schema**：通过模型内建的 tool-use 机制暴露

```
# 一个好的 MCP 工具定义示例
{
  "name": "search_products",
  "description": "根据关键词、品类和价格区间搜索可售商品。
                   返回分页结果，每页最多 50 条。
                   注意：搜索结果按相关度排序，已自动过滤下架商品。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "搜索关键词，支持模糊匹配和 SKU 精确匹配"
      },
      "category": {
        "type": "string",
        "enum": ["electronics", "clothing", "books", "home"],
        "description": "商品品类过滤。不传则搜索全品类。"
      },
      "price_min": { "type": "number" },
      "price_max": { "type": "number" },
      "page": { "type": "integer", "default": 1 },
      "page_size": { "type": "integer", "default": 20, "maximum": 50 }
    },
    "required": ["query"]
  }
}
```

#### 3.2.2 可恢复性（Recoverability）

Agent 遇到错误时，需要足够的信息来做出纠正决策。

```
❌ 不友好的错误响应：
HTTP 400 Bad Request
{
  "error": "Invalid input"
}

✅ Agent 友好的错误响应：
HTTP 422 Unprocessable Entity
{
  "error": {
    "code": "INVALID_PARAMETER",
    "detail": "product_id 'prod_999' does not exist",
    "suggestion": "Check available products via GET /products?limit=10&status=active",
    "parameter": "product_id",
    "provided_value": "prod_999"
  }
}
```

第二个响应让 Agent 能够自主修复：查出可用商品列表，找到正确的 ID 重试。第一个响应只能报错给人类用户。

#### 3.2.3 幂等性（Idempotency）

这是 Agent 世界中最容易被忽视的设计要求。

人类很少会重复提交同一份表单——即使点快了，前端也会做防抖。但 Agent 的场景完全不同：

1. Agent 可能在网络超时后重试，实际上操作已经在服务器端完成
2. 多个子 Agent 并行处理时，可能同时对同一资源发起操作
3. Agent 的状态管理不如人类灵活，容易丢失「已提交」的上下文

**解决方案：幂等键（Idempotency Key）**

```
POST /api/v2/payments
Idempotency-Key: agent-{session_id}-{step_id}-{timestamp}
{
  "amount": 2999,
  "currency": "USD",
  "source": "tok_visa"
}
```

服务器端对同一幂等键的请求只执行一次，重复请求返回第一次的完整结果。

### 3.3 Human in the Loop：一个新的交互模式

Agent Interface 并不意味着完全取消人类的参与。相反，它创造了一个新的交互模式——**Human in the Loop (HitL)**。

在 HitL 模式下，交互流程变为：

```
人类（下达意图）
  │
  ▼
Agent（理解 → 规划 → 执行）
  │         │         │
  │         │         └─ 自动决策（低风险操作）
  │         ├── 需要审批 → 暂停，通知人类
  ▼         
系统反馈结果
  │
  ▼
人类（确认 / 修正意图 → 循环）
```

这个模式对人类来说意味着从「操作者」变为「监督者」：


| 角色    | 旧模式    | 新模式             |
| ----- | ------ | --------------- |
| 人类    | 执行操作   | 发出意图 + 审核关键决策   |
| Agent | 不存在    | 执行操作 + 管理细节     |
| 交互频率  | 每步操作   | 每个关键决策点         |
| 容错机制  | 人类实时纠错 | 检查点 + 回滚 + 审计日志 |


---

## 4. 基础设施变迁：从 REST 到 MCP 再到 Agent-native 协议

API 设计本身并不是一个新话题——RESTful API 已经存在了二十多年，GraphQL 也火了六七年。但 Agent Interface 对 API 基础设施提出了新的要求。

### 4.1 第一代：RESTful API (人类友好)

REST 的设计哲学是「资源导向」：每个 URL 代表一个资源，HTTP 方法代表操作。这对于人类开发者来说是自然的——`GET /users/123` 意思是「看用户 123 的信息」。

但 REST 对 Agent 并不友好：

- URL 和 HTTP 方法的语义对 Agent 来说不够显式
- 错误处理依赖 HTTP 状态码 + 非结构化 body
- 缺少工具级别的上下文约束（什么先决条件必须满足？）
- 大量隐式依赖（比如必须先 `POST /auth/login` 获取 token）

### 4.2 第二代：OpenAI Function Calling (模型层工具定义)

OpenAI 在 2023 年推出的 Function Calling 第一次让模型能**按 Schema 调用工具**。它的核心是做了一层工具定义抽象层：

```json
{
  "type": "function",
  "function": {
    "name": "create_ticket",
    "description": "在 Zendesk 创建一个新的支持工单",
    "parameters": {
      "type": "object",
      "properties": {
        "subject": { "type": "string" },
        "description": { "type": "string" },
        "priority": {
          "type": "string",
          "enum": ["low", "normal", "high", "urgent"]
        }
      },
      "required": ["subject", "description"]
    }
  }
}
```

这是一个重要的里程碑，因为它第一次让 Agent 和工具之间的交互有了一个结构化的契约。但这个模式的局限性也很明显：**工具定义是模型厂商锁定的**，不同模型之间的 Function Calling Schema 不兼容。

### 4.3 第三代：MCP (Model Context Protocol)

2024 年底，Anthropic 推出了 MCP——一个开源的 Agent-tool 交互协议。它在 Function Calling 的基础上做了三件事：

1. **标准化**：定义了一套通用的工具发现、调用与上下文交换协议
2. **去中心化**：任何人都可以搭建 MCP Server，不需要经过平台审核
3. **双向通信**：支持 tools（Agent → 服务）、resources（服务 → Agent）、prompts（模版）三种原语

```
┌──────────────────────┐      MCP Transport        ┌──────────────────────┐
│                      │  (stdio / SSE / Streamable HTTP)                  │
│  AI Agent (Host)     │ ◄─────────────────────────► │  MCP Server (工具)  │
│  ─────────────       │                            │  ──────────────      │
│  • 理解用户意图      │   tools/list               │  • 数据库查询       │
│  • 规划任务路线      │   tools/call               │  • 第三方 API 调用  │
│  • 调用工具执行      │   resources/read            │  • 文件系统操作      │
│  • 综合结果反馈      │   resources/subscribe       │  • 计算任务          │
│                      │   prompts/get               │                      │
└──────────────────────┘                            └──────────────────────┘
```

MCP 的三类原语对应了三种角色：


| 原语            | 方向             | 类比                     | 典型用途           |
| ------------- | -------------- | ---------------------- | -------------- |
| **Tools**     | Agent → Server | POST endpoint          | 执行操作、触发流程、写入数据 |
| **Resources** | Server → Agent | GET endpoint + pub/sub | 读取数据、获取配置、监控变化 |
| **Prompts**   | 双向             | 模版函数                   | 携带上下文的预定义指令    |


### 4.4 MCP 的设计哲学：以 Agent 为中心

MCP 最有趣的地方不是它的技术实现，而是它的设计哲学——**一切设计围绕 Agent 的认知模型展开**。

举个例子，传统的 REST API 中，「列出所有活跃用户」看起来是这样的：

```
GET /api/users?status=active&page=1&limit=20
```

在 MCP 中，工具的 metadata 会告诉 Agent：

```json
{
  "name": "list_active_users",
  "description": "获取当前组织下状态为 active 的用户列表。
                   返回结果包含用户基本信息、角色和最近活跃时间。
                   一次最多返回 50 条记录，超过需要分页。
                   注意：此工具需要 ADMIN 或 MANAGER 角色才能调用。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "page": {
        "type": "integer",
        "default": 1,
        "description": "页码。系统最多缓存 100 页。"
      },
      "page_size": {
        "type": "integer",
        "default": 20,
        "description": "每页数量，建议值 20-50。超过 50 会被截断。"
      },
      "include_inactive": {
        "type": "boolean",
        "default": false,
        "description": "是否同时包含 inactive 用户。设为 true 会返回完整用户列表，响应可能变慢。"
      }
    }
  }
}
```

这里的关键信息是：

- **在 description 中写清楚了调用前提**（需要什么角色）
- **在 description 中写了业务约束**（分页限制、缓存行为）
- **对参数做了「Agent 友好的说明」**：不是简单地写参数类型，而是解释了这个参数的实际影响

这些信息对人类开发者来说可能是「常识」或「写在另一份文档里」，但对 Agent 来说，它们必须内联在工具定义中——因为 Agent 不会像人类一样去「百度一下」。

### 4.5 第四代：Agent-native 协议展望

MCP 还不是终点。目前出现的趋势是 **Agent-to-Agent 协议**——多个 Agent 之间如何通信和协调。

2025 年 Google 推出了 **A2A (Agent-to-Agent)** 协议。A2A 和 MCP 的核心区别是：


|          | MCP                  | A2A               |
| -------- | -------------------- | ----------------- |
| **设计场景** | Agent 调用工具           | Agent 之间协作        |
| **通信模式** | 请求-响应                | 任务卡片 + 流式更新       |
| **状态管理** | 无状态                  | Agent Card 包含状态   |
| **能力发现** | tools/list           | Agent Card 广播     |
| **典型用例** | 一个 Agent 调用 SaaS API | 多个 Agent 协作完成复杂任务 |


```
                  A2A Protocol
     ┌──────────────┴──────────────┐
     │                              │
  Agent A                      Agent B
  (规划 Agent)                  (执行 Agent)
     │                              │
     │  ① 发送 Task Card             │
     │  "请为用户分析 PDF 并生成报告" │
     │                              │
     │                   ② 接收任务  │
     │                   生成子任务   │
     │                              │
     │  ③ 返回进度更新 + 最终结果    │
     │                              │
```

这个方向还处于早期，但方向很清晰：**未来的软件不是单体 Agent，而是由多个专业 Agent 组成的网络。** 每个 Agent 提供一种能力，通过标准协议相互调用。

---

## 5. 实战模式：设计与实现一个 Agent-first 的 API

理论说够了，来看一个具体的实战例子。

假设我们在设计一个「任务管理 SaaS」（类似 Asana/Linear）。传统 HI 设计下的 API 可能是这样的：

```
# 传统设计：Human-first API

GET    /projects                        # 项目列表
GET    /projects/:id                    # 项目详情
POST   /projects                        # 创建项目
PUT    /projects/:id                    # 更新项目
DELETE /projects/:id                    # 删除项目

GET    /projects/:id/tasks              # 任务列表（分页）
POST   /projects/:id/tasks              # 创建任务
PUT    /tasks/:id                       # 更新任务
PATCH  /tasks/:id/status                # 更新任务状态
```

这看起来完全合理——资源清晰、RESTful、可猜到端点。但让我们来看看 Agent 视角下的问题。

### 5.1 问题诊断

一个 Agent 的任务是：「用户说『帮我整理一下下周的 sprint，把 P0 的 bug 都挪到下周，然后给每个 assignee 发个通知』」

在 HI API 设计下，Agent 需要：

1. `GET /tasks?status=open&priority=P0&due_before=2026-05-18` → 找到 P0 且在下周的 bugs
2. 对每个找到的 task：`PATCH /tasks/:id/status` → 移动到「下个 sprint」
3. 对每个 assignee：`POST /notifications`（假设有独立的通知端点）

这是一个典型的 **N+1 问题 × 批量操作的缺失**。

### 5.2 Agent-first 的 API 设计模式

以下是我在实践中总结的六个关键模式：

#### 模式 1：批量操作为一等公民

```
POST /api/v2/tasks/batch-update
{
  "filter": {
    "status": "open",
    "priority": "P0",
    "due_before": "2026-05-18"
  },
  "updates": {
    "status": "next_sprint",
    "sprint_name": "Sprint 23"
  },
  "options": {
    "notify_assignees": true
  }
}
```

这个端点一次性解决了上面的 N+1 问题。注意 **`filter + updates` 模式**代替了传统的 `{id, data}` 模式——因为 Agent 可能不是通过 ID 去定位资源，而是通过条件查询。

#### 模式 2：复合操作（Compound Operations）

Agent 可能需要在一个请求中完成多个关联操作：

```
POST /api/v2/workflows/move-to-sprint
{
  "task_ids": ["task_001", "task_002", "task_003"],
  "target_sprint": "Sprint 23",
  "notify_assignees": true,
  "set_priority": "P1",
  "audit_reason": "Sprint planning rebalance by Agent"
}
}

# 内部实现：
# 1. 验证 task_ids 存在
# 2. 所有 task 在当前 sprint 中
# 3. 批量更新 sprint + priority
# 4. 发送通知
# 5. 记录审计日志
# 6. 如果中间任何一步失败，整体回滚并返回详细的失败原因
```

这个模式牺牲了 RESTful 纯度，但大大减少了 Agent 的推理轮次和延迟。

#### 模式 3：增强的错误信息

上面说过了，但值得再用这个场景展示一次：

```json
{
  "success": false,
  "error": {
    "code": "TASK_NOT_FOUND",
    "message": "以下 task_ids 不存在或当前用户无权限访问：['task_999', 'task_888']",
    "recoverable": true,
    "recovery_action": "调用 GET /tasks?ids=task_001,task_002,task_003 检查可用的 task",
    "partial_result": {
      "updated": ["task_001", "task_002"],
      "already_in_sprint": ["task_003"]
    }
  }
}
```

#### 模式 4：可查询的 Schema/元数据端点

Agent 需要运行时发现能力，而不是靠硬编码：

```
GET /api/v2/meta
{
  "version": "2.1",
  "endpoints": {
    "tasks": {
      "searchable_fields": ["status", "priority", "assignee", "sprint", "due_date"],
      "sortable_fields": ["created_at", "due_date", "priority"],
      "batch_operations": ["update", "delete", "move"],
      "max_batch_size": 200
    },
    "users": {
      "searchable_fields": ["role", "team", "status"],
      "batch_operations": []
    }
  }
}
```

#### 模式 5：流式响应（适用于耗时操作）

Agent 遇到耗时操作时不应该阻塞：

```
POST /api/v2/reports/generate
Accept: text/event-stream

→ event: progress
    data: {"step": "querying", "progress": 20, "eta_seconds": 15}

→ event: progress
    data: {"step": "aggregating", "progress": 60, "eta_seconds": 8}

→ event: complete
    data: {"report_id": "rpt_456", "download_url": "...", "summary": "..."}
```

#### 模式 6：操作执行计划预览（防误操作）

对于风险操作，Agent 应该先「预览」再「执行」：

```
POST /api/v2/tasks/batch-delete-preview
{
  "filter": { "status": "archived", "updated_before": "2025-01-01" }
}

→ {
  "affected_count": 342,
  "sample_tasks": [
    {"id": "task_001", "title": "旧需求 1", "created_at": "2024-03-15"},
    {"id": "task_002", "title": "旧需求 2", "created_at": "2024-05-20"}
  ],
  "estimated_impact": "将永久删除 3 个 sprint 的历史数据"
}
```

然后 Agent 再调用：

```
POST /api/v2/tasks/batch-delete-execute
{
  "preview_token": "prev_abc123",
  "confirm": true
}
```

---

## 6. 行业案例深度剖析

### 6.1 Stripe Agent Toolkit

Stripe 可能是目前在 Agent-first 方面做得最成熟的 SaaS 之一。

2025 年推出的 Stripe Agent Toolkit 本质上是在 Strip 现有 API 之上加了一层 **MCP 工具定义**：

```json
{
  "name": "create_payment_link",
  "description": "创建一个支付链接。用户可以点击链接完成支付。
                   支持一次性产品和订阅。
                   注意：此操作会在 Stripe 上创建 Product 和 Price，
                   需要 merchant 账户状态为 active。",
  "inputSchema": {
    "type": "object",
    "properties": {
      "amount": {
        "type": "integer",
        "description": "金额，单位是分（cents）。USD $10.00 = 1000"
      },
      "currency": {
        "type": "string",
        "default": "usd",
        "description": "ISO 4217 三字货币代码"
      },
      "description": { "type": "string" },
      "metadata": {
        "type": "object",
        "description": "附加元数据，会透传到 Payment Intent"
      },
      "return_url": {
        "type": "string",
        "description": "支付完成后的跳转链接"
      }
    },
    "required": ["amount"]
  }
}
```

**关键洞察**：Stripe 没有为 Agent 新建一个 API 层，而是在现有 API 上包装了 **Agent 友好的工具定义**。工具描述的精细度决定了 Agent 调用的成功率。

### 6.2 Salesforce Agentforce

Salesforce 的 Agentforce 是一个更有意思的案例——因为它面对的是**过度封装**的挑战。

Salesforce 的 SOAP/REST API 极其庞大（超过 1000 个对象、数万个端点），一个 Agent 不可能在上下文中处理所有工具定义。Salesforce 的解决方案是：

1. **动态工具选择**：不把所有端点给 Agent，而是通过 Agent 的推理结果动态加载相关工具
2. **意图到动作的映射**：预定义 200+「AI Action」——每个 Action 是一个复合操作（类似于上文的复合操作模式），直接对应业务意图
3. **数据 Schema 注入**：Agent 可以查询对象 Schema 来理解数据结构，不必在工具定义中硬编码

```
// Agentforce 的 AI Action 示例
// 将多个底层 API 调用封装为一个业务操作
{
  "name": "update_opportunity_stage_with_products",
  "description": "更新商机阶段并同步关联产品行项目的价格和数量。
                   此操作会同时更新 Opportunity 对象和关联的 OpportunityLineItem。
                   如果阶段为 'Closed Won'，会自动触发订单创建流程。",
  "inputSchema": {...}
}

// 内部实现（对 Agent 透明）：
// 1. POST /services/data/v61.0/sobjects/Opportunity/{id}
// 2. GET /services/data/v61.0/sobjects/Opportunity/{id}/OpportunityLineItems
// 3. 验证价格汇总
// 4. 如果 Close Won → 调用 Order creation flow
// 5. 返回统一结果
```

**关键洞察**：当底层 API 粒度太细时，Agent 无法独立推演出正确的组合。**业务级封装 + 动态加载**是更好的策略。

### 6.3 Notion AI 的 API 演变

Notion 的案例展示了一个反向路径：从 HI 到 AIF 的渐进式改造。

Notion 的传统 API（2021 年）是对 UI 操作的直接映射：

```
POST /v1/pages          # 创建页面
PATCH /v1/pages/:id     # 更新页面
POST /v1/comments       # 添加评论
POST /v1/databases/:id/query  # 搜索数据库
```

到 2025 年，Notion 开始为 AI Agent 提供专门的抽象：

```
POST /v1/ai/search-and-embed
  # 语义搜索 + 自动返回匹配的块级内容
  # 替代了：keyword search + manual content fetch

POST /v1/ai/transform-block
  # 让 Agent 修改块结构（合并/拆分/重新排序）
  # 替代了：逐块读取 → 计算新结构 → 逐块更新

POST /v1/ai/template-from-context
  # 根据当前页面上下文自动推荐模板结构
  # 全新端点，没有 HI 对应物
```

**关键洞察**：Notion 发现了 Agent 在执行一些「人类不会高频做」的操作（比如批量重排块结构），因此新增了 **Agent-specific endpoints**。SaaS 产品应该主动发现这些缺口。

---

## 7. 三层生态：能力层、协调层与体验层

了解完具体案例，我们用一个统一框架来理解 Agent Interface 时代的软件生态——**三层架构**：

```
Layer 3: 体验层 (Experience Layer)
    ┌──────────────────────────────────────┐
    │ Chat UI  │ 嵌入式 Widget  │ 自动执行  │
    │ Webhook  │ 语音接口       │ Push 通知 │
    └──────────────┬───────────────────────┘
                   │ 人类意图输入 / Agent 结果反馈
                   ▼
Layer 2: 协调层 (Orchestration Layer)
    ┌──────────────────────────────────────┐
    │ 任务规划  │ 上下文管理  │ Agent 编排  │
    │ 决策路由  │ 记忆存储   │ 冲突解决    │
    │ 权限代理  │ 缓存层     │ 审计日志    │
    └──────────────┬───────────────────────┘
                   │ MCP / A2A / Function Calling
                   ▼
Layer 1: 能力层 (Ability Layer)
    ┌──────────────────────────────────────┐
    │ API Gateway  │ MCP Server  │ Function  │
    │ 数据库      │ 向量存储   │ 文件系统   │
    │ 第三方集成  │ 计算引擎   │ 消息队列   │
    └──────────────────────────────────────┘
```

### 7.1 能力层

这一层是 Agent 能调用的所有「原子能力」的集合。设计原则：

- **无状态**：每个调用独立，结果不依赖之前的调用状态
- **幂等**：重复调用产生相同结果（或至少不产生副作用）
- **可观测**：每个调用都有 trace ID、耗时、输入输出的完整记录
- **有边界**：每个工具都有明确的输入输出 Schema，不存在隐式依赖

当前这个层最大的缺口是标准。Stripe 有 MCP Server，Notion 有 Function Calling，Salesforce 有自家的 AI Action——**每家的 wrapper 都是定制的**。虽然 MCP 正在成为事实标准，但距离「代理友好的一次性发现」还有差距。

### 7.2 协调层

协调层是 AIF 架构中最体现工程价值的部分。它解决了以下问题：

- **意图到任务的分解**：用户说「帮我整理项目」，Agent 需要分解为 5-8 个子任务
- **记忆与上下文管理**：Agent 不能每次对话都重新发现用户偏好
- **多 Agent 冲突解决**：当多个 Agent 同时对同一资源操作时，如何避免冲突？
- **Human in the Loop 网关**：什么操作需要人类审批？审批如何代理到正确的渠道？

当前这层的代表性框架：


| 框架        | 厂商        | 特点                  |
| --------- | --------- | ------------------- |
| OpenClaw  | 开源社区      | 企业级多 Agent 编排，强在集成层 |
| LangGraph | LangChain | 图状态机语义，灵活的工作流定义     |
| CrewAI    | 开源        | 角色分工 + 任务委派，简洁优雅    |
| AutoGen   | Microsoft | 多 Agent 对话框架，学术气质浓  |


### 7.3 体验层

最后一层是 Agent 如何与人类用户交互。这里最颠覆性的洞察是：

> **随着 Agent 能力的增强，交互方式会从「人类操作 Agent」变成「Agent 主动向人类汇报」。**

体验层的三种主流模式：

**模式 A：会话式（Chat）**  
用户通过自然语言与 Agent 交互。这是最直观的形式，但它的缺点是 Agent 的每次操作都需要人类确认，交互效率实际上并不高。

**模式 B：嵌入式（Embedded）**  
Agent 以 widget 形式嵌入到现有 UI 中，在特定的上下文里提供能力。比如在 CRM 的「客户详情页」嵌入一个「分析 Agent」。

**模式 C：自主执行+汇报（Run-and-Report）**  
用户给 Agent 一个高层次的指令，Agent 自主规划执行，完成后 Push 通知人类。这是最高效但最需要信任的模式。

我个人的判断是：**到 2027 年，模式 C 会成为企业场景的主要交互模式。** 注意力是人类最稀缺的资源，模式 C 在消耗人类注意力方面是最经济的。

---

## 8. 安全性：Agent 时代的权限与信任模型

Agent Interface 引入了一个根本性的安全挑战：**谁能授权 Agent 做什么？**

传统 OAuth 2.0 的授权模型是：人类用户登录，获得与自身权限一致的 token，AI 用自己的 token 执行操作。这个模型假设 AI 永远代表当前用户的意图。

但现实要复杂得多：

### 8.1 权限的四个维度

Agent 时代的权限管理至少需要四个维度：


| 维度      | 问题                  | 解决方案                        |
| ------- | ------------------- | --------------------------- |
| **身份**  | Agent 以谁的名义执行？      | 用户绑定 + Delegated Permission |
| **范围**  | Agent 能做什么不能做什么？    | 精细化 Scope（粒度到 API 端点级别）     |
| **上下文** | 同一个操作在不同上下文中风险一样吗？  | 动态权限（如金额 > $1000 需要审批）      |
| **审计**  | 谁在什么时间让 Agent 做了什么？ | 不可篡改的审计日志 + 操作回放            |


### 8.2 委托权限模型（Delegated Authorization）

一个实用的 Agent 权限模型是 **OAuth 2.0 Device Grant + Scoped API Key**：

```
1. 用户通过设备授权流给 Agent 授权
2. 授权时选择 Scope：read / write / admin
3. Agent 获得一个 Scoped API Key
4. 每次调用携带 API Key + 用户标识
5. 关键操作需要额外审批
```

审批机制可以参考 Stripe 的 **radar for agent**——一个规则引擎：

```json
{
  "rule": [
    {
      "condition": "action == 'refund' AND amount > 10000",
      "action": "require_human_approval",
      "channel": "slack",
      "timeout": 300,
      "on_timeout": "deny"
    },
    {
      "condition": "action == 'update_plan' AND target == 'production'",
      "action": "require_human_approval",
      "channel": "email"
    }
  ]
}
```

### 8.3 Agent 操作的可观测性

Security 的另一面是可观测性。Agent 操作的速度和规模远超人类，安全团队需要新的工具来理解 Agent 的行为：

```
传统的审计日志：
2026-05-11 10:00:00 | user_123 | PATCH /tasks/456 | status=done

Agent 需要的能力：
2026-05-11 10:00:00 | agent_shopping_v3 | PATCH /tasks/456 | status=done
  - Trace ID: trace_abc_xyz
  - User intent: "完结这个 sprint 里已完成但忘了归档的 task"
  - Parent task: "整理 sprint backlog"
  - Child of: "整体项目清理流程" (由 agent_coordinator_v2 发起)
  - Decision: "此 task 状态为 done，剩余 subtask 均为 closed → 更新为 done"
  - Duration: 320ms
  - Cost: $0.0012
```

当前行业在 Agent 可观测性上还处于非常早期的阶段。**这是一个值得做的创业方向。**

---

## 9. 开发者的新技能树

AI 时代的开发者技能分野正在呈现一个「T 型」甚至「蘑菇型」结构。以下是我观察到的核心变化：

### 9.1 正在贬值的能力


| 能力          | 贬值原因                       |
| ----------- | -------------------------- |
| 手写 CRUD API | AI 能 10 秒生成                |
| 复杂的 SQL 查询  | AI 能用自然语言生成                |
| 前端 UI 细节调试  | AI Agent 不需要精美 UI          |
| 单体应用架构设计    | Agent-first 架构天然微服务        |
| 文档手写        | Agent 能直接读 Swagger/OpenAPI |


### 9.2 正在升值的核心能力

**① 工具定义设计**

这是 AIF 时代最重要的技能。不只是在 OpenAPI 上标注几个字段，而是理解：Agent 看到这个工具定义会怎么推理？它的哪个参数最容易被误解？我需不需要加一个 warning？

好的工具定义是一门手艺，类似于 2010 年代好的 API 设计——但抽象层级更高。

**② Agent 工作流编排**

单人写代码的时代在退潮，取而代之的是「设计 Agent 如何协作」。开发者变成了 Agent 的「指挥者」——定义工具、设定边界、规划工作流、设计和监测反馈闭环。

**③ 反馈闭环设计**

AI 不是一次写对代码的，Agent 的操作也不是一次完美的。好的开发者设计的是「Agent 犯错后如何自动修复」的闭环，而不是「Agent 必须一次正确」的空中楼阁。

**④ 知识工程**

把隐性知识转化为 Agent 可消耗的结构化指令。这不是写文档，而是设计 RAG 流程、设计工具上下文、设计 few-shot examples。**知识工程正在取代 Prompt Engineering 成为新的热点。**

---

## 10. 创业者窗口：哪些赛道值得做

每一轮范式转移都会诞生新的平台级公司，Agent Interface 也不例外。以下是我认为值得关注的几个方向：

### 10.1 Agent-native 基础设施


| 赛道             | 机会描述                         | 对标                  |
| -------------- | ---------------------------- | ------------------- |
| **Agent 可观测性** | 追踪 Agent 的操作链路、决策过程、Token 消耗 | Datadog for Agent   |
| **权限管理**       | 动态权限、审批流、交互审计的 SaaS 服务       | Okta for Agent      |
| **测试与评估**      | Agent 的行为测试框架、回归测试、对抗测试      | Sentry + Cypress 合体 |
| **MCP 市场**     | MCP Server 的发现、安装、监控、版本管理市场  | NPM for MCP         |


### 10.2 Agent-first 的 SaaS 重构


| 赛道                | 机会                                     |
| ----------------- | -------------------------------------- |
| **垂直领域 Agent 平台** | 法律、医疗、金融等垂直领域——Agent-first 的行业 SaaS    |
| **工具集成层**         | 一个 Agent 调用 10 个 SaaS，谁来提供统一认证 + 会话管理？ |


### 10.3 最佳切入点：做 Agent 帮你做其他 SaaS 的事情

注意：**不要花时间重新发明日历、待办、CRM。** 这些赛道已经极度拥挤，你做不过 Notion、Salesforce、Asana。

最佳切入点是：**让 Agent 去协调这些已有工具。**

一个例子：垂直场景的「Agent 协调器」比如「合同管理 Agent」——通过 Gmail API 读取合同附件、通过 Stripe API 获取支付状态、通过 Notion API 写入项目记录、通过 Slack API 通知相关人。**不需要自己建任何存储。**

### 10.4 反直觉的建议

**现在开始，但在 2026 年不要太激进。** 因为：

1. Agent 的可靠性还不够稳定，容错率低的应用场景如果太早铺开，会伤害品牌
2. 标准（MCP vs A2A）还在演进，过早锁定可能站错队
3. 用户的「Agent 信任度」还没有建立——人类还需要时间适应让 AI 代劳

**建议节奏：** 2026 年做基础设施和工具链，2027 年做应用层，2028 年做平台层。

---

## 11. 展望：2027 年会是什么样子

以一个合理的预测收尾。

### 11.1 我比较确信的趋势

- 大多数 B2B SaaS 会提供 **MCP Server 或等效的 Agent 接口**——就像 2015 年所有软件都需要 Mobile App
- **Agent-to-Agent 通信**会成为一种标准实践，A2A 或类似协议被广泛采用
- **API-first 成为默认开发模式**：新建项目时 API 优先于 UI，UI 变成 thin layer
- **Agent 操作将超过人类操作**：API 调用量的主要来源不再是浏览器，而是 Agent
- **出现 Agent-native 的公司**：全员使用 Agent 操作的「零 GUI」公司（类似于当年的 remote-first）

### 11.2 我不太确定但愿意赌的方向

- **不会出现一个「超级 Agent」**。更可能的是专业分工的 Agent 网络——一个 Agent 查资料，一个 Agent 写代码，一个 Agent 测试代码，一个 Agent 管理部署
- **MCP 会赢但不是唯一标准**。就像 REST 赢了但 GraphQL 和 gRPC 也活得很好，MCP 和 A2A 会共存于不同层
- **Agent 不等于 Chatbot**。2027 年的主流交互不是「对话框」，而是 Agent 在后台运行、定期推送给人类结果

### 11.3 给读者的行动建议

如果你是**开发者**：从今天开始，把你写的下一个内部工具的 API 按照 Agent-first 原则设计。不需要一开始就做到完美，但方向要对。

如果你是**架构师**：在你的现有系统中，识别出那些「Agent 最可能先尝试集成」的能力，优先暴露为 MCP Server。

如果你是**创业者**：2026 年做工具链，2027 年做应用，2028 年做平台。不要急，但要开始做了。

---

## 参考与延伸阅读

1. **Model Context Protocol (MCP)** — [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
2. **Agent-to-Agent Protocol (A2A)** — Google Research, 2025
3. **Stripe Agent Toolkit** — [https://docs.stripe.com/agent](https://docs.stripe.com/agent)
4. **Salesforce Agentforce** — [https://www.salesforce.com/agentforce](https://www.salesforce.com/agentforce)
5. **Function Calling (OpenAI)** — [https://platform.openai.com/docs/guides/function-calling](https://platform.openai.com/docs/guides/function-calling)
6. **OAuth 2.0 Device Authorization Grant** — RFC 8628
7. **"Building Effective Agents" (Anthropic, 2024)** — [https://anthropic.com/engineering/building-effective-agents](https://anthropic.com/engineering/building-effective-agents)
8. **"The AI Software Architecture" (Martin Fowler, 2025)** — martinfowler.com

---

*写于 2026 年 5 月 · 上海*

*如果你觉得这篇文章有价值，欢迎在社区分享和讨论。作者联系方式见个人主页。*