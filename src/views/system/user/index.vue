<template>
  <div class="card container">
    <p class="title">用户管理</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="userList" style="width: 100%">
      <el-table-column prop="id" label="Id" width="120" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="createdAt" label="创建时间" width="200" :formatter="formatter" />
      <el-table-column fixed="right" label="操作" min-width="120">
        <template #default="scoped">
          <el-button link type="primary" size="small" color="#409EFF" @click="handleEditPass(scoped.row)">修改密码</el-button>
          <el-button link type="danger" size="small" @click="handleDelUser(scoped.row.id)">删除</el-button>
        </template>
      </el-table-column>
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
    <el-dialog v-model="dialogEditVisible" title="修改密码" width="500">
      <el-form :model="editForm" label-width="auto" style="max-width: 600px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled />
        </el-form-item>
        <el-form-item label="旧密码">
          <el-input v-model="editForm.old" type="password" show-password />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="editForm.password" type="password" show-password />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogEditVisible = false">取消</el-button>
          <el-button type="primary" @click="handleEditConfirm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="user">
import { User } from "@/api/interface/system";
import { addUser, deleteUser, getUserList, editUserPass } from "@/api/modules/system";
import { onBeforeMount, reactive, ref } from "vue";
import dayjs from "dayjs";
import { Plus } from "@element-plus/icons-vue";
import md5 from "md5";
import router from "@/routers";
import { LOGIN_URL } from "@/config";
import { useUserStore } from "@/stores/modules/user";
import { ElMessage } from "element-plus";

const handleAddBtn = () => {
  dialogVisible.value = true;
};

const userList = ref<Array<User.Entity>>();

const formatter = (row: User.Entity) => {
  return dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss");
};

async function handleDelUser(id: number) {
  await deleteUser({
    id
  });
  refreshTable();
}

const curEditItem = ref<User.Entity>();
function handleEditPass(row: User.Entity) {
  dialogEditVisible.value = true;
  curEditItem.value = row;
  editForm.username = row.username;
}

async function refreshTable() {
  const res = await getUserList();
  userList.value = res.data;
}

onBeforeMount(() => {
  refreshTable();
});

const dialogVisible = ref(false);

let form = reactive({
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
    form = reactive({
      username: "",
      password: ""
    });
    dialogVisible.value = false;
    refreshTable();
  }
};

const dialogEditVisible = ref(false);

let editForm = reactive({
  username: "",
  old: "",
  password: ""
});

const userStore = useUserStore();

const handleEditConfirm = async () => {
  if (!curEditItem.value) return;
  const res = await editUserPass(curEditItem.value.id, md5(editForm.old), md5(editForm.password));
  if (res.code === 200) {
    editForm = reactive({
      username: "",
      old: "",
      password: ""
    });
    dialogEditVisible.value = false;
    refreshTable();
    setTimeout(() => {
      // 2.清除 Token
      userStore.setToken("");

      // 3.重定向到登陆页
      router.replace(LOGIN_URL);
      ElMessage.success("退出登录！");
    });
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
