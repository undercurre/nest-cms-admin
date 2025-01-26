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
export const addConsumable = (params: Consumable.CreateParams) => {
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
export const addProduct = (params: Product.CreateParams) => {
  return http.post<Product.Entity>(PORT1 + `/products`, params, { loading: true });
};

/**
 * @name 修改产品
 */
export const updateProduct = (params: Product.UpdateParams) => {
  const { id, ...others } = params;
  return http.patch<Product.Entity>(PORT1 + `/products/${id}`, others, { loading: true });
};

/**
 * @name 删除产品
 */
export const delProduct = (params: Product.DelParams) => {
  return http.delete<Product.Entity>(PORT1 + `/products/${params.id}`, params, { loading: true });
};

/**
 * @name 获取OSS签名
 */
export const getOSSSignature = (params: OSS.GetOSSSignatureParams) => {
  return http.post<OSS.Signature>(PORT1 + `/oss/signature`, params, { loading: true });
};
