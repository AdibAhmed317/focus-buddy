// Offscreen document to play sounds reliably

type CustomSound = { id: string; dataUrl?: string };

let audioContext = new (
  window.AudioContext || (window as any).webkitAudioContext
)();

console.log(
  'Offscreen document loaded, audio context state:',
  audioContext.state,
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
const initAudioContext = async () => {
  try {
    if (audioContext.state === 'suspended') {
      console.log('Resuming audio context on load');
      await audioContext.resume();
      console.log('Audio context resumed successfully');
    }
  } catch (e) {
    console.error('Failed to resume audio context:', e);
  }
};

// Try to initialize immediately
initAudioContext();

// Also initialize after a delay to ensure proper setup
setTimeout(() => {
  initAudioContext();
}, 100);

const resumeAudioContextWithRetry = async (retries = 3): Promise<void> => {
  for (let i = 0; i < retries; i++) {
    try {
      if (audioContext.state === 'suspended') {
        console.log(`Resuming audio context (attempt ${i + 1}/${retries})`);
        await audioContext.resume();
        console.log('Audio context resumed successfully');
        return;
      } else if (audioContext.state === 'running') {
        console.log('Audio context already running');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 50));
    } catch (error) {
      console.error(`Resume attempt ${i + 1} failed:`, error);
      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }
  console.warn('Failed to resume audio context after retries');
};

const playBuiltInSound = async (soundId: string) => {
  try {
    // Ensure audio context is ready
    await resumeAudioContextWithRetry();

    // Check if it's a sound file (ends with .mp3 or .wav)
    if (soundId.endsWith('.mp3') || soundId.endsWith('.wav')) {
      try {
        const soundPath = `/sounds/${soundId}`;
        console.log('Loading built-in sound file:', soundPath);
        const audio = new Audio(soundPath);
        audio.volume = 1.0;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Built-in sound file played successfully:', soundId);
        }
        return;
      } catch (error) {
        console.error('Error loading sound file:', soundId, error);
        // Fall through to synthetic sound generation as fallback
      }
    }

    // Fallback: Generate synthetic sounds for legacy/unknown IDs
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
    console.log('Built-in sound played successfully:', soundId);
  } catch (error) {
    console.error('Error playing built-in sound in offscreen:', error);
    throw error;
  }
};

const playSound = async (
  selectedSound: string,
  customSounds: CustomSound[],
) => {
  try {
    console.log('playSound called for:', selectedSound);

    // Always ensure audio context is resumed before attempting playback
    await resumeAudioContextWithRetry();

    const custom = customSounds.find(
      (s) => s.id === selectedSound && s.dataUrl,
    );

    if (custom?.dataUrl) {
      try {
        const audio = new Audio(custom.dataUrl);
        // Set volume to maximum to ensure it's audible
        audio.volume = 1.0;
        console.log('Playing custom audio:', selectedSound);
        const playPromise = audio.play();

        // Handle play promise properly
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Custom audio play started successfully');
            })
            .catch((error) => {
              console.error('Custom audio play failed:', error);
              // Fallback to built-in sound if custom fails
              console.log('Falling back to built-in chime sound');
              playBuiltInSound('chime');
            });
        }
        return;
      } catch (error) {
        console.error('Offscreen custom audio play error:', error);
        // Fallback to a built-in sound
        console.log('Falling back to chime sound');
        await playBuiltInSound('chime');
        return;
      }
    }

    // Play built-in sound
    console.log('Playing built-in sound:', selectedSound);
    await playBuiltInSound(selectedSound);
  } catch (error) {
    console.error('Error in playSound:', error);
  }
};

let lastTriggeredId = '';

// Listen for messages
chrome.runtime.onMessage.addListener((msg: any): void => {
  console.log('Offscreen received message:', msg?.type);
  if (msg?.type !== 'PLAY_SOUND') {
    console.log('Ignoring non-PLAY_SOUND message');
    return;
  }
  const { selectedSound, customSounds } = msg.payload || {};
  console.log('Offscreen message handler: Playing sound:', selectedSound);
  playSound(selectedSound, customSounds || []).catch((error) => {
    console.error('Message-based playback error:', error);
  });
});

// Watch storage for trigger signals (works even when popup is closed)
chrome.storage.onChanged?.addListener?.(
  (changes: any, areaName: string): void => {
    if (areaName !== 'local') {
      return;
    }
    console.log('Offscreen: Storage changed:', Object.keys(changes));
    if (
      changes.soundTriggerId?.newValue &&
      changes.soundTriggerId.newValue !== lastTriggeredId
    ) {
      lastTriggeredId = changes.soundTriggerId.newValue;
      console.log('Offscreen: Storage trigger received! ID:', lastTriggeredId);

      // Get the sound settings and play immediately
      chrome.storage.local.get(
        ['selectedSound', 'customSounds'],
        async (items) => {
          const soundToPlay = items.selectedSound || 'chime';
          console.log(
            'Offscreen: Playing from storage trigger, sound:',
            soundToPlay,
          );
          try {
            await playSound(soundToPlay, items.customSounds || []);
            console.log('Offscreen: Sound played successfully');
          } catch (error) {
            console.error('Offscreen: Playback error:', error);
          }
        },
      );
    }
  },
);
