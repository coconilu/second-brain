import type { Plugin } from "@opencode-ai/plugin"

export const ScanReviewerPlugin: Plugin = async ({ client }) => {
  return {
    "session.idle": async () => {
      try {
        await client.app.log({
          body: {
            service: "scan-reviewer",
            level: "info",
            message: "生成后审查已触发（session.idle）",
          },
        })

        await client.tool.execute("task", {
          description: "生成后代码审查",
          subagent_type: "post-generate-reviewer",
          prompt: `审查最近生成的代码。

1. 加载 skill "scan-reviewer"。
2. 读取 .scan-review/catalog.md。如果不存在，回复："未找到目录。请运行 /scan-index 生成可复用组件索引。"
3. 运行 "git diff" 查看最近的变更。
4. 对照目录比对生成的代码。
5. 使用多维度评分分类（Critical/High/Medium/Low），包括 PageRank 加权中心度、修改热度、测试覆盖度。
6. 执行近似重复检测：搜索项目中是否在其他地方存在相似但未提取的逻辑片段。
7. 对 Critical 和 High 级别编辑代码以复用已有组件。
8. 输出审查摘要。`,
        })
      } catch (error) {
        await client.app.log({
          body: {
            service: "scan-reviewer",
            level: "warn",
            message: `生成后审查失败: ${error}`,
          },
        })
      }
    },
  }
}
