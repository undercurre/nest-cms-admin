import { getValType } from "@/utils";
import { ref } from "vue";

export function useFeishuErrorCheck() {
  // 标注错误信息：0：默认，1：成功，2：失败
  const errorValidateMap = ref({
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0
  });
  // 设置错误信息
  const setErrorValidateMap = (type: number, value: number) => {
    errorValidateMap.value[type] = value;
  };
  // 重置错误信息
  const resetErrorValidateMap = () => {
    errorValidateMap.value = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0
    };
  };
  // 飞书错误码汇总
  const sheetsErrorMap = {
    1310251: "参考响应体中的错误",
    1310213: "没有电子表格权限",
    1310249: "请恢复表格后重试",
    1310214: "请检查表格 token",
    1315201: "服务内部错误，详询飞书客服",
    1315203: "服务内部错误，详询飞书客服",
    1315210: "服务内部错误，详询飞书客服",
    131001: "服务报错，请稍后重试",
    131002: "数据类型不匹配",
    131004: "非法用户",
    131005: {
      "member not found": "用户不是知识空间成员（管理员），无法删除。",
      "identity not found": "userid不存在，无法添加/删除成员。",
      "space not found": "知识空间不存在",
      "node not found": "节点不存在",
      "document not found": "文档不存在",
      "document is not in wiki": "文档不在知识库中",
      "resource not found": "资源不存在"
    },
    99991663: "登录过期",
    99991677: "登录过期",
    131006: {
      "permission denied: wiki space permission denied": "需要为知识空间成员（管理员）",
      "permission denied: node permission denied": "读操作时需要有节点阅读权限。",
      "permission denied: no source parent node permission": "需要原父节点容器编辑权限。",
      "permission denied: no destination parent node permission": "需要目的父节点容器编辑权限。",
      "permission denied: only task creator can query status": "为任务创建者（用户或应用/机器人）"
    },
    131007: "服务内部错误，请勿重试"
  };
  // 获取飞书错误码对应的信息
  const getSheetsErrorMap = err => {
    if (getValType(sheetsErrorMap[err.response.data.code]) === "string") {
      return sheetsErrorMap[err.response.data.code] ?? err.response.data.msg ?? err;
    } else {
      return sheetsErrorMap[err.response.data.code]?.[err.response.data.msg] ?? err.response.data.msg ?? err;
    }
  };

  return {
    errorValidateMap,
    resetErrorValidateMap,
    setErrorValidateMap,
    getSheetsErrorMap
  };
}
