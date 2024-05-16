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
      <el-button class="add-item" @click="createGroupDialogVisible = true">
        创建群聊
      </el-button>
      <template #reference>
        <el-button type="primary" :icon="Plus" circle />
      </template>
    </el-popover>
  </div>

  <el-dialog
    class="add-dialog"
    v-model="addFriendDialogVisible"
    title="添加好友"
    width="500"
  >
    <div class="search-friend">
      <el-input placeholder="好友昵称" style="width: 85%" v-model="friendName" />
      <el-button type="primary" style="margin-left: 1%; width: 10%" @click="searchFriend"
        >搜索</el-button
      >
    </div>
    <el-table
      class="add-friend-table"
      :data="userInfo"
      style="width: 100%"
      :show-header="false"
      height="300"
    >
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
          <el-button :disabled="scope.row.disable" @click="applyFriend(scope.row)">
            {{ scope.row.prompt }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <el-dialog
    class="add-dialog"
    v-model="createGroupDialogVisible"
    title="创建群组"
    width="500"
  >
    <div class="search-friend">
      <el-input placeholder="好友昵称" style="width: 85%" v-model="friendName" />
      <el-button type="primary" style="margin-left: 1%; width: 10%" @click="searchFriend"
        >搜索</el-button
      >
    </div>
    <el-table
      class="add-friend-table"
      @selection-change=""
      v-el-table-infinite-scroll="onContactsLoad"
      :data="tableData"
      height="400px"
      :show-header="false"
      ref="createGroupTable"
    >
      <el-table-column type="selection" />
      <el-table-column label="userInfo">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <el-avatar :size="50" :src="scope.row.avatar" />
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="createGroupDialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="createGroup"> Confirm </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
import { reactive, ref, watch } from "vue";
import apis from "@/services/apis";
import type { UserFriendAddInfo } from "@/services/types";
import { FriendTypeTextMap } from "@/constant/user";
import { ElMessage, ElMessageBox, ElTable } from "element-plus";
import { FriendTypeEnum } from "@/enums";
import UserItem from "./UserItem.vue";
import { default as vElTableInfiniteScroll } from "el-table-infinite-scroll";

type UserFriendAddInfoVo = UserFriendAddInfo & {
  prompt: string;
  disable: boolean;
};

const addFriendDialogVisible = ref(false);
const createGroupDialogVisible = ref(false);
const userInfo = reactive<UserFriendAddInfoVo[]>([]);

// 搜索用户信息
const searchFriend = async () => {
  const data = await apis
    .getUserInfoByName({
      params: {
        name: friendName.value,
      },
    })
    .send();
  // 数据不存在直接返回
  if (!data) return;
  // 数据存在则遍历
  const dataList = data.map((item) => {
    return {
      ...item,
      prompt: FriendTypeTextMap[item.status],
      disable: item.status !== 1,
    };
  });
  userInfo.splice(0, userInfo.length, ...dataList);
};

const applyFriend = (data: UserFriendAddInfoVo) => {
  ElMessageBox.prompt("申请信息", "添加好友", {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
  }).then(({ value }) => {
    apis
      .sendAddFriendRequest({
        uid: data.uid,
        msg: value,
      })
      .send()
      .then(() => {
        data.disable = true;
        data.status = FriendTypeEnum.WaitAgree;
        data.prompt = FriendTypeTextMap[data.status];
        ElMessage.success("等待对方回复~");
      });
  });
};

const friendName = ref("");

import { useContactStore } from "@/stores/contacts";
import { useUserInfo } from "@/hooks/useCached";
import item from "@/components/VirtualList/item";
const contactStore = useContactStore();
const onContactsLoad = () => {
  contactStore.getContactList();
};
interface UserInfo {
  name: string;
  avatar: string;
  uid: number;
}

const tableData: UserInfo[] = reactive([]);
watch(contactStore.contactsList, (newList) => {
  const newTableData = newList.map((item) => {
    const currentUid = item?.uid;
    const currentUser = useUserInfo(currentUid);
    return {
      uid: currentUid,
      name: currentUser.value.name || "",
      avatar: currentUser.value.avatar || "",
    };
  });
  tableData.splice(0, tableData.length, ...newTableData);
});
const createGroupTable = ref<InstanceType<typeof ElTable>>()
const createGroup = async () => {
  const data = createGroupTable.value?.getSelectionRows();
  const uidList = data.map((item) => item.uid);
  const res = await apis.createGroup({
      uidList,
  })
  .send()
  if (res) {
    ElMessage.success("创建成功");
    createGroupDialogVisible.value = false;
  }
};
</script>
<style lang="scss" src="./styles.scss" />
