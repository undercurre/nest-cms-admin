<script setup lang="ts">
import { TableSetting } from "@/api/interface/index";
import { convertArrayToObject } from "@/utils";
import { Download, Upload } from "@element-plus/icons-vue";
import { ElMessage, genFileId, UploadFile, UploadInstance, UploadProps, UploadRawFile } from "element-plus";
import { PropType, ref } from "vue";
import * as XLSX from "xlsx";

const props = defineProps({
  title: {
    default: "导入产品",
    type: String
  },
  columnConfig: {
    default: () => [],
    type: Array as PropType<Array<TableSetting.Columns>>
  },
  templateUrl: {
    default: "",
    type: String
  }
});

const emits = defineEmits(["saveInBulk"]);
const dialogVisible = ref(false);
const importData = ref<any[]>([]);

// 导出Excel模板
const exportTemplate = () => {
  if (!props.templateUrl) {
    ElMessage.error("暂无模板");
    return;
  }
  const a = document.createElement("a");
  a.href = `/src/templates/${props.templateUrl}`;
  a.download = props.templateUrl || "导入模板.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  ElMessage.success("模板下载成功");
};

// 导入Excel文件
const openExcelImportDialog = () => {
  dialogVisible.value = true;
};

// 处理导入的Excel文件
const handleUploadChange = (file: UploadFile) => {
  const isExcel = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"].includes(
    file?.raw?.type ?? ""
  );
  if (!isExcel) {
    return ElMessage.error("文件只能是.xls, .xlsx格式!");
  }
  const reader = new FileReader();

  reader.onload = e => {
    if (!e.target || !(e.target.result instanceof ArrayBuffer)) {
      ElMessage.error("文件读取失败，请重试");
      return;
    }
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData: string[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    // 处理数据
    const headers = jsonData[0];
    const columns = convertArrayToObject(props.columnConfig);
    const importTemplateData: any[] = [];
    if (jsonData.length === 0) {
      ElMessage.error("导入数据为空，请检查文件");
    }
    for (let i = 1; i < jsonData.length; i++) {
      const row: any = {};
      headers.forEach((element, index) => {
        Object.assign(row, {
          [columns[element]]: jsonData[i][index]
        });
      });
      importTemplateData.push(row);
    }
    importData.value = importTemplateData;
  };

  if (file.raw) {
    reader.readAsArrayBuffer(file.raw);
  } else {
    ElMessage.error("文件读取失败，请重试");
  }
};
const upload = ref<UploadInstance>();

const handleExceed: UploadProps["onExceed"] = files => {
  upload.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  upload.value!.handleStart(file);
};
// 取消
const handleCancel = () => {
  dialogVisible.value = false;
  importData.value = [];
};
// 确认
const handleConfirm = () => {
  emits("saveInBulk", importData.value);
};
defineExpose({
  handleCancel
});
</script>
<template>
  <el-dialog v-model="dialogVisible" :title="title" width="900" :close-on-click-modal="false">
    <el-space alignment="stretch">
      <el-button type="primary" :icon="Download" @click="exportTemplate">下载模板</el-button>
      <el-upload
        ref="upload"
        action="#"
        :auto-upload="false"
        :limit="1"
        :on-exceed="handleExceed"
        :on-change="handleUploadChange"
        :show-file-list="false"
      >
        <template #trigger>
          <el-button plain>导入</el-button>
        </template>
      </el-upload>
    </el-space>
    <el-space :size="8"></el-space>
    <el-table :data="importData">
      <el-table-column
        v-for="item in columnConfig"
        :key="item.prop"
        :property="item.prop"
        :label="item.label"
        :width="item.width"
      >
        <template #default="scope">
          <el-input v-model="scope.row[item.prop]"></el-input>
        </template>
      </el-table-column>
    </el-table>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 导入 -->
  <el-button plain :icon="Upload" @click="openExcelImportDialog">导入</el-button>
</template>
<style lang="scss" scoped></style>
