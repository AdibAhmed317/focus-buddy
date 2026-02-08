// Chrome extension background service worker using alarms + offscreen audio
import { SessionManager } from './lib/sessionManager';

interface State {
  isRunning: boolean;
  isPaused: boolean;
  minMinutes: number;
  maxMinutes: number;
  selectedSound: string;
  customSounds: any[];
  nextSoundAt: number | null;
  pausedRemainingMs: number | null;
  soundTriggerId?: string;
}

interface BlockedSite {
  id: string;
  url: string;
  addedAt: number;
}

// Initialize session manager
const sessionManager = new SessionManager();

// Website blocking management
const BLOCKING_RULE_ID_START = 1000;

const updateBlockingRules = async (sites: BlockedSite[], isActive: boolean) => {
  try {
    // Get existing rules to remove them
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const ruleIdsToRemove = existingRules.map((rule) => rule.id);

    if (sites.length === 0 || !isActive) {
      // Just remove all rules if blocking inactive or no sites
      if (ruleIdsToRemove.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
          removeRuleIds: ruleIdsToRemove,
        });
      }
      return;
    }

    // Create TWO blocking rules per site - one for exact domain, one for subdomains
    const rules = sites.flatMap((site, index) => [
      {
        id: BLOCKING_RULE_ID_START + index * 2,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
        },
        condition: {
          // Match the exact domain (e.g., youtube.com)
          urlFilter: `*://${site.url}/*`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      },
      {
        id: BLOCKING_RULE_ID_START + index * 2 + 1,
        priority: 1,
        action: {
          type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
        },
        condition: {
          // Match all subdomains (e.g., www.youtube.com, m.youtube.com)
          urlFilter: `*://*.${site.url}/*`,
          resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME],
        },
      },
    ]);

    // Update rules
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: rules,
    });

    console.log(`Blocking ${sites.length} sites with ${rules.length} rules`);
    console.log(
      'Active blocking rules:',
      rules.map((r) => ({ id: r.id, urlFilter: r.condition.urlFilter })),
    );
  } catch (error) {
    console.error('Failed to update blocking rules:', error);
  }
};

const enableBlocking = async () => {
  const result = await chrome.storage.local.get(['blockedSites']);
  const sites = result.blockedSites || [];
  await updateBlockingRules(sites, true);
};

const disableBlocking = async () => {
  await updateBlockingRules([], false);
};

const DEFAULT_STATE: State = {
  isRunning: false,
  isPaused: false,
  minMinutes: 2,
  maxMinutes: 10,
  selectedSound: 'chime',
  customSounds: [],
  nextSoundAt: null,
  pausedRemainingMs: null,
};

const OFFSCREEN_URL = chrome.runtime.getURL('offscreen.html');
const ALARM_NAME = 'focus-buddy-tick';
const DEFAULT_FOCUS_WINDOW_BOUNDS = { width: 420, height: 520 };

let focusWindowId: number | null = null;
let focusWindowBounds = { ...DEFAULT_FOCUS_WINDOW_BOUNDS };

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
    // Check if offscreen API is available
    if (!chrome.offscreen) {
      console.warn('Offscreen API not available');
      return;
    }

    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [OFFSCREEN_URL],
    });

    if (existingContexts.length === 0) {
      console.log('Creating offscreen document for audio playback');
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_URL,
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Play focus reminder audio',
      });
      console.log('Offscreen document created successfully');
    }
  } catch (error) {
    console.error('Error ensuring offscreen document:', error);
  }
};

const registerFocusWindow = (
  windowId: number,
  width?: number,
  height?: number,
) => {
  focusWindowId = windowId;
  focusWindowBounds = {
    width: width ?? DEFAULT_FOCUS_WINDOW_BOUNDS.width,
    height: height ?? DEFAULT_FOCUS_WINDOW_BOUNDS.height,
  };
};

const enforceFocusWindowState = async (windowId: number) => {
  if (focusWindowId === null || windowId !== focusWindowId) {
    return;
  }
  try {
    await chrome.windows.update(windowId, {
      state: 'normal',
      width: focusWindowBounds.width,
      height: focusWindowBounds.height,
    });
  } catch (error) {
    console.warn('Failed to enforce focus window size:', error);
  }
};

