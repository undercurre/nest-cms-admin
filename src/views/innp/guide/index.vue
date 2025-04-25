<!-- eslint-disable vue/html-closing-bracket-newline -->
<template>
  <div class="card container">
    <p class="title">指引配置</p>
    <div class="operations">
      <ExcelImport
        v-if="false"
        ref="importBtn"
        title="导入指引"
        :column-config="columnConfig"
        template-url="指引配置-导入模板.xlsx"
        @save-in-bulk="saveInBulk"
      />
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="guideList" style="width: 100%">
      <el-table-column prop="id" label="Id" width="50" align="center" />
      <el-table-column prop="title" label="标题" align="center" />
      <el-table-column prop="video" label="视频" align="center">
        <template #default="scoped">
          <video class="product_img_preview" :src="getUrlConcat(scoped.row.video)" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scoped">
          <div class="btns">
            <el-button color="#409EFF" plain link @click="handleEditStart(scoped.row)">修改</el-button>
            <el-popconfirm title="确认要删除这一项吗？" confirm-button-type="danger" @confirm="handleDel(scoped.row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="dialogActionType === 'add' ? '添加指引' : '修改指引'" width="500">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="标题">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="标题（英文）">
          <el-input v-model="form.title_en" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="描述（英文）">
          <el-input v-model="form.description_en" />
        </el-form-item>
        <el-form-item label="视频">
          <el-upload
            class="upload_container"
            :action="videoAction"
            :file-list="uploadVideoFileList"
            drag
            ref="uploadVideo"
            :auto-upload="false"
            :limit="1"
            :data="extraVideoData"
            :on-change="handleVideoChange"
            :on-success="handleVideoSuccess"
            :on-exceed="handleVideoExceed"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text"><em>指引视频</em></div>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm" :disabled="uploadLoading"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="user">
// import axios from "axios";
import { Guide } from "@/api/interface/innp";
import { addGuide, delGuide, getGuideList, getOSSSignature, updateGuide } from "@/api/modules/innp";
import ExcelImport from "@/components/ExcelImport/index.vue";
import { Plus } from "@element-plus/icons-vue";
import {
  ElMessage,
  genFileId,
  UploadFile,
  UploadFiles,
  UploadInstance,
  UploadProps,
  UploadRawFile,
  UploadUserFile
} from "element-plus";
import { nextTick, onBeforeMount, reactive, ref } from "vue";

const columnConfig = reactive([
  { prop: "title", label: "标题" },
  { prop: "title_en", label: "标题（英文）" },
  { prop: "video", label: "视频" },
  { prop: "description", label: "描述" },
  { prop: "description_en", label: "描述（英文）" }
]);
const importBtn = ref<InstanceType<typeof ExcelImport>>();
const saveInBulk = e => {
  console.log(e);
  importBtn.value?.handleCancel();
};
const handleAddBtn = () => {
  resetForm();
  dialogVisible.value = true;
  dialogActionType.value = "add";
  nextTick(() => {
    uploadVideo.value!.clearFiles();
  });
};

const guideList = ref<Array<Guide.Entity>>();

async function refreshTable() {
  const res = await getGuideList();
  guideList.value = res.data;
}

onBeforeMount(() => {
  refreshTable();
});
const dialogActionType = ref<"add" | "edit">("add");
const dialogVisible = ref(false);

let form = reactive({
  title: "",
  title_en: "",
  description: "",
  description_en: "",
  video: ""
});

const resetForm = () => {
  form = reactive({
    title: "",
    title_en: "",
    description: "",
    description_en: "",
    video: ""
  });
};

const uploadVideo = ref<UploadInstance>();
const uploadVideoFileList = ref<UploadUserFile[]>([]);
const videoAction = ref("#");
const extraVideoData = ref<{
  key: string;
  OSSAccessKeyId: string;
  policy: string;
  signature: string;
  success_action_status: string;
}>();
const handleVideoExceed: UploadProps["onExceed"] = files => {
  uploadVideo.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadVideo.value!.handleStart(file);
};

// url加http前缀
const getUrlConcat = (url: string) => {
  if (!url) {
    return "";
  }
  if (url.startsWith("http")) return url;
  return `${window.location.protocol}//${url}`;
};

// 上传loading
const uploadLoading = ref(false);
const handleVideoChange = async (uploadFile: UploadFile) => {
  const isVideo = ["video/mp4", "video/mov", "video/webm"].includes(uploadFile?.raw?.type ?? "");
  if (!isVideo) {
    uploadVideoFileList.value = [];
    return ElMessage.error("文件只能是.mp4、.mov或.webm格式!");
  }
  const signatureVideoRes = await getOSSSignature({
    headerContentType: uploadFile?.raw?.type ?? "",
    fileType: uploadFile?.raw?.type?.split("/")?.[1] ?? ""
  });
  uploadLoading.value = true;
  try {
    ElMessage.info("文件上传中，请稍等...");
    const res = await fetch(signatureVideoRes.data.url ?? "", {
      method: "PUT",
      body: uploadFile.raw
    });
    uploadLoading.value = false;
    form.video = signatureVideoRes.data.url?.split("?")?.[0] ?? "";
    if (res.status === 200) {
      ElMessage.success("文件上传成功");
    }
  } catch (error) {
    uploadLoading.value = false;
    ElMessage.error("文件上传失败");
  }
};

const handleVideoSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("videoSuccess", response, uploadFile, uploadFiles);
  submitForm();
};

const submitForm = async () => {
  const clone = {
    title: form.title,
    title_en: form.title_en,
    description: form.description,
    description_en: form.description_en,
    video: form.video
  };
  let resCode: string | number = 0;
  let resMsg: string = "";
  if (dialogActionType.value === "add") {
    const res = await addGuide(clone);
    resCode = res.code ?? 0;
    resMsg = res.message ?? "";
  } else {
    if (!curEditItem.value) return;
    const res = await updateGuide({ ...clone, id: curEditItem.value.id });
    resCode = res.code ?? 0;
    resMsg = res.message ?? "";
  }

  if (resCode === 200) {
    dialogVisible.value = false;
    refreshTable();
    resetForm();
  } else {
    ElMessage.error(resMsg);
  }
};

const handleConfirm = async () => {
  submitForm();
};

const curEditItem = ref<Guide.Entity>();
async function handleEditStart(row: Guide.Entity) {
  curEditItem.value = row;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...others } = row;
  form = reactive({
    ...others,
    title_en: others.title_en || "",
    description_en: others.description_en || ""
  });
  dialogActionType.value = "edit";
  const fakerImgRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.video)) || "video.mp4",
    url: getUrlConcat(row.video)
  };
  uploadVideoFileList.value = [fakerImgRawFile];
  dialogVisible.value = true;
}

function getFileNameFromUrl(url: string) {
  // 使用正则从 URL 中提取文件名
  const match = url.match(/\/([^/]+)$/);

  // 如果匹配成功，返回文件名，否则返回 null
  return match ? match[1] : null;
}

async function handleDel(id: number) {
  const delRes = await delGuide({ id });
  if (delRes.errCode === 200) {
    ElMessage.success("删除成功");
    refreshTable();
  } else {
    ElMessage.error("删除失败");
  }
}
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
