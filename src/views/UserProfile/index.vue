<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import apis from '@/services/apis'
import ProfileHeader from './components/ProfileHeader.vue'

const userStore = useUserStore()

// 修改用户名表单
const nameForm = reactive({
  name: userStore.userInfo.name || ''
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 修改手机号表单
const phoneForm = reactive({
  newPhone: '',
  captcha: ''
})

// 验证码倒计时
const captchaCountdown = ref(0)

// 头像上传相关
const avatarFile = ref<File>()

// 编辑状态
const isEditingName = ref(false)
const isEditingAvatar = ref(false)

// 修改用户名
const updateUserName = () => {
  if (!nameForm.name.trim()) {
    ElMessage.warning('请输入用户名')
    return
  }
  
  apis.modifyUserName(nameForm.name)
    .send()
    .then(() => {
      ElMessage.success('用户名修改成功')
      userStore.userInfo.name = nameForm.name
      // 更新本地存储
      const localUserInfo = JSON.parse(localStorage.getItem('USER_INFO') || '{}')
      localUserInfo.name = nameForm.name
      localStorage.setItem('USER_INFO', JSON.stringify(localUserInfo))
      isEditingName.value = false
    })
    .catch(() => {
      ElMessage.error('用户名修改失败')
    })
}

// 取消编辑用户名
const cancelEditName = () => {
  nameForm.name = userStore.userInfo.name || ''
  isEditingName.value = false
}

// 修改密码
const updatePassword = () => {
  if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入密码不一致')
    return
  }
  
  apis.modifyPassword({
    oldPassword: passwordForm.oldPassword,
    newPassword: passwordForm.newPassword
  })
    .send()
    .then(() => {
      ElMessage.success('密码修改成功')
      passwordForm.oldPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    })
    .catch(() => {
      ElMessage.error('密码修改失败')
    })
}

// 修改手机号
const updatePhone = () => {
  if (!phoneForm.newPhone || !phoneForm.captcha) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  apis.modifyPhone({
    newPhone: phoneForm.newPhone,
    captcha: phoneForm.captcha
  })
    .send()
    .then(() => {
      ElMessage.success('手机号修改成功')
      phoneForm.newPhone = ''
      phoneForm.captcha = ''
    })
    .catch(() => {
      ElMessage.error('手机号修改失败')
    })
}

// 发送验证码
const sendCaptcha = () => {
  if (!phoneForm.newPhone) {
    ElMessage.warning('请先输入手机号')
    return
  }
  
  if (!/^1[3-9]\d{9}$/.test(phoneForm.newPhone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  apis.sendCaptcha({ phone: phoneForm.newPhone })
    .send()
    .then(() => {
      ElMessage.success('验证码已发送')
      captchaCountdown.value = 60
      const timer = setInterval(() => {
        captchaCountdown.value--
        if (captchaCountdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    })
    .catch(() => {
      ElMessage.error('验证码发送失败')
    })
}

// 上传头像
const handleAvatarUpload = (file: File) => {
  avatarFile.value = file
  return false // 阻止自动上传
}

// 保存头像
const saveAvatar = () => {
  if (!avatarFile.value) {
    ElMessage.warning('请先选择头像')
    return
  }
  
  const formData = new FormData()
  formData.append('avatar', avatarFile.value)
  
  apis.uploadAvatar(formData)
    .send()
    .then((data) => {
      ElMessage.success('头像上传成功')
      userStore.userInfo.avatar = data.avatarUrl
      // 更新本地存储
      const localUserInfo = JSON.parse(localStorage.getItem('USER_INFO') || '{}')
      localUserInfo.avatar = data.avatarUrl
      localStorage.setItem('USER_INFO', JSON.stringify(localUserInfo))
      avatarFile.value = undefined
      isEditingAvatar.value = false
    })
    .catch(() => {
      ElMessage.error('头像上传失败')
    })
}

// 取消编辑头像
const cancelEditAvatar = () => {
  avatarFile.value = undefined
  isEditingAvatar.value = false
}

// 注销账户
const deleteAccount = () => {
  ElMessageBox.confirm(
    '确定要注销账户吗？此操作不可恢复，所有数据将被永久删除。',
    '注销账户',
    {
      confirmButtonText: '确定注销',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      apis.deleteAccount()
        .send()
        .then(() => {
          ElMessage.success('账户已注销')
          // 清除本地数据
          localStorage.removeItem('TOKEN')
          localStorage.removeItem('USER_INFO')
          userStore.isSign = false
          userStore.userInfo = {}
          // 跳转到登录页
          window.location.href = '/'
        })
        .catch(() => {
          ElMessage.error('注销账户失败')
        })
    })
}
</script>

<template>
  <div class="user-profile">
    <ProfileHeader />
    <div class="profile-container">
      <!-- 用户信息卡片 -->
      <div class="user-info-card">
        <div class="user-avatar" @click.stop="isEditingAvatar = true">
          <img
            :src="userStore.userInfo.avatar || '/src/assets/logo.png'"
            alt="用户头像"
            class="avatar-image"
          />
          <div class="avatar-overlay">
            <i class="el-icon-camera"></i>
          </div>
        </div>
        <div class="user-details">
          <div class="name-section">
            <h1 v-if="!isEditingName" class="user-name" @click.stop="isEditingName = true">
              {{ userStore.userInfo.name || '用户' }}
              <i class="el-icon-edit edit-icon"></i>
            </h1>
            <div v-else class="name-edit-section">
              <el-input
                v-model="nameForm.name"
                placeholder="请输入新的用户名"
                class="name-input"
                size="large"
                @keyup.enter="updateUserName"
                @keyup.esc="cancelEditName"
                ref="nameInputRef"
              />
              <div class="name-edit-actions">
                <el-button type="primary" size="small" @click="updateUserName">
                  <i class="el-icon-check"></i>
                  确定
                </el-button>
                <el-button size="small" @click="cancelEditName">
                  <i class="el-icon-close"></i>
                  取消
                </el-button>
              </div>
            </div>
          </div>
          <p class="user-id">ID: {{ userStore.userInfo.uid || '暂无' }}</p>
          <div class="user-stats">
            <div class="stat-item">
              <span class="stat-label">性别</span>
              <span class="stat-value">{{ userStore.userInfo.sex === 1 ? '男' : userStore.userInfo.sex === 2 ? '女' : '暂无' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 头像编辑弹窗 -->
      <el-dialog
        v-model="isEditingAvatar"
        title="修改头像"
        width="400px"
        :show-close="true"
        @close="cancelEditAvatar"
      >
        <div class="avatar-edit-content">
          <div class="current-avatar">
            <img
              :src="userStore.userInfo.avatar || '/src/assets/logo.png'"
              alt="当前头像"
              class="avatar-preview"
            />
            <p>当前头像</p>
          </div>
          <div class="upload-section">
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :before-upload="handleAvatarUpload"
              accept="image/*"
            >
              <el-button type="primary">
                <i class="el-icon-upload"></i>
                选择头像
              </el-button>
            </el-upload>
            <el-button
              v-if="avatarFile"
              type="success"
              @click="saveAvatar"
            >
              <i class="el-icon-check"></i>
              保存头像
            </el-button>
          </div>
        </div>
      </el-dialog>

      <!-- 功能卡片区域 -->
      <div class="cards-container">
        <!-- 修改密码卡片 -->
        <div class="profile-card">
          <div class="card-header">
            <i class="el-icon-lock"></i>
            <h3>修改密码</h3>
          </div>
          <div class="card-content">
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              class="custom-input"
              size="large"
              show-password
            />
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              class="custom-input"
              size="large"
              show-password
            />
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              class="custom-input"
              size="large"
              show-password
            />
            <el-button type="primary" @click="updatePassword" class="action-btn">
              <i class="el-icon-key"></i>
              修改密码
            </el-button>
          </div>
        </div>

        <!-- 修改手机号卡片 -->
        <div class="profile-card">
          <div class="card-header">
            <i class="el-icon-phone"></i>
            <h3>修改手机号</h3>
          </div>
          <div class="card-content">
                         <el-input
               v-model="phoneForm.newPhone"
               placeholder="请输入新手机号"
               class="custom-input"
               size="large"
             />
             <div class="captcha-input-group">
               <el-input
                 v-model="phoneForm.captcha"
                 placeholder="验证码"
                 class="captcha-input"
                 size="large"
               />
               <el-button
                 :disabled="captchaCountdown > 0"
                 @click="sendCaptcha"
                 class="captcha-btn"
                 :class="{ 'countdown': captchaCountdown > 0 }"
               >
                 <i class="el-icon-message"></i>
                 {{ captchaCountdown > 0 ? `${captchaCountdown}s` : '发送验证码' }}
               </el-button>
             </div>
            <el-button type="primary" @click="updatePhone" class="action-btn">
              <i class="el-icon-check"></i>
              修改手机号
            </el-button>
          </div>
        </div>

        <!-- 注销账户卡片 -->
        <div class="profile-card danger-card">
          <div class="card-header">
            <i class="el-icon-delete"></i>
            <h3>注销账户</h3>
          </div>
          <div class="card-content">
            <div class="danger-warning">
              <i class="el-icon-warning"></i>
              <p>注销账户后，您的所有数据将被永久删除且无法恢复。</p>
            </div>
            <el-button type="danger" @click="deleteAccount" class="danger-btn">
              <i class="el-icon-delete"></i>
              注销账户
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-profile {
  min-height: 100vh;
  background: rgb(217, 236, 255);
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(64, 158, 255, 0.1) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(64, 158, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(64, 158, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(64, 158, 255, 0.03) 0%, transparent 50%);
    animation: pulse 15s ease-in-out infinite;
    pointer-events: none;
  }
}

.profile-container {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

// 用户信息卡片
.user-info-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 30px;
  animation: slideInUp 0.6s ease-out;
  position: relative;
  cursor: pointer; /* Add cursor pointer for clickability */
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, transparent 100%);
    border-radius: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
  
  .user-avatar {
    position: relative;
    width: 120px;
    height: 120px;
    
    .avatar-image {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid #fff;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
      }
    }
    
    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      
      i {
        color: white;
        font-size: 24px;
      }
    }
    
    &:hover .avatar-overlay {
      opacity: 1;
    }
  }
  
  .user-details {
    flex: 1;
    
    .name-section {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      
      .user-name {
        font-size: 32px;
        font-weight: 700;
        color: #2c3e50;
        margin: 0;
        background: linear-gradient(135deg, #409eff 0%, #1890ff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        cursor: pointer; /* Add cursor pointer for clickability */
        
        .edit-icon {
          font-size: 18px;
          color: #409eff;
          margin-left: 5px;
        }
      }
    }
    
    .name-edit-section {
      display: flex;
      align-items: center;
      gap: 10px;
      
             .name-input {
         flex: 1;
         
         :deep(.el-input__wrapper) {
           height: 40px;
           border-radius: 8px;
           box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
           border: 1px solid #e1e8ed;
           transition: all 0.3s ease;
           
           &:hover {
             border-color: #409eff;
             box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
           }
           
           &.is-focus {
             border-color: #409eff;
             box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
           }
         }
       }
      
             .name-edit-actions {
         display: flex;
         gap: 8px;
         
                   .el-button {
            min-width: 70px;
            height: 40px;
            font-size: 13px;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            
            &:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
            }
            
            i {
              margin-right: 4px;
              font-size: 14px;
            }
          }
       }
    }
    
    .user-id {
      color: #7f8c8d;
      font-size: 16px;
      margin: 0 0 20px 0;
    }
    
    .user-stats {
      display: flex;
      gap: 20px;
      
      .stat-item {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .stat-label {
          color: #95a5a6;
          font-size: 14px;
        }
        
        .stat-value {
          color: #2c3e50;
          font-weight: 600;
          font-size: 14px;
        }
      }
    }
  }
}

// 卡片容器 - 修改为单列布局
.cards-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
  animation: slideInUp 0.8s ease-out 0.2s both;
}

// 功能卡片
.profile-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(64, 158, 255, 0.1), transparent);
    transition: left 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    
    &::before {
      left: 100%;
    }
  }
  
  &.danger-card {
    border-left: 4px solid #f56c6c;
    background: linear-gradient(135deg, rgba(245, 108, 108, 0.05) 0%, rgba(245, 108, 108, 0.1) 100%);
  }
  
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 25px;
    
    i {
      font-size: 24px;
      color: #409eff;
    }
    
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }
  }
  
  .card-content {
    .custom-input {
      margin-bottom: 15px;
      
      :deep(.el-input__wrapper) {
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #e1e8ed;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
        }
        
        &.is-focus {
          border-color: #409eff;
          box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
        }
      }
    }
    
    .action-btn {
      width: 100%;
      height: 44px;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
      
      i {
        margin-right: 8px;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(64, 158, 255, 0.3);
      }
    }
  }
}

