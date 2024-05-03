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
    return true;
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

watchEffect(() => {
  // 打开窗口了 而且 二维码没获取，而且非登录就去获取二维码
  if (visible.value && !loginQrCode.value) {
    // 获取登录二维码
    loginStore.getLoginQrCode();
  }
});
</script>

<template>
  <ElDialog class="login-box-modal" :width="376" v-model="visible" center align-center>
    <div class="login-box">
      <img class="login-logo" src="@/assets/logo.png" alt="MallChat" />
      <p class="login-slogan">连接你我，谛听心声</p>
      
        <div class="login-input-wrapper">
          <LoginTable v-if="isLogin" />
          <RegisterTabel v-else></RegisterTabel>
        </div>
    </div>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
