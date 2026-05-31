# 前端团队接入 Visual Regression Review：从一个最小流程开始

## 一个真实的烦恼

你做前端 PR 时，代码检查全绿，单测也过了。但 reviewer 打开页面一看：按钮错位了，弹窗变窄了，某个文案把布局撑爆了。

更麻烦的是，这类问题通常不是“功能坏了”，而是“看起来不对”。传统单测很难发现，只能靠人肉点页面。

**Visual Regression Review 解决的就是这个问题：自动截图、自动对比、自动把 UI 差异贴到 PR 里。**

下面从一套最小可落地流程开始。

## 第一步：先定义哪些页面要截图

不要一上来覆盖全站。先选 3～5 个高价值页面。

| 页面 | 为什么要测 | 示例 |
|---|---|---|
| 首页 | 品牌和首屏最容易被改坏 | `/` |
| 登录页 | 表单、按钮、错误提示密集 | `/login` |
| 设置页 | 弹窗、表单、分组多 | `/settings` |
| 详情页 | 数据卡片、长文本、空态多 | `/projects/demo` |
| 移动端关键页 | 响应式最容易破 | `/dashboard` |

建议第一版只做：

```text
visual-home
visual-login
visual-settings
```

不要贪多。视觉回归系统最怕维护成本太高。

## 第二步：用 Playwright 截图

安装依赖：

```bash
pnpm add -D @playwright/test pixelmatch pngjs
pnpm exec playwright install chromium
```

创建视觉测试配置：

```ts
// e2e/playwright.visual.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './visual',
  testMatch: '*.visual.test.ts',
  timeout: 30_000,
  retries: 0,
  workers: 1,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:3000',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    screenshot: 'off',
  },
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

创建第一个截图测试：

```ts
// e2e/visual/home.visual.test.ts
import { test, expect } from '@playwright/test';
import path from 'node:path';

const outputDir = process.env.VISUAL_OUTPUT_DIR || 'e2e/visual/screenshots';

test('visual-home', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveScreenshot(
    path.join(outputDir, 'visual-home.png'),
    {
      fullPage: true,
      animations: 'disabled',
    },
  );
});
```

本地跑：

```bash
VISUAL_OUTPUT_DIR=e2e/visual/screenshots \
pnpm exec playwright test -c e2e/playwright.visual.config.ts
```

跑完会得到：

```text
e2e/visual/screenshots/visual-home.png
```

搞定。现在你已经有“自动打开页面并截图”的能力了。

## 回过头看：刚才发生了什么

整套视觉回归只有三层：

```text
页面场景              ← 截哪里？
  Playwright 截图     ← 怎么稳定地截？
    pixelmatch 对比   ← 和谁比、差多少？
```

也可以理解成：

```text
Visual Test = 场景 × 截图 × 对比
```

**这就是 Visual Regression Review 的全部模型：场景 × 截图 × 差异报告。**

### 1. 场景：截哪里

| 类型 | 适合做视觉回归吗 | 例子 |
|---|---:|---|
| 关键入口页 | 适合 | 首页、登录页、工作台 |
| 弹窗/抽屉 | 很适合 | 新建项目弹窗、设置弹窗 |
| 复杂组件 | 很适合 | 表格、卡片流、编辑器 |
| 随机内容页 | 谨慎 | 推荐流、实时数据 |
| 频繁实验页 | 不建议第一批接入 | A/B 测试页 |

经验法则：**先测“重要且应该稳定”的页面。**

### 2. 截图：怎么稳定地截

视觉测试最怕不稳定。你要控制变量。

| 变量 | 建议做法 | 原因 |
|---|---|---|
| 浏览器 | 固定 Chromium | 不同浏览器渲染差异大 |
| viewport | 固定尺寸 | 防止响应式随机变化 |
| deviceScaleFactor | 固定为 1 | 避免高清屏像素差异 |
| 动画 | 禁用 | 动画中途截图会抖 |
| 数据 | 使用 mock 或 seed | 避免真实数据变化 |
| 时间 | 固定 Date | 避免“今天/昨天”变化 |
| 字体 | CI 固定安装 | 字体差异会导致大量 diff |

### 3. 对比：和谁比

| 对比对象 | 适用场景 | 推荐程度 |
|---|---|---:|
| main 分支最新截图 | PR review | 强烈推荐 |
| 上一次发布截图 | 发布前检查 | 推荐 |
| 本地 baseline | 小团队起步 | 可以 |
| 设计稿截图 | 很难维护 | 谨慎 |

最常见做法是：

```text
main 分支截图 = baseline
PR 分支截图 = candidate
candidate 和 baseline 做 pixelmatch
```

## pixelmatch 做了什么

`pixelmatch` 不依赖 AI。它是传统像素对比算法。

最小示例：

```ts
// scripts/compare-visual.ts
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { readFileSync, writeFileSync } from 'node:fs';

