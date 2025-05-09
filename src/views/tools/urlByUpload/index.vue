<script setup lang="ts">
import { useOssUpload } from "@/hooks/useOssUpload";
import { ElMessage, UploadFile, UploadFiles, UploadUserFile } from "element-plus";
import { ref, watch } from "vue";
const uploadedFileList = ref([] as Array<UploadUserFile>);

const { uploadFileList, setUploadFileList, handleFileChange: handleFileUploadChange } = useOssUpload({ isMultiple: true });
watch(
  () => uploadFileList.value,
  async (val: any, oldVal) => {
    if (val.length !== oldVal.length) {
      ElMessage.info({
        message: "文件上传中，请稍等...",
        duration: 1500
      });
    }
    for (const item of val) {
      if (item.status === "ready") {
        item.status = "uploading";
        await handleFileUploadChange(item)
          .then(res => {
            item.status = "success";
            uploadedFileList.value.push({ ...item, url: res });
          })
          .catch(() => {
            item.status = "fail";
          });
      }
    }

    if (val.every(item => item.status == "success")) {
      ElMessage.success("文件上传成功");
    }
  }
);
const handleFileChange = async (file: UploadFile, uploadFiles: UploadFiles) => {
  setUploadFileList(uploadFiles);
};
</script>
<template>
  <div>
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :auto-upload="false"
      :show-file-list="false"
      :file-list="uploadFileList"
      :on-change="handleFileChange"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖拽文件到这里，上传并生成URL</div>
      <template #tip> </template>
    </el-upload>
    <div class="uploaded-box" v-if="uploadedFileList.length">
      <div class="uploaded-item" v-for="item in uploadedFileList" :key="item.uid">
        <div class="uploaded-name">{{ item.name }}</div>
        <div class="uploaded-url-flex">
          <div class="uploaded-url">{{ item.url }}</div>
          <el-tooltip content="复制文件URL" placement="top-start">
            <el-icon class="copy-icon" v-copy="item.url"><CopyDocument /></el-icon>
          </el-tooltip>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.uploaded-box {
  padding: 12px 12px 2px;
  margin-top: 10px;
  background: #ffffff;
  .uploaded-item {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    margin-bottom: 10px;
    background: #f0f0f0;
  }
  .uploaded-name {
    width: 300px;
  }
  .uploaded-url-flex {
    display: flex;
    align-items: center;
    margin-left: 40px;
  }
  .uploaded-url {
    margin-right: 16px;
    color: #afafaf;
  }
  .ml-16px {
    margin-left: 16px;
  }
  .copy-icon {
    cursor: pointer;
  }
}
</style>
