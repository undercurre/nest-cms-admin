<script setup lang="ts">
import { AIKnowLedge } from "@/api/interface/aiKnowledge";
import { addKnowledgeTemplate, editKnowledgeTemplate } from "@/api/modules/aiKnowledge";
import { deepClone, isFeishuSheetUrl } from "@/utils";
import { ElMessage } from "element-plus";
import { nextTick, reactive, ref, watch } from "vue";
const props = defineProps({
  dialogTemplateVisible: {
    default: false,
    type: Boolean
  },
  actionType: {
    default: "add",
    type: String
  },
  row: {
    default: () => ({}),
    type: Object
  }
});

const emits = defineEmits(["update:dialogTemplateVisible", "saveTemplate"]);
const visible = ref(false);
watch(
  () => props.dialogTemplateVisible,
  val => {
    visible.value = val;
    if (val) {
      if (props.actionType === "add") {
        nextTick(() => {
          templateRef.value?.clearValidate();
          templateRef.value?.resetFields();
        });
      } else {
        nextTick(() => {
          templateRef.value?.clearValidate();
          templateForm.value = deepClone(props.row);
        });
      }
    }
  },
  {
    immediate: true,
    deep: true
  }
);
// 新增模板
const templateForm = ref<AIKnowLedge.TemplateEntity>({
  templateName: "",
  templateUrl: "",
  description: "",
  label: "",
  labels: []
});
const validatePass = (rule: any, value: any, callback: any) => {
  if (!isFeishuSheetUrl(value)) {
    callback(new Error("请输入飞书多维表格链接"));
  } else {
    callback();
  }
};
const templateRules = reactive({
  templateName: [{ required: true, message: "必填", trigger: "blur" }],
  templateUrl: [
    { required: true, message: "必填", trigger: "blur" },
    {
      validator: validatePass,
      trigger: "blur"
    }
  ]
});
const templateRef = ref();
const saveTemplate = () => {
  templateRef.value.validate(async valid => {
    if (valid) {
      const params = {
        ...templateForm.value,
        label: templateForm.value.labels?.join(",")
      };
      delete params.labels;
      let resSuccess: boolean = false;
      let resMsg: string = "";
      const res = props.actionType === "add" ? await addKnowledgeTemplate(params) : await editKnowledgeTemplate(params);
      resSuccess = res.success ?? false;
      resMsg = res.errMessage ?? "";
      if (resSuccess) {
        handleCancel();
        emits("saveTemplate");
      } else {
        ElMessage.error(resMsg);
      }
    }
  });
};
const handleCancel = () => {
  emits("update:dialogTemplateVisible", false);
};
const creatableSelect = ref();
const creatableLimit = 5;
const handleLabelFocus = () => {
  setTimeout(() => {
    if ((templateForm.value?.labels?.length ?? 0) >= 5) {
      ElMessage.warning(`只能输入${creatableLimit}个标签`);
    }
  }, 400);
};
const handelLabelChange = e => {
  if (e.length === 5) {
    creatableSelect.value?.blur();
  }
};
</script>
<template>
  <!-- 新增模板 -->
  <el-dialog
    v-model="visible"
    :title="actionType === 'add' ? '新增知识库模板' : '修改知识库模板'"
    width="500"
    @close="handleCancel"
  >
    <el-form :model="templateForm" label-width="auto" :rules="templateRules" ref="templateRef">
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="templateForm.templateName" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="文档链接" prop="templateUrl">
        <el-input v-model="templateForm.templateUrl" placeholder="请输入飞书多维表格链接" :disabled="actionType != 'add'" />
      </el-form-item>
      <el-form-item label="标签" prop="labels">
        <el-select
          class="creatable-select"
          ref="creatableSelect"
          v-model="templateForm.labels"
          filterable
          multiple
          :multiple-limit="creatableLimit"
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="请输入标签"
          :disabled="actionType != 'add'"
          :teleported="false"
          @focus="handleLabelFocus"
          @change="handelLabelChange"
        >
        </el-select>
      </el-form-item>
      <el-form-item label="备注" prop="description">
        <el-input v-model="templateForm.description" type="textarea" placeholder="请输入备注" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="saveTemplate"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.creatable-select .el-select__popper:has(.el-select-dropdown__empty) {
  display: none;
}
</style>
