import { ref } from 'vue'
import apis from '@/services/apis'
import { defineStore } from 'pinia'
import type { UserInfoType } from '@/services/types'

export const useUserStore = defineStore('user', () => {
  // Partial 将一个对象的所有属性转换为可选的
  const userInfo = ref<Partial<UserInfoType>>({})
  const isSign = ref(false)

  let localUserInfo = {}
  try {
    // localStorage提供了持久化键值对的方法
    localUserInfo = JSON.parse(localStorage.getItem('USER_INFO') || '{}')
  } catch (error) {
    localUserInfo = {}
  }

  // 从 local读取
  if (!Object.keys(userInfo.value).length && Object.keys(localUserInfo).length) {
    userInfo.value = localUserInfo
  }

  function getUserDetailAction() {
    apis
      .getUserDetail()
      .send()
      .then((data) => {
        userInfo.value = { ...userInfo.value, ...data }
      })
      .catch(() => {
        // 删除缓存
        localStorage.removeItem('TOKEN')
        localStorage.removeItem('USER_INFO')
      })
  }

  return { userInfo, isSign, getUserDetailAction }
})
