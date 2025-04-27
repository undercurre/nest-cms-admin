<script setup lang="ts">
import MonacoEdit from "@/components/MonacoEdit/index.vue";
import { ref, watch } from "vue";

const props = defineProps({
  transJson: {
    default: () => ({}),
    type: Object
  }
});
const localTransJson = ref({ ...props.transJson });
watch(
  () => props.transJson,
  val => {
    localTransJson.value = val;
  }
);
const getValType = item => {
  let value = item;
  const valueType = Object.prototype.toString.call(item).slice(8, -1).toLowerCase();
  if (valueType !== "number") {
    try {
      value = JSON.parse(item);
    } catch (e) {}
  }
  const realType = Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
  return realType;
};
const getComponentByType = type => {
  const componentMap = {
    boolean: "el-switch",
    string: "el-input",
    number: "el-input-number",
    object: MonacoEdit,
    array: MonacoEdit
  };
  return componentMap[type];
};
console.log("props: ", props);
</script>
<template>
  <div class="json-view" v-for="(item, i) in transJson" :key="i">
    <div class="json-key">{{ i }} ：</div>
    <div class="json-value">
      <Component
        :is="getComponentByType(getValType(item))"
        v-model="localTransJson[i]"
        :value="localTransJson[i]"
        disabled
      ></Component>
    </div>
  </div>
</template>

<style scoped lang="scss">
.json-view {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.json-key {
  width: 100px;
  margin-right: 10px;
  text-align: right;
}
</style>
