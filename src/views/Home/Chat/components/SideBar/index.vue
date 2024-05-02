<script setup lang="ts">
import { formatTimestamp } from '@/utils/computedTime'
const sessionList = [
    {
      // ...item,
      name: 'test',
      avatar:'avatar',
      roomId:1,
      unreadCount: 1,
      tag: '官方' ,
      lastMsg: '欢迎使用MallChat',
      // 获取当前时间
      lastMsgTime: formatTimestamp(new Date().getTime() / 1000),
    },
    {
      // ...item,
      name: 'test',
      avatar:'avatar',
      roomId:1,
      unreadCount: 1,
      tag: '官方' ,
      lastMsg: '欢迎使用MallChat',
      // 获取当前时间
      lastMsgTime: formatTimestamp(new Date().getTime() / 1000),
    }
]
</script>

<template>
  <ul class="chat-message" :infinite-scroll-immediate="false">
    <li
      v-for="(item, index) in sessionList"
      :key="index"
      :data-room-id="item.roomId"
      :class="['chat-message-item']"
    >
      <div class="item-wrapper">
        <el-badge :value="item.unreadCount" :max="999" :hidden="item.unreadCount < 1" class="item">
          <el-avatar shape="circle" :size="38" :src="item.avatar" />
        </el-badge>
        <div class="message-info">
          <div style="white-space: nowrap">
            <span class="person">{{ item.name }}</span>
            <span v-if="item.tag" class="tag">{{ item.tag }}</span>
          </div>
          <div class="message-message">{{ item.lastMsg }}</div>
        </div>
        <span class="message-time">{{ item.lastMsgTime }}</span>
      </div>
    </li>
  </ul>
</template>

<style lang="scss" src="./styles.scss" scoped />
