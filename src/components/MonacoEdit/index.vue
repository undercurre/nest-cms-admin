<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
// 引入 monaco-editor
import * as monaco from "monaco-editor";

const editorContainer = ref(null);
let editor: any = null;
const props = defineProps({
  value: {
    default: () => ({}),
    type: Object
  }
});
watch(
  () => props.value,
  val => {
    nextTick(() => {
      editor?.setValue(val);
    });
  },
  {
    immediate: true,
    deep: true
  }
);
console.log("props: ", props);
const initEditor = () => {
  // 初始化编辑器
  editor = monaco.editor.create(editorContainer.value!, {
    value: "", // 初始代码
    theme: "hc-black", // 主题
    language: "json",
    renderLineHighlight: "gutter",
    folding: true, // 是否折叠
    roundedSelection: false,
    foldingHighlight: true, // 折叠等高线
    foldingStrategy: "indentation", // 折叠方式  auto | indentation
    showFoldingControls: "always", // 是否一直显示折叠 always | mouseover
    disableLayerHinting: true, // 等宽优化
    emptySelectionClipboard: false, // 空选择剪切板
    selectionClipboard: false, // 选择剪切板
    automaticLayout: true, // 自动布局
    codeLens: true, // 代码镜头
    scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
    colorDecorators: true, // 颜色装饰器
    accessibilitySupport: "on", // 辅助功能支持  "auto" | "off" | "on"
    lineNumbers: "off", // 行号 取值： "on" | "off" | "relative" | "interval" | function
    lineNumbersMinChars: 5, // 行号最小字符   number
    readOnly: true, //是否只读  取值 true | false
    formatOnType: true,
    formatOnPaste: true
  });
};

// 生命周期钩子
onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  editor?.dispose(); // 销毁编辑器实例
});
</script>
<template>
  <div ref="editorContainer" class="monaco-editor-container"></div>
</template>
<style scoped lang="scss">
.monaco-editor-container {
  width: 500px;
  min-height: 50px;
}
</style>
<style>
.monaco-editor .margin-view-overlays .current-line-exact-margin {
  border: none !important;
}
</style>
