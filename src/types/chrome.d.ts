declare const chrome: {
  runtime: {
    sendMessage(message: any, responseCallback?: (response: any) => void): void;
    onMessage: {
      addListener(
        callback: (
          request: any,
          sender: any,
          sendResponse: any
        ) => boolean | void
      ): void;
      removeListener(
        callback: (
          request: any,
          sender: any,
          sendResponse: any
        ) => boolean | void
      ): void;
    };
    onInstalled: {
      addListener(callback: (details: any) => void): void;
    };
    lastError?: { message?: string };
    getURL(path: string): string;
  };
  storage: {
    local: {
      get(keys: string | string[], callback: (items: any) => void): void;
      set(items: any, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
      onChanged?: {
        addListener?(callback: (changes: any, areaName: string) => void): void;
      };
    };
  };
  tabs?: {
    create(createProperties: { url: string }): void;
  };
  windows?: {
    create(createData: {
      url: string;
      type?: string;
      width?: number;
      height?: number;
      focused?: boolean;
    }): void;
  };
  alarms: {
    clear(name: string, callback?: () => void): void;
    clearAll(callback?: () => void): void;
    create(name: string, alarmInfo: { delayInMinutes: number }): void;
    onAlarm: {
      addListener(callback: (alarm: { name: string }) => void): void;
    };
  };
  notifications: {
    create(
      notificationId: string,
      options: any,
      callback?: (notificationId: string) => void
    ): void;
    clear(notificationId: string, callback?: () => void): void;
  };
  offscreen?: {
    hasDocument?(options: { url: string }): Promise<boolean>;
    createDocument?(options: {
      url: string;
      reasons: string[];
      justification: string;
    }): Promise<void>;
    closeDocument?(): Promise<void>;
  };
};
