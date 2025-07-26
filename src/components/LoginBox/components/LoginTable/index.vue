<script setup lang="ts">
import { reactive, ref } from "vue";
import { useWsLoginStore, LoginStatus } from "@/stores/ws";
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { useGroupStore } from '@/stores/group'
import { useGlobalStore } from '@/stores/global'
import { useEmojiStore } from '@/stores/emoji'
import type { FormRules, FormInstance } from "element-plus";
import { computedToken } from '@/services/request'
import apis from "@/services/apis";
import { OnlineEnum, } from '@/enums'
import type {
  LoginSuccessResType,
} from '@/services/types'
import wsIns from '@/utils/websocket'

// 登录方式枚举
enum LoginType {
  PASSWORD = 'password',
  SMS = 'sms'
}

interface PasswordLoginForm {
  username: string;
  password: string;
}

interface SmsLoginForm {
  phone: string;
  code: string;
}

const loginStore = useWsLoginStore()
const userStore = useUserStore()
const chatStore = useChatStore()
const groupStore = useGroupStore()
const emojiStore = useEmojiStore()

// 当前登录方式
const currentLoginType = ref<LoginType>(LoginType.PASSWORD)

const showRegister = () => {
  loginStore.showLoginTalbe = false
}

// 手机号验证函数
const validatePhone = (value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

// 验证码验证函数
const validateCode = (value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入验证码'))
  } else if (!/^\d{6}$/.test(value)) {
    callback(new Error('验证码为6位数字'))
  } else {
    callback()
  }
}

// 账号密码登录表单
const passwordForm = reactive<PasswordLoginForm>({
  username: "",
  password: "",
});

// 手机号验证码登录表单
const smsForm = reactive<SmsLoginForm>({
  phone: "",
  code: "",
});

// 账号密码登录验证规则
const passwordRules = reactive<FormRules<PasswordLoginForm>>({
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 6, max: 15, message: "用户名长度在6-15个字符", trigger: "blur" },
  ],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
});

// 手机号验证码登录验证规则
const smsRules = reactive<FormRules<SmsLoginForm>>({
  phone: [{ validator: validatePhone, trigger: 'blur' }],
  code: [{ validator: validateCode, trigger: 'blur' }],
});

const passwordFormRef = ref<FormInstance>()
const smsFormRef = ref<FormInstance>()

// 发送验证码倒计时
const countdown = ref(0)
const canSendCode = ref(true)

const sendSmsCode = () => {
  if (!smsForm.phone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  // 验证手机号格式
  if (!/^1[3-9]\d{9}$/.test(smsForm.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  // 调用发送验证码的API
  apis.sendSmsCode({ phone: smsForm.phone })
    .send()
    .then(() => {
      ElMessage.success('验证码已发送')
      canSendCode.value = false
      countdown.value = 60
      
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
          canSendCode.value = true
        }
      }, 1000)
    })
    .catch((error) => {
      ElMessage.error('发送验证码失败：' + (error.message || '请稍后重试'))
    })
}

// 账号密码登录
const passwordLogin = () => {
  if (!passwordFormRef.value) return
  
  passwordFormRef.value.validate((valid) => {
    if (valid) {
      apis
        .userLogin({
          username: passwordForm.username,
          password: passwordForm.password,
        })
        .send()
        .then((data) => {
          handleLoginSuccess(data)
        })
        .catch((error) => {
          ElMessage.error('登录失败：' + (error.message || '用户名或密码错误'))
        });
    }
  })
}

// 手机号验证码登录
const smsLogin = () => {
  if (!smsFormRef.value) return
  
  smsFormRef.value.validate((valid) => {
    if (valid) {
      apis.smsLogin({
        phone: smsForm.phone,
        code: smsForm.code,
      })
      .send()
      .then((data) => {
        handleLoginSuccess(data)
      })
      .catch((error) => {
        ElMessage.error('登录失败：' + (error.message || '验证码错误'))
      })
    }
  })
}

