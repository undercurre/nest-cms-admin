<script setup lang="ts">
import { SelectItem, TableSetting } from "@/api/interface";
import { ProtocolImport } from "@/api/interface/virtualDevice";
import ExcelImport from "@/components/ExcelImport/index.vue";
import { deepClone } from "@/utils";
import { ElMessage } from "element-plus";
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
const columnConfigImport = ref<TableSetting.Columns[]>([]);
// 获取设备列表
const protocolList = ref<ProtocolImport.ProtocolItem[]>([]);
const getProtocolList = () => {
  protocolList.value = [
    {
      protocolName: "3did",
      model: "5model",
      protocolData: [
        {
          产品型号: "MOVA-KQZG",
          产品名称: "空气炸锅",
          "产品名称（英文）": "KQZG",
          产品图片:
            "http://cook-oss.iot.mova-tech.com/third-party-server/avatar/instructions/c1589cdfecaf47c9865c050265e640e1.png",
          产品卖点: "炸美食",
          "产品卖点（英文）": "GOOD",
          产品说明书:
            "https://cook-oss.iot.mova-tech.com/third-party-server/avatar/instructions/7b3aafa38b534ba2a318c0bf8567c925.pdf"
        },
        {
          产品型号: "MOVA-XDJ",
          产品名称: "洗地机",
          "产品名称（英文）": "XDJ",
          产品图片:
            "http://cook-oss.iot.mova-tech.com/third-party-server/avatar/instructions/c1589cdfecaf47c9865c050265e640e1.png",
          产品卖点: "给你一个干净的家",
          "产品卖点（英文）": "GOOD",
          产品说明书:
            "https://cook-oss.iot.mova-tech.com/third-party-server/avatar/instructions/7b3aafa38b534ba2a318c0bf8567c925.pdf"
        },
        {
          产品型号: "MOVA-XDJ1",
          产品名称: "洗地机1",
          "产品名称（英文）": "XDJ1",
          产品图片:
            "http://cook-oss.iot.mova-tech.com/third-party-server/avatar/instructions/c1589cdfecaf47c9865c050265e640e1.png",
          产品卖点: "给你一个干净的家",
          "产品卖点（英文）": "GOOD",
          产品说明书:
            "https://cook-oss.iot.mova-tech.com/third-party-server/avatar/instructions/7b3aafa38b534ba2a318c0bf8567c925.pdf"
        }
      ]
    }
  ];
};

const actionType = ref("add");
const ruleForm = ref();
const rules = {
  model: [{ required: true, message: "必填", trigger: "blur" }]
};
const form = ref<ProtocolImport.ProtocolItem>({
  protocolName: "",
  model: "",
  protocolData: []
});

const modelList = ref<SelectItem[]>([]);
// 获取模型下拉列表
const getModelList = () => {
  modelList.value = [
    {
      value: "5model",
      label: "5model"
    }
  ];
};

const importBtn = ref<InstanceType<typeof ExcelImport>>();
const saveInBulk = (e, fileName) => {
  ruleForm.value.validate(valid => {
    if (valid) {
      if (!e.length) {
        ElMessage.error("请导入协议");
        return;
      }
      // TODO:调接口保存
      console.log(form.value);
      console.log(e, fileName);
      importBtn.value?.handleCancel();
    }
  });
};
// 协议添加
const handleAdd = () => {
  columnConfigImport.value = [];
  actionType.value = "add";
  nextTick(() => {
    ruleForm.value?.resetFields();
    ruleForm.value?.clearValidate();
  });
};
// 协议修改
const handleEdit = row => {
  columnConfigImport.value = [];
  actionType.value = "edit";
  nextTick(() => {
    ruleForm.value?.clearValidate();
    form.value = deepClone(row);
    importBtn.value?.updateImportData(form.value.protocolData as any[]);
    const obj = row.protocolData?.[0];
    for (let i in obj) {
      columnConfigImport.value.push({
        label: i,
        prop: i
      });
    }
  });
};
// 协议删除
const handleDel = id => {
  console.log("id: ", id);
};
onBeforeMount(() => {
  getModelList();
  getProtocolList();
});
</script>
<template>
  <div class="card container">
    <p class="title">导入协议</p>
    <div class="operations">
      <ExcelImport
        ref="importBtn"
        title="导入协议"
        @save-in-bulk="saveInBulk"
        @open-dialog="handleAdd"
        v-model:column-config="columnConfigImport"
        :is-column-custom="true"
      >
        <div>
          <el-form :model="form" label-width="auto" ref="ruleForm" :rules="rules">
            <el-form-item label="设备型号" prop="model">
              <el-select v-model="form.model" placeholder="设备型号" size="large" style="width: 240px">
                <el-option v-for="item in modelList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
        <template #header>
          <div style="margin-top: 4px; margin-left: 14px">导入协议</div>
        </template>
      </ExcelImport>
    </div>

    <el-table class="table" :data="protocolList" style="width: 100%">
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
            <ExcelImport
              ref="importBtn"
              title="导入协议"
              @save-in-bulk="saveInBulk"
              @open-dialog="handleEdit(scoped.row)"
              v-model:column-config="columnConfigImport"
              :is-column-custom="true"
              btn-type="text"
            >
              <div>
                <el-form :model="form" label-width="auto" ref="ruleForm" :rules="rules">
                  <el-form-item label="设备型号" prop="model">
                    <el-select v-model="form.model" placeholder="设备型号" size="large" style="width: 240px">
                      <el-option v-for="item in modelList" :key="item.value" :label="item.label" :value="item.value" />
                    </el-select>
                  </el-form-item>
                </el-form>
              </div>
              <template #header>
                <div style="margin-top: 4px; margin-left: 14px">导入协议</div>
              </template>
            </ExcelImport>
            <el-popconfirm title="确认要删除这一项吗？" confirm-button-type="danger" @confirm="handleDel(scoped.row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
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
