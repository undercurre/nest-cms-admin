<!-- eslint-disable vue/html-closing-bracket-newline -->
<template>
  <div class="card container">
    <p class="title">产品配置</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="productList" style="width: 100%">
      <el-table-column prop="id" label="Id" width="120" />
      <el-table-column prop="model" label="型号" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="imageUrl" label="图片">
        <template #default="scoped">
          <img class="product_img_preview" :src="scoped.row.imageUrl" />
        </template>
      </el-table-column>
      <el-table-column prop="sellingPoints" label="卖点" />
      <el-table-column fixed="right" label="操作">
        <template #default="scoped">
          <div class="btns">
            <el-button class="watch_qrcode" link type="primary" size="small" @click="watchQrCode(scoped.row)"
              >查看二维码</el-button
            >
            <el-button link><el-link :href="scoped.row.manualOssUrl" target="_blank" underline>下载说明书</el-link></el-button>
            <el-popconfirm title="确认要删除这一项吗？" confirm-button-type="danger" @confirm="handleDel(scoped.row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" title="添加产品" width="500">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="产品型号">
          <el-input v-model="form.model" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="产品图片">
          <el-upload
            :action="imgAction"
            ref="uploadImg"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :data="extraImgData"
            :on-change="handleImgChange"
            :on-success="handleImgSuccess"
            :on-exceed="handleImgExceed"
          >
            <el-icon><Plus /></el-icon>
            <template #file="{ file }">
              <div>
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品卖点">
          <el-input v-model="form.sellingPoints" />
        </el-form-item>
        <el-form-item label="产品说明书">
          <el-upload
            class="upload_container"
            :action="manualAction"
            drag
            ref="uploadManual"
            :auto-upload="false"
            :limit="1"
            :data="extraManualData"
            :on-change="handleManualChange"
            :on-success="handleManualSuccess"
            :on-exceed="handleManualExceed"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text"><em>说明书</em></div>
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

    <el-dialog v-model="dialogQrcodeVisible" title="二维码" width="500">
      <div class="qrcode_container">
        <canvas class="qrcode" ref="qrcode" id="qrcode"></canvas>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="downloadQrCode"> 下载二维码 </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts" name="user">
import { Product } from "@/api/interface/innp";
import { onBeforeMount, reactive, ref, toRaw } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { getProductList, addProduct, getOSSSignature, delProduct } from "@/api/modules/innp";
import QRCode from "qrcode";
import { ElMessage, genFileId, UploadFile, UploadFiles, UploadInstance, UploadProps, UploadRawFile } from "element-plus";

const handleAddBtn = () => {
  dialogVisible.value = true;
};

const productList = ref<Array<Product.Entity>>();

async function refreshTable() {
  const res = await getProductList();
  productList.value = res.data;
}

onBeforeMount(() => {
  refreshTable();
});

const dialogVisible = ref(false);

const form = reactive({
  model: "",
  name: "",
  imageUrl: "",
  sellingPoints: "",
  manualOssUrl: ""
});

const uploadImg = ref<UploadInstance>();
const uploadImgSuccessMark = ref(false);
const uploadRawFileImg = ref<File>();
const imgAction = ref("#");
const extraImgData = ref<{
  key: string;
  OSSAccessKeyId: string;
  policy: string;
  signature: string;
  success_action_status: string;
}>();
const handleImgExceed: UploadProps["onExceed"] = files => {
  uploadImg.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadImg.value!.handleStart(file);
};

const handleImgChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("uploadImg", uploadFile, uploadFiles);
  uploadRawFileImg.value = toRaw(uploadFile.raw);
};

const handleImgSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("imgSuccess", response, uploadFile, uploadFiles);
  uploadImgSuccessMark.value = true;
  if (uploadManualSuccessMark.value) {
    submitForm();
  }
};

const uploadManual = ref<UploadInstance>();
const uploadManualSuccessMark = ref(false);
const uploadRawFileManual = ref<File>();
const manualAction = ref("#");
const extraManualData = ref<{
  key: string;
  OSSAccessKeyId: string;
  policy: string;
  signature: string;
  success_action_status: string;
}>();
const handleManualExceed: UploadProps["onExceed"] = files => {
  uploadManual.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadManual.value!.handleStart(file);
};

const handleManualChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("uploadManual", uploadFile, uploadFiles);
  uploadRawFileManual.value = toRaw(uploadFile.raw);
};

const handleManualSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("manualSuccess", response, uploadFile, uploadFiles);
  uploadManualSuccessMark.value = true;
  if (uploadImgSuccessMark.value) {
    submitForm();
  }
};

const submitForm = async () => {
  const clone = {
    model: form.model,
    name: form.name,
    imageUrl: form.imageUrl,
    sellingPoints: form.sellingPoints,
    manualOssUrl: form.manualOssUrl
  };
  const res = await addProduct(clone);
  if (res.code === 200) {
    dialogVisible.value = false;
    refreshTable();
  }
};

const handleConfirm = async () => {
  const signatureImgRes = await getOSSSignature({ fileType: "image" });
  console.log(signatureImgRes);
  const signatureManualRes = await getOSSSignature({ fileType: "pdf" });
  console.log(signatureManualRes);
  imgAction.value = signatureImgRes.data.host;
  manualAction.value = signatureManualRes.data.host;

  const imgUrlKey = generateFileName(signatureImgRes.data, uploadRawFileImg.value);
  const manualUrlKey = generateFileName(signatureManualRes.data, uploadRawFileManual.value);

  extraImgData.value = {
    key: imgUrlKey,
    OSSAccessKeyId: signatureImgRes.data.accessId,
    policy: signatureImgRes.data.policy,
    signature: signatureImgRes.data.signature,
    success_action_status: "200"
  };

  form.imageUrl = imgAction.value + "/" + imgUrlKey;

  extraManualData.value = {
    key: manualUrlKey,
    OSSAccessKeyId: signatureManualRes.data.accessId,
    policy: signatureManualRes.data.policy,
    signature: signatureManualRes.data.signature,
    success_action_status: "200"
  };

  form.manualOssUrl = manualAction.value + "/" + manualUrlKey;
  console.log("key", imgUrlKey, manualUrlKey);
  // 先上传两份文件
  uploadImg.value!.submit();
  uploadManual.value!.submit();
};

// 生成文件名，作为 key 使用
const generateFileName = (ossData, file) => {
  console.log(file, file.name);
  const suffix = file.name.slice(file.name.lastIndexOf("."));
  const filename = Date.now() + suffix;
  return ossData.dir + filename;
};

let canvas = document.getElementById("qrcode");
const watchQrCodeItem = ref<Product.Entity>();
const dialogQrcodeVisible = ref(false);
const watchQrCode = async (e: Product.Entity) => {
  watchQrCodeItem.value = e;
  dialogQrcodeVisible.value = true;
  requestAnimationFrame(() => {
    canvas = document.getElementById("qrcode");
    console.log(canvas);
    QRCode.toCanvas(
      canvas,
      `${import.meta.env.VITE_API_URL}markH5/product/${watchQrCodeItem.value?.id}`,
      { width: 200 },
      error => {
        if (error) console.error(error);
        console.log("二维码生成成功");
      }
    );
  });
};
function downloadQrCode() {
  if (!canvas) return;
  const url = (canvas as HTMLCanvasElement).toDataURL(); // 转换为 Base64 URL
  const link = document.createElement("a");
  link.href = url;
  link.download = `${watchQrCodeItem.value?.name}二维码.png`;
  link.click();
}

async function handleDel(id: number) {
  const delRes = await delProduct({ id });
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
</style>
