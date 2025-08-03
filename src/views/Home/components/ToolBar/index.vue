<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { judgeClient } from '@/utils/detectDevice'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// import { useGroupStore } from '@/stores/group'
// import { useGlobalStore } from '@/stores/global'



const client = judgeClient()
const visible = ref(false)
const popoverVisible = ref(false)
const popoverOpacity = ref(0)
const hideTimeout = ref<NodeJS.Timeout | null>(null)
const userStore = useUserStore()
const router = useRouter()
// const groupStore = useGroupStore()
// const globalStore = useGlobalStore()

const showSettingBox = () => {
  if (!userStore.isSign) {
    visible.value = true
  }
}

// 退出登录
const logout = () => {
  // 清除本地数据
  localStorage.removeItem('TOKEN')
  localStorage.removeItem('USER_INFO')
  userStore.isSign = false
  userStore.userInfo = {}
  
  ElMessage.success('已退出登录')
  
  // 刷新页面或跳转到登录页
  window.location.reload()
}

// 跳转到用户详情页
const goToProfile = () => {
  router.push('/profile')
}

// 弹窗控制函数
const showPopover = () => {
  // 清除之前的隐藏定时器
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
    hideTimeout.value = null
  }
  popoverVisible.value = true
  popoverOpacity.value = 1
}

const hidePopover = () => {
  // 设置延迟隐藏
  hideTimeout.value = setTimeout(() => {
    // 开始渐隐动画
    popoverOpacity.value = 0
    // 动画结束后隐藏元素
    setTimeout(() => {
      popoverVisible.value = false
      hideTimeout.value = null
    }, 300) // 渐隐动画持续300ms
  }, 500) // 0.5秒后开始渐隐
}

const handleMouseLeave = () => {
  hidePopover()
}

// 组件卸载时清理定时器
onUnmounted(() => {
  if (hideTimeout.value) {
    clearTimeout(hideTimeout.value)
  }
})


const avatar = computed(() => userStore?.userInfo.avatar)
// const unReadMark = computed(() => globalStore.unReadMark)

// // 是否PC端
const isPc = computed(() => client === 'PC')

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
    <div v-if="userStore.isSign" class="avatar-wrapper" @mouseenter="showPopover" @mouseleave="handleMouseLeave">
      <Avatar :src="avatar" :size="isPc ? 50 : 40" :shape="'square'" class="avatar-hover" />
      <div v-if="popoverVisible" class="custom-popover" :style="{ opacity: popoverOpacity }" @mouseenter="showPopover" @mouseleave="handleMouseLeave">
        <div class="menu-item" @click="goToProfile">
          <i class="el-icon-user"></i>
          <span>修改信息</span>
        </div>
        <div class="menu-item logout" @click="logout">
          <i class="el-icon-switch-button"></i>
          <span>退出登录</span>
        </div>
      </div>
    </div>
    
    <Avatar 
      v-else 
      :src="''" 
      :size="isPc ? 50 : 40" 
      :shape="'square'" 
      v-login="showSettingBox" 
    />
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