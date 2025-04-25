export namespace DeviceList {
  export interface DeviceItem {
    did: string;
    key: string;
    model: string;
  }
}

export namespace ProtocolImport {
  type ExcelData<T> = T[];
  export interface ProtocolItem {
    protocolName: string;
    protocolData: ExcelData<object>;
    model: string;
  }
}
