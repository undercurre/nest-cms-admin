import { User } from "@/api/interface/system";
import { PORT1 } from "@/api/config/servicePort";
import http from "@/api";

/**
 * @name 查询用户列表
 */
export const getUserList = () => {
  return http.get<Array<User.Entity>>(PORT1 + `/users`, {}, { loading: true });
};

/**
 * @name 创建用户
 */
export const addUser = (params: User.RegisterUserParams) => {
  return http.post<User.Entity>(PORT1 + `/users/register`, params, { loading: true });
};
