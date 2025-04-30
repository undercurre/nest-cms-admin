<script setup lang="ts">
import { TableSetting } from "@/api/interface";
import { AIKnowLedge } from "@/api/interface/aiKnowledge";
import { deleteKnowledgeTemplate, searchKnowledgeTemplate } from "@/api/modules/aiKnowledge";
import { deepClone } from "@/utils";
import { Plus } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { onBeforeMount, reactive, ref } from "vue";
import CreateTemplate from "../component/createTemplate.vue";

// 表格
const templateColumnsConfig = reactive<TableSetting.Columns[]>([
  {
    label: "模板名称",
    prop: "templateName",
    width: 200
  },
  {
    label: "标签",
    prop: "label",
    component: "el-tag",
    tagColorMap: {
      1: "#409EFF"
    },
    tagClassMap: {
      1: "icon-bu"
    },
    compProps: {
      hit: false
    }
  },
  {
    label: "文档链接",
    prop: "templateUrl",
    component: "el-button",
    compProps: {
      color: "#409EFF",
      plain: true,
      link: true,
      click: row => {
        window.open(row.templateUrl);
      }
    }
  },
  {
    label: "备注",
    prop: "description"
  }
]);
const templateList = ref<AIKnowLedge.TemplateEntity[]>([]);
const queryForm = ref({
  templateName: ""
});
// 获取数据
const getTemplateList = () => {
  searchKnowledgeTemplate({
    templateName: queryForm.value.templateName
  }).then(res => {
    templateList.value = res.data.knowledgeBaseTemplateList;
  });
};
// 编辑
const actionType = ref("add");
const currentRow = ref<AIKnowLedge.TemplateEntity>({
  templateName: "",
  templateUrl: "",
  description: "",
  label: "",
  labels: []
});
const dialogTemplateVisible = ref(false);
const handleAddTemplate = () => {
  actionType.value = "add";
  dialogTemplateVisible.value = true;
};
const handleEdit = row => {
  actionType.value = "edit";
  currentRow.value = deepClone({
    ...row,
    labels: row.label?.split(",")
  });
  dialogTemplateVisible.value = true;
};
// 删除
const handleDel = async id => {
  let resSuccess: boolean = false;
  let resMsg: string = "";
  const res = await deleteKnowledgeTemplate({
    id
  });
  resSuccess = res.success ?? false;
  resMsg = res.errMessage ?? "";
  if (resSuccess) {
    getTemplateList();
  } else {
    ElMessage.error(resMsg);
  }
};
// 新增模板
const saveTemplate = () => {
  getTemplateList();
};
onBeforeMount(() => {
  getTemplateList();
  // TODO: 去掉
  templateList.value = [
    {
      id: "100001",
      templateName: "100001",
      templateUrl: "https://dreametech.feishu.cn/sheets/PyW1skhZghNETNtRTb6cwn0qnyb",
      description: "已审核",
      label: "咖啡机,IOT"
    },
    {
      id: "100002",
      templateName: "100002",
      templateUrl: "https://dreametech.feishu.cn/sheets/PyW1skhZghNETNtRTb6cwn0qnyb",
      description: "已使用",
      label: "咖啡机,IOT"
    },
    {
      id: "100003",
      templateName: "100003",
      templateUrl: "https://dreametech.feishu.cn/sheets/PyW1skhZghNETNtRTb6cwn0qnyb",
      description: "已传输",
      label: "咖啡机,IOT"
    },
    {
      id: "100004",
      templateName: "100004",
      templateUrl: "https://dreametech.feishu.cn/sheets/PyW1skhZghNETNtRTb6cwn0qnyb",
      description: "失败",
      label: "咖啡机,IOT"
    }
  ];
});
</script>
<template>
  <div class="card container">
    <div class="container-header">
      <p class="title">知识库模板</p>
      <div class="operations">
        <el-button type="primary" :icon="Plus" @click="handleAddTemplate">新增模板</el-button>
      </div>
    </div>
    <el-form :inline="true" :model="queryForm" class="demo-form-inline" justify="space-between">
      <el-form-item label="模版名称">
        <el-input v-model="queryForm.templateName" placeholder="模版名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="getTemplateList">查询</el-button>
      </el-form-item>
    </el-form>
    <el-table class="table" :data="templateList" style="width: 100%">
      <el-table-column
        v-for="item in templateColumnsConfig"
        :key="item.prop"
        :prop="item.prop"
        :label="item.label"
        :width="item.width"
      >
        <template #default="scoped">
          <el-space v-if="item.component && scoped.row[item.prop]">
            <Component
              v-for="row in scoped.row[item.prop]?.split(',')"
              :key="row"
              :is="item.component"
              :color="item?.tagColorMap?.[row] ?? item?.tagColorMap?.[1]"
              :class="item?.tagClassMap?.[row] ?? item?.tagClassMap?.[1]"
              v-bind="item?.compProps"
              @click="item?.compProps?.click?.(scoped.row)"
            >
              {{ row }}
            </Component>
          </el-space>
          <span v-else>{{ scoped.row[item.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center" width="120">
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
    <!-- 新增模板 -->
    <CreateTemplate
      v-model:dialog-template-visible="dialogTemplateVisible"
      :action-type="actionType"
      @save-template="saveTemplate"
      :row="currentRow"
    />
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
</style>

<style lang="scss">
.table {
  .el-tag__content {
    padding-left: 12px;
    color: #ffffff;

    --svg-bu: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M18 23v-3h-3v-2h3v-3h2v3h3v2h-3v3zM2 20v-6H1v-2l1-5h15l1 5v2h-1v3h-2v-3h-4v6zm2-2h5v-4H4zM2 6V4h15v2z'/%3E%3C/svg%3E");
    --svg-success: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' color='%23000'%3E%3Cpath d='M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10s10-4.477 10-10'/%3E%3Cpath d='m8 12.5l2.5 2.5L16 9'/%3E%3C/g%3E%3C/svg%3E");
    --svg-get-fail: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' stroke='%23000' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' color='%23000'%3E%3Cpath d='M15.5 8.5L12 12m0 0l-3.5 3.5M12 12l3.5 3.5M12 12L8.5 8.5'/%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/g%3E%3C/svg%3E");
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
</style>
