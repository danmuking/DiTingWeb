<script setup lang="ts">
import { computed, ref } from 'vue'
import { judgeClient } from '@/utils/detectDevice'

const client = judgeClient()
const visible = ref(false)

// // 是否PC端
const isPc = computed(() => client === 'PC')

const menuList = [
  {
    name: '',
    desc: '哔哩哔哩',
    icon: 'bilibili',
    handler: () => {
      window.open('https://space.bilibili.com/146719540', '_blank')
    },
  },
  {
    name: '项目文档',
    desc: '语雀',
    icon: 'yuque',
    handler: () => {
      window.open('https://www.yuque.com/snab/planet/cef1mcko4fve0ur3', '_blank')
    },
  },
  {
    name: '618超优惠',
    desc: '腾讯云',
    icon: 'tengxunyun',
    handler: () => {
      window.open('https://curl.qcloud.com/qSaH0JLT', '_blank')
    },
  },
  {
    name: '后端源码',
    desc: 'MallChatWeb Server',
    icon: 'GitHubBlack',
    handler: () => {
      window.open('https://github.com/zongzibinbin/MallChat', '_blank')
    },
  },
  {
    name: '前端源码',
    desc: 'MallChatWeb Web',
    icon: 'GitHubBlack',
    handler: () => {
      window.open('https://github.com/Evansy/MallChatWeb', '_blank')
    },
  },
]
</script>
<template>
    <aside class="side-toolbar">
      <div></div>
      <div class="menu">
        <el-tooltip effect="dark" :placement="isPc ? 'right' : 'bottom'">
          <template #content>
            <img class="icon-wechat-qrcode" :src="qrcode" alt="wx qrcode" />
          </template>
          <Icon icon="weixin" :size="28" colorful />
        </el-tooltip>
        <a
          v-for="(item, index) in menuList"
          class="menu-item"
          :key="index"
          :title="item.desc"
          @click="item.handler"
        >
          <Icon :icon="item.icon" :size="28" colorful />
          <span v-if="item.name" class="menu-item-name">{{ item.name }}</span>
        </a>
      </div>
      <!-- <Icon icon="zhankai" :size="28" /> -->
      <!-- <UserSettingBox v-model="visible" /> -->
    </aside>
  </template>

<style lang="scss" src="./styles.scss" scoped />