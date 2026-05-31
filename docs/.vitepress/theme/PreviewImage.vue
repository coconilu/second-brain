<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vitepress'

const route = useRoute()
const visible = ref(true)

const previewSrc = computed(() => {
  const cleanPath = route.path.split('#')[0].split('?')[0]
  if (cleanPath === '/' || cleanPath === '/index') return ''

  const basePath = cleanPath.endsWith('/')
    ? cleanPath
    : cleanPath.slice(0, cleanPath.lastIndexOf('/') + 1)

  if (basePath === '/') return ''

  return `${basePath}preview.png`
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
