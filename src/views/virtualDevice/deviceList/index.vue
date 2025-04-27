<script setup lang="ts">
import { TableSetting } from "@/api/interface";
import { DeviceList } from "@/api/interface/virtualDevice";
import { deepClone } from "@/utils";
import { Plus } from "@element-plus/icons-vue";
import { nextTick, onBeforeMount, reactive, ref } from "vue";
import { useRouter } from "vue-router";
const columnConfig = reactive<TableSetting.Columns[]>([
  {
    prop: "did",
    label: "设备ID"
  },
  {
    prop: "key",
    label: "设备密钥"
  },
  {
    prop: "model",
    label: "设备型号"
  },
  {
    prop: "status",
    label: "设备状态"
  }
]);
// 获取设备列表
const deviceList = ref<DeviceList.DeviceItem[]>([]);
const getDeviceList = () => {
  deviceList.value = [
    {
      did: "3did",
      key: "4key",
      model: "5model",
      status: "在线"
    }
  ];
};

const actionType = ref("add");
const dialogVisible = ref(false);
const ruleForm = ref();
const rules = {
  did: [{ required: true, message: "必填", trigger: "blur" }],
  key: [{ required: true, message: "必填", trigger: "blur" }],
  model: [{ required: true, message: "必填", trigger: "blur" }]
};
const form = ref<DeviceList.DeviceItem>({
  did: "",
  key: "",
  model: ""
});
// 设备添加
const handleAdd = () => {
  actionType.value = "add";
  dialogVisible.value = true;
  nextTick(() => {
    ruleForm.value?.resetFields();
    ruleForm.value?.clearValidate();
  });
};
// 设备修改
const handleEdit = row => {
  dialogVisible.value = true;
  actionType.value = "edit";
  nextTick(() => {
    ruleForm.value?.clearValidate();
  });
  form.value = deepClone(row);
};
const handleConfirm = () => {
  ruleForm.value.validate(valid => {
    if (valid) {
      submitForm();
    }
  });
};
const submitForm = () => {
  console.log(form.value);
};
const router = useRouter();
const go2Detail = row => {
  router.push({
    path: "/virtualDevice/deviceDetail",
    query: {
      ...row
    }
  });
};
// 设备删除
const handleDel = id => {
  console.log("id: ", id);
};
onBeforeMount(() => {
  getDeviceList();
});
</script>
<template>
  <div class="card container">
    <p class="title">设备列表</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加</el-button>
    </div>

    <el-table class="table" :data="deviceList" style="width: 100%" @row-click="go2Detail">
      <el-table-column
        v-for="item in columnConfig"
        :key="item.prop"
        :property="item.prop"
        :label="item.label"
        :width="item.width"
      ></el-table-column>
      <el-table-column property="QRCode" label="设备二维码">
        <template #default="scoped">
          {{ `device_${scoped.row.model}_${scoped.row.did}_${scoped.row.key}` }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scoped">
          <div class="btns">
            <el-button color="#409EFF" plain link @click.stop="handleEdit(scoped.row)">修改</el-button>
            <el-popconfirm title="确认要删除这一项吗？" confirm-button-type="danger" @confirm="handleDel(scoped.row.id)">
              <template #reference>
                <el-button type="danger" @click.stop link>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 表单提交 -->
    <el-dialog :title="actionType == 'add' ? '添加' : '修改'" v-model="dialogVisible">
      <el-form :model="form" label-width="auto" ref="ruleForm" :rules="rules">
        <el-form-item label="设备ID" prop="did">
          <el-input v-model="form.did" />
        </el-form-item>
        <el-form-item label="设备密钥" prop="key">
          <el-input v-model="form.key" />
        </el-form-item>
        <el-form-item label="设备型号" prop="model">
          <el-input v-model="form.model" />
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

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.title {
  font-size: 20px;
  font-weight: 700;
}
.operations {
  align-self: flex-end;
}
.table {
  flex: 1;
  width: 100%;
}
.product_img_preview {
  width: 100%;
}
.btns {
  display: flex;
  justify-content: center;
}
.watch_qrcode {
  font-size: 14px;
  color: #606266;
}
.qrcode_container {
  display: flex;
  justify-content: center;
}
.qrcode {
  width: 200px;
  height: 200px;
}
.upload_container {
  width: 100%;
  height: 100%;
}
.preview_container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
