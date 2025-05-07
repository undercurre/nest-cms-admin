import http from "@/api";
import { PORT6, PORT7 } from "@/api/config/servicePort";
import { Result } from "@/api/interface";
import { AIKnowLedge, Feishu } from "@/api/interface/aiKnowledge";

/**
 * @name 获取知识空间节点信息
 */
export const getNode = (params: Feishu.NodeParams) => {
  return http.get<Feishu.NodeRes>(`${PORT6}/wiki/v2/spaces/get_node`, params, {
    loading: false,
    hideErrorMsg: true,
    headers: {
      Authorization: "Bearer "
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
        Authorization: "Bearer "
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
        Authorization: "Bearer "
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
export const searchKnowledgeTemplate = (params: AIKnowLedge.KnowledgeTemplateParams) => {
  return http.post<AIKnowLedge.KnowledgeTemplateRes<AIKnowLedge.KnowledgeTemplateParams>>(
    PORT7 + `/web/knowledgeBaseTemplate/list`,
    params,
    { loading: true }
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
  return http.get<Result>(PORT7 + `/web/reStartDocumentInfo`, params, { loading: true });
};