// 验证码输入组
.captcha-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  
  .captcha-input {
    flex: 1;
    
    :deep(.el-input__wrapper) {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border: 1px solid #e1e8ed;
      transition: all 0.3s ease;
      
      &:hover {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
      }
      
      &.is-focus {
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
      }
    }
  }
  
  .captcha-btn {
    min-width: 120px;
    height: 44px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
    }
    
    &.countdown {
      background: #95a5a6;
      border-color: #95a5a6;
      
      &:hover {
        background: #95a5a6;
        border-color: #95a5a6;
        transform: none;
        box-shadow: none;
      }
    }
    
    i {
      margin-right: 4px;
    }
  }
}

// 头像上传区域
.avatar-upload-section {
  display: flex;
  align-items: center;
  gap: 30px;
  
  .current-avatar {
    text-align: center;
    
    .avatar-preview {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #e1e8ed;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }
    }
    
    .avatar-info {
      margin-top: 10px;
      
      p {
        color: #7f8c8d;
        font-size: 14px;
        margin: 0;
      }
    }
  }
  
  .upload-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
    
    .upload-btn, .save-btn {
      width: 120px;
      height: 40px;
      border-radius: 8px;
      font-weight: 600;
      
      i {
        margin-right: 6px;
      }
    }
  }
}

