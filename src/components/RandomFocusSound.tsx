import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Square, Upload, Volume2, Clock, Music } from 'lucide-react';

interface Sound {
  id: string;
  name: string;
  isBuiltIn: boolean;
  dataUrl?: string;
}

const builtInSounds: Sound[] = [
  { id: 'chime', name: 'Gentle Chime', isBuiltIn: true },
  { id: 'bell', name: 'Soft Bell', isBuiltIn: true },
  { id: 'ding', name: 'Quick Ding', isBuiltIn: true },
  { id: 'tone', name: 'Focus Tone', isBuiltIn: true },
];

// Create a single persistent AudioContext to avoid suspension issues
let globalAudioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!globalAudioContext) {
    globalAudioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
  }
  return globalAudioContext;
};

// Generate built-in sounds using Web Audio API
const playBuiltInSound = async (soundId: string) => {
  const audioContext = getAudioContext();

  // Ensure audio context is running (not suspended)
  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  const now = audioContext.currentTime;

  switch (soundId) {
    case 'chime':
      // Gentle chime - two tones
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      oscillator.frequency.setValueAtTime(1320, now + 0.15);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
      break;

    case 'bell':
      // Soft bell - rich harmonics
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      gainNode.gain.setValueAtTime(0.4, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      oscillator.start(now);
      oscillator.stop(now + 0.8);
      break;

    case 'ding':
      // Quick ding - short and bright
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1046.5, now); // C6
      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;

    case 'tone':
      // Focus tone - calming low frequency
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, now); // A4
      oscillator.frequency.setValueAtTime(493.88, now + 0.2); // B4
      oscillator.frequency.setValueAtTime(523.25, now + 0.4); // C5
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

interface RandomFocusSoundProps {
  // When true, show a helper button to open the dedicated focus tab
  showOpenInTabButton?: boolean;
  // When true (used in popup), Start will open a small focus window instead of running timers locally in the popup
  launchesWindowOnStart?: boolean;
}

const RandomFocusSound = ({
  showOpenInTabButton,
  launchesWindowOnStart,
}: RandomFocusSoundProps) => {
  const [minMinutes, setMinMinutes] = useState(2);
  const [maxMinutes, setMaxMinutes] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string>('chime');
  const [customSounds, setCustomSounds] = useState<Sound[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeUntilNextSound, setTimeUntilNextSound] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // Load and persist settings
  useEffect(() => {
    const loadSettings = () => {
      try {
        chrome.storage.local.get(
          ['minMinutes', 'maxMinutes', 'selectedSound', 'customSounds'],
          (result: any) => {
            if (result.minMinutes) setMinMinutes(result.minMinutes);
            if (result.maxMinutes) setMaxMinutes(result.maxMinutes);
            if (result.selectedSound) setSelectedSound(result.selectedSound);
            if (result.customSounds) setCustomSounds(result.customSounds);
          }
        );
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    try {
      chrome.storage.local.set({
        minMinutes,
        maxMinutes,
        selectedSound,
        customSounds,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [minMinutes, maxMinutes, selectedSound, customSounds]);

  const playSound = useCallback(async () => {
    // Visual feedback animation
    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 600);

    // Check if it's a custom sound
    const customSound = customSounds.find((s) => s.id === selectedSound);

    if (customSound && customSound.dataUrl) {
      // Play custom uploaded sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      audioRef.current = new Audio(customSound.dataUrl);

      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing custom sound:', error);
      }
    } else {
      // Play built-in sound using Web Audio API
      await playBuiltInSound(selectedSound);
    }
  }, [selectedSound, customSounds]);

  const scheduleNextSound = useCallback(() => {
    // Clear any existing timers
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    // Compute next delay in milliseconds
    const minMs = minMinutes * 60 * 1000;
    const maxMs = maxMinutes * 60 * 1000;
    const delay = Math.floor(
      minMs + Math.random() * Math.max(0, maxMs - minMs)
    );

    setTimeUntilNextSound(delay);

    // Countdown display
    countdownRef.current = window.setInterval(() => {
      setTimeUntilNextSound((prev) => {
        if (!isRunningRef.current) return 0;
        const next = prev - 1000;
        return next > 0 ? next : 0;
      });
    }, 1000);

    // Actual sound trigger
    timerRef.current = window.setTimeout(() => {
      if (!isRunningRef.current) return;
      playSound();
      scheduleNextSound();
    }, delay);
  }, [minMinutes, maxMinutes, playSound]);

  const handleStart = () => {
    if (minMinutes >= maxMinutes) {
      alert('Min must be less than Max');
      return;
    }

    // In popup: open dedicated small window and let that instance own the timers
    if (launchesWindowOnStart) {
      try {
        const url =
          typeof chrome !== 'undefined' && chrome.runtime?.getURL
            ? chrome.runtime.getURL('index.html')
            : '/index.html';

        if (typeof chrome !== 'undefined' && (chrome as any).windows) {
          (chrome as any).windows.create({
            url: url + '?autostart=true',
            type: 'popup',
            width: 420,
            height: 520,
            focused: true,
          });
        } else if (typeof chrome !== 'undefined' && (chrome as any).tabs) {
          (chrome as any).tabs.create({ url: url + '?autostart=true' });
        } else {
          window.open(
            url + '?autostart=true',
            '_blank',
            'width=420,height=520'
          );
        }

        // Also start timer locally in popup for backup
        isRunningRef.current = true;
        setIsRunning(true);
        scheduleNextSound();
      } catch (error) {
        console.error('Error opening focus window:', error);
      }

      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    scheduleNextSound();
  };

  const handleStop = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setTimeUntilNextSound(0);

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (countdownRef.current !== null) {
      window.clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  };

  // Auto-start from URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === 'true' && !isRunning) {
        isRunningRef.current = true;
        setIsRunning(true);
        scheduleNextSound();
      }
    }
  }, []);

  // Ensure audio context stays active even when tab is in background
  useEffect(() => {
    const audioContext = getAudioContext();

    // Periodically resume audio context to prevent suspension
    const keepAlive = setInterval(() => {
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
    }, 5000); // Check every 5 seconds

    const handleFocus = () => {
      // Resume audio context when window gains focus
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
    };

    const handleVisibilityChange = () => {
      // Resume audio context when page becomes visible
      if (
        document.visibilityState === 'visible' &&
        audioContext.state === 'suspended'
      ) {
        audioContext.resume().catch(() => {});
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(keepAlive);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [playSound]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
      if (countdownRef.current !== null) {
        window.clearInterval(countdownRef.current);
      }
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a valid audio file (.mp3 or .wav)');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newSound: Sound = {
        id: `custom-${Date.now()}`,
        name: file.name.replace(/\.(mp3|wav)$/i, ''),
        isBuiltIn: false,
        dataUrl,
      };
      setCustomSounds((prev) => [...prev, newSound]);
      setSelectedSound(newSound.id);
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className='w-[360px] bg-background p-5'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6'>
        <img src='/logo.png' alt='Focus Buddy' className='w-8 h-8 rounded-lg' />
        <div>
          <h1 className='text-lg font-semibold text-foreground tracking-tight'>
            Focus Buddy
          </h1>
          <p className='text-xs text-muted-foreground'>
            Stay focused with random reminders
          </p>
        </div>
      </div>

      {/* Time Interval Section */}
      <div className='bg-card rounded-xl p-4 shadow-soft mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Clock className='w-4 h-4 text-muted-foreground' />
          <span className='text-sm font-medium text-foreground'>
            Interval Range
          </span>
        </div>

        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <label
              htmlFor='min-input'
              className='block text-xs text-muted-foreground mb-1.5'
            >
              Min (minutes)
            </label>
            <input
              id='min-input'
              type='number'
              min={1}
              max={60}
              value={minMinutes}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setMinMinutes(1);
                } else {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    setMinMinutes(Math.max(1, Math.min(60, num)));
                  }
                }
              }}
              disabled={isRunning}
              className='w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Minimum interval in minutes'
            />
          </div>

          <span className='text-muted-foreground mt-5'>—</span>

          <div className='flex-1'>
            <label
              htmlFor='max-input'
              className='block text-xs text-muted-foreground mb-1.5'
            >
              Max (minutes)
            </label>
            <input
              id='max-input'
              type='number'
              min={1}
              max={60}
              value={maxMinutes}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setMaxMinutes(10);
                } else {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    setMaxMinutes(Math.max(1, Math.min(60, num)));
                  }
                }
              }}
              disabled={isRunning}
              className='w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Maximum interval in minutes'
            />
          </div>
        </div>
      </div>

      {/* Sound Selection Section */}
      <div className='bg-card rounded-xl p-4 shadow-soft mb-4'>
        <div className='flex items-center gap-2 mb-3'>
          <Music className='w-4 h-4 text-muted-foreground' />
          <span className='text-sm font-medium text-foreground'>
            Alert Sound
          </span>
        </div>

        <div className='flex gap-2 items-end'>
          <div className='flex-1 relative'>
            <select
              value={selectedSound}
              onChange={(e) => setSelectedSound(e.target.value)}
              disabled={isRunning}
              className='w-full h-10 px-3 pr-8 rounded-lg bg-secondary border border-border text-foreground text-sm font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
              aria-label='Select alert sound'
            >
              <optgroup label='Built-in Sounds'>
                {builtInSounds.map((sound) => (
                  <option key={sound.id} value={sound.id}>
                    {sound.name}
                  </option>
                ))}
              </optgroup>
              {customSounds.length > 0 && (
                <optgroup label='Your Sounds'>
                  {customSounds.map((sound) => (
                    <option key={sound.id} value={sound.id}>
                      {sound.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
              <svg
                className='w-4 h-4 text-muted-foreground'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>

          <button
            onClick={playSound}
            className={`h-10 w-10 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center justify-center shrink-0 ${
              isPlaying
                ? 'animate-sound-pulse bg-primary/10 text-primary border-primary/30'
                : ''
            }`}
            aria-label='Preview selected sound'
            title='Preview sound'
          >
            <Volume2 className='w-4 h-4' />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isRunning}
            className='h-10 px-3 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shrink-0'
            aria-label='Upload custom sound'
            title='Upload .mp3 or .wav file'
          >
            <Upload className='w-4 h-4' />
          </button>

          <input
            ref={fileInputRef}
            type='file'
            accept='.mp3,.wav,audio/mpeg,audio/wav'
            onChange={handleFileUpload}
            className='hidden'
            aria-hidden='true'
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className='flex gap-3'>
        <button
          onClick={handleStart}
          disabled={isRunning}
          className='flex-1 h-12 rounded-xl bg-success text-success-foreground font-semibold text-sm shadow-button hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2'
          aria-label='Start random focus sounds'
        >
          <Play className='w-4 h-4' fill='currentColor' />
          Start
        </button>

        <button
          onClick={handleStop}
          disabled={!isRunning}
          className='flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground font-semibold text-sm shadow-button hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2'
          aria-label='Stop random focus sounds'
        >
          <Square className='w-4 h-4' fill='currentColor' />
          Stop
        </button>
      </div>

      {showOpenInTabButton && (
        <div className='mt-3 flex justify-center'>
          <button
            type='button'
            onClick={() => {
              try {
                const url =
                  typeof chrome !== 'undefined' && chrome.runtime?.getURL
                    ? chrome.runtime.getURL('index.html')
                    : '/';
                if (typeof chrome !== 'undefined' && (chrome as any).tabs) {
                  (chrome as any).tabs.create({ url });
                } else {
                  window.open(url, '_blank');
                }
              } catch (error) {
                console.error('Error opening focus tab:', error);
              }
            }}
            className='mt-2 text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline'
          >
            Open dedicated focus tab
          </button>
        </div>
      )}

      {/* Status Indicator */}
      {isRunning && (
        <div className='mt-4'>
          <div className='bg-card rounded-xl p-4 shadow-soft mb-3'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-xs text-muted-foreground font-medium'>
                Next Sound In
              </span>
              <div className='text-2xl font-bold text-primary font-mono'>
                {formatTime(timeUntilNextSound)}
              </div>
            </div>
            <div className='h-1.5 bg-secondary rounded-full overflow-hidden'>
              <div
                className='h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-1000'
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (1 - timeUntilNextSound / (maxMinutes * 60 * 1000)) * 100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
            <span className='relative flex h-2 w-2'>
              <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75'></span>
              <span className='relative inline-flex rounded-full h-2 w-2 bg-success'></span>
            </span>
            Active • Interval: {minMinutes}–{maxMinutes} min
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomFocusSound;
