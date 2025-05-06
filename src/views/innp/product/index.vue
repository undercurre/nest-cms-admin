<!-- eslint-disable vue/html-closing-bracket-newline -->
<template>
  <div class="card container">
    <p class="title">产品配置</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="productList" style="width: 100%">
      <el-table-column prop="id" label="Id" width="50" align="center" />
      <el-table-column prop="productModel" label="型号" align="center" />
      <el-table-column prop="productName" label="名称" align="center" />
      <el-table-column prop="imageOssUrl" label="图片" align="center">
        <template #default="scoped">
          <img class="product_img_preview" :src="scoped.row.imageOssUrl" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="卖点" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scoped">
          <div class="btns">
            <el-button class="watch_qrcode" link type="primary" size="small" @click="watchQrCode(scoped.row)"
              >查看二维码</el-button
            >
            <el-button link><el-link :href="scoped.row.manualOssUrl" target="_blank" underline>下载说明书</el-link></el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogActionType === 'add' ? '添加产品' : '修改产品'" width="500">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="产品型号">
          <el-input v-model="form.productModel" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="form.productName" />
        </el-form-item>
        <el-form-item label="产品图片">
          <el-upload
            :action="imgAction"
            :file-list="uploadImgFileList"
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
              <div class="preview_container">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品卖点">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="产品说明书">
          <el-upload
            class="upload_container"
            :action="manualAction"
            :file-list="uploadManualFileList"
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
import { addProduct, delProduct, getOSSSignature, getProductList, updateProduct } from "@/api/modules/innp";
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
import QRCode from "qrcode";
import { onBeforeMount, reactive, ref, toRaw } from "vue";

const handleAddBtn = () => {
  dialogVisible.value = true;
  dialogActionType.value = "add";
};

const productList = ref<Array<Product.Entity>>();

async function refreshTable() {
  const res = await getProductList();
  console.log(res);
  productList.value = res.data;
}

onBeforeMount(() => {
  refreshTable();
});

const dialogActionType = ref<"add" | "edit">("add");
const dialogVisible = ref(false);

type ProductForm = Omit<Product.Entity, "createTime" | "createUid" | "sku" | "updateTime" | "updateUid" | "id">;

let form = reactive<ProductForm>({
  productModel: "",
  productName: "",
  imageOssUrl: "",
  description: "",
  manualOssUrl: ""
});

const resetForm = () => {
  form = reactive({
    productModel: "",
    productName: "",
    imageOssUrl: "",
    description: "",
    manualOssUrl: ""
  });
};

const uploadImg = ref<UploadInstance>();
const uploadImgFileList = ref<UploadUserFile[]>([]);
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
const uploadManualFileList = ref<UploadUserFile[]>([]);
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
    model: form.productModel,
    name: form.productName,
    imageUrl: form.imageOssUrl,
    sellingPoints: form.description,
    manualOssUrl: form.manualOssUrl
  };
  let resCode: string | number = 0;
  let resMsg: string = "";
  if (dialogActionType.value === "add") {
    const res = await addProduct(clone);
    resCode = res.code;
    resMsg = res.msg;
  } else {
    if (!curEditItem.value) return;
    const res = await updateProduct({ ...clone, id: curEditItem.value.id });
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

  form.imageOssUrl = imgAction.value + "/" + imgUrlKey;

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
      `http://172.26.224.136:31211/web/cms/markH5/product/${watchQrCodeItem.value?.id}`,
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
  link.download = `${watchQrCodeItem.value?.productName}二维码.png`;
  link.click();
}

const curEditItem = ref<Product.Entity>();
async function handleEditStart(row: Product.Entity) {
  curEditItem.value = row;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...others } = row;
  form = reactive(others);
  dialogActionType.value = "edit";
  const fakerImgRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.imageOssUrl)) || "image.jpg",
    url: row.imageOssUrl
  };
  const fakerManualRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.manualOssUrl)) || "manual.pdf",
    url: row.manualOssUrl
  };
  uploadImgFileList.value = [fakerImgRawFile];
  uploadManualFileList.value = [fakerManualRawFile];
  dialogVisible.value = true;
}

function getFileNameFromUrl(url: string) {
  // 使用正则从 URL 中提取文件名
  const match = url.match(/\/([^/]+)$/);

  // 如果匹配成功，返回文件名，否则返回 null
  return match ? match[1] : null;
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
