<script setup lang="ts">
import { computed, ref } from 'vue'
import { judgeClient } from '@/utils/detectDevice'
import { useUserStore } from '@/stores/user'
// import { useGroupStore } from '@/stores/group'
// import { useGlobalStore } from '@/stores/global'



const client = judgeClient()
const visible = ref(false)
const userStore = useUserStore()
// const groupStore = useGroupStore()
// const globalStore = useGlobalStore()

const showSettingBox = () => (visible.value = true)
const avatar = computed(() => userStore?.userInfo.avatar)
// const unReadMark = computed(() => globalStore.unReadMark)

// // 是否PC端
const isPc = computed(() => client === 'PC')
console.log(isPc)

const menuList = [
  {
    name: '',
    desc: '哔哩哔哩',
    icon: 'bilibili',
    handler: () => {
      // window.open('https://space.bilibili.com/146719540', '_blank')
    },
  },
  {
    name: '项目文档',
    desc: '语雀',
    icon: 'yuque',
    handler: () => {
      window.open('https://danmuking.github.io/', '_blank')
    },
  },
  {
    name: '618超优惠',
    desc: '腾讯云',
    icon: 'tengxunyun',
    handler: () => {
      window.open('https://curl.qcloud.com/DhrHVHJh', '_blank')
    },
  },
  {
    name: '后端源码',
    desc: 'MallChatWeb Server',
    icon: 'GitHubBlack',
    handler: () => {
      window.open('https://github.com/danmuking/DiTing-Go', '_blank')
    },
  },
  {
    name: '前端源码',
    desc: 'MallChatWeb Web',
    icon: 'GitHubBlack',
    handler: () => {
      window.open('https://github.com/danmuking/DiTingWeb', '_blank')
    },
  },
]
</script>
<template>
  <aside class="side-toolbar">
    <Avatar :src="userStore.isSign ? avatar : ''" :size="isPc ? 50 : 40" :shape="'square'" v-login="showSettingBox" />
    <div class="tool-icons">
      <div class="tool-icons">
      <!-- 会话 -->
      <router-link exactActiveClass="tool-icon-active" to="/">
        <el-badge
          :max="99"
        >
          <Icon class="tool-icon" icon="chat" :size="28" />
        </el-badge>
      </router-link>
      <!-- 联系人 -->
      <router-link v-login-show exactActiveClass="tool-icon-active" to="/contact">
        <el-badge
          :max="99"
        >
          <Icon class="tool-icon" icon="group" :size="28" />
        </el-badge>
      </router-link>
    </div>
    </div>
    <div class="menu">
      <el-tooltip effect="dark" :placement="isPc ? 'right' : 'bottom'">
        <template #content>
          <img class="icon-wechat-qrcode" src="" alt="wx qrcode" />
        </template>
        <Icon icon="weixin" :size="28" colorful />
      </el-tooltip>
      <a v-for="(item, index) in menuList" class="menu-item" :key="index" :title="item.desc" @click="item.handler">
        <Icon :icon="item.icon" :size="28" colorful />
        <span v-if="item.name" class="menu-item-name">{{ item.name }}</span>
      </a>
    </div>
    <!-- <UserSettingBox v-model="visible" /> -->
  </aside>
</template>

<style lang="scss" src="./styles.scss" scoped />