
<template>
  <div class="app-wrapper">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
// 全局导入 toast 样式
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'
</script>

<style scoped>
.app-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: url("@/assets/login_bg.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
/* 支持的话就替换 */
@supports (background-image: url("@/assets/login_bg.webp")) {
  .app-wrapper {
    background-image: url("@/assets/login_bg.webp");
  }
}
</style>
