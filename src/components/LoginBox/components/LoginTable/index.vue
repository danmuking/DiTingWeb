<script setup lang="ts">
// import QrCode from 'qrcode.vue'
import { reactive,computed } from "vue";
import { useWsLoginStore, LoginStatus } from "@/stores/ws";
import type {  FormRules } from "element-plus";
import apis from "@/services/apis";
interface LoginForm {
  username: string;
  password: string;
}

const loginStore = useWsLoginStore();
const showRegister = ()=>{
    loginStore.showLoginTalbe = false
}

const rules = reactive<FormRules<LoginForm>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 6, max: 15, message: "用户名长度在6-15个字符", trigger: "blur" },
  ],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
});
const loginForm = reactive<LoginForm>({
  username: "",
  password: "",
});

// 发送登录请求
const login = () => {
  apis
    .userLogin({
      username: loginForm.username,
      password: loginForm.password,
    })
    .send()
    .then((res) => {
      console.log(res);
    });
};
</script>
<template>
    <el-form class="login-wrapper" :model="loginForm" :rules="rules" label-width="auto">
        <div class="login-input-wrapper">
          <el-form-item label-width="0" label="" prop="username">
            <ElInput size="large" v-model="loginForm.username" placeholder="用户名" />
          </el-form-item>
          <el-form-item label-width="0" label="" prop="password">
            <ElInput
              size="large"
              v-model="loginForm.password"
              placeholder="密码"
              show-password
            />
          </el-form-item>
        </div>
        <div class="login-button-wrapper">
          <el-button size="large" @click="showRegister">注册</el-button>
          <el-button size="large" type="primary" @click="login">登录</el-button>
        </div>
      </el-form>
</template>
<style lang="scss" src="./styles.scss" scoped />