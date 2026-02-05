// Offscreen document to play sounds reliably

type CustomSound = { id: string; dataUrl?: string };

const audioContext = new (window.AudioContext ||
  (window as any).webkitAudioContext)();

console.log(
  'Offscreen document loaded, audio context state:',
  audioContext.state
);

// Keepalive mechanism - send a message every 10 seconds to keep service worker alive
setInterval(() => {
  try {
    chrome.runtime.sendMessage({ type: 'KEEPALIVE' });
  } catch {
    // Ignore errors
  }
}, 10000);

// Initialize audio context (user gesture not needed for offscreen documents)
if (audioContext.state === 'suspended') {
  console.log('Resuming audio context on load');
  audioContext.resume().catch((e) => console.error('Failed to resume:', e));
}

const playBuiltInSound = (soundId: string) => {
  try {
    // Resume audio context if suspended (required when popup is closed)
    if (audioContext.state === 'suspended') {
      console.log('Resuming audio context');
      audioContext.resume().catch((e) => console.error('Failed to resume:', e));
    }

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
  } catch (error) {
    console.error('Error playing built-in sound in offscreen:', error);
  }
};

const playSound = async (
  selectedSound: string,
  customSounds: CustomSound[]
) => {
  try {
    // Always try to resume audio context
    if (audioContext.state === 'suspended') {
      console.log('Resuming audio context before play');
      await audioContext.resume();
    }

    const custom = customSounds.find(
      (s) => s.id === selectedSound && s.dataUrl
    );
    if (custom?.dataUrl) {
      try {
        const audio = new Audio(custom.dataUrl);
        console.log('Playing custom audio:', selectedSound);
        await audio.play();
        return;
      } catch (error) {
        console.error('Offscreen custom audio play error:', error);
      }
    }

    console.log('Playing built-in sound:', selectedSound);
    playBuiltInSound(selectedSound);
  } catch (error) {
    console.error('Error in playSound:', error);
  }
};

let lastTriggeredId: string = '';

chrome.runtime.onMessage.addListener((msg: any): void => {
  console.log('Offscreen received message:', msg?.type);
  if (msg?.type !== 'PLAY_SOUND') {
    console.log('Ignoring non-PLAY_SOUND message');
    return;
  }
  const { selectedSound, customSounds } = msg.payload || {};
  console.log('Playing sound:', selectedSound);
  playSound(selectedSound, customSounds || []).catch((error) => {
    console.error('Playback error:', error);
  });
});

// Watch storage for trigger signals (works even when popup is closed)
chrome.storage.local.onChanged?.addListener?.((changes: any): void => {
  console.log('Storage changed:', Object.keys(changes));
  if (
    changes.soundTriggerId?.newValue &&
    changes.soundTriggerId.newValue !== lastTriggeredId
  ) {
    lastTriggeredId = changes.soundTriggerId.newValue;
    console.log('Storage trigger received:', lastTriggeredId);
    chrome.storage.local.get(['selectedSound', 'customSounds'], (items) => {
      console.log('Playing from storage trigger, sound:', items.selectedSound);
      playSound(items.selectedSound || 'chime', items.customSounds || []).catch(
        (error) => {
          console.error('Playback error:', error);
        }
      );
    });
  }
});
