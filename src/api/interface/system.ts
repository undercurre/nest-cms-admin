export namespace User {
  export interface Entity {
    id: number;
    username: string;
    password: string;
    thirdPartyId: string;
    isActive: boolean;
    email: string;
    role: "admin" | "user";
    createdAt: string;
    updatedAt: string;
  }

  export interface RegisterUserParams {
    username: string;
    password: string;
  }
}
