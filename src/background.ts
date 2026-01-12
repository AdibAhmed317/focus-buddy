// Chrome extension background service worker
interface State {
  isRunning: boolean;
  nextSoundTime: number | null;
  minMinutes: number;
  maxMinutes: number;
  selectedSound: string;
  customSounds: any[];
}

let state: State = {
  isRunning: false,
  nextSoundTime: null,
  minMinutes: 2,
  maxMinutes: 10,
  selectedSound: 'chime',
  customSounds: [],
};

let timerInterval: number | null = null;

// Play built-in sound using Web Audio API
const playBuiltInSound = (soundId: string) => {
  const audioContext = new (window.AudioContext ||
    (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;

  switch (soundId) {
    case 'chime':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.setValueAtTime(1320, now + 0.15);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
      break;

    case 'bell':
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(523.25, now);
      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      oscillator.start(now);
      oscillator.stop(now + 0.8);
      break;

    case 'ding':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1046.5, now);
      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;

    case 'tone':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now);
      oscillator.frequency.setValueAtTime(493.88, now + 0.2);
      oscillator.frequency.setValueAtTime(523.25, now + 0.4);
      gainNode.gain.setValueAtTime(0.25, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
      oscillator.start(now);
      oscillator.stop(now + 0.7);
      break;

    default:
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
  }
};

const playSound = () => {
  // Send message to popup to play sound
  chrome.runtime.sendMessage(
    { action: 'playSound', selectedSound: state.selectedSound },
    () => {
      if (chrome.runtime.lastError) {
        console.error('Error sending play message:', chrome.runtime.lastError);
      }
    }
  );
};

const scheduleNextSound = () => {
  if (!state.isRunning) return;

  const minMs = state.minMinutes * 60 * 1000;
  const maxMs = state.maxMinutes * 60 * 1000;
  const randomDelay = Math.random() * (maxMs - minMs) + minMs;

  state.nextSoundTime = Date.now() + randomDelay;

  // Clear any existing timeout
  if ((scheduleNextSound as any).timeoutId) {
    clearTimeout((scheduleNextSound as any).timeoutId);
  }

  // Schedule the next sound
  (scheduleNextSound as any).timeoutId = setTimeout(() => {
    if (
      state.isRunning &&
      state.nextSoundTime &&
      Date.now() >= state.nextSoundTime
    ) {
      playSound();
      scheduleNextSound();
    }
  }, randomDelay);
};

const startTimer = () => {
  if (state.isRunning) return;

  state.isRunning = true;
  scheduleNextSound();

  // Update timer every 100ms
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    // Just keep the state updated
  }, 100);
};

const stopTimer = () => {
  state.isRunning = false;
  state.nextSoundTime = null;
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  (request: any, sender: any, sendResponse: any) => {
    try {
      switch (request.action) {
        case 'start':
          state.minMinutes = request.minMinutes;
          state.maxMinutes = request.maxMinutes;
          state.selectedSound = request.selectedSound;
          state.customSounds = request.customSounds || [];
          startTimer();
          sendResponse({ success: true });
          break;

        case 'stop':
          stopTimer();
          sendResponse({ success: true });
          break;

        case 'getState':
          const timeUntilNextSound = state.nextSoundTime
            ? Math.max(0, state.nextSoundTime - Date.now())
            : 0;
          sendResponse({
            isRunning: state.isRunning,
            nextSoundTime: state.nextSoundTime,
            timeUntilNextSound,
          });
          break;

        default:
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Error in message handler:', error);
      sendResponse({ error: 'Internal error' });
    }
    return true;
  }
);
chrome.runtime.onInstalled.addListener(() => {
  console.log('Focus Buddy extension installed!');
});
