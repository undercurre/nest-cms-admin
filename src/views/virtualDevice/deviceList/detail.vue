<script setup lang="ts">
import { TableSetting } from "@/api/interface";
import { DeviceList, ProtocolImport } from "@/api/interface/virtualDevice";
import JsonToView from "@/components/JsonToView/index.vue";
import { deepClone } from "@/utils";
import { onBeforeMount, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const detailForm = ref<DeviceList.DeviceItem>();
const statusMap = reactive({
  在线: {
    label: "在线",
    color: "#529963"
  },
  离线: {
    label: "离线",
    color: "#f14c40"
  }
});

const protocol = ref("");
const protocolList = ref<ProtocolImport.ProtocolItem[]>([]);
const getProtocolList = () => {
  protocolList.value = [
    {
      protocolName: "device.xlsx",
      model: "5model",
      protocolData: [
        {
          key: "count",
          value: 10
        },
        {
          key: "enable",
          value: "true"
        },
        {
          key: "resJson",
          value: '{"a": "123", "b": "4665"}'
        },
        {
          key: "resArr",
          value: '[{"a": "123", "b": "4665"}, {"a": "232", "b": "4fd"}]'
        },
        {
          key: "str",
          value: "test"
        }
      ]
    }
  ];
};
const protocolData = ref([]);
const protocolColumn = ref<TableSetting.Columns[]>([]);
// 选择协议
const protocolChange = e => {
  selectList.value = [];
  protocolData.value = deepClone(protocolList.value.find(item => item.protocolName === e)?.protocolData);
  protocolColumn.value = [];
  const obj = protocolData.value?.[0];
  for (let i in obj) {
    protocolColumn.value.push({
      label: i,
      prop: i
    });
  }
};

// 选中模型行
const selectList = ref<{ key: string | number; value: any }[]>([]);
const multipleTable = ref();
const handleSelectionChange = e => {
  selectList.value = e;
};
const handleRowClick = row => {
  const selected = selectList.value.some(item => item.key === row.key);
  if (!selected) {
    selectList.value.push(row);
    multipleTable.value.toggleRowSelection(row, true);
  } else {
    let finalArr = selectList.value.filter(item => {
      return item.key !== row.key;
    });
    selectList.value = finalArr;
    multipleTable.value.toggleRowSelection(row, false);
  }
};
// 监听勾选行变化,处理数据
const transJson = ref({});
watch(
  () => selectList.value,
  val => {
    // 处理数据
    const resJson = {};
    val.forEach(item => {
      let value = item.value;
      Object.assign(resJson, {
        [item.key]: value
      });
    });
    transJson.value = resJson;
  }
);
const getCopyJson = () => {
  // 处理数据
  const resJson = {};
  selectList.value.forEach(item => {
    let value = item.value;
    const valueType = Object.prototype.toString.call(item.value).slice(8, -1).toLowerCase();
    if (valueType !== "number") {
      try {
        value = JSON.parse(item.value);
      } catch (e) {}
    }
    Object.assign(resJson, {
      [item.key]: value
    });
  });
  return resJson;
};

// MQTT日志
const MQTTLog = ref<DeviceList.MQTTLogItem[]>([]);
const MQTTLogColumn = reactive([
  {
    label: "设备ID",
    prop: "did"
  },
  {
    label: "设备型号",
    prop: "model"
  },
  {
    label: "时间",
    prop: "timestamp"
  },
  {
    label: "数据",
    prop: "data",
    formatter: true
  },
  {
    label: "状态",
    prop: "data_quality"
  }
]);
const getMQTTLog = () => {
  MQTTLog.value = [
    {
      did: "device_001",
      model: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00",
      data: {
        temperature: 25.5
      },
      data_quality: 0
    }
  ];
};
// 操作历史
const history = ref<DeviceList.HistoryItem[]>([]);
const getHistory = () => {
  history.value = [
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    },
    {
      id: "device_001",
      content: "temperature_sensor",
      timestamp: "2024-11-01 12:00:00"
    }
  ];
};
onBeforeMount(() => {
  detailForm.value = route.query as unknown as DeviceList.DeviceItem;
  getProtocolList();
  getMQTTLog();
  getHistory();
});
</script>
<template>
  <div class="card container">
    <div class="title-box">
      <div class="title">设备型号：{{ detailForm?.model }}</div>
      <div
        class="device-status"
        :style="{
          '--status-color': statusMap?.[detailForm?.status ?? '']?.color
        }"
      >
        {{ statusMap?.[detailForm?.status ?? ""]?.label }}
      </div>
      <el-button plain>启动</el-button>
    </div>
    <div class="layout">
      <div class="box">
        <div class="protocol-title">
          选择协议：<el-select
            v-model="protocol"
            placeholder="选择协议"
            size="large"
            style="width: 240px"
            @change="protocolChange"
          >
            <el-option
              v-for="item in protocolList"
              :key="item.protocolName"
              :label="item.protocolName"
              :value="item.protocolName"
            />
          </el-select>
        </div>
        <el-table
          ref="multipleTable"
          :data="protocolData"
          height="39vh"
          v-if="protocolColumn.length"
          @selection-change="handleSelectionChange"
          @row-click="handleRowClick"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column
            v-for="item in protocolColumn"
            :key="item.prop"
            :property="item.prop"
            :label="item.label"
            :width="item.width"
          >
          </el-table-column>
        </el-table>
        <el-empty v-else :image-size="200" description="请选择协议"></el-empty>
      </div>
      <div class="box">
        <div class="protocol-title">MQTT日志</div>
        <el-table :data="MQTTLog" height="41vh">
          <el-table-column v-for="item in MQTTLogColumn" :key="item.prop" :property="item.prop" :label="item.label">
            <template #default="scoped">
              <span v-if="item.formatter">
                <div v-for="(r, i) in scoped.row[item.prop]" :key="i">{{ i }}：{{ r }}</div>
              </span>
              <span v-else>{{ scoped.row[item.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="box">
        <div class="protocol-title">
          <div>属性视图</div>
          <el-tooltip content="复制JSON" placement="top-start">
            <el-icon class="copy-icon" v-if="selectList.length" v-copy="JSON.stringify(getCopyJson())"><CopyDocument /></el-icon>
          </el-tooltip>
          <el-button plain v-if="selectList.length">发送</el-button>
        </div>
        <div class="protocol-view-box" v-if="selectList.length">
          <JsonToView :trans-json="transJson" />
        </div>
        <el-empty v-else :image-size="60" description="请勾选协议字段查看视图"></el-empty>
      </div>
      <div class="box">
        <div class="protocol-title">操作历史列表</div>
        <div class="history-box" v-if="history.length">
          <div class="history-item" v-for="item in history" :key="item.id">
            <div>{{ item.content }}</div>
            <div>{{ item.timestamp }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.title-box {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.device-status {
  position: relative;
  margin-right: 20px;
  margin-left: 50px;
}
.device-status::before {
  position: absolute;
  width: 12px;
  height: 12px;
  margin-top: 7px;
  margin-left: -16px;
  content: "";
  background: var(--status-color);
  border-radius: 50%;
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
.layout {
  display: grid;
  grid-template-rows: 2fr 1fr;
  grid-template-columns: 1.5fr 1fr;
  grid-gap: 12px;
  height: 100%;
  padding-bottom: 12px;
}
.protocol-title {
  display: flex;
  align-items: center;
  font-weight: bold;
}
.copy-icon {
  margin-right: 20px;
  margin-left: 4px;
  cursor: pointer;
}
.protocol-view-box {
  height: 15vh;
  padding: 12px;
  margin-top: 12px;
  overflow: auto;
  background: #f0f0f0;
}
.history-box {
  height: 18vh;
  margin-top: 12px;
  overflow: auto;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  margin-bottom: 6px;
  background: #f0f0f0;
}
.history-item:last-child {
  margin-bottom: 0;
}
.box {
  padding: 12px;
  color: rgb(48 49 51);
  background-color: rgb(255 255 255);
  border-color: rgb(235 238 245);
  border-style: solid;
  border-width: 1px;
  border-radius: 4px;
  border-image: initial;
  box-shadow: rgb(0 0 0 / 10%) 0 2px 12px 0;
  transition: 0.3s;
}
</style>
