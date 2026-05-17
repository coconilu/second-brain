import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import PreviewImage from './PreviewImage.vue'
import { installStandaloneHtmlLinkHandler } from './standaloneHtmlLinks'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp() {
    installStandaloneHtmlLinkHandler()
  },
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'doc-before': () => h(PreviewImage),
    })
  },
}
