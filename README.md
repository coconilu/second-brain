# Second Brain

知识沉底 markdown 化，功能技术 skill 化。

将个人知识和常用技术技巧提炼为可复用的 skill，方便在不同 AI Agent 平台间迁移使用；同时提供可本地浏览或部署到 Vercel 的 VitePress docs 网站用于浏览知识库。

## 目录结构

- `docs/` — 知识库，Markdown 文档和 standalone HTML 教学页
- `skills/` — 通用 Skill 定义源文件（Markdown + YAML Frontmatter）
- `sub-agent/` — Sub-agent 配置定义（纯 Markdown）
- `templates/` — 文档和 Skill 模板
- `scripts/` — 工具脚本
- `docs/.vitepress/` — VitePress 配置、主题和本地构建输出
- `.opencode/skills/` — 本仓库本地 OpenCode 辅助技能（不通过 manifest 打包）
- `package.json` — plugins/docs 网站脚本和 docs 网站依赖
- `vercel.json` — docs 网站的 Vercel 部署配置
- `dist/` — 构建产物（由 sync-plugins.sh 生成，不提交 Git）

## 快速开始

```bash
./scripts/sync-plugins.sh build                        # 构建（生成 dist/）
./scripts/sync-plugins.sh install [opencode|claudecode] # 安装到本地
./scripts/sync-plugins.sh uninstall [opencode|claudecode] # 卸载
./scripts/sync-plugins.sh update [opencode|claudecode]  # 卸载 + 清理 + 构建 + 安装
./scripts/sync-plugins.sh all                          # 构建 + 安装（双平台）
./scripts/sync-plugins.sh clean                        # 清空 dist/
pnpm plugins:build                                     # sync-plugins build 的 package script 别名
pnpm plugins:install                                   # sync-plugins install 的 package script 别名
pnpm plugins:uninstall                                 # sync-plugins uninstall 的 package script 别名
pnpm plugins:update                                    # sync-plugins update 的 package script 别名
pnpm plugins:all                                       # sync-plugins all 的 package script 别名
pnpm plugins:clean                                     # sync-plugins clean 的 package script 别名
pnpm docs:dev                                          # 启动本地 VitePress docs 网站
pnpm docs:build                                        # 构建 docs 网站
pnpm docs:preview                                      # 预览构建后的 docs 网站
pnpm docs:update-index                                 # 刷新 docs/index.md 和 docs/timeline.md
pnpm deploy                                            # 通过 Vercel 部署 docs 网站预览环境
pnpm deploy:preview                                    # 先构建 docs 网站，再通过 Vercel 部署预览环境
pnpm deploy:prod                                       # 先构建 docs 网站，再通过 Vercel 部署生产环境
vale --config="docs/.vale.ini" --output=JSON "docs/**/*.md" # 校验 docs Markdown
```

不指定平台时，install/uninstall/update 默认操作两个平台。
