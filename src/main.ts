import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './styles/main.css'
import App from './App.vue'
import router from './router'
import vLogin from './directives/v-login'
// import vFriends from './directives/v-friends'
import vLoginShow from './directives/v-login-show'

import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
app
  .use(pinia)
  .use(router)
  .directive('login', vLogin) // 登录权限指令-未登录先登录
  .directive('login-show', vLoginShow) // 登录权限指令-未登录先登录
  //   .directive('friends', vFriends) // 是否好友
  .mount('#app')