// 危险警告
.danger-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  background: rgba(245, 108, 108, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
  
  i {
    color: #f56c6c;
    font-size: 20px;
  }
  
  p {
    color: #f56c6c;
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
  }
}

.danger-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
  
  i {
    margin-right: 8px;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(245, 108, 108, 0.3);
  }
}

// 头像编辑弹窗样式
.avatar-edit-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  
  .current-avatar {
    text-align: center;
    
    .avatar-preview {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid #e1e8ed;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      margin-bottom: 10px;
    }
    
    p {
      color: #7f8c8d;
      font-size: 14px;
      margin: 0;
    }
  }
  
  .upload-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
    
    .el-button {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      font-weight: 600;
      
      i {
        margin-right: 6px;
      }
    }
  }
}

// 动画
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(10px, -10px) rotate(1deg);
  }
  50% {
    transform: translate(-5px, 15px) rotate(-1deg);
  }
  75% {
    transform: translate(-15px, -5px) rotate(0.5deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .user-profile {
    padding: 10px;
  }
  
  .user-info-card {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
    
    .user-details {
      .user-name {
        font-size: 24px;
      }
      
      .user-stats {
        justify-content: center;
      }
    }
  }
  
  .cards-container {
    gap: 20px;
  }
  
  .profile-card {
    padding: 25px 20px;
  }
  
     .captcha-input-group {
     flex-direction: column;
     gap: 10px;
     
     .captcha-btn {
       min-width: 100%;
     }
   }
  
  .avatar-upload-section {
    flex-direction: column;
    gap: 20px;
    
    .upload-actions {
      flex-direction: row;
      justify-content: center;
    }
  }
}

@media (max-width: 480px) {
  .user-info-card {
    .user-avatar {
      width: 100px;
      height: 100px;
    }
    
    .user-details {
      .user-name {
        font-size: 20px;
      }
    }
  }
  
  .profile-card {
    padding: 20px 15px;
    
    .card-header {
      h3 {
        font-size: 18px;
      }
    }
  }
}
</style> 