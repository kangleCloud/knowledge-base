import { h } from 'vue'
import Theme from 'vitepress/theme'
import './style.css'
import { imgClick } from './imageTouchScale'
import KbDivider from './components/KbDivider.vue'

// 引入 tabs 插件
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'

export default {
  extends: Theme,
  Layout: () => {
    return h(Theme.Layout, null, {
      // 这里可以用 slot 扩展布局
    })
  },
  enhanceApp({ app, router, siteData }) {
    // 你的图片点击放大逻辑
    imgClick()

    // 注册 tabs 插件
    enhanceAppWithTabs(app)
    app.component('KbDivider', KbDivider)
  },
  setup() {},
}
