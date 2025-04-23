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
      <el-table-column prop="imageOssUrl" label="图片" align="center" width="200">
        <template #default="scoped">
          <img class="product_img_preview" :src="getUrlConcat(scoped.row.imageOssUrl)" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="卖点" align="center" />
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scoped">
          <div class="btns">
            <el-button class="watch_qrcode" link type="primary" size="small" @click="watchQrCode(scoped.row)"
              >查看二维码</el-button
            >
            <el-button link
              ><el-link :href="getUrlConcat(scoped.row.manualOssUrl)" target="_blank" underline>下载说明书</el-link></el-button
            >
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
        <el-form-item label="产品名称（英文）">
          <el-input v-model="form.productNameEn" />
        </el-form-item>
        <el-form-item label="产品图片">
          <el-upload
            :action="imgAction"
            ref="uploadImg"
            list-type="picture-card"
            :limit="1"
            :file-list="uploadImgFileList"
            :auto-upload="false"
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
        <el-form-item label="产品卖点（英文）">
          <el-input v-model="form.descriptionEn" />
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
          <el-button type="primary" @click="handleConfirm" :disabled="uploadLoading"> 确认 </el-button>
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
import { onBeforeMount, reactive, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";

import { getProductList, addProduct, delProduct, updateProduct, uploadAvatar, getOSSSignature } from "@/api/modules/innp";
import QRCode from "qrcode";
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

const handleAddBtn = () => {
  dialogVisible.value = true;
  dialogActionType.value = "add";
  resetForm();
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
  productNameEn: "",
  imageOssUrl: "",
  description: "",
  descriptionEn: "",
  manualOssUrl: ""
});

const resetForm = () => {
  form = reactive({
    productModel: "",
    productName: "",
    productNameEn: "",
    imageOssUrl: "",
    description: "",
    descriptionEn: "",
    manualOssUrl: ""
  });
  uploadImgFileList.value = [];
  uploadManualFileList.value = [];
};

const uploadImg = ref<UploadInstance>();
const uploadImgFileList = ref<UploadUserFile[]>([]);
const uploadImgSuccessMark = ref(false);
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
// url加http前缀
const getUrlConcat = (url: string) => {
  if (!url) {
    return "";
  }
  if (url.startsWith("http")) return url;
  return `${window.location.protocol}//${url}`;
};
// 上传图片接口对接
const handleImgChange = (file: UploadFile, fileList: UploadFiles) => {
  console.log("uploadImg", fileList, file);
  const isImg = file.raw ? ["image/jpg", "image/jpeg", "image/png"].includes(file.raw.type) : false;
  const isLt5M = file?.size ? file.size / 1024 / 1024 < 5 : false;
  if (!isImg) {
    uploadImgFileList.value = [];
    return ElMessage.error("文件只能是.jpg, .jpeg, .png格式!");
  }
  if (!isLt5M) {
    uploadImgFileList.value = [];
    return ElMessage.error("文件大小不能超过 5MB!");
  }
  if (!file.raw) return;
  const fileType = file.raw.type as "image/jpg" | "image/jpeg" | "image/png" | "application/pdf";
  getBase64(file.raw).then((res: string) => {
    uploadAvatar({
      contentType: fileType,
      base64: res
    }).then(ret => {
      form.imageOssUrl = ret?.data?.url;
    });
  });
};
// 获取图片转base64
const getBase64 = (file: File): Promise<string> => {
  return new Promise<string>(function (resolve, reject) {
    const reader = new FileReader();
    let imgResult = "";
    reader.readAsDataURL(file);
    reader.onload = function () {
      imgResult = reader.result as string;
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.onloadend = function () {
      resolve(imgResult);
    };
  });
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
// 上传loading
const uploadLoading = ref(false);
const handleManualChange = async (uploadFile: UploadFile) => {
  if (!uploadFile.raw?.type) {
    uploadManualFileList.value = [];
    return ElMessage.error("无法识别文件类型!");
  }
  const isPdf = ["application/pdf"].includes(uploadFile.raw.type);
  const isLt5M = uploadFile?.size ? uploadFile.size / 1024 / 1024 < 5 : false;
  if (!isPdf) {
    uploadManualFileList.value = [];
    return ElMessage.error("文件只能是.pdf格式!");
  }
  if (!isLt5M) {
    uploadManualFileList.value = [];
    return ElMessage.error("文件大小不能超过 5MB!");
  }
  const allowedTypes = [
    "image/jpg",
    "image/jpeg",
    "image/png",
    "application/pdf",
    "video/mp4",
    "video/mov",
    "video/webm"
  ] as const;
  if (!uploadFile.raw.type || !allowedTypes.includes(uploadFile.raw.type as any)) {
    return ElMessage.error("不支持的文件类型");
  }
  const signatureManualRes = await getOSSSignature({
    contentType: uploadFile.raw.type as (typeof allowedTypes)[number]
    // fileType: uploadFile.raw.type?.split("/")?.[1]
  });
  uploadLoading.value = true;
  try {
    ElMessage.info("文件上传中，请稍等...");
    const res = await fetch(signatureManualRes.data.url, {
      method: "PUT",
      body: uploadFile.raw
    });
    uploadLoading.value = false;
    form.manualOssUrl = signatureManualRes.data.url?.split("?")?.[0];
    if (res.status === 200) {
      ElMessage.success("文件上传成功");
    }
  } catch (error) {
    uploadLoading.value = false;
    ElMessage.error("文件上传失败");
  }
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
    nameEn: form.productNameEn,
    imageUrl: form.imageOssUrl,
    sellingPoints: form.description,
    sellingPointsEn: form.descriptionEn,
    manualUrl: form.manualOssUrl
  };
  let resSuccess: boolean = false;
  let resMsg: string = "";
  if (dialogActionType.value === "add") {
    const res = await addProduct(clone);
    resSuccess = res.success;
    resMsg = res.msg || "添加失败";
  } else {
    if (!curEditItem.value) return;
    const res = await updateProduct({ ...clone, id: curEditItem.value.id });
    resSuccess = res.success;
    resMsg = res.msg || "修改失败";
  }

  if (resSuccess) {
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

// 生成文件名，作为 key 使用

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
      `http://172.26.224.165:30343/web/cms/markH5/product/${watchQrCodeItem.value?.id}`,
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
    url: getUrlConcat(row.imageOssUrl)
  };
  const fakerManualRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.manualOssUrl)) || "manual.pdf",
    url: getUrlConcat(row.manualOssUrl)
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
  if (delRes.success) {
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
