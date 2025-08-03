<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="profile-header-nav">
    <el-button @click="goBack" type="text" class="back-btn">
      <i class="el-icon-arrow-left"></i>
      返回首页
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.profile-header-nav {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 100;
}

.back-btn {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: #2c3e50;
  font-size: 14px;
  font-weight: 600;
  padding: 12px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.95);
    color: #409eff;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
  
  i {
    margin-right: 8px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .profile-header-nav {
    top: 15px;
    left: 15px;
  }
  
  .back-btn {
    padding: 10px 16px;
    font-size: 13px;
    
    i {
      font-size: 14px;
    }
  }
}
</style> 