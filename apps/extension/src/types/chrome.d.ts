declare const chrome: {
  runtime: {
    sendMessage(
      message: any,
      responseCallback?: (response: any) => void,
    ): Promise<any>;
    onMessage: {
      addListener(
        callback: (
          request: any,
          sender: any,
          sendResponse: any,
        ) => boolean | void,
      ): void;
      removeListener(
        callback: (
          request: any,
          sender: any,
          sendResponse: any,
        ) => boolean | void,
      ): void;
    };
    onInstalled: {
      addListener(callback: (details: any) => void): void;
    };
    onStartup?: {
      addListener(callback: () => void): void;
    };
    lastError?: { message?: string };
    getURL(path: string): string;
    getContexts?: (options: {
      contextTypes: string[];
      documentUrls?: string[];
    }) => Promise<Array<{ contextType: string; documentUrl?: string }>>;
  };
  storage: {
    onChanged?: {
      addListener?(callback: (changes: any, areaName: string) => void): void;
    };
    local: {
      get(
        keys?: string | string[] | null,
        callback?: (items: Record<string, any>) => void,
      ): Promise<Record<string, any>>;
      set(items: Record<string, any>, callback?: () => void): Promise<void>;
      remove(keys: string | string[], callback?: () => void): Promise<void>;
      onChanged?: {
        addListener?(callback: (changes: any, areaName: string) => void): void;
      };
    };
  };
  tabs?: {
    create(createProperties: { url: string }): void;
  };
  windows?: {
    create(
      createData: {
        url: string;
        type?: string;
        width?: number;
        height?: number;
        focused?: boolean;
      },
      callback?: (window: { id: number } | null) => void,
    ): void;
    update(
      windowId: number,
      updateInfo: {
        state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
        width?: number;
        height?: number;
        focused?: boolean;
      },
      callback?: (window: { id: number } | null) => void,
    ): void;
    onBoundsChanged?: {
      addListener(
        callback: (window: {
          id: number;
          state?: 'normal' | 'minimized' | 'maximized' | 'fullscreen';
          width?: number;
          height?: number;
        }) => void,
      ): void;
    };
    onRemoved?: {
      addListener(callback: (windowId: number) => void): void;
    };
  };
  alarms: {
    clear(name: string, callback?: () => void): void;
    clearAll(callback?: () => void): void;
    create(name: string, alarmInfo: { delayInMinutes: number }): void;
    getAll?: (
      callback?: (
        alarms: Array<{ name: string; scheduledTime: number }>,
      ) => void,
    ) => Promise<Array<{ name: string; scheduledTime: number }>>;
    onAlarm: {
      addListener(
        callback: (alarm: { name: string; scheduledTime: number }) => void,
      ): void;
    };
  };
  notifications: {
    create(
      notificationId: string,
      options: any,
      callback?: (notificationId: string) => void,
    ): void;
    clear(notificationId: string, callback?: () => void): void;
  };
  offscreen?: {
    Reason?: {
      AUDIO_PLAYBACK: 'AUDIO_PLAYBACK';
    };
    hasDocument?(options: { url: string }): Promise<boolean>;
    createDocument?(options: {
      url: string;
      reasons: string[];
      justification: string;
    }): Promise<void>;
    closeDocument?(): Promise<void>;
  };
  declarativeNetRequest?: {
    RuleActionType: {
      BLOCK: 'block';
    };
    ResourceType: {
      MAIN_FRAME: 'main_frame';
    };
    Rule: {
      id: number;
      priority: number;
      action: { type: 'block' };
      condition: { urlFilter: string; resourceTypes: string[] };
    };
    getDynamicRules(): Promise<Array<{ id: number }>>;
    updateDynamicRules(options: {
      removeRuleIds: number[];
      addRules?: Array<{
        id: number;
        priority: number;
        action: { type: 'block' };
        condition: { urlFilter: string; resourceTypes: string[] };
      }>;
    }): Promise<void>;
  };
};
