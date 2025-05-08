import http from "@/api";
import { PORT6, PORT7 } from "@/api/config/servicePort";
import { Result } from "@/api/interface";
import { AIKnowLedge, Feishu } from "@/api/interface/aiKnowledge";

/**
 * 临时方案：自建应用获取 tenant_access_token
 */
const getTenantAccessToken = (params: { app_id: string; app_secret: string }) => {
  return http.post<any>(`${PORT6}/auth/v3/tenant_access_token/internal`, params, {
    loading: false,
    hideErrorMsg: true
  });
};
const tenantAccessTokenRes: any = await getTenantAccessToken({
  app_id: "cli_a881b63143ffd01c",
  app_secret: "hSHrCPD4HWJ9jH6kVxPGMh4pCe1X2YYA"
});
const tenant_access_token = tenantAccessTokenRes?.tenant_access_token;
/**
 * @name 获取知识空间节点信息
 */
export const getNode = (params: Feishu.NodeParams) => {
  return http.get<Feishu.NodeRes>(`${PORT6}/wiki/v2/spaces/get_node`, params, {
    loading: false,
    hideErrorMsg: true,
    headers: {
      Authorization: `Bearer ${tenant_access_token}`
    }
  });
};

/**
 * @name 获取工作表
 */
export const getSheets = (params: Feishu.NodeParams) => {
  return http.get<Feishu.SheetsRes>(
    `${PORT6}/sheets/v3/spreadsheets/${params.obj_token}/sheets/query`,
    {},
    {
      loading: false,
      hideErrorMsg: true,
      headers: {
        Authorization: `Bearer ${tenant_access_token}`
      }
    }
  );
};

/**
 * @name 读取多个工作表范围
 */
export const getValueBatchByRange = (params: Feishu.NodeParams) => {
  return http.get<Feishu.SheetsRangesRes>(
    `${PORT6}/sheets/v2/spreadsheets/${params.obj_token}/values_batch_get`,
    {
      ranges: params.ranges
    },
    {
      loading: false,
      hideErrorMsg: true,
      headers: {
        Authorization: `Bearer ${tenant_access_token}`
      }
    }
  );
};

/**
 * @name 读取单个工作表范围
 */
export const getValueSingleByRange = (params: Feishu.NodeParams) => {
  return http.get<Feishu.SheetsRangeRes>(
    `${PORT6}/sheets/v2/spreadsheets/${params.obj_token}/values/${params.range}`,
    {},
    {
      loading: false,
      hideErrorMsg: true,
      headers: {
        Authorization: `Bearer ${tenant_access_token}`
      }
    }
  );
};

/**
 * @name 创建知识库模板
 */
export const addKnowledgeTemplate = (params: AIKnowLedge.TemplateEntity) => {
  return http.post<Result>(PORT7 + `/web/knowledgeBaseTemplate/create`, params, { loading: true });
};
/**
 * @name 修改知识库模板
 */
export const editKnowledgeTemplate = (params: AIKnowLedge.TemplateEntity) => {
  return http.put<Result>(PORT7 + `/web/knowledgeBaseTemplate/update`, params, { loading: true });
};
/**
 * @name 删除知识库模板
 */
export const deleteKnowledgeTemplate = (params: { id: string }) => {
  return http.post<Result>(PORT7 + `/web/knowledgeBaseTemplate/${params.id}`, {}, { loading: true });
};
/**
 * @name 查询知识库模板
 */
export const searchKnowledgeTemplate = (params: AIKnowLedge.KnowledgeTemplateParams, loading: boolean = true) => {
  return http.post<AIKnowLedge.KnowledgeTemplateRes<AIKnowLedge.KnowledgeTemplateParams>>(
    PORT7 + `/web/knowledgeBaseTemplate/list`,
    params,
    { loading: loading }
  );
};

/**
 * @name 创建知识库
 */
export const addKnowledge = (params: AIKnowLedge.Entity) => {
  return http.post<Result>(PORT7 + `/web/knowledgeBase/create`, params, { loading: true });
};
/**
 * @name 修改知识库
 */
export const editKnowledge = (params: AIKnowLedge.Entity) => {
  return http.put<Result>(PORT7 + `/web/knowledgeBase/update`, params, { loading: true });
};
/**
 * @name 删除知识库
 */
export const deleteKnowledge = (params: { id: string }) => {
  return http.post<Result>(PORT7 + `/web/knowledgeBase/${params.id}`, {}, { loading: true });
};
/**
 * @name 查询知识库
 */
export const searchKnowledge = (params: AIKnowLedge.KnowledgeParams) => {
  return http.post<AIKnowLedge.KnowledgeResPage<AIKnowLedge.Entity>>(PORT7 + `/web/knowledgeBase/list`, params, {
    loading: true
  });
};
/**
 * @name 同步知识库
 */
export const reStartKnowledge = (params: { id: string }) => {
  return http.post<Result>(PORT7 + `/web/knowledgeBase/sync/${params.id}`, {}, { loading: true });
};
