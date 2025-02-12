import { Consumable, Diet, Guide, Ingredients, OSS, Product, Steps } from "@/api/interface/innp";
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

/**
 * @name 查询指引列表
 */
export const getGuideList = () => {
  return http.get<Array<Guide.Entity>>(PORT1 + `/guide`, {}, { loading: true });
};

/**
 * @name 创建指引
 */
export const addGuide = (params: Guide.CreateParams) => {
  return http.post<Guide.Entity>(PORT1 + `/guide`, params, { loading: true });
};

/**
 * @name 修改指引
 */
export const updateGuide = (params: Guide.UpdateParams) => {
  const { id, ...others } = params;
  return http.patch<Guide.Entity>(PORT1 + `/guide/${id}`, others, { loading: true });
};

/**
 * @name 删除指引
 */
export const delGuide = (params: Guide.DelParams) => {
  return http.delete<Guide.Entity>(PORT1 + `/guide/${params.id}`, params, { loading: true });
};

/**
 * @name 查询食谱列表
 */
export const getDietList = () => {
  return http.get<Array<Diet.Entity>>(PORT1 + `/cookbooks`, {}, { loading: true });
};

/**
 * @name 创建食谱
 */
export const addDiet = (params: Diet.CreateParams) => {
  return http.post<Diet.Entity>(PORT1 + `/cookbooks`, params, { loading: true });
};

/**
 * @name 修改食谱
 */
export const updateDiet = (params: Diet.UpdateParams) => {
  const { id, ...others } = params;
  return http.patch<Guide.Entity>(PORT1 + `/cookbooks/${id}`, others, { loading: true });
};

/**
 * @name 删除食谱
 */
export const delDiet = (params: Diet.DelParams) => {
  return http.delete<Guide.Entity>(PORT1 + `/cookbooks/${params.id}`, params, { loading: true });
};

/**
 * @name 查询食材列表
 */
export const getIngredients = (id: number) => {
  return http.get<Array<Ingredients.Entity[]>>(PORT1 + `/ingredients/recipe/${id}`, {}, { loading: true });
};

/**
 * @name 创建食材
 */
export const addIngredients = (params: Ingredients.CreateParams) => {
  return http.post<Ingredients.Entity>(PORT1 + `/ingredients`, params, { loading: true });
};

/**
 * @name 修改食材
 */
export const updateIngredients = (params: Ingredients.UpdateParams) => {
  const { id, ...others } = params;
  return http.patch<Ingredients.Entity>(PORT1 + `/ingredients/${id}`, others, { loading: true });
};

/**
 * @name 删除食材
 */
export const delIngredients = (params: Ingredients.DelParams) => {
  return http.delete<Ingredients.Entity>(PORT1 + `/ingredients/${params.id}`, params, { loading: true });
};

/**
 * @name 查询步骤列表
 */
export const getSteps = (id: number) => {
  return http.get<Array<Steps.Entity[]>>(PORT1 + `/steps/recipe/${id}`, {}, { loading: true });
};

/**
 * @name 创建食材
 */
export const addSteps = (params: Steps.CreateParams) => {
  return http.post<Steps.Entity>(PORT1 + `/steps`, params, { loading: true });
};

/**
 * @name 修改步骤
 */
export const updateSteps = (params: Steps.UpdateParams) => {
  const { id, ...others } = params;
  return http.patch<Steps.Entity>(PORT1 + `/steps/${id}`, others, { loading: true });
};

/**
 * @name 删除步骤
 */
export const delSteps = (params: Steps.DelParams) => {
  return http.delete<Steps.Entity>(PORT1 + `/steps/${params.id}`, params, { loading: true });
};

/**
 * @name 查询品类列表
 */
export const getCategoryList = () => {
  return http.get<string[]>(PORT1 + "/cookbooks/list/categories");
};

/**
 * @name 查询口味列表
 */
export const getTasteList = () => {
  return http.get<string[]>(PORT1 + "/cookbooks/list/taste");
};
