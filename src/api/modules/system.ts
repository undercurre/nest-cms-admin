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

// 编辑用户
export const editUserPass = (id: number, oldPass: string, newPass: string) => {
  return http.patch(PORT1 + `/users/pass/${id}`, { oldPass, newPass });
};

// 删除用户
export const deleteUser = (params: { id: number }) => {
  return http.delete(PORT1 + `/users/${params.id}`);
};
