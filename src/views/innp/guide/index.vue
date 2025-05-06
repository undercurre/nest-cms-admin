<!-- eslint-disable vue/html-closing-bracket-newline -->
<template>
  <div class="card container">
    <p class="title">指引配置</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="guideList" style="width: 100%">
      <el-table-column prop="id" label="Id" width="50" align="center" />
      <el-table-column prop="title" label="名称" align="center" />
      <el-table-column prop="video" label="视频" align="center">
        <template #default="scoped">
          <video class="product_img_preview" :src="scoped.row.video" />
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
        <el-form-item label="描述">
          <el-input v-model="form.description" />
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
          <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="user">
import { Guide } from "@/api/interface/innp";
import { addGuide, delGuide, getGuideList, getOSSSignature, updateGuide } from "@/api/modules/innp";
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
import { nextTick, onBeforeMount, reactive, ref, toRaw } from "vue";

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
  description: "",
  video: ""
});

const resetForm = () => {
  form = reactive({
    title: "",
    description: "",
    video: ""
  });
};

const uploadVideo = ref<UploadInstance>();
const uploadVideoFileList = ref<UploadUserFile[]>([]);
const uploadRawFileVideo = ref<File>();
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

const handleVideoChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("uploadVideo", uploadFile, uploadFiles);
  uploadRawFileVideo.value = toRaw(uploadFile.raw);
};

const handleVideoSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("videoSuccess", response, uploadFile, uploadFiles);
  submitForm();
};

const submitForm = async () => {
  const clone = {
    title: form.title,
    description: form.description,
    video: form.video
  };
  let resCode: string | number = 0;
  let resMsg: string = "";
  if (dialogActionType.value === "add") {
    const res = await addGuide(clone);
    resCode = res.code;
    resMsg = res.msg;
  } else {
    if (!curEditItem.value) return;
    const res = await updateGuide({ ...clone, id: curEditItem.value.id });
    resCode = res.code;
    resMsg = res.msg;
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
  const signatureVideoRes = await getOSSSignature({ fileType: "mp4" });
  console.log(signatureVideoRes);

  videoAction.value = signatureVideoRes.data.host;

  const videoUrlKey = generateFileName(signatureVideoRes.data, uploadRawFileVideo.value);

  extraVideoData.value = {
    key: videoUrlKey,
    OSSAccessKeyId: signatureVideoRes.data.accessId,
    policy: signatureVideoRes.data.policy,
    signature: signatureVideoRes.data.signature,
    success_action_status: "200"
  };

  form.video = videoAction.value + "/" + videoUrlKey;

  console.log("key", videoUrlKey);

  uploadVideo.value!.submit();
};

// 生成文件名，作为 key 使用
const generateFileName = (ossData, file) => {
  console.log(file, file.name);
  const suffix = file.name.slice(file.name.lastIndexOf("."));
  const filename = Date.now() + suffix;
  return ossData.dir + filename;
};

const curEditItem = ref<Guide.Entity>();
async function handleEditStart(row: Guide.Entity) {
  curEditItem.value = row;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...others } = row;
  form = reactive(others);
  dialogActionType.value = "edit";
  const fakerImgRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.video)) || "video.mp4",
    url: row.video
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
  if (delRes.code === 200) {
    ElMessage.success("删除成功");
    refreshTable();
  } else {
    ElMessage.error("删除失败");
  }
}
</script>

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
