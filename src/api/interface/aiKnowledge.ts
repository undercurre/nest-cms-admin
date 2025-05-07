import { Result } from "@/api/interface/index";
export namespace AIKnowLedge {
  export interface TemplateEntity {
    id?: string;
    label?: string;
    labels?: string[];
    templateName: string;
    templateUrl?: string;
    description?: string;
  }
  export interface KnowledgeTemplateRes<T> {
    knowledgeBaseTemplateList: T[];
    total: number;
  }
  export interface Entity {
    syncStatus?: string;
    id?: string;
    name: string;
    templateId?: string;
    templateUrl?: string; // 选中的时候要
    documentUrl: string;
    label?: string;
    labels?: string[];
    description?: string;
  }

  export interface KnowledgeParams extends Entity {
    pageSize: number;
    pageNo: number;
  }

  export interface KnowledgeTemplateParams extends TemplateEntity {
    pageSize: number;
    pageNo: number;
  }
  export interface KnowledgeResPage<T> {
    knowledgeBaseList: T[];
    total: number;
  }
}

export namespace Feishu {
  export interface NodeParams {
    obj_type?: string;
    token?: string;
    obj_token?: string;
    ranges?: string;
  }
  export interface Sheets {
    sheet_id: string;
    title: string;
    resource_type?: string;
  }
  export interface Ranges {
    values: string[][] | number[][];
  }
  export interface NodeRes extends Result {
    node: NodeParams;
  }
  export interface SheetsRes extends Result {
    sheets: Sheets[];
  }
  export interface SheetsRangesRes extends Result {
    valueRanges: Ranges[];
  }
}
