<!-- eslint-disable vue/html-closing-bracket-newline -->
<template>
  <div class="card container">
    <div class="container-header">
      <p class="title">食谱配置</p>
      <div class="operations">
        <ExcelImport
          v-if="false"
          ref="importBtn"
          title="导入食谱"
          :column-config="columnConfig"
          template-url="指引配置-导入模板.xlsx"
          @save-in-bulk="saveInBulk"
        />
        <el-button type="primary" :icon="Plus" @click="handleAddBtn">添加</el-button>
      </div>
    </div>
    <el-table class="table" :data="dietList" style="width: 100%">
      <el-table-column prop="name" label="名称" align="center" />
      <el-table-column prop="image" label="图片" align="center">
        <template #default="scoped">
          <img class="product_img_preview" :src="getUrlConcat(scoped.row.image)" />
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
          <span>{{ $t(`cookbook.${scoped.row.taste}`) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="category" label="品类" align="center">
        <template #default="scoped">
          <span>{{ $t(`cookbook.${scoped.row.category}`) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="nutrition_info" label="营养价值" align="center">
        <template #default="scoped">
          <p v-for="item in Object.keys(scoped.row.nutrition_info)" :key="item">
            {{ $t(`cookbook.${item}`) }}:{{ scoped.row.nutrition_info[`${item}`] }}
          </p>
        </template>
      </el-table-column>
      <el-table-column prop="ingredients" label="食材" align="center">
        <template #default="scoped">
          <p v-for="item in scoped.row.ingredients" :key="item">
            {{ item.name }}:{{ item.quantity === "AppropriateAmount" ? $t(`cookbook.${item.quantity}`) : item.quantity
            }}{{ item.quantity === "AppropriateAmount" ? "" : $t(`cookbook.${item.unit}`) }}
          </p>
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
      <el-form :model="form" label-width="auto" style="max-width: 600px" ref="ruleForm" :rules="rules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="名称（英文）" prop="name_en">
          <el-input v-model="form.name_en" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" />
        </el-form-item>
        <el-form-item label="描述（英文）" prop="description_en">
          <el-input v-model="form.description_en" />
        </el-form-item>
        <el-form-item label="用时" prop="time">
          <el-input-number v-model="form.time" :min="0" :max="360" />
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-input-number v-model="form.difficulty" :min="1" :max="3" />
        </el-form-item>
        <el-form-item label="口味">
          <el-input v-model="form.taste" style="max-width: 600px" placeholder="Please input" class="input-with-select">
            <template #append>
              <el-select v-model="form.taste" placeholder="口味" size="large" style="width: 240px">
                <el-option v-for="item in tasteList" :key="item" :label="$t(`cookbook.${item}`)" :value="item" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="品类">
          <el-input v-model="form.category" style="max-width: 600px" placeholder="Please input" class="input-with-select">
            <template #append>
              <el-select v-model="form.category" placeholder="品类" size="large" style="width: 240px">
                <el-option v-for="item in categoryList" :key="item" :label="$t(`cookbook.${item}`)" :value="item" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            :action="imageAction"
            :file-list="uploadFileList"
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
            <el-table-column fixed prop="key" label="key">
              <template #default="scope">
                <span> {{ $t(`cookbook.${scope.row.key}`) }} </span>
              </template>
            </el-table-column>
            <el-table-column prop="value" label="value">
              <template #default="scope">
                <span> {{ scope.row.value }} </span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteNutritionRow(scope.row.key)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; width: 100%; margin-top: 10px">
            <el-select v-model="nutrition_info_key" style="width: 120px" placeholder="营养">
              <el-option
                v-for="item in nutrition_info_options"
                :key="item.value"
                :label="$t(`cookbook.${item.label}`)"
                :value="item.value"
              />
            </el-select>
            <el-input v-model="nutrition_info_value" style="width: 120px" placeholder="数量" />
            <el-button type="primary" style="flex: 1" @click="onAddNutritionItem">增加该项</el-button>
          </div>
        </el-form-item>
        <el-form-item label="食材">
          <el-table :data="form.ingredients" style="width: 100%" max-height="250" :show-header="false">
            <el-table-column fixed prop="name" label="name" />
            <el-table-column fixed prop="name_en" label="name_en" />
            <el-table-column prop="quantity" label="quantity">
              <template #default="scope">
                <span>
                  {{ scope.row.quantity === "AppropriateAmount" ? $t(`cookbook.${scope.row.quantity}`) : scope.row.quantity }}
                  {{ scope.row.quantity === "AppropriateAmount" ? "" : $t(`cookbook.${scope.row.unit}`) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="Operations" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteIngredientsRow(scope.$index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; width: 100%; margin-top: 10px">
            <el-input v-model="ingredients_name" style="width: 120px" placeholder="食材" />
            <el-input v-model="ingredients_name_en" style="width: 120px" placeholder="食材(英文)" />
            <el-switch
              v-model="ingredients_quantity_appropriate_amount"
              inline-prompt
              active-text="适量"
              inactive-text="具体数量"
            />
            <el-input
              v-if="!ingredients_quantity_appropriate_amount"
              v-model="ingredients_quantity"
              style="width: 120px"
              placeholder="数量"
            />
            <el-select
              v-if="!ingredients_quantity_appropriate_amount"
              v-model="ingredients_quantity_unit"
              style="width: 120px"
              placeholder="单位"
            >
              <el-option
                v-for="item in ingredients_quantity_unit_options"
                :key="item.value"
                :label="$t(`cookbook.${item.label}`)"
                :value="item.value"
              />
            </el-select>
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
            <el-table-column prop="description_en" label="description_en" />
            <el-table-column fixed="right" label="Operations" min-width="120">
              <template #default="scope">
                <el-button link type="primary" size="small" @click.prevent="deleteStepsRow(scope.$index)"> 删除 </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="display: flex; width: 100%; margin-top: 10px">
            <el-input v-model="steps_description" style="width: 240px" placeholder="描述" />
            <el-input v-model="steps_description_en" style="width: 240px" placeholder="描述(英文)" />
            <el-button type="primary" style="flex: 1" @click="onAddStepsItem">增加该项</el-button>
          </div>
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
import { Diet, Ingredients } from "@/api/interface/innp";
import { addDiet, delDiet, getCategoryList, getDietList, getTasteList, updateDiet } from "@/api/modules/innp";
import ExcelImport from "@/components/ExcelImport/index.vue";
import { useOssUpload } from "@/hooks/useOssUpload";
import { deepClone } from "@/utils";
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

const ruleForm = ref();
const rules = reactive({
  name: [{ required: true, message: "必填", trigger: "blur" }],
  name_en: [{ required: true, message: "必填", trigger: "blur" }],
  description: [{ required: true, message: "必填", trigger: "blur" }],
  description_en: [{ required: true, message: "必填", trigger: "blur" }],
  time: [{ required: true, message: "必填", trigger: "blur" }],
  difficulty: [{ required: true, message: "必填", trigger: "blur" }],
  image: [{ required: true, message: "请上传图片", trigger: "blur" }]
});
const columnConfig = reactive([
  {
    prop: "name",
    label: "名称",
    width: "120"
  },
  {
    prop: "name_en",
    label: "名称（英文）",
    width: "120"
  },
  {
    prop: "image",
    label: "图片",
    width: "120"
  },
  {
    prop: "description",
    label: "描述",
    width: "120"
  },
  {
    prop: "description_en",
    label: "描述（英文）",
    width: "120"
  },
  {
    prop: "time",
    label: "用时（min）",
    width: "120"
  },
  {
    prop: "difficulty",
    label: "难度",
    width: "120"
  },
  {
    prop: "taste",
    label: "口味",
    width: "120"
  },
  {
    prop: "category",
    label: "品类",
    width: "120"
  },
  {
    prop: "nutrition_info_key",
    label: "营养价值名称",
    width: "120"
  },
  {
    prop: "nutrition_info_value",
    label: "营养价值含量",
    width: "120"
  },
  {
    prop: "ingredients_name",
    label: "食材",
    width: "120"
  },
  {
    prop: "ingredients_name_en",
    label: "食材（英文）",
    width: "120"
  },
  {
    prop: "ingredients_quantity",
    label: "食材量",
    width: "120"
  },
  {
    prop: "ingredients_quantity_unit",
    label: "食材单位",
    width: "120"
  },
  {
    prop: "steps_description",
    label: "步骤",
    width: "120"
  },
  {
    prop: "steps_description_en",
    label: "步骤（英文）",
    width: "120"
  }
]);
const importBtn = ref<InstanceType<typeof ExcelImport>>();
const saveInBulk = e => {
  console.log(e);
  importBtn.value?.handleCancel();
};
const handleAddBtn = () => {
  resetForm();
  dialogVisible.value = true;
  nextTick(() => {
    ruleForm.value.clearValidate();
  });
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
  name_en: string;
  category: string;
  description: string;
  description_en: string;
  taste: string;
  nutrition_info: Record<string, string>;
  ingredients: Omit<Ingredients.Entity, "id">[];
  steps: { description: string; description_en: string }[];
}

let form = reactive<Form>({
  image: "",
  time: 0,
  difficulty: 1,
  name: "",
  name_en: "",
  category: "",
  description: "",
  description_en: "",
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
    name_en: "",
    category: "",
    description: "",
    description_en: "",
    taste: "",
    nutrition_info: {},
    ingredients: [],
    steps: []
  });
};

const uploadImage = ref<UploadInstance>();
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

// url加http前缀
const getUrlConcat = (url: string) => {
  if (!url) {
    return "";
  }
  if (url.startsWith("http")) return url;
  return `${window.location.protocol}//${url}`;
};
// 上传loading
const { uploadLoading, uploadFileList, setUploadFileList, handleFileChange } = useOssUpload({
  accept: ["image/jpg", "image/jpeg", "image/png"],
  acceptError: "文件只能是.jpg, .jpeg, .png格式!",
  maxSize: 5 * 1024 * 1024
});
const handleImageChange = async (file: UploadFile) => {
  handleFileChange(file).then(res => {
    form.image = res;
  });
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
    name_en: form.name_en,
    category: form.category,
    description: form.description,
    description_en: form.description_en,
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
    resCode = res.code ?? 0;
    resMsg = res.msg ?? "";
  } else {
    if (!curEditItem.value) return;
    const res = await updateDiet({ ...newDiet, id: curEditItem.value.id });
    resCode = res.code ?? 0;
    resMsg = res.msg ?? "";
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
  ruleForm.value.validate(valid => {
    if (valid) {
      submitForm();
    }
  });
};

const curEditItem = ref<Diet.Entity>();
async function handleEditStart(row: Diet.Entity) {
  curEditItem.value = deepClone(row);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...others } = curEditItem.value!;
  form = reactive<Form>({
    ...others,
    name_en: row.name_en || "",
    description_en: row.description_en || "",
    steps: others.steps.map(step => ({
      description: step.description,
      description_en: step.description_en || ""
    }))
  });
  dialogActionType.value = "edit";
  const fakerImgRawFile: UploadUserFile = {
    // 从 url decodeURIComponent 解码成中文
    name: getFileNameFromUrl(decodeURIComponent(row.image)) || "image.png",
    url: getUrlConcat(row.image)
  };
  setUploadFileList([fakerImgRawFile]);
  dialogVisible.value = true;
  nextTick(() => {
    ruleForm.value.clearValidate();
  });
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
const nutrition_info_options = ref([
  {
    value: "calorie",
    label: "calorie"
  },
  {
    value: "fat",
    label: "fat"
  },
  {
    value: "protein",
    label: "protein"
  },
  {
    value: "carbohydrate",
    label: "carbohydrate"
  }
]);
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
const ingredients_name_en = ref("");
const ingredients_quantity_appropriate_amount = ref(false);
const ingredients_quantity = ref("");
const ingredients_quantity_unit = ref("");
const ingredients_quantity_unit_options = ref([
  {
    value: "strip",
    label: "strip"
  },
  {
    value: "piece",
    label: "piece"
  },
  {
    value: "root",
    label: "root"
  }
]);
const deleteIngredientsRow = (index: number) => {
  form.ingredients.splice(index, 1);
};
function onAddIngredientsItem() {
  if (!ingredients_name.value && !ingredients_quantity.value) return;
  form.ingredients.push({
    name: ingredients_name.value,
    name_en: ingredients_name_en.value,
    quantity: ingredients_quantity_appropriate_amount.value ? "AppropriateAmount" : ingredients_quantity.value,
    unit: ingredients_quantity_unit.value
  });
  ingredients_name.value = "";
  ingredients_name_en.value = "";
  ingredients_quantity.value = "";
  ingredients_quantity_unit.value = "";
  ingredients_quantity_appropriate_amount.value = false;
}
const steps_description = ref("");
const steps_description_en = ref("");
const deleteStepsRow = (index: number) => {
  form.steps.splice(index, 1);
};
function onAddStepsItem() {
  if (!steps_description.value) return;
  form.steps.push({
    description: steps_description.value,
    description_en: steps_description_en.value
  });
  steps_description.value = "";
  steps_description_en.value = "";
}
</script>

<style scoped lang="scss">
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
