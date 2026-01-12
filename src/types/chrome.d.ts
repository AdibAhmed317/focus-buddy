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
  };
  storage: {
    local: {
      get(keys: string | string[], callback: (items: any) => void): void;
      set(items: any, callback?: () => void): void;
      remove(keys: string | string[], callback?: () => void): void;
    };
  };
};
