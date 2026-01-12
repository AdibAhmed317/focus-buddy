// Chrome extension background service worker using alarms + offscreen audio
interface State {
  isRunning: boolean;
  minMinutes: number;
  maxMinutes: number;
  selectedSound: string;
  customSounds: any[];
  nextSoundAt: number | null;
}

const DEFAULT_STATE: State = {
  isRunning: false,
  minMinutes: 2,
  maxMinutes: 10,
  selectedSound: 'chime',
  customSounds: [],
  nextSoundAt: null,
};

const OFFSCREEN_URL = chrome.runtime.getURL('offscreen.html');
const ALARM_NAME = 'focus-buddy-tick';

const getState = (): Promise<State> =>
  new Promise((resolve) => {
    chrome.storage.local.get(Object.keys(DEFAULT_STATE), (items) => {
      resolve({ ...DEFAULT_STATE, ...items });
    });
  });

const setState = (partial: Partial<State>): Promise<void> =>
  new Promise((resolve) => {
    chrome.storage.local.set(partial, () => resolve());
  });

const ensureOffscreen = async () => {
  try {
    // @ts-expect-error offscreen types are minimal
    const hasDoc = await chrome.offscreen?.hasDocument?.({
      url: OFFSCREEN_URL,
    });
    if (!hasDoc) {
      await chrome.offscreen?.createDocument?.({
        url: OFFSCREEN_URL,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play focus reminder audio',
      });
    }
  } catch (error) {
    console.error('Error ensuring offscreen document:', error);
  }
};

const scheduleNextSound = async (state: State) => {
  if (!state.isRunning) {
    chrome.alarms.clear(ALARM_NAME);
    await setState({ nextSoundAt: null });
    return;
  }

  const delayMinutes =
    Math.random() * (state.maxMinutes - state.minMinutes) + state.minMinutes;
  const nextSoundAt = Date.now() + delayMinutes * 60_000;

  chrome.alarms.clear(ALARM_NAME, () => {
    chrome.alarms.create(ALARM_NAME, { delayInMinutes: delayMinutes });
  });

  await setState({ nextSoundAt });
};

const triggerSound = async () => {
  try {
    await ensureOffscreen();
    // Small delay to ensure offscreen document is fully ready
    await new Promise((resolve) => setTimeout(resolve, 50));

    const state = await getState();

    // Try to send message multiple times for reliability
    const sendWithRetry = (attempt = 0) => {
      chrome.runtime.sendMessage(
        {
          type: 'PLAY_SOUND',
          payload: {
            selectedSound: state.selectedSound,
            customSounds: state.customSounds,
          },
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              `Message attempt ${attempt + 1} failed:`,
              chrome.runtime.lastError
            );
            // Retry once more after a short delay
            if (attempt < 1) {
              setTimeout(() => sendWithRetry(attempt + 1), 50);
            }
          } else {
            console.log('Sound message delivered successfully');
          }
        }
      );
    };

    sendWithRetry();
  } catch (error) {
    console.error('Error in triggerSound:', error);
  }
};

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  const state = await getState();
  if (!state.isRunning) return;

  // Trigger sound with unique ID to ensure offscreen document detects it
  await setState({
    soundTriggerId: Date.now().toString() + Math.random(),
  });

  // Also send message (redundant but helps reliability)
  await triggerSound();

  // Schedule next sound
  await scheduleNextSound(state);
});

chrome.runtime.onMessage.addListener(
  (request: any, _sender: any, sendResponse: any) => {
    (async () => {
      const state = await getState();
      switch (request.action || request.type) {
        case 'start':
        case 'START_TIMER': {
          const nextState: State = {
            ...state,
            isRunning: true,
            minMinutes: request.minMinutes ?? request.min ?? state.minMinutes,
            maxMinutes: request.maxMinutes ?? request.max ?? state.maxMinutes,
            selectedSound: request.selectedSound ?? state.selectedSound,
            customSounds: request.customSounds ?? state.customSounds,
          };
          await setState(nextState);
          await scheduleNextSound(nextState);
          sendResponse({ success: true });
          break;
        }

        case 'stop':
        case 'STOP_TIMER': {
          await setState({ isRunning: false, nextSoundAt: null });
          chrome.alarms.clear(ALARM_NAME);
          sendResponse({ success: true });
          break;
        }

        case 'getState':
        case 'GET_STATE': {
          const now = Date.now();
          const timeUntilNextSound = state.nextSoundAt
            ? Math.max(0, state.nextSoundAt - now)
            : 0;
          sendResponse({
            ...state,
            nextSoundTime: state.nextSoundAt,
            timeUntilNextSound,
          });
          break;
        }

        default:
          sendResponse({ error: 'Unknown action' });
      }
    })().catch((error) => {
      console.error('Error in message handler:', error);
      sendResponse({ error: 'Internal error' });
    });
    return true;
  }
);

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.clearAll();
  // Create offscreen document on extension install
  ensureOffscreen();
});

// Keepalive: Handle messages from offscreen to keep service worker alive
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'KEEPALIVE') {
    sendResponse({ ok: true });
  }
});
