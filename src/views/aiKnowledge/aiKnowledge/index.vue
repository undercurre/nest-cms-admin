<script setup lang="ts">
import { TableSetting } from "@/api/interface";
import { AIKnowLedge, Feishu } from "@/api/interface/aiKnowledge";
import {
  addKnowledge,
  deleteKnowledge,
  editKnowledge,
  getNode,
  getSheets,
  getValueBatchByRange,
  reStartKnowledge,
  searchKnowledge,
  searchKnowledgeTemplate
} from "@/api/modules/aiKnowledge";
import { deepClone, deepEqualIgnoreOrder, getValType, isFeishuSheetUrl } from "@/utils";
import { Plus, View } from "@element-plus/icons-vue";
import { Action, ElMessage, ElMessageBox } from "element-plus";
import { nextTick, onBeforeMount, reactive, ref } from "vue";
import CreateTemplate from "../component/createTemplate.vue";

// 表格
const knowledgeColumnsConfig = reactive<TableSetting.Columns[]>([
  {
    label: "知识库名称",
    prop: "name",
    width: 200
  },
  {
    label: "标签",
    prop: "label",
    component: "el-tag",
    tagColorMap: {
      1: "#409EFF"
    },
    compProps: {
      hit: false,
      "disable-transitions": true
    },
    tagClassMap: {
      1: "icon-bu"
    }
  },
  {
    label: "飞书链接",
    prop: "documentUrl",
    component: "el-button",
    compProps: {
      color: "#409EFF",
      plain: true,
      link: true,
      click: row => {
        window.open(row.documentUrl);
      }
    }
  },
  {
    label: "状态",
    prop: "syncStatus",
    component: "el-tag",
    compProps: {
      hit: false
    },
    tagColorMap: {
      1: "#7bb800",
      2: "#faca0a",
      3: "#f56e6e"
    },
    tagClassMap: {
      1: "icon-success",
      2: "icon-get-fail",
      3: "icon-trans-fail"
    },
    tagMap: {
      1: "已审核",
      2: "已传输",
      3: "已使用"
    },
    width: 100
  },
  {
    label: "备注",
    prop: "description",
    width: 180
  }
]);
const knowledgeList = ref<AIKnowLedge.Entity[]>([]);
const pageConfig = ref({
  pageNo: 1,
  pageSize: 20,
  total: 0
});
// 获取数据
const queryForm = ref({
  documentUrl: "",
  name: "",
  label: ""
});
const getKnowledgeList = () => {
  searchKnowledge({
    pageNo: pageConfig.value.pageNo,
    pageSize: pageConfig.value.pageSize,
    ...queryForm.value
  }).then(res => {
    knowledgeList.value = res.data.knowledgeBaseList;
    pageConfig.value.total = res.data.total;
  });
};
const search = () => {
  pageConfig.value = {
    pageNo: 1,
    pageSize: 20,
    total: 0
  };
  getKnowledgeList();
};
const handleSizeChange = val => {
  pageConfig.value.pageSize = val;
  getKnowledgeList();
};
const handleCurrentChange = val => {
  pageConfig.value.pageNo = val;
  getKnowledgeList();
};
// 编辑
const handleEdit = row => {
  dialogKnowledgeVisible.value = true;
  actionType.value = "edit";
  nextTick(() => {
    knowledgeRef.value?.clearValidate();
    knowledgeForm.value = deepClone({
      ...row,
      labels: row.label?.split(",")
    });
    templateSelectChange(knowledgeForm.value.templateId);
  });
};
// 同步
const handleReStart = async id => {
  let resSuccess: boolean = false;
  let resMsg: string = "";
  const res = await reStartKnowledge({
    id
  });
  resSuccess = res.success ?? false;
  resMsg = res.errMessage ?? "";
  if (resSuccess) {
    search();
    ElMessage.success("同步成功");
  } else {
    ElMessage.error(resMsg);
  }
};
// 删除
const handleDel = async id => {
  let resSuccess: boolean = false;
  let resMsg: string = "";
  const res = await deleteKnowledge({
    id
  });
  resSuccess = res.success ?? false;
  resMsg = res.errMessage ?? "";
  if (resSuccess) {
    search();
    ElMessage.success("删除成功");
  } else {
    ElMessage.error(resMsg);
  }
};
// 新增模板
const dialogTemplateVisible = ref(false);
const validatePass = (rule: any, value: any, callback: any) => {
  if (!isFeishuSheetUrl(value)) {
    errorValidateMap.value[0] = 2;
    callback(new Error("输入的链接不为飞书电子表格链接"));
  } else {
    errorValidateMap.value[0] = 1;
    callback();
  }
};
const handleAddTemplate = () => {
  dialogTemplateVisible.value = true;
};

