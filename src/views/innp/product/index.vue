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
          <el-input v-model="form.imageUrl" />
        </el-form-item>
        <el-form-item label="产品卖点">
          <el-input v-model="form.sellingPoints" />
        </el-form-item>
        <el-form-item label="产品说明书">
          <el-input v-model="form.manualOssUrl" />
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
import { onBeforeMount, reactive, ref } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { getProductList, addProduct } from "@/api/modules/innp";
import QRCode from "qrcode";

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

const handleConfirm = async () => {
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

let canvas = document.getElementById("qrcode");
const watchQrCodeItem = ref<Product.Entity>();
const dialogQrcodeVisible = ref(false);
const watchQrCode = async (e: Product.Entity) => {
  watchQrCodeItem.value = e;
  dialogQrcodeVisible.value = true;
  requestAnimationFrame(() => {
    canvas = document.getElementById("qrcode");
    console.log(canvas);
    QRCode.toCanvas(canvas, `http://172.27.36.208/markH5/product/${watchQrCodeItem.value?.id}`, { width: 200 }, error => {
      if (error) console.error(error);
      console.log("二维码生成成功");
    });
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
</style>
