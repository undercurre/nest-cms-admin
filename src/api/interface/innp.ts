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

export namespace OSS {
  export interface Signature {
    expire: string;
    policy: string;
    signature: string;
    accessId: string;
    host: string;
    dir: string;
  }

  export interface GetOSSSignatureParams {
    fileType: "image" | "pdf";
  }
}
