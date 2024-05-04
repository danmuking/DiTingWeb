<script setup lang="ts">
// import QrCode from 'qrcode.vue'
import { useWsLoginStore, LoginStatus } from "@/stores/ws";
import { reactive, ref } from "vue";
import type { FormRules, FormInstance } from "element-plus";
import apis from "@/services/apis";
interface RegisterForm {
    username: string;
    password: string;
    repeatPassword: string;
}
// type RegisterPostForm = Pick<RegisterForm, 'username' | 'password'>
const ruleFormRef = ref<FormInstance>()
const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerForm.password) {
        callback(new Error("两次输入密码不一致"))
    } else {
        callback()
    }
}
const rules = reactive<FormRules<RegisterForm>>({
    username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 6, max: 15, message: "用户名长度在6-15个字符", trigger: "blur" },
    ],
    password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
    repeatPassword: [{ validator: validatePass, trigger: 'blur' }],
});
const registerForm = reactive<RegisterForm>({
    username: "",
    password: "",
    repeatPassword: ""
});

const loginStore = useWsLoginStore();
const showLogin = () => {
    loginStore.showLoginTalbe = true
}

// 发送登录请求
const register = (formEl: FormInstance | undefined) => {
    if (!formEl) return
    formEl.validate((valid) => {
        if (valid) {
            // TODO:注册
            apis
                .userRegister({
                    username: registerForm.username,
                    password: registerForm.password,
                })
                .send()
                .then(() => {
                    ElMessage.success('注册成功');
                    loginStore.showLoginTalbe = true
                });
        } else {
            console.log('error submit!')
            return false
        }
    })

};
</script>
<template>
    <el-form class="register-wrapper" :model="registerForm" :rules="rules" label-width="auto" ref="ruleFormRef">
        <div class="register-input-wrapper">
            <el-form-item label="" label-width="0" prop="username">
                <ElInput size="large" v-model="registerForm.username" placeholder="用户名" />
            </el-form-item>
            <el-form-item label="" label-width="0" prop="password">
                <ElInput size="large" v-model="registerForm.password" placeholder="密码" show-password />
            </el-form-item>
            <el-form-item label="" label-width="0" prop="repeatPassword">
                <ElInput size="large" v-model="registerForm.repeatPassword" placeholder="再次输入密码" show-password />
            </el-form-item>
        </div>
        <div class="login-button-wrapper">
            <el-button size="large" @click="register(ruleFormRef)" type="primary">注册</el-button>
            <el-button size="large" @click="showLogin">登录</el-button>
        </div>
    </el-form>
</template>
<style lang="scss" src="./styles.scss" scoped />