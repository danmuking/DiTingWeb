<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useWsLoginStore, LoginStatus } from "@/stores/ws";
// import QrCode from 'qrcode.vue'
import LoginTable from "./components/LoginTable/index.vue"
import RegisterTabel from "./components/RegisterTable/index.vue"

interface LoginForm {
  username: string;
  password: string;
}

const loginStore = useWsLoginStore();
const visible = computed({
  get() {
    return loginStore.showLogin;
  },
  set(value) {
    loginStore.showLogin = value;
  },
});

const isLogin = computed({
  get() {
    return loginStore.showLoginTalbe;
  },
  set(value) {
    value=loginStore.showLoginTalbe;
  },
});

const loginQrCode = computed(() => loginStore.loginQrCode);

// 关闭登录框
const closeLoginBox = () => {
  loginStore.showLogin = false;
  loginStore.showLoginTalbe = true; // 关闭时重置为登录表单
};

watchEffect(() => {
  // // 打开窗口了 而且 二维码没获取，而且非登录就去获取二维码
  // if (visible.value && !loginQrCode.value) {
  //   // 获取登录二维码
  //   loginStore.getLoginQrCode();
  // }
});
</script>

<template>
  <ElDialog 
    class="login-box-modal" 
    :width="420" 
    v-model="visible" 
    center 
    align-center
    :show-close="true"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
  >
    <div class="login-box">
      <!-- 自定义关闭按钮 -->
      <button class="custom-close-btn" @click="closeLoginBox">
        <span class="close-icon">×</span>
      </button>
      
      <!-- 背景装饰 -->
      <div class="login-bg-decoration">
        <div class="bg-circle circle-1"></div>
        <div class="bg-circle circle-2"></div>
        <div class="bg-circle circle-3"></div>
      </div>
      
      <!-- Logo区域 -->
      <div class="logo-section">
        <div class="logo-container">
          <img class="login-logo" src="@/assets/logo.png" alt="MallChat" />
          <div class="logo-glow"></div>
        </div>
        <h1 class="login-title">谛听</h1>
        <p class="login-slogan">连接你我，谛听心声</p>
      </div>
      
      <!-- 登录/注册表单区域 -->
      <div class="login-content">
        <transition name="fade-slide" mode="out-in">
          <LoginTable v-if="isLogin" key="login" />
          <RegisterTabel v-else key="register" />
        </transition>
      </div>
      
      <!-- 底部装饰 -->
      <div class="login-footer">
        <div class="footer-decoration">
          <div class="decoration-line"></div>
          <div class="decoration-dot"></div>
          <div class="decoration-line"></div>
        </div>
      </div>
    </div>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
