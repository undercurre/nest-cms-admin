<script setup lang="ts">
import { AIKnowLedge, Feishu } from "@/api/interface/aiKnowledge";
import { addKnowledgeTemplate, editKnowledgeTemplate, getNode } from "@/api/modules/aiKnowledge";
import { deepClone, getValType, isFeishuSheetUrl } from "@/utils";
import { Action, ElMessage, ElMessageBox } from "element-plus";
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

// 获取知识空间节点信息：
const parseFeishuUrl = url => {
  // 匹配 /${obj_type}/${token} 的模式
  const regex = /https:\/\/dreametech\.feishu\.cn\/([^\/]+)\/([^\/\?]+)/;
  const match = url.match(regex);

  if (match && match.length >= 3) {
    return {
      obj_type: match[1],
      token: match[2]
    };
  } else {
    return { obj_type: "", token: "" };
  }
};
// 飞书错误码汇总
const getSheetsErrorMap = {
  1310251: "参考响应体中的错误",
  1310213: "没有电子表格权限",
  1310249: "请恢复表格后重试",
  1310214: "请检查表格 token",
  1315201: "服务内部错误，详询飞书客服",
  1315203: "服务内部错误，详询飞书客服",
  1315210: "服务内部错误，详询飞书客服",
  131001: "服务报错，请稍后重试",
  131002: "数据类型不匹配",
  131004: "非法用户",
  131005: {
    "member not found": "用户不是知识空间成员（管理员），无法删除。",
    "identity not found": "userid不存在，无法添加/删除成员。",
    "space not found": "知识空间不存在",
    "node not found": "节点不存在",
    "document not found": "文档不存在",
    "document is not in wiki": "文档不在知识库中",
    "resource not found": "资源不存在"
  },
  99991663: "登录过期",
  99991677: "登录过期",
  131006: {
    "permission denied: wiki space permission denied": "需要为知识空间成员（管理员）",
    "permission denied: node permission denied": "读操作时需要有节点阅读权限。",
    "permission denied: no source parent node permission": "需要原父节点容器编辑权限。",
    "permission denied: no destination parent node permission": "需要目的父节点容器编辑权限。",
    "permission denied: only task creator can query status": "为任务创建者（用户或应用/机器人）"
  },
  131007: "服务内部错误，请勿重试"
};
// 获取知识空间节点信息
const getNodeInfo = (value: string): Promise<Feishu.NodeParams> => {
  const { obj_type, token } = parseFeishuUrl(value);
  return new Promise((resolve, reject) => {
    if (obj_type === "sheets") {
      resolve({ obj_type: "sheet", obj_token: token });
      return;
    }
    getNode({
      obj_type,
      token
    })
      .then(res => {
        let { node } = res.data;
        resolve({ ...node });
      })
      .catch(err => {
        if (err.response.data.code == 1310213) {
          ElMessageBox.alert(
            "您没有电子表格的阅读或编辑权限。请联系该文档管理员，通过电子表格网页页面右上方 [分享] 入口为您添加权限。",
            "提示",
            {
              confirmButtonText: "知道了",
              callback: (action: Action) => {
                console.log("action: ", action);
              }
            }
          );
        }
        if (getValType(getSheetsErrorMap[err.response.data.code]) === "string") {
          reject(getSheetsErrorMap[err.response.data.code] ?? err.response.data.msg ?? err);
        } else {
          reject(getSheetsErrorMap[err.response.data.code]?.[err.response.data.msg] ?? err.response.data.msg ?? err);
        }
      });
  });
};
const validatePass = (rule: any, value: any, callback: any) => {
  if (!isFeishuSheetUrl(value)) {
    callback(new Error("请输入飞书电子表格链接"));
  } else {
    getNodeInfo(value)
      .then(({ obj_type }) => {
        if (obj_type === "sheet") {
          callback();
        } else {
          callback(new Error("请输入飞书电子表格链接"));
        }
      })
      .catch(err => {
        callback(new Error(err));
      });
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
        ElMessage.success("保存成功");
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
      creatableSelect.value?.blur();
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
    <el-form :model="templateForm" label-width="auto" :rules="templateRules" status-icon ref="templateRef">
      <el-form-item label="模板名称" prop="templateName">
        <el-input v-model="templateForm.templateName" placeholder="请输入模板名称" />
      </el-form-item>
      <el-form-item label="文档链接" prop="templateUrl">
        <el-input v-model="templateForm.templateUrl" placeholder="请输入飞书电子表格链接" :disabled="actionType != 'add'" />
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
