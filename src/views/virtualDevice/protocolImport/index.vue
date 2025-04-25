<script setup lang="ts">
import { TableSetting } from "@/api/interface";
import { DeviceList } from "@/api/interface/virtualDevice";
import { deepClone } from "@/utils";
import { Plus } from "@element-plus/icons-vue";
import { nextTick, onBeforeMount, reactive, ref } from "vue";
const columnConfig = reactive<TableSetting.Columns[]>([
  {
    prop: "protocolName",
    label: "协议名称"
  },
  {
    prop: "model",
    label: "协议模型"
  }
]);
// 获取设备列表
const deviceList = ref<DeviceList.DeviceItem[]>([]);
const getDeviceList = () => {
  deviceList.value = [
    {
      did: "3did",
      key: "4key",
      model: "5model"
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
  //
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
    <p class="title">导入协议</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAdd">添加</el-button>
    </div>

    <el-table class="table" :data="deviceList" style="width: 100%">
      <el-table-column
        v-for="item in columnConfig"
        :key="item.prop"
        :property="item.prop"
        :label="item.label"
        :width="item.width"
      ></el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scoped">
          <div class="btns">
            <el-button color="#409EFF" plain link @click="handleEdit(scoped.row)">修改</el-button>
            <el-popconfirm title="确认要删除这一项吗？" confirm-button-type="danger" @confirm="handleDel(scoped.row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
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
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
