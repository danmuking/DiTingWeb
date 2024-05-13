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
      <el-input
        placeholder="好友昵称"
        style="width: 85%"
        v-model="friendName"
      />
      <el-button
        type="primary"
        style="margin-left: 1%; width: 10%"
        @click="searchFriend"
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
          <el-button
            :disabled="scope.row.disable"
            @click="applyFriend(scope.row)"
          >
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
      <el-input
        placeholder="好友昵称"
        style="width: 85%"
        v-model="friendName"
      />
      <el-button
        type="primary"
        style="margin-left: 1%; width: 10%"
        @click="searchFriend"
        >搜索</el-button
      >
    </div>
    <el-table
      @selection-change=""
      v-el-table-infinite-scroll="load"
      :data="tableData"
      height="400px"
      :show-header="false"
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
  </el-dialog>
</template>

<script lang="ts" setup>
import { Plus } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";
import apis from "@/services/apis";
import type { UserFriendAddInfo } from "@/services/types";
import { FriendTypeTextMap } from "@/constant/user";
import { ElMessage, ElMessageBox } from "element-plus";
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

const tableData = ref([
  {
    date: "2016-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-02",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-04",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-01",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-08",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-06",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
  {
    date: "2016-05-07",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  },
]);
const load = () => {
  // 添加数据
  tableData.value.push({
    date: "2016-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
  });
};
</script>
<style lang="scss" src="./styles.scss" />
