<script setup lang="ts">
// import QrCode from 'qrcode.vue'
import { reactive, computed } from "vue";
import { useWsLoginStore, LoginStatus } from "@/stores/ws";
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useGroupStore } from '@/stores/group'
import { useGlobalStore } from '@/stores/global'
import { useEmojiStore } from '@/stores/emoji'
import type { FormRules } from "element-plus";
import { computedToken } from '@/services/request'
import apis from "@/services/apis";
import { OnlineEnum, ChangeTypeEnum, RoomTypeEnum } from '@/enums'
import type {
  LoginSuccessResType,
} from '@/services/types'
interface LoginForm {
  username: string;
  password: string;
}

const loginStore = useWsLoginStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const groupStore = useGroupStore()
const globalStore = useGlobalStore()
const emojiStore = useEmojiStore()
const showRegister = () => {
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
    .then((data) => {
      // debugger
      userStore.isSign = true
      const { token, ...rest } = data as LoginSuccessResType
      // FIXME 可以不需要赋值了，单独请求了接口。
      userStore.userInfo = { ...userStore.userInfo, ...rest }
      localStorage.setItem('USER_INFO', JSON.stringify(rest))
      localStorage.setItem('TOKEN', token)
      // 更新一下请求里面的 token.
      computedToken.clear()
      computedToken.get()
      loginStore.loginStatus = LoginStatus.Success
      // 获取用户详情
      userStore.getUserDetailAction()
      // 关闭登录弹窗
      loginStore.showLogin = false
      // 自己更新自己上线
      groupStore.batchUpdateUserStatus([
        {
          activeStatus: OnlineEnum.ONLINE,
          avatar: rest.avatar,
          lastOptTime: Date.now(),
          name: rest.name,
          uid: rest.uid,
        },
      ])
      // 获取详情
      chatStore.getSessionList(true)
      // // 自定义表情列表
      // emojiStore.getEmojiList()
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
        <ElInput size="large" v-model="loginForm.password" placeholder="密码" show-password />
      </el-form-item>
    </div>
    <div class="login-button-wrapper">
      <el-button size="large" @click="showRegister">注册</el-button>
      <el-button size="large" type="primary" @click="login">登录</el-button>
    </div>
  </el-form>
</template>
<style lang="scss" src="./styles.scss" scoped />