const baseline = PNG.sync.read(readFileSync('baseline/visual-home.png'));
const current = PNG.sync.read(readFileSync('current/visual-home.png'));

const { width, height } = baseline;
const diff = new PNG({ width, height });

const diffPixels = pixelmatch(
  baseline.data,
  current.data,
  diff.data,
  width,
  height,
  {
    threshold: 0.1,
  },
);

writeFileSync('diff/visual-home.png', PNG.sync.write(diff));

console.log(`Diff pixels: ${diffPixels}`);
```

结果：

| 输出 | 含义 |
|---|---|
| `diffPixels` | 有多少像素不同 |
| `diff/visual-home.png` | 差异图 |
| `threshold` | 忽略轻微颜色/抗锯齿差异 |

它不会判断“好不好看”。它只回答：

> 这张 PR 截图和 main 截图有没有视觉变化？

至于这个变化是不是合理，仍然需要人 review。

## 第三个例子：在 PR 里自动评论

完整流程建议分成三个 CI job。

```text
main push
  → 截 baseline
  → 上传到对象存储

PR update
  → 截 PR screenshots
  → 上传 artifact

PR comment
  → 下载 PR screenshots
  → 拉 baseline
  → pixelmatch 对比
  → 生成 markdown comment
```

### 1. main 分支生成 baseline

```yaml
# .github/workflows/visual-baseline.yml
name: visual-baseline

on:
  push:
    branches:
      - main

jobs:
  baseline:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium

      - name: Capture baseline screenshots
        env:
          VISUAL_OUTPUT_DIR: e2e/visual/screenshots
        run: pnpm exec playwright test -c e2e/playwright.visual.config.ts

      - name: Upload baseline artifact
        uses: actions/upload-artifact@v4
        with:
          name: visual-baseline-${{ github.sha }}
          path: e2e/visual/screenshots
```

第一版可以先用 GitHub artifact。成熟后再换 S3 / R2。

### 2. PR 生成截图

```yaml
# .github/workflows/visual-pr.yml
name: visual-pr

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  capture:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium

      - name: Capture PR screenshots
        env:
          VISUAL_OUTPUT_DIR: e2e/visual/screenshots
        run: pnpm exec playwright test -c e2e/playwright.visual.config.ts

      - name: Upload PR artifact
        uses: actions/upload-artifact@v4
        with:
          name: visual-pr-${{ github.event.pull_request.number }}-${{ github.sha }}
          path: e2e/visual/screenshots
```

### 3. 生成对比报告

可以先不自动评论，先把 diff 作为 artifact 上传。成熟后再接入 PR comment：

```yaml
- name: Comment visual report
  env:
    GH_TOKEN: ${{ github.token }}
  run: |
    gh pr comment "${{ github.event.pull_request.number }}" \
      --body-file e2e/visual/report/comment.md
```

## 推荐团队落地流程

### 阶段 1：只截图，不阻塞

目标：让团队先看到价值。

| 策略 | 做法 |
|---|---|
| 触发条件 | PR 改到 `src/**`、`app/**`、`components/**` 时跑 |
| 结果 | 上传截图 artifact |
| 是否阻塞合并 | 不阻塞 |
| 人工动作 | reviewer 自己点开看 |

这个阶段不要追求自动判定。先让大家习惯“PR 有截图”。

### 阶段 2：自动对比，但不阻塞

目标：让 diff 自动出现在 PR。

| 策略 | 做法 |
|---|---|
| baseline | main 分支最新截图 |
| PR 截图 | 每次 push 重新生成 |
| diff | pixelmatch |
| PR comment | 展示 changed / unchanged |
| 是否阻塞合并 | 不阻塞 |

这个阶段适合观察误报率。如果经常误报，先处理稳定性问题，不要急着变成 required check。

### 阶段 3：关键页面阻塞合并

目标：保护核心 UI。

| 页面类型 | 是否阻塞 |
|---|---:|
| 首页首屏 | 是 |
| 登录 / 支付 / 关键转化页 | 是 |
| 设置页 / 表格页 | 视情况 |
| 实验页 / 活动页 | 否 |

推荐策略：

```text
核心视觉用例 changed → required review
非核心视觉用例 changed → comment only
```

不要所有 diff 都直接 fail。否则团队会很快讨厌这套系统。

## 如何减少误报

视觉回归最重要的不是 pixelmatch，而是稳定截图。

| 问题 | 解决方式 |
|---|---|
| 动画导致 diff | 全局禁用 animation / transition |
| 时间文案变化 | mock Date |
| 随机头像/图片 | 固定 seed 或拦截资源 |
| 后端数据变化 | 使用 mock API |
| 字体不同 | CI 安装固定字体 |
| 图片懒加载不稳定 | 等待关键元素出现 |
| 页面还没加载完 | 不只用 `networkidle`，加业务断言 |
| 光标闪烁 | 隐藏 caret |
| 滚动条差异 | 固定 viewport，必要时隐藏 scrollbar |

可以加一个测试专用 CSS：

```css
/* e2e/visual/visual-test.css */
*,
*::before,
*::after {
  animation: none !important;
  transition: none !important;
  caret-color: transparent !important;
}

