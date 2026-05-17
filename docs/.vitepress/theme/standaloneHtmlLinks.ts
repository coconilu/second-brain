declare const __STANDALONE_HTML_ROUTES__: string[]

let installed = false

export function installStandaloneHtmlLinkHandler() {
  if (typeof window === 'undefined') return
  if (installed) return
  installed = true

  const standaloneRoutes = new Set(__STANDALONE_HTML_ROUTES__.flatMap(routeVariants))
  const isStandaloneHtmlUrl = (url: URL) => {
    if (url.origin !== window.location.origin) return false

    const variants = routeVariants(url.pathname)
    return variants.some((variant) => standaloneRoutes.has(variant))
  }

  const markStandaloneLinks = () => {
    for (const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const url = new URL(link.href, window.location.href)
      if (!isStandaloneHtmlUrl(url)) continue

      // VitePress skips SPA routing for links with a target attribute. `_self`
      // keeps the same tab while forcing the browser to request the real HTML.
      link.target = '_self'
    }
  }

  markStandaloneLinks()
  requestAnimationFrame(markStandaloneLinks)

  const observer = new MutationObserver(markStandaloneLinks)
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['href'],
  })

  window.addEventListener(
    'click',
    (event) => {
      if (event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

      const link = findAnchor(event)
      if (!link) return
      if (link.target && link.target !== '_self') return

      const url = new URL(link.href, window.location.href)
      if (!isStandaloneHtmlUrl(url)) return

      event.preventDefault()
      event.stopImmediatePropagation()
      const targetHref = normalizeDirectoryUrl(url).href

      if (window.location.href === targetHref) {
        window.location.reload()
      } else {
        window.location.assign(targetHref)
      }
    },
    true,
  )
}

function findAnchor(event: MouseEvent) {
  const path = event.composedPath()
  for (const node of path) {
    if (node instanceof HTMLAnchorElement) return node
    if (node instanceof HTMLElement) {
      const anchor = node.closest('a')
      if (anchor) return anchor
    }
  }

  return null
}

function routeVariants(route: string) {
  const normalized = normalizePath(route)
  const withoutTrailingSlash = normalized.slice(0, -1)

  return [
    normalized,
    withoutTrailingSlash,
    `${withoutTrailingSlash}/index`,
    `${withoutTrailingSlash}/index/`,
    `${withoutTrailingSlash}/index.html`,
  ]
}

function normalizePath(pathname: string) {
  return pathname.endsWith('/') ? pathname : `${pathname}/`
}

function normalizeDirectoryUrl(url: URL) {
  for (const route of __STANDALONE_HTML_ROUTES__) {
    if (routeVariants(url.pathname).includes(normalizePath(route))) {
      url.pathname = normalizePath(route)
      return url
    }
  }

  return url
}