const handleViewTemplate = () => {
  window.open(knowledgeForm.value.templateUrl);
};

const saveTemplate = () => {
  getTemplateList();
};
// 新增知识库
const templateList = ref<AIKnowLedge.TemplateEntity[]>([]);
const getTemplateList = () => {
  searchKnowledgeTemplate({
    templateName: "",
    pageSize: 999999,
    pageNo: 1
  }).then(res => {
    templateList.value = res.data.knowledgeBaseTemplateList;
  });
};
const templateSelectChange = e => {
  knowledgeForm.value.templateUrl = templateList.value.find(item => item.id === e)?.templateUrl;
};
const base_list = ref<{ value: string; label: string }[]>([]);
const dialogKnowledgeVisible = ref(false);
const actionType = ref("add");
const knowledgeForm = ref<AIKnowLedge.Entity>({
  name: "",
  templateId: "",
  documentUrl: "",
  label: "",
  labels: [],
  description: ""
});
const validateLoading = ref(false);
// 解析知识空间节点信息：
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
        validateLoading.value = false;
        errorValidateMap.value[4] = 2;
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
// 获取工作表
const getSheetsInfo = (obj_token: string = ""): Promise<Feishu.Sheets[]> => {
  return new Promise((resolve, reject) => {
    getSheets({
      obj_token
    })
      .then(res => {
        let { sheets } = res.data;
        resolve(sheets);
      })
      .catch(err => {
        validateLoading.value = false;
        errorValidateMap.value[4] = 2;
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
// 获取多个工作表范围
const getValueInfo = (obj_token: string = "", sheets: Feishu.Sheets[]): Promise<Feishu.Ranges[]> => {
  return new Promise((resolve, reject) => {
    const ranges = Array.from(
      sheets.filter(item => item.resource_type === "sheet"),
      ({ sheet_id }) => sheet_id
    ).join(",");
    getValueBatchByRange({
      obj_token,
      ranges
    })
      .then(res => {
        let { valueRanges } = res.data;
        resolve(valueRanges);
      })
      .catch(err => {
        validateLoading.value = false;
        errorValidateMap.value[4] = 2;
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
// 错误信息
const errorMap = reactive([
  "输入为飞书wiki/电子表格链接",
  "输入文件的类型与模板匹配",
  "电子表格的工作表数量与模板匹配",
  "电子表格的表头与模板匹配",
  "不存在其他报错信息"
]);
// 标注错误信息：0：默认，1：成功，2：失败
const errorValidateMap = ref({
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0
});
// 重置错误信息
const resetErrorValidateMap = () => {
  errorValidateMap.value = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };
};
const handleDocumentUrlBlur = () => {
  resetErrorValidateMap();
};
// 解析文档，是否匹配
const parseDocument = async (value: string) => {
  validateLoading.value = true;
  ElMessage.info({
    message: "正在校验是否匹配模板，请稍候...",
    duration: 1500
  });
  // 获取输入的知识空间节点信息
  const { obj_type, obj_token } = await getNodeInfo(value);
  // 获取模板的知识空间节点信息
  const { obj_type: obj_type_template, obj_token: obj_token_template } = await getNodeInfo(knowledgeForm.value.templateUrl ?? "");
  if (obj_type !== obj_type_template) {
    validateLoading.value = false;
    errorValidateMap.value[1] = 2;
    return `输入的文件的类型${obj_type}和模板文件的类型${obj_type_template}不同，请检查`;
  }
  errorValidateMap.value[1] = 1;
  // 获取输入的工作表
  const sheets = await getSheetsInfo(obj_token);
  // 获取模板的工作表
  const sheetsTemplate = await getSheetsInfo(obj_token_template);
  if (sheets.length !== sheetsTemplate.length) {
    validateLoading.value = false;
    errorValidateMap.value[2] = 2;
    return `输入的文件工作表数量${sheets.length}和模板文件的工作表数量${sheetsTemplate.length}不同，请检查`;
  }
  errorValidateMap.value[2] = 1;
  // 获取输入的多个工作表范围
  const ranges = await getValueInfo(obj_token, sheets);
  // 获取模板的多个工作表范围
  const rangesTemplate = await getValueInfo(obj_token_template, sheetsTemplate);
  errorValidateMap.value[4] = 1;
  if (
    !deepEqualIgnoreOrder(
      ranges?.map(item => item.values?.[0]),
      rangesTemplate?.map(item => item.values?.[0])
    )
  ) {
    validateLoading.value = false;
    errorValidateMap.value[3] = 2;
    return "输入的文件和模板文件的表头不一致，请检查";
  }
  errorValidateMap.value[3] = 1;
  validateLoading.value = false;
  return "";
};
// 校验输入文件与模板文件是否一致
const validateIsMatchedTemplate = async (rule: any, value: any, callback: any) => {
  const errMsg = await parseDocument(value);
  if (!!errMsg) {
    callback(new Error(errMsg));
  } else {
    ElMessage.success({
      message: "输入文件与模板文件匹配！",
      duration: 1500
    });
    callback();
  }
};
// 表单校验规则
const knowledgeRules = reactive({
  name: [{ required: true, message: "必填", trigger: "blur" }],
  templateId: [{ required: true, message: "必填", trigger: "blur" }],
  documentUrl: [
    { required: true, message: "必填", trigger: "blur" },
    {
      validator: validatePass,
      trigger: "blur"
    },
    {
      validator: validateIsMatchedTemplate,
      trigger: "blur"
    }
  ]
});
const knowledgeRef = ref();
// 新增知识库
const handleAddKnowledge = () => {
  getTemplateList();
  actionType.value = "add";
  resetErrorValidateMap();
  dialogKnowledgeVisible.value = true;
  nextTick(() => {
    knowledgeForm.value.templateUrl = "";
    knowledgeRef.value?.clearValidate();
    knowledgeRef.value?.resetFields();
  });
};
// 保存知识库
const saveKnowledge = () => {
  resetErrorValidateMap();
  knowledgeRef.value.validate(async valid => {
    if (valid) {
      const params = {
        ...knowledgeForm.value,
        label: knowledgeForm.value.labels?.join(",")
      };
      delete params.labels;
      let resSuccess: boolean = false;
      let resMsg: string = "";
      const res = actionType.value === "add" ? await addKnowledge(params) : await editKnowledge(params);
      resSuccess = res.success ?? false;
      resMsg = res.errMessage ?? "";
      if (resSuccess) {
        dialogKnowledgeVisible.value = false;
        search();
        ElMessage.success("保存成功");
      } else {
        ElMessage.error(resMsg);
      }
    }
  });
};
const creatableSelect = ref();
const creatableLimit = 5;
// 标签选择器:聚焦,等于5个时,失去焦点,弹出提示
const handleLabelFocus = () => {
  setTimeout(() => {
    if ((knowledgeForm.value?.labels?.length ?? 0) >= 5) {
      ElMessage.warning(`只能输入${creatableLimit}个标签`);
      creatableSelect.value?.blur();
    }
  }, 400);
};
// 标签选择器:等于5个时,失去焦点
const handelLabelChange = e => {
  if (e.length === 5) {
    creatableSelect.value?.blur();
  }
};
onBeforeMount(() => {
  // 获取知识库列表
  getKnowledgeList();
});
</script>
<template>
  <div class="card container">
    <div class="container-header">
      <p class="title">AI知识库</p>
      <div class="operations">
        <el-button type="primary" :icon="Plus" @click="handleAddKnowledge">新增知识库</el-button>
      </div>
    </div>
    <el-form :inline="true" :model="queryForm" class="demo-form-inline" justify="space-between">
      <el-form-item label="知识库名称">
        <el-input v-model="queryForm.name" placeholder="知识库名称" clearable @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="标签">
        <el-input v-model="queryForm.label" placeholder="标签" clearable @keyup.enter="search" />
      </el-form-item>
      <el-form-item label="飞书链接">
        <el-input v-model="queryForm.documentUrl" placeholder="飞书链接" clearable @keyup.enter="search" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="search">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table class="table" :data="knowledgeList" style="width: 100%" show-overflow-tooltip>
      <el-table-column
        v-for="item in knowledgeColumnsConfig"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
      >
        <template #default="scoped">
          <el-space v-if="item.component && scoped.row[item.prop]">
            <Component
              v-for="row in scoped.row?.[item.prop]?.toString()?.split(',')"
              :key="row"
              :is="item.component"
              :color="item?.tagColorMap?.[row] ?? item?.tagColorMap?.[1]"
              :class="item?.tagClassMap?.[row] ?? item?.tagClassMap?.[1]"
              v-bind="item?.compProps"
              @click="item?.compProps?.click?.(scoped.row)"
            >
              {{ item?.tagMap?.[row] ?? row }}
            </Component>
          </el-space>
          <span v-else>{{ scoped.row[item.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="200">
        <template #default="scoped">
          <div class="btns">
            <el-popconfirm title="确认要重启这一项吗？" confirm-button-type="success" @confirm="handleReStart(scoped.row.id)">
              <template #reference>
                <el-button color="#119018" plain link>同步</el-button>
              </template>
            </el-popconfirm>
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
    <el-space direction="vertical" alignment="normal" :size="12">
      <div></div>
      <el-pagination
        background
        layout="total, prev, pager, next, sizes"
        :page-sizes="[20, 50, 100]"
        v-model:current-page="pageConfig.pageNo"
        v-model:page-size="pageConfig.pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :total="pageConfig.total"
      />
    </el-space>
    <!-- 新增模板 -->
    <CreateTemplate
      v-model:dialog-template-visible="dialogTemplateVisible"
      :action-type="actionType"
      @save-template="saveTemplate"
    />
    <el-dialog v-model="dialogKnowledgeVisible" :title="actionType === 'add' ? '新增知识库' : '修改知识库'" width="500">
      <el-form :model="knowledgeForm" label-width="auto" :rules="knowledgeRules" status-icon ref="knowledgeRef">
        <el-form-item label="知识库名称" prop="name">
          <el-input v-model="knowledgeForm.name" placeholder="请输入知识库名称" />
        </el-form-item>
        <el-form-item label="使用模板" prop="templateId">
          <el-row :gutter="12">
            <el-col :span="20">
              <el-select
                v-model="knowledgeForm.templateId"
                filterable
                :reserve-keyword="false"
                :disabled="actionType != 'add'"
                @change="templateSelectChange"
              >
                <el-option v-for="item in templateList" :key="item.id" :label="item.templateName" :value="item.id ?? ''" />
              </el-select>
            </el-col>
            <el-col :span="2" v-if="actionType == 'add'">
              <el-tooltip effect="dark" content="新增模板" placement="top">
                <el-icon @click="handleAddTemplate" class="add-template"><CirclePlus /></el-icon>
              </el-tooltip>
            </el-col>
            <el-col :span="2" v-if="knowledgeForm.templateUrl">
              <el-tooltip effect="dark" content="查看模板" placement="top">
                <el-icon @click="handleViewTemplate" class="add-template"><View /></el-icon>
              </el-tooltip>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="文档链接" prop="documentUrl">
          <el-popover
            class="box-item"
            placement="right"
            :visible="!!knowledgeForm.documentUrl && dialogKnowledgeVisible && actionType == 'add'"
            width="260"
          >
            <template #reference>
              <el-input
                v-model="knowledgeForm.documentUrl"
                placeholder="请输入飞书电子表格链接"
                :disabled="actionType != 'add' || !knowledgeForm.templateUrl"
                @blur="handleDocumentUrlBlur"
              />
            </template>
            <template #default>
              <div
                :class="[
                  'box-item-content',
                  errorValidateMap[index] === 2
                    ? 'box-item-content-error'
                    : errorValidateMap[index] === 1
                      ? 'box-item-content-success'
                      : ''
                ]"
                v-for="(item, index) in errorMap"
                :key="'error' + index"
              >
                {{ item }}
              </div>
            </template>
          </el-popover>
        </el-form-item>
        <el-form-item label="标签" prop="labels">
          <el-select
            class="creatable-select"
            ref="creatableSelect"
            v-model="knowledgeForm.labels"
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
            <el-option v-for="item in base_list" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="description">
          <el-input v-model="knowledgeForm.description" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogKnowledgeVisible = false">取消</el-button>
          <el-button type="primary" @click="saveKnowledge" :loading="validateLoading"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
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
.add-template {
  cursor: pointer;
}
</style>

<style lang="scss">
.table {
  .el-tag__content {
    padding-left: 12px;
    color: #ffffff;

    --svg-bu: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M18 23v-3h-3v-2h3v-3h2v3h3v2h-3v3zM2 20v-6H1v-2l1-5h15l1 5v2h-1v3h-2v-3h-4v6zm2-2h5v-4H4zM2 6V4h15v2z'/%3E%3C/svg%3E");
    --svg-success: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' color='%23000'%3E%3Cpath d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10'/%3E%3Cpath d='m8 12.5l2.5 2.5L16 9'/%3E%3C/g%3E%3C/svg%3E");
    --svg-get-fail: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M19 9H6.659c-1.006 0-1.51 0-1.634-.309c-.125-.308.23-.672.941-1.398L8.211 5M5 15h12.341c1.006 0 1.51 0 1.634.309c.125.308-.23.672-.941 1.398L15.789 19' color='%23000'/%3E%3C/svg%3E");
    --svg-trans-fail: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' color='%23000'%3E%3Cpath d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10'/%3E%3Cpath d='M12.242 17v-5c0-.471 0-.707-.146-.854c-.147-.146-.382-.146-.854-.146m.75-3h.009'/%3E%3C/g%3E%3C/svg%3E");
  }
  .icon-bu {
    .el-tag__content::before {
      position: absolute;
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-top: 1px;
      margin-left: -14px;
      content: "";
      background-color: currentColor;
      mask-image: var(--svg-bu);
      mask-repeat: no-repeat;
      mask-size: 100% 100%;
    }
  }
  .icon-success {
    .el-tag__content::before {
      position: absolute;
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-top: 1px;
      margin-left: -14px;
      content: "";
      background-color: currentColor;
      mask-image: var(--svg-success);
      mask-repeat: no-repeat;
      mask-size: 100% 100%;
    }
  }
  .icon-get-fail {
    .el-tag__content::before {
      position: absolute;
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-top: 1px;
      margin-left: -14px;
      content: "";
      background-color: currentColor;
      mask-image: var(--svg-get-fail);
      mask-repeat: no-repeat;
      mask-size: 100% 100%;
    }
  }
  .icon-trans-fail {
    .el-tag__content::before {
      position: absolute;
      display: inline-block;
      width: 12px;
      height: 12px;
      margin-top: 1px;
      margin-left: -14px;
      content: "";
      background-color: currentColor;
      mask-image: var(--svg-trans-fail);
      mask-repeat: no-repeat;
      mask-size: 100% 100%;
    }
  }
}
.creatable-select .el-select__popper:has(.el-select-dropdown__empty) {
  display: none;
}
.box-item-content {
  padding-left: 20px;

  --svg-success: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 36 36'%3E%3Cpath fill='%23000' d='M18 2a16 16 0 1 0 16 16A16 16 0 0 0 18 2m10.45 10.63L15.31 25.76L7.55 18a1.4 1.4 0 0 1 2-2l5.78 5.78l11.14-11.13a1.4 1.4 0 1 1 2 2Z' class='clr-i-solid clr-i-solid-path-1'/%3E%3Cpath fill='none' d='M0 0h36v36H0z'/%3E%3C/svg%3E");
  --svg-error: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cpath fill='%23000' fill-rule='evenodd' d='M256 42.667c117.803 0 213.334 95.53 213.334 213.333S373.803 469.334 256 469.334S42.667 373.803 42.667 256S138.197 42.667 256 42.667m48.918 134.25L256 225.836l-48.917-48.917l-30.165 30.165L225.835 256l-48.917 48.918l30.165 30.165L256 286.166l48.918 48.917l30.165-30.165L286.166 256l48.917-48.917z'/%3E%3C/svg%3E");
}
.box-item-content::before {
  position: absolute;
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-top: 2px;
  margin-left: -20px;
  content: "";
}
.box-item-content-success::before {
  color: #7bb800;
  background-color: currentColor;
  mask-image: var(--svg-success);
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}
.box-item-content-error::before {
  color: #f56e6e;
  background-color: currentColor;
  mask-image: var(--svg-error);
  mask-repeat: no-repeat;
  mask-size: 100% 100%;
}
</style>
