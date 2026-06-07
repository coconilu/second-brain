import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitepress'

const docsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const standaloneHtmlPages = findStandaloneHtmlPages(docsRoot)
const standaloneHtmlAssets = findStandaloneHtmlAssets(docsRoot, standaloneHtmlPages)
const standaloneHtmlRoutes = [...standaloneHtmlPages].map((page) => `/${page.replace(/index\.html$/, '')}`)
const previewImages = findPreviewImages(docsRoot)
const sidebar = generateSidebarFromIndex(docsRoot)

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
    sidebar,
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
      htmlStaticAssetsPlugin(docsRoot, standaloneHtmlAssets),
      previewImagesPlugin(docsRoot, previewImages),
    ],
  },
})

function htmlStaticAssetsPlugin(root: string, assets: Set<string>): Plugin {
  return {
    name: 'second-brain-html-static-assets',
    generateBundle() {
      for (const relativePath of assets) {
        this.emitFile({
          type: 'asset',
          fileName: relativePath,
          source: fs.readFileSync(path.join(root, relativePath)),
        })
      }
    },
  }
}

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

function generateSidebarFromIndex(root: string) {
  const indexPath = path.join(root, 'index.md')
  const content = fs.readFileSync(indexPath, 'utf-8')
  const sidebar = []
  let currentSection: { text: string; collapsed: boolean; items: Array<{ text: string; link: string; target?: string }> } | null = null

  for (const line of content.split('\n')) {
    const headingMatch = line.match(/^##\s+(.+)\s*$/)

    if (headingMatch) {
      const text = headingMatch[1].trim()

      // This section already exists only to expose all standalone HTML pages on
      // the homepage. Most of those links are also manually placed in curated
      // categories above, so duplicating it in the sidebar makes navigation noisy.
      if (text === '独立 HTML 页面（自动生成）') {
        currentSection = null
        continue
      }

      currentSection = { text, collapsed: false, items: [] }
      sidebar.push(currentSection)
      continue
    }

    if (!currentSection) continue

    const itemMatch = line.match(/^-\s+\[([^\]]+)\]\(([^)]+)\)(.*)$/)
    if (!itemMatch) continue

    const [, text, rawLink, suffix] = itemMatch
    const item: { text: string; link: string; target?: string } = {
      text: suffix.includes('`HTML`') ? `${text} · HTML` : text,
      link: normalizeSidebarLink(rawLink),
    }

    if (suffix.includes('target="_self"')) {
      item.target = '_self'
    }

    currentSection.items.push(item)
  }

  sidebar.push({
    text: '按时间浏览',
    collapsed: false,
    items: [{ text: '文档创建时间线', link: '/timeline' }],
  })

  return sidebar
}

function normalizeSidebarLink(link: string) {
  if (/^(https?:|mailto:|#)/.test(link)) return link

  let normalized = link.replace(/^\.\//, '')

  if (normalized.endsWith('/index.html')) {
    normalized = normalized.slice(0, -'index.html'.length)
  } else if (normalized.endsWith('/index.md')) {
    normalized = normalized.slice(0, -'index.md'.length)
  } else if (normalized.endsWith('.html')) {
    normalized = normalized.slice(0, -'.html'.length)
  } else if (normalized.endsWith('.md')) {
    normalized = normalized.slice(0, -'.md'.length)
  }

  return normalized.startsWith('/') ? normalized : `/${normalized}`
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

function findStandaloneHtmlAssets(root: string, pages: Set<string>) {
  const assets = new Set<string>()

  for (const page of pages) {
    const pageDir = path.dirname(page)
    walk(path.join(root, pageDir))
  }

  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.DS_Store') continue

      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
        continue
      }

      if (!entry.isFile()) continue
      if (entry.name === 'index.html' || entry.name === 'preview.png') continue

      assets.add(path.relative(root, fullPath).split(path.sep).join('/'))
    }
  }

  return assets
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
