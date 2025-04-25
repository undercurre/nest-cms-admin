<script setup lang="ts">
import { UploadFile, UploadFiles } from "element-plus";
import { ref } from "vue";

const uploadFileList = ref([] as Array<UploadFile>);
const handleFileChange = (file: UploadFile) => {
  uploadFileList.value.push(file);
  console.log("uploadFileList: ", uploadFileList.value);
};
const handleFileSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("uploadFiles: ", uploadFiles);
  console.log("uploadFile: ", uploadFile);
  console.log("response: ", response);
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
      :on-success="handleFileSuccess"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">拖拽文件到这里，上传并生成URL</div>
      <template #tip> </template>
    </el-upload>
    <div>
      <div v-for="item in uploadFileList" :key="item.uid">{{ item.name }}</div>
    </div>
  </div>
</template>
<style lang="scss" scoped></style>
