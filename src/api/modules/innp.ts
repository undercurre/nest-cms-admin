import { Consumable, OSS, Product } from "@/api/interface/innp";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 查询耗材列表
 */
export const getConsumableList = () => {
  return http.get<Array<Consumable.Entity>>(PORT1 + `/consumables`, {}, { loading: true });
};

/**
 * @name 创建耗材
 */
export const addConsumable = (params: Consumable.RegisterUserParams) => {
  return http.post<Consumable.Entity>(PORT1 + `/consumables`, params, { loading: true });
};

/**
 * @name 查询产品列表
 */
export const getProductList = () => {
  return http.get<Array<Product.Entity>>(PORT1 + `/products`, {}, { loading: true });
};

/**
 * @name 创建产品
 */
export const addProduct = (params: Product.RegisterUserParams) => {
  return http.post<Product.Entity>(PORT1 + `/products`, params, { loading: true });
};

/**
 * @name 获取OSS签名
 */
export const getOSSSignature = (params: OSS.GetOSSSignatureParams) => {
  return http.post<OSS.Signature>(PORT1 + `/oss/signature`, params, { loading: true });
};