const scheduleNextSound = async (state: State) => {
  console.log('scheduleNextSound called, state:', {
    isRunning: state.isRunning,
    isPaused: state.isPaused,
  });

  if (!state.isRunning || state.isPaused) {
    await chrome.alarms.clear(ALARM_NAME);
    await setState({ nextSoundAt: null });
    console.log('Cleared alarms - not running or paused');
    return;
  }

  const delayMinutes =
    Math.random() * (state.maxMinutes - state.minMinutes) + state.minMinutes;
  const nextSoundAt = Date.now() + delayMinutes * 60_000;

  // IMPORTANT: Clear alarm BEFORE creating new one to avoid race condition
  await chrome.alarms.clear(ALARM_NAME);

  chrome.alarms.create(ALARM_NAME, { delayInMinutes: delayMinutes });

  await setState({ nextSoundAt });

  console.log(
    `Scheduled next sound in ${delayMinutes.toFixed(2)} minutes (${(delayMinutes * 60).toFixed(0)}s) at ${new Date(nextSoundAt).toLocaleTimeString()}`,
  );

  // Debug: List all alarms
  const allAlarms = await chrome.alarms.getAll();
  console.log(
    'All active alarms:',
    allAlarms.map((a) => ({
      name: a.name,
      scheduledTime: new Date(a.scheduledTime).toLocaleTimeString(),
    })),
  );
};

const triggerSound = async () => {
  try {
    // Always ensure offscreen document exists before playing sound
    await ensureOffscreen();

    // Wait longer to ensure offscreen document is fully ready and AudioContext is initialized
    await new Promise((resolve) => setTimeout(resolve, 300));

    const state = await getState();

    console.log('Triggering sound:', state.selectedSound);

    // PRIMARY: Always use storage-based trigger (most reliable when popup is closed)
    // This works even when popup is closed and is the most consistent method
    const triggerId = Date.now().toString() + Math.random();
    await setState({
      soundTriggerId: triggerId,
    });

    console.log('Sound triggered via storage ID:', triggerId);

    // SECONDARY: Also try message-based approach for redundancy (in case storage method fails)
    // This provides a backup mechanism
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      await chrome.runtime.sendMessage({
        type: 'PLAY_SOUND',
        payload: {
          selectedSound: state.selectedSound,
          customSounds: state.customSounds,
        },
      });
      console.log('Sound message sent as backup');
    } catch (error) {
      console.warn(
        'Backup message failed (storage trigger will handle it):',
        error,
      );
    }
  } catch (error) {
    console.error('Error in triggerSound:', error);
  }
};

chrome.alarms.onAlarm.addListener(async (alarm) => {
  console.log('===== Alarm triggered =====');
  console.log('Alarm name:', alarm.name);
  console.log(
    'Scheduled time:',
    new Date(alarm.scheduledTime).toLocaleTimeString(),
  );

  if (alarm.name !== ALARM_NAME) {
    console.log('Not our alarm, ignoring');
    return;
  }

  const state = await getState();
  console.log('Current state:', {
    isRunning: state.isRunning,
    isPaused: state.isPaused,
    nextSoundAt: state.nextSoundAt
      ? new Date(state.nextSoundAt).toLocaleTimeString()
      : 'null',
  });

  if (!state.isRunning || state.isPaused) {
    console.log('Skipping sound - not running or paused');
    return;
  }

  console.log('>> Timer reached 0! Playing sound now!');

  // Track sound play in session
  await sessionManager.incrementSoundCount();

  // Trigger sound with offscreen readiness and redundancy
  await triggerSound();

  // Schedule next sound
  await scheduleNextSound(state);

  console.log('===== Alarm handler complete =====');
});

