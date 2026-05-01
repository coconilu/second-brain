---
description: 扫描项目并生成可复用组件、hooks、工具函数和 API 客户端的目录。
agent: component-scanner
subtask: true
---

扫描此项目中所有可复用的代码制品。

## 背景

首先理解可复用性标准：
- 当一个导出的函数、类、组件、hook、工具函数、API 客户端方法或类型定义被项目中其他文件导入时，它就是"可复用的"。

## 步骤

1. 识别项目的源码目录（通常是 `src/`、`lib/`、`app/`、`components/` 等）。
2. 使用 glob 查找所有源文件（排除 `node_modules/`、`dist/`、`build/`、`.next/`、测试文件）。
3. 对每个源文件，提取：
   - 导出的函数、类和常量
   - React/Vue/Svelte 组件
   - 自定义 hooks（useXxx 模式）
   - API 客户端方法（fetch/axios/graphql 封装）
   - `types/` 或 `interfaces/` 目录下的类型/接口导出
4. 对每个条目，grep 代码库统计有多少文件导入/引用了它。
5. 将目录写入 `.scan-review/catalog.md`，格式如下：

```markdown
# 项目可复用组件索引
> 生成时间: {date} | 来源: {扫描的源码目录}

## 组件
- **{ComponentName}** → `{filepath}:{line}`
  - Props: {props 描述}
  - 被引用: {count} 个文件

## Hooks
- **{hookName}** → `{filepath}:{line}`
  - 返回: {返回类型}
  - 被引用: {count} 个文件

## 工具函数
- **{utilityName}** → `{filepath}:{line}`
  - 签名: {函数签名}
  - 被引用: {count} 个文件

## API 客户端
- **{apiMethod}** → `{filepath}:{line}`
  - 被引用: {count} 个文件

## 类型
- **{TypeName}** → `{filepath}:{line}`
  - 种类: {interface/type/enum}
  - 被引用: {count} 个文件
```

6. 每个分类按引用次数降序排列。
7. 输出摘要：共编目多少条目，最常用的 5 个，涵盖哪些分类。
