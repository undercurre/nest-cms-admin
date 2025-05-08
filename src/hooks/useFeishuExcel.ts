import { Feishu } from "@/api/interface/aiKnowledge";
import { getNode, getSheets, getValueBatchByRange, getValueSingleByRange } from "@/api/modules/aiKnowledge";
import { useFeishuErrorCheck } from "@/hooks/useFeishuErrorCheck";
import { type Action, ElMessage, ElMessageBox } from "element-plus";
import { ref } from "vue";

// 获取知识空间节点信息/获取工作表/获取多个工作表范围/获取单个工作表范围
export const useFeishuExcel = () => {
  const validateLoading = ref(false);
  const setValidateLoading = (loading: boolean) => {
    validateLoading.value = loading;
  };
  const { setErrorValidateMap, getSheetsErrorMap, errorValidateMap, resetErrorValidateMap } = useFeishuErrorCheck();

  /**
   * 检查字符串是否为有效的飞书电子表格链接
   * @param url 待检查的URL字符串
   * @returns 返回匹配结果（true/false），或返回匹配的URL（如果returnMatch为true）
   */
  const isFeishuSheetUrl = (url: string): boolean => {
    // 飞书电子表格链接正则（支持带参数）
    const feishuLinkRegex =
      /^https:\/\/[a-zA-Z0-9-]+\.feishu\.cn\/(wiki\/[a-zA-Z0-9]+(\?[^#\s]*)?|sheets\/[a-zA-Z0-9]+(\?[^#\s]*)?)(#.*)?$/;
    return feishuLinkRegex.test(url);
  };

  /**
   * 解析飞书电子表格链接，获取obj_type、token、sheet参数
   * @param url 待检查的URL字符串
   * @returns 返回解析结果对象，包括obj_type、token、sheet参数
   */
  const parseFeishuUrl = url => {
    const regex = /https:\/\/dreametech\.feishu\.cn\/([^\/]+)\/([^\/\?]+)(?:\?.*?sheet=([^&]+))?/;
    const match = url.match(regex);

    if (match && match.length >= 3) {
      return {
        obj_type: match[1],
        token: match[2],
        sheet: match[3] || "" // 如果没有sheet参数则返回空字符串
      };
    } else {
      return { obj_type: "", token: "", sheet: "" };
    }
  };

  /**
   * 获取知识空间节点信息
   * @param url 知识空间节点链接
   * @returns 返回知识空间节点信息
   */
  const getNodeInfo = (url: string): Promise<Feishu.NodeParams> => {
    const { obj_type, token } = parseFeishuUrl(url);
    return new Promise((resolve, reject) => {
      if (obj_type === "sheets") {
        resolve({ obj_type: "sheet", obj_token: token });
        return;
      }
      getNode({
        obj_type,
        token
      })
        .then(res => {
          let { node } = res.data;
          resolve({ ...node });
        })
        .catch(err => {
          validateLoading.value = false;
          setErrorValidateMap(4, 2);
          if (err.response.data.code == 1310213) {
            ElMessageBox.alert(
              "您没有电子表格的阅读或编辑权限。请联系该文档管理员，通过电子表格网页页面右上方 [分享] 入口为您添加权限。",
              "提示",
              {
                confirmButtonText: "知道了",
                callback: (action: Action) => {
                  console.log("action: ", action);
                }
              }
            );
          }
          reject(getSheetsErrorMap(err));
        });
    });
  };

  /**
   * 获取工作表列表
   * @param obj_token 知识空间节点token
   * @returns 返回工作表列表
   */
  const getSheetsInfo = (obj_token: string = ""): Promise<Feishu.Sheets[]> => {
    return new Promise((resolve, reject) => {
      getSheets({
        obj_token
      })
        .then(res => {
          let { sheets } = res.data;
          resolve(sheets);
        })
        .catch(err => {
          setValidateLoading(false);
          setErrorValidateMap(4, 2);
          if (err.response.data.code == 1310213) {
            ElMessageBox.alert(
              "您没有电子表格的阅读或编辑权限。请联系该文档管理员，通过电子表格网页页面右上方 [分享] 入口为您添加权限。",
              "提示",
              {
                confirmButtonText: "知道了",
                callback: (action: Action) => {
                  console.log("action: ", action);
                }
              }
            );
          }
          reject(getSheetsErrorMap(err));
        });
    });
  };

  /**
   * 获取多个工作表范围的表格数据
   * @param obj_token 知识空间节点token
   * @param sheets 工作表列表
   * @returns 返回多个工作表范围的表格数据
   */
  const getValueInfo = (obj_token: string = "", sheets: Feishu.Sheets[]): Promise<Feishu.Ranges[]> => {
    return new Promise((resolve, reject) => {
      const ranges = Array.from(
        sheets.filter(item => item.resource_type === "sheet"),
        ({ sheet_id }) => sheet_id
      ).join(",");
      getValueBatchByRange({
        obj_token,
        ranges
      })
        .then(res => {
          let { valueRanges } = res.data;
          resolve(valueRanges);
        })
        .catch(err => {
          setValidateLoading(false);
          setErrorValidateMap(4, 2);
          if (err.response.data.code == 1310213) {
            ElMessageBox.alert(
              "您没有电子表格的阅读或编辑权限。请联系该文档管理员，通过电子表格网页页面右上方 [分享] 入口为您添加权限。",
              "提示",
              {
                confirmButtonText: "知道了",
                callback: (action: Action) => {
                  console.log("action: ", action);
                }
              }
            );
          }
          reject(getSheetsErrorMap(err));
        });
    });
  };

  /**
   * 获取单个工作表范围的表格数据
   * @param obj_token 知识空间节点token
   * @param sheet_id 工作表id
   * @returns 返回单个工作表范围的表格数据
   */
  const getValueInfoBySheet = (obj_token: string, sheet_id: string): Promise<Feishu.Ranges> => {
    return new Promise((resolve, reject) => {
      getValueSingleByRange({
        obj_token,
        range: sheet_id
      })
        .then(res => {
          let { valueRange } = res.data;
          resolve(valueRange);
        })
        .catch(err => {
          setValidateLoading(false);
          setErrorValidateMap(4, 2);
          if (err.response.data.code == 1310213) {
            ElMessageBox.alert(
              "您没有电子表格的阅读或编辑权限。请联系该文档管理员，通过电子表格网页页面右上方 [分享] 入口为您添加权限。",
              "提示",
              {
                confirmButtonText: "知道了",
                callback: (action: Action) => {
                  console.log("action: ", action);
                }
              }
            );
          }
          reject(getSheetsErrorMap(err));
        });
    });
  };

  /**
   * 获取电子表格数据（多个工作表范围）
   * @param url 知识空间节点链接
   * @returns 返回电子表格数据（多个工作表范围）
   * @example await getExcelDataBatch(url)
   */
  const getExcelDataBatch = async (url: string): Promise<Feishu.Ranges[]> => {
    if (isFeishuSheetUrl(url)) {
      try {
        const { obj_token } = await getNodeInfo(url);
        try {
          const sheets = await getSheetsInfo(obj_token);
          try {
            const ranges = await getValueInfo(obj_token, sheets);
            return ranges;
          } catch (error) {
            ElMessage.error(error ?? "");
            return [];
          }
        } catch (error) {
          ElMessage.error(error ?? "");
          return [];
        }
      } catch (error) {
        ElMessage.error(error ?? "");
        return [];
      }
    } else {
      ElMessage.error("请输入有效的飞书电子表格链接！");
      return [];
    }
  };

  /**
   * 获取电子表格数据（单个工作表范围）
   * @param url 知识空间节点链接
   * @returns 返回电子表格数据（单个工作表范围）
   * @example await getExcelDataSingle(url)
   */
  const getExcelDataSingle = async (url: string): Promise<Feishu.Ranges> => {
    if (isFeishuSheetUrl(url)) {
      const { sheet } = parseFeishuUrl(url);
      if (!sheet) {
        // 如果没有sheet参数，则获取第一个工作表的表格数据
        const ranges = await getExcelDataBatch(url);
        return ranges?.[0] ?? {};
      }
      try {
        const { obj_token } = await getNodeInfo(url);
        try {
          const range = await getValueInfoBySheet(obj_token ?? "", sheet);
          return range;
        } catch (error) {
          ElMessage.error(error ?? "");
          return {};
        }
      } catch (error) {
        console.log("error: ", error);
        ElMessage.error(error ?? "");
        return {};
      }
    } else {
      ElMessage.error("请输入有效的飞书电子表格链接！");
      return {};
    }
  };
  return {
    getNodeInfo,
    getSheetsInfo,
    getValueInfo,
    getValueInfoBySheet,
    validateLoading,
    setValidateLoading,
    isFeishuSheetUrl,
    parseFeishuUrl,
    getExcelDataBatch,
    getExcelDataSingle,
    setErrorValidateMap,
    getSheetsErrorMap,
    errorValidateMap,
    resetErrorValidateMap
  };
};
