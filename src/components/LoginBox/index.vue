<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { useWsLoginStore, LoginStatus } from "@/stores/ws";
// import QrCode from 'qrcode.vue'
import { reactive, ref } from "vue";
import type { ComponentSize, FormInstance, FormRules } from "element-plus";

interface LoginForm {
  name: string;
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

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 6, max: 15, message: "用户名长度在6-15个字符", trigger: "blur" },
  ],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
});
const loginForm = reactive<LoginForm>({
  name: "",
  password: "",
});

const loginQrCode = computed(() => loginStore.loginQrCode);
const loginStatus = computed(() => loginStore.loginStatus);

watchEffect(() => {
  // 打开窗口了 而且 二维码没获取，而且非登录就去获取二维码
  if (visible.value && !loginQrCode.value) {
    // 获取登录二维码
    loginStore.getLoginQrCode()
  }
});
</script>

<template>
  <ElDialog class="login-box-modal" :width="376" v-model="visible" center align-center>
    <div class="login-box">
      <img class="login-logo" src="@/assets/logo.png" alt="MallChat" />
      <p class="login-slogan">连接你我，谛听心声</p>
      <el-form class="login-wrapper" :model="loginForm" :rules="rules" label-width="auto">
        <div class="login-input-wrapper">
          <el-form-item label="" prop="name">
            <ElInput size="large" v-model="loginForm.name" placeholder="用户名" />
          </el-form-item>
          <el-form-item label="" prop="password">
            <ElInput
              size="large"
              v-model="loginForm.password"
              placeholder="密码"
              show-password
            />
          </el-form-item>
        </div>
        <div class="login-button-wrapper">
          <el-button size="large">注册</el-button>
          <el-button size="large" type="primary">登录</el-button>
        </div>
      </el-form>
    </div>
  </ElDialog>
</template>

<style lang="scss" src="./styles.scss" scoped />
