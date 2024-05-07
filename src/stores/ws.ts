import { ref } from 'vue'
import { defineStore } from 'pinia'

import { WsRequestMsgType } from '@/utils/wsType'

export enum LoginStatus {
  Init,
  Waiting,
  Success,
}

export const useWsLoginStore = defineStore('wsLogin', () => {
  const loginQrCode = ref<string>()
  // 是否显示登录页面
  const showLogin = ref(false)
  // 是否显示登录表单
  const showLoginTalbe = ref(true)
  // 登录状态
  const loginStatus = ref(LoginStatus.Init)
  function getLoginQrCode() {
    // wsIns.send({ type: WsRequestMsgType.RequestLoginQrCode })
  }
  function resetLoginState() {
    loginQrCode.value = undefined
    loginStatus.value = LoginStatus.Init
  }

  return {
    loginQrCode,
    loginStatus,
    showLogin,
    showLoginTalbe,
    resetLoginState,
    getLoginQrCode,
  }
})
