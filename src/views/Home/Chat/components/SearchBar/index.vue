<template>
  <div class="search-bar">
    <el-input placeholder="Please input" />
    <el-popover
      trigger="click"
      placement="bottom"
      :width="160"
      popper-class="add-popover"
    >
      <el-button class="add-item" @click="addFriendDialogVisible = true">
        添加好友
      </el-button>
      <el-button class="add-item" @click="addFriendDialogVisible = true">
        创建群聊
      </el-button>
      <template #reference>
        <el-button type="primary" :icon="Plus" circle />
      </template>
    </el-popover>
  </div>

  <el-dialog v-model="addFriendDialogVisible" title="添加好友" width="500">
    <div class="search-friend">
      <el-input placeholder="好友昵称" style="width: 85%" v-model="friendName" />
      <el-button type="primary" style="margin-left: 1%; width: 10%;" @click="searchFriend">搜索</el-button>
    </div>
    <el-table class="add-friend-table" :data="userInfo" style="width: 100%" :show-header="false" height="300">
      <el-table-column label="userInfo" width="180">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-avatar :size="50" :src="scope.row.avatar" />
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="Operations" align="right">
        <template #default="scope">
          <el-button >
            添加
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
import { reactive, ref } from 'vue'
import apis from '@/services/apis'
import type { UserFriendAddInfo } from "@/services/types";



const addFriendDialogVisible = ref(false);
const userInfo = reactive<UserFriendAddInfo[]>([]);;

// 搜索用户信息
const searchFriend = async () => {
  const data = await apis
      .getUserInfoByName({
        params: {
          name: friendName.value,
        },
      })
      .send()
    // 数据不存在直接返回
    if (!data) return
    userInfo.splice(0, userInfo.length, ...data)
    console.log(userInfo)
}

const friendName = ref('')
</script>
<style lang="scss" src="./styles.scss" />
