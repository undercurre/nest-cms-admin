export namespace Consumable {
  export interface Entity {
    id: number;
    model: string;
    name: string;
    description: string;
    imageUrl: string;
    productLink: string;
  }

  export interface CreateParams {
    model: string;
    name: string;
    description: string;
    imageUrl: string;
    productLink: string;
  }
}

export namespace Product {
  export interface Entity {
    createTime: string;
    createUid: string;
    description: string;
    id: number;
    imageOssUrl: string;
    manualOssUrl: string;
    productModel: string;
    productName: string;
    sku: string;
    updateTime: string;
    updateUid: string | null;
  }

  export interface CreateParams {
    model: string;
    name: string;
    sellingPoints: string;
    imageUrl: string;
    manualOssUrl: string;
  }

  export interface UpdateParams extends Partial<CreateParams> {
    id: number;
  }

  export interface DelParams {
    id: number;
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

  export interface UploadParams {
    contentType: "image/jpg" | "image/jpeg" | "image/png" | "application/pdf";
    base64: string;
  }

  export interface GetOSSSignatureParams {
    fileType: "image" | "pdf" | "mp4";
  }
}

export namespace Guide {
  export interface Entity {
    id: number;
    title: string;
    createdAt: string;
    video: string;
    description: string;
  }

  export interface CreateParams {
    title: string;
    video: string;
    description: string;
  }

  export interface UpdateParams extends Partial<CreateParams> {
    id: number;
  }

  export interface DelParams {
    id: number;
  }
}

export namespace Diet {
  export interface Entity {
    id: number;
    name: string;
    taste: string;
    nutrition_info: Record<string, string>;
    createdAt: string;
    image: string;
    description: string;
    category: string;
    time: number;
    difficulty: number;
    ingredients: Ingredients.Entity[];
    steps: Steps.Entity[];
  }

  export interface CreateParams {
    name: string;
    taste: string;
    nutrition_info: string;
    image: string;
    description: string;
    category: string;
    time: number;
    difficulty: number;
    ingredients: { name: string; quantity: string }[];
    steps: { step_number: number; description: string; image_url?: null | string }[];
  }

  export interface UpdateParams extends Partial<CreateParams> {
    id: number;
  }

  export interface DelParams {
    id: number;
  }
}

export namespace Ingredients {
  export interface Entity {
    id: number;
    name: string;
    quantity: string;
  }

  export interface CreateParams {
    name: string;
    quantity: string;
  }

  export interface UpdateParams extends Partial<CreateParams> {
    id: number;
  }

  export interface DelParams {
    id: number;
  }
}

export namespace Steps {
  export interface Entity {
    id: number;
    step_number: number;
    description: string;
    image_url: null | string;
  }

  export interface CreateParams {
    step_number: number;
    description: string;
    image_url: null | string;
  }

  export interface UpdateParams extends Partial<CreateParams> {
    id: number;
  }

  export interface DelParams {
    id: number;
  }
}
