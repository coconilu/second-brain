<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useData, useRoute, withBase } from 'vitepress'

const route = useRoute()
const { site } = useData()
const visible = ref(true)

const previewSrc = computed(() => {
  // route.path carries the deployed base prefix (e.g. /second-brain/ on
  // GitHub Pages), which would make top-level pages look like sub-directory
  // pages. Strip it before matching, then re-apply it via withBase — raw
  // img src values skip VitePress' automatic base prefixing.
  const base = site.value.base
  let cleanPath = route.path.split('#')[0].split('?')[0]
  if (base !== '/' && cleanPath.startsWith(base)) {
    cleanPath = cleanPath.slice(base.length)
  }
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`
  if (cleanPath === '/' || cleanPath === '/index') return ''

  const basePath = cleanPath.endsWith('/')
    ? cleanPath
    : cleanPath.slice(0, cleanPath.lastIndexOf('/') + 1)

  if (basePath === '/') return ''

  return withBase(`${basePath}preview.png`)
})

watch(
  () => route.path,
  () => {
    visible.value = true
  },
)
</script>

<template>
  <img
    v-if="previewSrc && visible"
    class="doc-preview-image"
    :src="previewSrc"
    alt="文档预览图"
    @error="visible = false"
  >
</template>
