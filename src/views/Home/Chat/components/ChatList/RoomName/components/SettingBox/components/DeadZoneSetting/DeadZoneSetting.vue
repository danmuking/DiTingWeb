<script setup lang="ts">
import { useGroupStore } from "@/stores/group";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";
import { ref } from "vue";

const groupStore = useGroupStore();
const superAdminId = ref(groupStore.currentLordId);
const userStore = useUserStore();
const userId = ref(userStore.userInfo?.uid);

/**
 * 删除管理员
 */
const exitGroup = async () => {
  await groupStore.exitGroup();
  ElMessage.success("退出群聊成功");
};

const dissmissGroup = async () => {
  await groupStore.dismissGroup();
  ElMessage.success("解散群聊成功");
};

</script>

<template>
  <div class="contains">
    <div class="dead-zone">
      <h5>
        <span>退出群聊</span>
      </h5>
      <div class="flex-center">
        <el-popconfirm
          title="是否退出该群聊？"
          confirm-button-text="确认"
          cancel-button-text="取消"
          width="200"
          @confirm="exitGroup"
        >
          <template #reference>
            <el-button type="danger" size="small">退出群聊</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
    <!-- TODO:只有群主可见 -->
    <div class="dead-zone">
      <h5>
        <span>解散群聊</span>
      </h5>
      <div class="flex-center">
        <el-popconfirm
          title="是否退出该群聊？"
          confirm-button-text="确认"
          cancel-button-text="取消"
          width="200"
          @confirm="dissmissGroup"
        >
          <template #reference>
            <el-button type="danger" size="small">解散群聊</el-button>
          </template>
        </el-popconfirm>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles.scss"></style>
