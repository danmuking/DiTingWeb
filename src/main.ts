import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import './style.css'
import App from './App.vue'
import router from './router'


const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)


const app = createApp(App)
app
  .use(pinia)
  .use(router)
//   .directive('login', vLogin) // 登录权限指令-未登录先登录
//   .directive('login-show', vLoginShow) // 登录权限指令-未登录先登录
//   .directive('friends', vFriends) // 是否好友
  .mount('#app')