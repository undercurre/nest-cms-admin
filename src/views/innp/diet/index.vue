<!-- eslint-disable vue/html-closing-bracket-newline -->
<template>
  <div class="card container">
    <p class="title">食谱配置</p>
    <div class="operations">
      <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
    </div>
    <el-table class="table" :data="dietList" style="width: 100%">
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="image" label="图片" align="center">
        <template #default="scoped">
          <img class="product_img_preview" :src="scoped.row.image" />
        </template>
      </el-table-column>
      <el-table-column prop="description" label="描述" align="center" />
      <el-table-column prop="time" label="用时" align="center">
        <template #default="scoped">
          <span>{{ scoped.row.time }}分钟</span>
        </template>
      </el-table-column>
      <el-table-column prop="difficulty" label="难度" align="center">
        <template #default="scoped">
          <span>{{ formatDifficulty(scoped.row.difficulty) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="taste" label="口味" align="center">
        <template #default="scoped">
          <span>{{ scoped.row.taste }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="品类" align="center">
        <template #default="scoped">
          <span>{{ scoped.row.category }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="nutrition_info" label="营养价值" align="center">
        <template #default="scoped">
          <p v-for="item in Object.keys(scoped.row.nutrition_info)" :key="item">
            {{ item }}:{{ scoped.row.nutrition_info[`${item}`] }}
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="ingredients" label="食材" align="center">
        <template #default="scoped">
          <p v-for="item in scoped.row.ingredients" :key="item">{{ item.name }}:{{ item.quantity }}</p>
        </template>
      </el-table-column>
      <el-table-column prop="steps" label="步骤" align="center">
        <template #default="scoped">
          <p v-for="item in scoped.row.steps" :key="item">{{ item.step_number }}、{{ item.description }}</p>
        </template>
      </el-table-column>
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

    <el-dialog v-model="dialogVisible" :title="dialogActionType === 'add' ? '添加' : '修改'" width="1000">
      <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="名称">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="用时">
          <el-input-number v-model="form.time" :min="0" :max="360" />
        </el-form-item>
        <el-form-item label="难度">
          <el-input-number v-model="form.difficulty" :min="1" :max="3" />
        </el-form-item>
        <el-form-item label="口味">
          <el-input v-model="form.taste" style="max-width: 600px" placeholder="Please input" class="input-with-select">
            <template #append>
              <el-select v-model="form.taste" placeholder="口味" size="large" style="width: 240px">
                <el-option v-for="item in tasteList" :key="item" :label="item" :value="item" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="品类">
          <el-input v-model="form.category" style="max-width: 600px" placeholder="Please input" class="input-with-select">
            <template #append>
              <el-select v-model="form.category" placeholder="品类" size="large" style="width: 240px">
                <el-option v-for="item in categoryList" :key="item" :label="item" :value="item" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            :action="imageAction"
            :file-list="uploadImageFileList"
            ref="uploadImage"
            list-type="picture-card"
            :auto-upload="false"
            :limit="1"
            :data="extraImageData"
            :on-change="handleImageChange"
            :on-success="handleImageSuccess"
            :on-exceed="handleImageExceed"
          >
            <el-icon><Plus /></el-icon>
            <template #file="{ file }">
              <div class="preview_container">
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="营养价值">
          <el-table
            :data="
              Object.keys(form.nutrition_info).map(item => {
                return { key: item, value: form.nutrition_info[`${item}`] };
              })
            "
            style="width: 100%"
            max-height="250"
            :show-header="false"
          >
            <el-table-column fixed prop="key" label="key" />
            <el-table-column prop="value" label="value" />
            <el-table-column fixed="right" label="Operations" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteNutritionRow(scope.row.key)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="width: 100%; display: flex; margin-top: 10px">
            <el-input v-model="nutrition_info_key" style="width: 120px" placeholder="营养" />
            <el-input v-model="nutrition_info_value" style="width: 120px" placeholder="数量" />
            <el-button type="primary" style="flex: 1" @click="onAddNutritionItem">增加该项</el-button>
          </div>
        </el-form-item>
        <el-form-item label="食材">
          <el-table :data="form.ingredients" style="width: 100%" max-height="250" :show-header="false">
            <el-table-column fixed prop="name" label="name" />
            <el-table-column prop="quantity" label="quantity" />
            <el-table-column fixed="right" label="Operations" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteIngredientsRow(scope.$index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="width: 100%; display: flex; margin-top: 10px">
            <el-input v-model="ingredients_name" style="width: 120px" placeholder="食材" />
            <el-input v-model="ingredients_quantity" style="width: 120px" placeholder="数量" />
            <el-button type="primary" style="flex: 1" @click="onAddIngredientsItem">增加该项</el-button>
          </div>
        </el-form-item>
        <el-form-item label="步骤">
          <el-table :data="form.steps" style="width: 100%" max-height="250" :show-header="false">
            <el-table-column fixed prop="index" label="index">
              <template #default="scope">
                <span>{{ scope.$index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="description" />
            <el-table-column fixed="right" label="Operations" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteStepsRow(scope.$index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="width: 100%; display: flex; margin-top: 10px">
            <el-input v-model="steps_description" style="width: 240px" placeholder="描述" />
            <el-button type="primary" style="flex: 1" @click="onAddStepsItem">增加该项</el-button>
          </div>
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
import { Diet, Ingredients } from "@/api/interface/innp";
import { onBeforeMount, reactive, ref, toRaw } from "vue";
import { Plus } from "@element-plus/icons-vue";
import { getDietList, addDiet, getOSSSignature, delDiet, updateDiet, getCategoryList, getTasteList } from "@/api/modules/innp";
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
import { nextTick } from "vue";

const handleAddBtn = () => {
  resetForm();
  dialogVisible.value = true;
  dialogActionType.value = "add";
  nextTick(() => {
    uploadImage.value!.clearFiles();
  });
};

const dietList = ref<Array<Diet.Entity>>();
const categoryList = ref<string[]>([]);
const tasteList = ref<string[]>([]);

async function refreshTable() {
  const dietRes = await getDietList();
  dietList.value = dietRes.data;
  const categoryRes = await getCategoryList();
  categoryList.value = categoryRes.data;
  const tasteRes = await getTasteList();
  tasteList.value = tasteRes.data;
}

function formatDifficulty(level: number) {
  const map: Record<number, string> = {
    1: "简单",
    2: "普通",
    3: "困难"
  };

  return map[level];
}

onBeforeMount(() => {
  refreshTable();
});

const dialogActionType = ref<"add" | "edit">("add");
const dialogVisible = ref(false);

interface Form {
  image: string;
  time: number;
  difficulty: number;
  name: string;
  category: string;
  description: string;
  taste: string;
  nutrition_info: Record<string, string>;
  ingredients: Omit<Ingredients.Entity, "id">[];
  steps: { description: string }[];
}

let form = reactive<Form>({
  image: "",
  time: 0,
  difficulty: 1,
  name: "",
  category: "",
  description: "",
  taste: "",
  nutrition_info: {},
  ingredients: [],
  steps: []
});

const resetForm = () => {
  form = reactive<Form>({
    image: "",
    time: 0,
    difficulty: 0,
    name: "",
    category: "",
    description: "",
    taste: "",
    nutrition_info: {},
    ingredients: [],
    steps: []
  });
};

const uploadImage = ref<UploadInstance>();
const uploadImageFileList = ref<UploadUserFile[]>([]);
const uploadRawFileImage = ref<File>();
const imageAction = ref("#");
const extraImageData = ref<{
  key: string;
  OSSAccessKeyId: string;
  policy: string;
  signature: string;
  success_action_status: string;
}>();
const handleImageExceed: UploadProps["onExceed"] = files => {
  uploadImage.value!.clearFiles();
  const file = files[0] as UploadRawFile;
  file.uid = genFileId();
  uploadImage.value!.handleStart(file);
};

const handleImageChange = (uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("uploadImage", uploadFile, uploadFiles);
  uploadRawFileImage.value = toRaw(uploadFile.raw);
};

const handleImageSuccess = (response: any, uploadFile: UploadFile, uploadFiles: UploadFiles) => {
  console.log("ImageSuccess", response, uploadFile, uploadFiles);
  submitForm();
};

const submitForm = async () => {
  const newDiet: Diet.CreateParams = {
    image: form.image,
    time: form.time,
    difficulty: form.difficulty,
    name: form.name,
    category: form.category,
    description: form.description,
    taste: form.taste,
    nutrition_info: JSON.stringify(form.nutrition_info),
    ingredients: form.ingredients,
    steps: form.steps.map((item, index) => {
      return {
        step_number: index + 1,
        ...item
      };
    })
  };
  let resCode: string | number = 0;
  let resMsg: string = "";
  if (dialogActionType.value === "add") {
    const res = await addDiet(newDiet);
    resCode = res.code;
    resMsg = res.msg;
  } else {
    if (!curEditItem.value) return;
    const res = await updateDiet({ ...newDiet, id: curEditItem.value.id });
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
  if (!uploadRawFileImage.value) {
    submitForm();
    return;
  }
  const signatureImageRes = await getOSSSignature({ fileType: "image" });
  console.log(signatureImageRes);

  imageAction.value = signatureImageRes.data.host;

  const imageUrlKey = generateFileName(signatureImageRes.data, uploadRawFileImage.value);

  extraImageData.value = {
    key: imageUrlKey,
    OSSAccessKeyId: signatureImageRes.data.accessId,
    policy: signatureImageRes.data.policy,
    signature: signatureImageRes.data.signature,
    success_action_status: "200"
  };

  form.image = imageAction.value + "/" + imageUrlKey;

  console.log("key", imageUrlKey);

  uploadImage.value!.submit();
};

// 生成文件名，作为 key 使用
const generateFileName = (ossData, file) => {
  console.log(file, file.name);
  const suffix = file.name.slice(file.name.lastIndexOf("."));
  const filename = Date.now() + suffix;
  return ossData.dir + filename;
};

const curEditItem = ref<Diet.Entity>();
async function handleEditStart(row: Diet.Entity) {
  curEditItem.value = row;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...others } = row;
  form = reactive(others);
  dialogActionType.value = "edit";
  const fakerImgRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.image)) || "image.png",
    url: row.image
  };
  uploadImageFileList.value = [fakerImgRawFile];
  dialogVisible.value = true;
}

function getFileNameFromUrl(url: string) {
  // 使用正则从 URL 中提取文件名
  const match = url.match(/\/([^/]+)$/);

  // 如果匹配成功，返回文件名，否则返回 null
  return match ? match[1] : null;
}

async function handleDel(id: number) {
  const delRes = await delDiet({ id });
  if (delRes.code === 200) {
    ElMessage.success("删除成功");
    refreshTable();
  } else {
    ElMessage.error("删除失败");
  }
}

const nutrition_info_key = ref("");
const nutrition_info_value = ref("");
const deleteNutritionRow = (key: string) => {
  delete form.nutrition_info[`${key}`];
};
function onAddNutritionItem() {
  if (!nutrition_info_key.value && !nutrition_info_value.value) return;
  form.nutrition_info[`${nutrition_info_key.value}`] = nutrition_info_value.value;
  nutrition_info_key.value = "";
  nutrition_info_value.value = "";
}
const ingredients_name = ref("");
const ingredients_quantity = ref("");
const deleteIngredientsRow = (index: number) => {
  form.ingredients.splice(index, 1);
};
function onAddIngredientsItem() {
  if (!ingredients_name.value && !ingredients_quantity.value) return;
  form.ingredients.push({
    name: ingredients_name.value,
    quantity: ingredients_quantity.value
  });
  ingredients_name.value = "";
  ingredients_quantity.value = "";
}
const steps_description = ref("");
const deleteStepsRow = (index: number) => {
  form.ingredients.splice(index, 1);
};
function onAddStepsItem() {
  if (!steps_description.value) return;
  form.steps.push({
    description: steps_description.value
  });
  steps_description.value = "";
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
