<script setup lang="ts">
// import QrCode from 'qrcode.vue'
import { useWsLoginStore } from "@/stores/ws";
import { reactive, ref, computed, watchEffect } from "vue";
import type { FormRules, FormInstance } from "element-plus";
import { ElMessage } from "element-plus";
import apis from "@/services/apis";
interface RegisterForm {
    username: string;
    password: string;
    repeatPassword: string;
    phone: string;
    code: string;
}
// type RegisterPostForm = Pick<RegisterForm, 'username' | 'password'>
const ruleFormRef = ref<FormInstance>()
const validatePass = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (!registerForm.password) {
        callback(new Error('请先输入密码'))
    } else if (value !== registerForm.password) {
        callback(new Error("两次输入密码不一致"))
    } else {
        callback()
    }
}

const validatePassword = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请输入密码'))
    } else if (value.length < 6) {
        callback(new Error('密码长度不能少于6位'))
    } else if (value.length > 20) {
        callback(new Error('密码长度不能超过20位'))
    } else {
        callback()
    }
}

const validatePhone = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请输入手机号'))
    } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'))
    } else {
        callback()
    }
}

const validateCode = (rule: any, value: any, callback: any) => {
    if (value === '') {
        callback(new Error('请输入验证码'))
    } else if (!/^\d{6}$/.test(value)) {
        callback(new Error('请输入6位数字验证码'))
    } else {
        callback()
    }
}
const rules = reactive<FormRules<RegisterForm>>({
    username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 6, max: 15, message: "用户名长度在6-15个字符", trigger: "blur" },
    ],
    password: [{ validator: validatePassword, trigger: 'blur' }],
    repeatPassword: [{ validator: validatePass, trigger: 'blur' }],
    phone: [{ validator: validatePhone, trigger: 'blur' }],
    code: [{ validator: validateCode, trigger: 'blur' }],
});
const registerForm = reactive<RegisterForm>({
    username: "",
    password: "",
    repeatPassword: "",
    phone: "",
    code: ""
});

const loginStore = useWsLoginStore();
const countdown = ref(0);
const canSendCode = computed(() => countdown.value === 0);

// 监听密码变化，实时验证
watchEffect(() => {
    // 当确认密码字段有值且密码字段也有值时，触发验证
    if (registerForm.repeatPassword && registerForm.password) {
        ruleFormRef.value?.validateField('repeatPassword');
    }
    // 当密码字段变化且确认密码字段有值时，也触发验证
    if (registerForm.repeatPassword && registerForm.password !== registerForm.repeatPassword) {
        ruleFormRef.value?.validateField('repeatPassword');
    }
});

// 发送验证码
const sendSmsCode = () => {
    if (!registerForm.phone) {
        ElMessage.warning('请先输入手机号');
        return;
    }
    
    apis.sendSmsCode({ phone: registerForm.phone })
        .send()
        .then(() => {
            ElMessage.success('验证码已发送');
            countdown.value = 60;
            const timer = setInterval(() => {
                countdown.value--;
                if (countdown.value <= 0) {
                    clearInterval(timer);
                }
            }, 1000);
        })
        .catch(() => {
            ElMessage.error('验证码发送失败');
        });
};

// 完成注册
const register = (formEl: FormInstance | undefined) => {
    if (!formEl) return;
    formEl.validate((valid) => {
        if (valid) {
            apis
                .userRegister({
                    username: registerForm.username,
                    password: registerForm.password,
                    phone: registerForm.phone,
                    code: registerForm.code,
                })
                .send()
                .then(() => {
                    ElMessage.success('注册成功');
                    loginStore.showLoginTalbe = true;
                })
                .catch(() => {
                    ElMessage.error('注册失败');
                });
        } else {
            console.log('error submit!');
            return false;
        }
    });
};
</script>
<template>
    <div class="register-container">
        <el-form class="register-wrapper" :model="registerForm" :rules="rules" label-width="auto" ref="ruleFormRef">
            <div class="register-input-wrapper">
                <el-form-item label="" label-width="0" prop="username">
                    <div class="input-with-icon">
                        <i class="el-icon-user input-icon"></i>
                        <ElInput size="large" v-model="registerForm.username" placeholder="用户名" class="custom-input" />
                    </div>
                </el-form-item>
                <el-form-item label="" label-width="0" prop="password">
                    <div class="input-with-icon">
                        <i class="el-icon-lock input-icon"></i>
                        <ElInput size="large" v-model="registerForm.password" placeholder="密码" show-password class="custom-input" />
                    </div>
                </el-form-item>
                <el-form-item label="" label-width="0" prop="repeatPassword">
                    <div class="input-with-icon">
                        <i class="el-icon-lock input-icon"></i>
                        <ElInput size="large" v-model="registerForm.repeatPassword" placeholder="再次输入密码" show-password class="custom-input" />
                    </div>
                </el-form-item>
                <el-form-item label="" label-width="0" prop="phone">
                    <div class="input-with-icon">
                        <i class="el-icon-mobile-phone input-icon"></i>
                        <ElInput size="large" v-model="registerForm.phone" placeholder="手机号" class="custom-input" />
                    </div>
                </el-form-item>
                <el-form-item label="" label-width="0" prop="code">
                    <div class="code-input-wrapper">
                        <div class="input-with-icon">
                            <i class="el-icon-message input-icon"></i>
                            <ElInput size="large" v-model="registerForm.code" placeholder="验证码" class="custom-input" />
                        </div>
                        <el-button 
                            size="large" 
                            @click="sendSmsCode" 
                            :disabled="!canSendCode"
                            class="send-code-btn"
                        >
                            {{ canSendCode ? '发送验证码' : `${countdown}s` }}
                        </el-button>
                    </div>
                </el-form-item>
            </div>
            <div class="register-button-wrapper">
                <el-button size="large" @click="register(ruleFormRef)" type="primary" class="register-btn">注册</el-button>
            </div>
        </el-form>
    </div>
</template>
<style lang="scss" src="./styles.scss" scoped />