// 处理登录成功
const handleLoginSuccess = (data: any) => {
  userStore.isSign = true
  const { token, ...rest } = data as LoginSuccessResType
  userStore.userInfo = { ...userStore.userInfo, ...rest }
  localStorage.setItem('USER_INFO', JSON.stringify(rest))
  localStorage.setItem('TOKEN', token)
  
  // 更新请求token
  computedToken.clear()
  computedToken.get()
  loginStore.loginStatus = LoginStatus.Success
  
  // 连接websocket
  wsIns.initConnect()
  
  // 获取用户详情
  userStore.getUserDetailAction()
  
  // 关闭登录弹窗
  loginStore.showLogin = false
  
  // 更新用户状态
  groupStore.batchUpdateUserStatus([
    {
      activeStatus: OnlineEnum.ONLINE,
      avatar: rest.avatar,
      lastOptTime: Date.now(),
      name: rest.name,
      uid: rest.uid,
    },
  ])
  
  // 获取会话列表
  chatStore.getSessionList(true)
  
  // 获取表情列表
  emojiStore.getEmojiList()
}
</script>

<template>
  <div class="login-container">
    <!-- 账号密码登录表单 -->
    <transition name="fade-slide" mode="out-in">
      <el-form 
        v-if="currentLoginType === LoginType.PASSWORD"
        key="password"
        class="login-wrapper" 
        :model="passwordForm" 
        :rules="passwordRules" 
        label-width="auto"
        ref="passwordFormRef"
      >
        <div class="login-input-wrapper">
          <el-form-item label-width="0" label="" prop="username">
            <div class="input-with-icon">
              <i class="el-icon-user input-icon"></i>
              <ElInput 
                size="large" 
                v-model="passwordForm.username" 
                placeholder="请输入用户名"
                class="custom-input"
              />
            </div>
          </el-form-item>
          <el-form-item label-width="0" label="" prop="password">
            <div class="input-with-icon">
              <i class="el-icon-lock input-icon"></i>
              <ElInput 
                size="large" 
                v-model="passwordForm.password" 
                placeholder="请输入密码" 
                show-password
                class="custom-input"
              />
            </div>
          </el-form-item>
        </div>
        <!-- 切换登录方式 -->
        <div class="login-switch-text">
          <span @click="currentLoginType = LoginType.SMS" class="switch-link">
            <i class="el-icon-mobile-phone"></i>
            使用手机号验证码登录
          </span>
        </div>
        <div class="login-button-wrapper">
          <el-button 
            size="large" 
            @click="showRegister"
            class="register-btn"
            :loading="false"
          >
            注册
          </el-button>
          <el-button 
            size="large" 
            type="primary" 
            @click="passwordLogin"
            class="login-btn"
            :loading="false"
          >
            登录
          </el-button>
        </div>
      </el-form>

      <!-- 手机号验证码登录表单 -->
      <el-form 
        v-else
        key="sms"
        class="login-wrapper" 
        :model="smsForm" 
        :rules="smsRules" 
        label-width="auto"
        ref="smsFormRef"
      >
        <div class="login-input-wrapper">
          <el-form-item label-width="0" label="" prop="phone">
            <div class="input-with-icon">
              <i class="el-icon-mobile-phone input-icon"></i>
              <ElInput 
                size="large" 
                v-model="smsForm.phone" 
                placeholder="请输入手机号"
                class="custom-input"
              />
            </div>
          </el-form-item>
          <el-form-item label-width="0" label="" prop="code">
            <div class="code-input-wrapper">
              <div class="input-with-icon">
                <i class="el-icon-key input-icon"></i>
                <ElInput 
                  size="large" 
                  v-model="smsForm.code" 
                  placeholder="请输入验证码"
                  class="custom-input"
                />
              </div>
              <el-button 
                :disabled="!canSendCode" 
                @click="sendSmsCode"
                class="send-code-btn"
                :class="{ 'disabled': !canSendCode }"
              >
                <i class="el-icon-message"></i>
                {{ canSendCode ? '发送验证码' : `${countdown}s后重发` }}
              </el-button>
            </div>
          </el-form-item>
        </div>
        <!-- 切换登录方式 -->
        <div class="login-switch-text">
          <span @click="currentLoginType = LoginType.PASSWORD" class="switch-link">
            <i class="el-icon-user"></i>
            使用账号密码登录
          </span>
        </div>
        <div class="login-button-wrapper">
          <el-button 
            size="large" 
            @click="showRegister"
            class="register-btn"
            :loading="false"
          >
            注册
          </el-button>
          <el-button 
            size="large" 
            type="primary" 
            @click="smsLogin"
            class="login-btn"
            :loading="false"
          >
            登录
          </el-button>
        </div>
      </el-form>
    </transition>


  </div>