chrome.runtime.onMessage.addListener(
  (request: any, _sender: any, sendResponse: any) => {
    (async () => {
      const state = await getState();
      switch (request.action || request.type) {
        case 'REGISTER_FOCUS_WINDOW': {
          if (typeof request.windowId === 'number') {
            registerFocusWindow(
              request.windowId,
              request.width,
              request.height,
            );
            await enforceFocusWindowState(request.windowId);
          }
          sendResponse({ success: true });
          break;
        }

        case 'start':
        case 'START_TIMER': {
          console.log('START_TIMER received');

          // Clear any existing alarms first to prevent duplicates
          await chrome.alarms.clear(ALARM_NAME);

          // Start new focus session
          await sessionManager.startSession();

          const nextState: State = {
            ...state,
            isRunning: true,
            isPaused: false,
            minMinutes: request.minMinutes ?? request.min ?? state.minMinutes,
            maxMinutes: request.maxMinutes ?? request.max ?? state.maxMinutes,
            selectedSound: request.selectedSound ?? state.selectedSound,
            customSounds: request.customSounds ?? state.customSounds,
            pausedRemainingMs: null,
          };
          await setState(nextState);

          console.log(
            'Starting new session with min:',
            nextState.minMinutes,
            'max:',
            nextState.maxMinutes,
          );

          await scheduleNextSound(nextState);

          // Enable website blocking
          await enableBlocking();

          sendResponse({ success: true });
          break;
        }

        case 'stop':
        case 'STOP_TIMER': {
          // End focus session
          const endStatus = request.completed ? 'completed' : 'cancelled';
          await sessionManager.endSession(endStatus);

          await setState({
            isRunning: false,
            isPaused: false,
            nextSoundAt: null,
            pausedRemainingMs: null,
          });
          chrome.alarms.clear(ALARM_NAME);

          // Disable website blocking
          await disableBlocking();

          sendResponse({ success: true });
          break;
        }

        case 'pause':
        case 'PAUSE_TIMER': {
          // Pause focus session
          await sessionManager.pauseSession();

          const now = Date.now();
          const remainingMs = state.nextSoundAt
            ? Math.max(0, state.nextSoundAt - now)
            : 0;
          chrome.alarms.clear(ALARM_NAME);
          await setState({
            isRunning: true,
            isPaused: true,
            nextSoundAt: null,
            pausedRemainingMs: remainingMs,
          });

          // Disable blocking during pause
          await disableBlocking();

          sendResponse({ success: true });
          break;
        }

        case 'resume':
        case 'RESUME_TIMER': {
          // Resume focus session
          await sessionManager.resumeSession();

          const remainingMs = state.pausedRemainingMs ?? 0;
          const nextSoundAt = remainingMs > 0 ? Date.now() + remainingMs : null;

          await setState({
            isRunning: true,
            isPaused: false,
            nextSoundAt,
            pausedRemainingMs: null,
          });

          // Clear any existing alarms first
          await chrome.alarms.clear(ALARM_NAME);

          if (remainingMs > 0) {
            console.log('Resuming with remaining time:', remainingMs, 'ms');
            chrome.alarms.create(ALARM_NAME, {
              delayInMinutes: remainingMs / 60_000,
            });
          } else {
            await scheduleNextSound({ ...state, isPaused: false });
          }

          // Re-enable blocking on resume
          await enableBlocking();

          sendResponse({ success: true });
          break;
        }

        case 'getState':
        case 'GET_STATE': {
          const now = Date.now();
          const timeUntilNextSound = state.isPaused
            ? (state.pausedRemainingMs ?? 0)
            : state.nextSoundAt
              ? Math.max(0, state.nextSoundAt - now)
              : 0;
          sendResponse({
            ...state,
            nextSoundTime: state.nextSoundAt,
            timeUntilNextSound,
          });
          break;
        }

        case 'GET_SESSIONS': {
          const sessions = await sessionManager.getSessions();
          sendResponse({ sessions });
          break;
        }

        case 'GET_STATS': {
          const stats = await sessionManager.getStats();
          sendResponse({ stats });
          break;
        }

        case 'CLEAR_HISTORY': {
          await sessionManager.clearHistory();
          sendResponse({ success: true });
          break;
        }

        case 'UPDATE_BLOCKLIST': {
          // Always save the blocklist - enforcement happens during active sessions
          await chrome.storage.local.set({ blockedSites: request.sites || [] });
          // Update rules if a session is currently active
          const isBlockingActive = state.isRunning && !state.isPaused;
          if (isBlockingActive) {
            await updateBlockingRules(request.sites || [], true);
          }
          sendResponse({ success: true });
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
  },
);

chrome.runtime.onInstalled.addListener(() => {
  console.log(
    'Extension installed/updated - clearing alarms and creating offscreen',
  );
  chrome.alarms.clearAll();
  // Create offscreen document on extension install
  ensureOffscreen();
});

// Also ensure offscreen document exists on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension startup - ensuring offscreen document');
  ensureOffscreen();
});

chrome.windows.onBoundsChanged.addListener((window) => {
  if (!window || typeof window.id !== 'number') {
    return;
  }
  if (
    window.id === focusWindowId &&
    (window.state === 'maximized' || window.state === 'fullscreen')
  ) {
    enforceFocusWindowState(window.id);
  }
});

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === focusWindowId) {
    focusWindowId = null;
  }
});

// Periodically ensure offscreen document exists (every 30 seconds)
setInterval(() => {
  ensureOffscreen().catch((err) =>
    console.error('Failed to ensure offscreen:', err),
  );
}, 30000);

// Keepalive: Handle messages from offscreen to keep service worker alive
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'KEEPALIVE') {
    sendResponse({ ok: true });
  }
});
