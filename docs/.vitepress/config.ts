import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitepress'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const standaloneHtmlPages = findStandaloneHtmlPages(docsRoot)
const standaloneHtmlRoutes = [...standaloneHtmlPages].map((page) => `/${page.replace(/index\.html$/, '')}`)
const previewImages = findPreviewImages(docsRoot)

export default defineConfig({
  title: 'Second Brain',
  description: 'AI Agent 工具链、写作方法、工程实践和月度追踪文档',
  lang: 'zh-CN',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'alternate icon', type: 'image/png', href: '/favicon.png' }],
    ['link', { rel: 'apple-touch-icon', href: '/favicon.png' }],
  ],
  cleanUrls: true,
  lastUpdated: true,
  markdown: {
    html: false,
  },
  // Standalone HTML pages are served by htmlStaticPagesPlugin below, not by
  // VitePress' Markdown router, so VitePress cannot statically verify them.
  ignoreDeadLinks: [
    ...standaloneHtmlRoutes,
    ...[...standaloneHtmlPages].map((page) => `./${page.replace(/\.html$/, '')}`),
    // VitePress URL-encodes non-ASCII paths during dead-link checking,
    // so we must also add the encoded variants to the ignore list.
    ...[...standaloneHtmlPages].map((page) => encodeURI(`./${page.replace(/\.html$/, '')}`)),
  ],
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '目录', link: '/' },
      { text: '时间线', link: '/timeline' },
    ],
    sidebar: [
      {
        text: '工具操作指南',
        collapsed: false,
        items: [
          { text: 'tmux：从一个例子开始', link: '/tmux/' },
          { text: 'Claude Code Hooks：从一个例子开始', link: '/claude-code-hooks/claude-code-hooks-use' },
          { text: 'Claude Code Hooks 完整指南', link: '/claude-code-hooks/claude-code-hooks-guide' },
          { text: 'OpenCode 插件：从一个通知开始', link: '/opencode-plugins-tutorial/' },
          { text: 'Claude Code Plugin：从打包到分发', link: '/claude-plugin/claude-plugin' },
          { text: 'Claude Code 会话机制', link: '/claude-session/claude-code-session-mechanism' },
          { text: 'Claude Code 实战指南', link: '/claude-best-practices/claude-code-best-practices' },
          { text: 'Harness 工程之道教学扩展稿 · HTML', link: '/claude-code-harness-engineering/', target: '_self' },
          { text: 'Harness 工程深度教案 · HTML', link: '/harness-engineering-lesson-plan/', target: '_self' },
        ],
      },
      {
        text: 'Agent 架构与协作',
        collapsed: false,
        items: [
          { text: 'Agent 设计模式互动教学稿 · HTML', link: '/agent-design-patterns/', target: '_self' },
          { text: '从 sub-agent 到 agent-team', link: '/claude-sub-agent/sub-agent-and-agent-team' },
          { text: 'Sub-agent 和 Agent-team：从一个例子开始', link: '/claude-sub-agent/sub-agent-and-agent-team-guide' },
          { text: 'Hermes Agent 课程', link: '/hermes-agent-course/' },
        ],
      },
      {
        text: '对比与选型',
        collapsed: false,
        items: [
          { text: 'OpenCode vs Claude Code', link: '/opencode-vs-claudecode/' },
          { text: 'scan-reviewer 对比', link: '/scan-reviewer/comparison' },
          { text: 'Scanning Strategy', link: '/scan-reviewer/scanning-strategy' },
        ],
      },
      {
        text: '思考与趋势',
        collapsed: false,
        items: [
          { text: 'AI 时代，什么才是稀缺能力', link: '/ai-era-scarce-abilities/' },
          { text: '从 Human Interface 到 Agent Interface', link: '/from_human_interface_to_agent_interface/' },
          { text: 'DeepSeek 演进', link: '/deepseek-evolution/' },
        ],
      },
      {
        text: '月度追踪',
        collapsed: false,
        items: [
          { text: 'Top 20 Agent Skills — 2026 年 4 月', link: '/skills-monthly/2026-04_top20' },
          { text: 'GitHub AI Trending Top 10（2026-05-12 至 2026-05-18）', link: '/github-ai-trending/2026-05-12_to_2026-05-18' },
          { text: 'GitHub AI Trending Top 10（2026-05-05 至 2026-05-11）', link: '/github-ai-trending/2026-05-05_to_2026-05-11' },
          { text: 'GitHub AI Trending Top 10（2026-04-28 至 2026-05-04）', link: '/github-ai-trending/2026-04-28_to_2026-05-04' },
          { text: 'Top 20 AI 开源项目 — 2026 年 4 月', link: '/ai-monthly/2026-04_top20' },
        ],
      },
      {
        text: '按时间浏览',
        collapsed: false,
        items: [
          { text: '文档创建时间线', link: '/timeline' },
        ],
      },
    ],
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    search: {
      provider: 'local',
    },
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
  },
  vite: {
    define: {
      __STANDALONE_HTML_ROUTES__: JSON.stringify(standaloneHtmlRoutes),
    },
    plugins: [
      htmlStaticPagesPlugin(docsRoot, standaloneHtmlPages),
      previewImagesPlugin(docsRoot, previewImages),
    ],
  },
})

function previewImagesPlugin(root: string, images: Set<string>): Plugin {
  return {
    name: 'second-brain-preview-images',
    generateBundle() {
      for (const relativePath of images) {
        this.emitFile({
          type: 'asset',
          fileName: relativePath,
          source: fs.readFileSync(path.join(root, relativePath)),
        })
      }
    },
  }
}

function htmlStaticPagesPlugin(root: string, pages: Set<string>): Plugin {
  return {
    name: 'second-brain-html-static-pages',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next()

        const pathname = decodeURIComponent(req.url.split('?')[0])
        const normalized = pathname.endsWith('/') ? `${pathname}index.html` : pathname
        const relativePath = normalized.replace(/^\//, '')

        if (!pages.has(relativePath)) return next()

        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(fs.readFileSync(path.join(root, relativePath)))
      })
    },
    generateBundle() {
      for (const relativePath of pages) {
        this.emitFile({
          type: 'asset',
          fileName: relativePath,
          source: fs.readFileSync(path.join(root, relativePath), 'utf-8'),
        })
      }
    },
  }
}

function findStandaloneHtmlPages(root: string) {
  const pages = new Set<string>()

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.vitepress') continue

      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (entry.isFile() && entry.name === 'index.html') {
        pages.add(path.relative(root, fullPath).split(path.sep).join('/'))
      }
    }
  }

  walk(root)
  return pages
}

function findPreviewImages(root: string) {
  const images = new Set<string>()

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.vitepress' || entry.name === 'public') continue

      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (entry.isFile() && entry.name === 'preview.png') {
        images.add(path.relative(root, fullPath).split(path.sep).join('/'))
      }
    }
  }

  walk(root)
  return images
}
