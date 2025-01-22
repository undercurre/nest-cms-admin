<template>
  <div class="card container">
    <p class="title">用户管理</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="userList" style="width: 100%">
      <el-table-column prop="id" label="Id" width="120" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="createdAt" label="创建时间" width="600" :formatter="formatter" />
      <!-- <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default>
          <el-button link type="primary" size="small">Edit</el-button>
        </template>
      </el-table-column> -->
    </el-table>

    <el-dialog v-model="dialogVisible" title="添加用户" width="500">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="user">
import { User } from "@/api/interface/system";
import { addUser, getUserList } from "@/api/modules/system";
import { onBeforeMount, reactive, ref } from "vue";
import dayjs from "dayjs";
import { Plus } from "@element-plus/icons-vue";
import md5 from "md5";

const handleAddBtn = () => {
  dialogVisible.value = true;
};

const userList = ref<Array<User.Entity>>();

const formatter = (row: User.Entity) => {
  return dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss");
};

async function refreshTable() {
  const res = await getUserList();
  userList.value = res.data;
}

onBeforeMount(() => {
  refreshTable();
});

const dialogVisible = ref(false);

const form = reactive({
  username: "",
  password: ""
});

const handleConfirm = async () => {
  const clone = {
    username: form.username,
    password: md5(form.password)
  };
  const res = await addUser(clone);
  if (res.code === 200) {
    dialogVisible.value = false;
    refreshTable();
  }
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 20px;
  font-weight: 700;
}

.operations {
  align-self: flex-end;
}

.table {
  width: 100%;
  flex: 1;
}
</style>
