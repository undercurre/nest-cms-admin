export namespace DeviceList {
  export interface DeviceItem {
    did: string;
    key: string;
    model: string;
    status?: string;
  }

  export interface MQTTLogItem {
    did: string;
    model: string;
    timestamp: string;
    data: Object;
    data_quality: number;
  }

  export interface HistoryItem {
    id: string;
    content: string;
    timestamp: string;
  }
}

export namespace ProtocolImport {
  export interface ProtocolItem {
    protocolName: string;
    protocolData?: any[];
    model: string;
  }
}
