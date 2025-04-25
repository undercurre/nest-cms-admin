<script setup lang="ts">
import { getOSSSignature } from "@/api/modules/innp";
import { ElMessage, UploadFile, UploadFiles } from "element-plus";
import { ref, watch } from "vue";

const uploadFileList = ref([] as Array<UploadFile>);
const uploadedFileList = ref([] as Array<UploadFile>);
const uploadLoading = ref(false);
watch(
  () => uploadFileList.value,
  async (val, oldVal) => {
    if (val.length !== oldVal.length) {
      ElMessage.info({
        message: "文件上传中，请稍等...",
        duration: 1500
      });
    }
    for (const item of val) {
      if (item.status === "ready") {
        item.status = "uploading";
        const signatureUploadRes = await getOSSSignature({
          headerContentType: item?.raw?.type,
          fileType: item?.raw?.type?.split("/")?.[1]
        });
        uploadLoading.value = true;
        try {
          const res = await fetch(signatureUploadRes.data.url ?? "", {
            method: "PUT",
            body: item.raw
          });
          uploadLoading.value = false;
          if (res.status === 200) {
            item.status = "success";
            uploadedFileList.value.push({ ...item, url: signatureUploadRes?.data?.url?.split("?")?.[0] ?? "" });
          } else {
            item.status = "fail";
            ElMessage.error("文件上传失败");
          }
        } catch (error) {
          uploadLoading.value = false;
          item.status = "fail";
          ElMessage.error("文件上传失败");
        }
      }
    }

    if (val.every(item => item.status == "success")) {
      ElMessage.success("文件上传成功");
    }
  }
);
const handleFileChange = async (file: UploadFile, uploadFiles: UploadFiles) => {
  uploadFileList.value = uploadFiles;
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
  margin-top: 10px;
  background: #ffffff;
  padding: 12px 12px 2px;
  .uploaded-item {
    display: flex;
    align-items: center;
    padding: 4px 12px;
    background: #f0f0f0;
    margin-bottom: 10px;
  }
  .uploaded-name {
    width: 300px;
  }
  .uploaded-url-flex {
    margin-left: 40px;
    display: flex;
    align-items: center;
  }
  .uploaded-url {
    color: #afafaf;
    margin-right: 16px;
  }
  .ml-16px {
    margin-left: 16px;
  }
  .copy-icon {
    cursor: pointer;
  }
}
</style>
