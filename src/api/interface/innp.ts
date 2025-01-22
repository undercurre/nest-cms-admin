export namespace Consumable {
  export interface Entity {
    id: number;
    model: string;
    name: string;
    description: string;
    imageUrl: string;
    productLink: string;
  }

  export interface RegisterUserParams {
    model: string;
    name: string;
    description: string;
    imageUrl: string;
    productLink: string;
  }
}

export namespace Product {
  export interface Entity {
    id: number;
    model: string;
    name: string;
    sellingPoints: string;
    imageUrl: string;
    manualOssUrl: string;
  }

  export interface RegisterUserParams {
    model: string;
    name: string;
    sellingPoints: string;
    imageUrl: string;
    manualOssUrl: string;
  }
}