html {
  scroll-behavior: auto !important;
}
```

在视觉测试环境注入：

```ts
await page.addStyleTag({
  path: 'e2e/visual/visual-test.css',
});
```

## PR 评论应该长什么样

建议评论不要只说“失败了”。要让 reviewer 一眼能判断。

```md
## Visual Regression Review

Base: main@abc123
Head: PR@def456

| Case | Status | Diff pixels | Links |
|---|---|---:|---|
| visual-home | changed | 1,204 | Main / PR / Diff |
| visual-login | unchanged | 0 | Main / PR |
| visual-settings | changed | 322 | Main / PR / Diff |

请检查 changed 的截图。
如果变化符合预期，在 PR 中回复：视觉变化符合预期。
```

更进一步可以加规则：

| 情况 | 处理 |
|---|---|
| `unchanged` | 无需处理 |
| `changed` 且是预期 UI 改动 | reviewer 认可 |
| `changed` 且非预期 | 修复 |
| baseline 过期 | 重新生成 baseline |
| capture failed | 看 Playwright 日志 |

## 配置放在哪

| 文件 | 作用 | 是否进 Git |
|---|---|---:|
| `e2e/playwright.visual.config.ts` | 视觉测试配置 | 是 |
| `e2e/visual/*.visual.test.ts` | 视觉用例 | 是 |
| `e2e/visual/visual-test.css` | 禁用动画等稳定化 CSS | 是 |
| `scripts/visual-report.ts` | 对比和生成报告 | 是 |
| `.github/workflows/visual-*.yml` | CI 流程 | 是 |
| `e2e/visual/screenshots` | 运行时截图 | 否 |
| `e2e/visual/diff` | 运行时 diff | 否 |

`.gitignore` 建议：

```gitignore
e2e/visual/screenshots/
e2e/visual/diff/
e2e/visual/report/
```

## 要不要用 AI

第一版不需要。

| 环节 | 是否需要 AI |
|---|---:|
| 截图 | 不需要 |
| 像素对比 | 不需要 |
| 生成 diff 图 | 不需要 |
| 判断是否有变化 | 不需要 |
| 判断变化是否合理 | 可以用 AI，但不建议第一版依赖 |

AI 可以作为后续增强：

```text
pixelmatch 发现 changed
  → AI 看 main / PR / diff
  → 自动总结：“设置页左侧栏宽度变窄，按钮位置下移”
```

但最终是否接受，还是应该由 reviewer 决定。

## 调试

常用命令：

```bash
# 清理旧截图
rm -rf e2e/visual/screenshots e2e/visual/diff e2e/visual/report

# 本地跑视觉测试
VISUAL_OUTPUT_DIR=e2e/visual/screenshots \
pnpm exec playwright test -c e2e/playwright.visual.config.ts

# 打开 Playwright UI 调试
pnpm exec playwright test -c e2e/playwright.visual.config.ts --ui

# 只跑一个 case
pnpm exec playwright test -c e2e/playwright.visual.config.ts -g visual-home
```

常见问题：

| 现象 | 可能原因 |
|---|---|
| 本地不 diff，CI diff | 字体/系统渲染不同 |
| 每次 diff 都不一样 | 动画、时间、随机数据 |
| 截图是空白 | 页面没等加载完成 |
| 截图只有半页 | 没开 `fullPage` 或容器滚动 |
| baseline 找不到 | main 没跑 baseline 或存储 key 不一致 |

## 速查

```text
Visual Regression Review = Playwright 截图 + pixelmatch 对比 + PR 评论

第一阶段：只截图，不阻塞
第二阶段：自动 diff，不阻塞
第三阶段：核心页面 diff 阻塞合并

稳定性优先级：
固定浏览器 > 固定 viewport > 禁用动画 > mock 数据 > 固定字体

不要一开始测全站。
先测 3～5 个关键页面。
```

如果要在团队里推广，建议落地顺序是：

1. 先选 3 个页面。
2. CI 只上传截图 artifact。
3. 一周后加 pixelmatch diff。
4. 再观察两周误报率。
5. 最后只把核心页面设为 required check。
