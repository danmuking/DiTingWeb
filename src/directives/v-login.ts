import type { Directive } from 'vue'

import { useUserStore } from '@/stores/user'
import { useWsLoginStore } from '@/stores/ws'
const handler = (fn: Function) => {
  const userStore = useUserStore()
  const loginStore = useWsLoginStore()
  // 没登录显示登录界面
  if (!userStore.isSign) {
    loginStore.showLogin = true
    loginStore.showLoginTalbe = true // 确保显示登录表单
    return
  }
  // 已登录执行回调
  fn?.()
}

const vLogin: Directive = {
  mounted(el, binding) {
    if (typeof binding.value !== 'function') return
    el.fn = handler.bind(el, binding.value)
    el.addEventListener('click', el.fn)
  },
  unmounted(el, binding) {
    if (typeof binding.value !== 'function') return
    el.removeEventListener('click', el.fn)
  },
}

export default vLogin