</template>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  position: relative;
}



.login-wrapper {
  width: 100%;
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  animation: slideInUp 0.6s ease-out;
}

.login-input-wrapper {
  width: 100%;
  margin-bottom: 20px;
  
  .input-with-icon {
    position: relative;
    width: 100%;
    
    .input-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #909399;
      font-size: 18px;
      z-index: 3;
      transition: color 0.3s ease;
    }
    
    .custom-input {
      width: 100%;
      
      .el-input__wrapper {
        background: rgba(255, 255, 255, 0.9);
        border: 2px solid transparent;
        border-radius: 12px;
        padding-left: 45px;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #409eff;
        }
        
        &.is-focus {
          border-color: #409eff;
          
          .input-icon {
            color: #409eff;
          }
        }
      }
    }
  }
  
  .code-input-wrapper {
    display: flex;
    gap: 12px;
    
    .input-with-icon {
      flex: 1;
      min-width: 0; // 确保flex项目可以收缩
    }
    
    .send-code-btn {
      width: 30%;
      height: 100%;
      white-space: nowrap;
      border-radius: 12px;
      background: linear-gradient(135deg, #409eff, #66b1ff);
      border: none;
      color: white;
      font-weight: 500;
      transition: all 0.3s ease;
      
      &:hover:not(.disabled) {
        transform: translateY(-2px);
      }
      
      &.disabled {
        background: #c0c4cc;
        cursor: not-allowed;
      }
      
      i {
        margin-right: 4px;
      }
    }
  }
}

.login-button-wrapper {
  width: 100%;
  height: 40px;
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  
  .register-btn, .login-btn {
    flex: 1;
    height: 100%;
    border-radius: 12px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    border: none;
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s ease;
    }
    
    &:hover::before {
      left: 100%;
    }
  }
  
  .register-btn {
    background: linear-gradient(135deg, #87ceeb, #b0e0e6);
    color: white;
    box-shadow: 0 4px 12px rgba(135, 206, 235, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(135, 206, 235, 0.4);
    }
  }
  
  .login-btn {
    background: linear-gradient(135deg, #409eff, #66b1ff);
    color: white;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
    }
  }
}

.login-switch-text {
  text-align: left;
  margin-bottom: 20px;
  
  .switch-link {
    color: #409eff;
    font-size: 13px;
    cursor: pointer;
    text-decoration: none;
    transition: all 0.3s ease;
    display: inline-flex;
    align-items: center;
    
    i {
      margin-right: 4px;
      font-size: 14px;
    }
    
    &:hover {
      color: #66b1ff;
      text-decoration: underline;
    }
  }
}

// 动画效果
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}



// 关键帧动画
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(120deg);
  }
  66% {
    transform: translateY(10px) rotate(240deg);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .login-container {
    padding: 15px;
  }
  
  .login-wrapper {
    padding: 20px;
  }
  
  .login-header .login-title {
    font-size: 24px;
  }
  
  .login-button-wrapper {
    flex-direction: column;
    
    .register-btn, .login-btn {
      width: 100%;
    }
  }
}
</style>