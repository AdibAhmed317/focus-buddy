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

// Generate built-in sounds using Web Audio API
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

interface BackgroundState {
  isRunning: boolean;
  nextSoundTime: number | null;
  timeUntilNextSound: number;
}

const RandomFocusSound = () => {
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

  const playSound = useCallback(() => {
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
      audioRef.current.play().catch(console.error);
    } else {
      // Play built-in sound using Web Audio API
      playBuiltInSound(selectedSound);
    }
  }, [selectedSound, customSounds]);

  // Sync with background worker state
  useEffect(() => {
    const syncState = () => {
      try {
        chrome.runtime.sendMessage({ action: 'getState' }, (response: any) => {
          if (response && !chrome.runtime.lastError) {
            setIsRunning(response.isRunning);
            setTimeUntilNextSound(response.timeUntilNextSound || 0);
          }
        });
      } catch (error) {
        console.error('Error syncing state:', error);
      }
    };

    syncState();
    const interval = setInterval(syncState, 1000);

    // Listen for messages from background worker
    const handleMessage = (message: any) => {
      if (message.action === 'playSound') {
        playSound();
      }
    };

    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.onMessage.addListener(handleMessage);
    }

    return () => {
      clearInterval(interval);
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.onMessage.removeListener(handleMessage);
      }
    };
  }, [playSound]);

  const handleStart = () => {
    if (minMinutes >= maxMinutes) {
      alert('Min must be less than Max');
      return;
    }
    try {
      chrome.runtime.sendMessage({
        action: 'start',
        minMinutes,
        maxMinutes,
        selectedSound,
        customSounds,
      });
      setIsRunning(true);
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleStop = () => {
    try {
      chrome.runtime.sendMessage({ action: 'stop' });
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
    setIsRunning(false);
    setTimeUntilNextSound(0);
  };

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
        <div
          className={`p-2.5 rounded-xl bg-primary/10 transition-all duration-300 ${
            isPlaying ? 'animate-sound-pulse' : ''
          } ${isRunning ? 'animate-glow' : ''}`}
        >
          <Volume2 className='w-5 h-5 text-primary' />
        </div>
        <div>
          <h1 className='text-lg font-semibold text-foreground tracking-tight'>
            Random Focus Sound
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
