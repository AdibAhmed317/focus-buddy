import { useState, useRef, useEffect } from 'react';
import { Play, Square, Upload, Clock, Music, Pause } from 'lucide-react';

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
  {
    id: 'dun-dun-dun-sound-effect-brass_8nFBccR.mp3',
    name: 'Dun Dun Dun',
    isBuiltIn: true,
  },
  { id: 'faaah.mp3', name: 'Faaah', isBuiltIn: true },
  { id: 'mac-quack.mp3', name: 'Mac Quack', isBuiltIn: true },
  {
    id: 'vine-boom-sound-effect_KT89XIq.mp3',
    name: 'Vine Boom',
    isBuiltIn: true,
  },
];

interface RandomFocusSoundProps {
  showOpenInTabButton?: boolean;
  launchesWindowOnStart?: boolean;
}

const RandomFocusSound = ({
  showOpenInTabButton,
  launchesWindowOnStart,
}: RandomFocusSoundProps) => {
  const [minMinutes, setMinMinutes] = useState(2);
  const [maxMinutes, setMaxMinutes] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string>('chime');
  const [customSounds, setCustomSounds] = useState<Sound[]>([]);
  const [timeUntilNextSound, setTimeUntilNextSound] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isRunningRef = useRef(false);
  const timeUntilNextSoundRef = useRef(0);

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
          },
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

  // Poll background state to sync timer when switching pages
  useEffect(() => {
    let pollInterval: number | null = null;

    const pollBackgroundState = async () => {
      try {
        const response = await chrome.runtime.sendMessage({
          type: 'GET_STATE',
        });
        if (response) {
          // Sync running state
          if (response.isRunning !== isRunningRef.current) {
            isRunningRef.current = response.isRunning;
            setIsRunning(response.isRunning);
          }
          if (response.isPaused !== isPaused) {
            setIsPaused(response.isPaused);
          }
          // Always use background as source of truth for time remaining
          const timeRemaining = response.timeUntilNextSound || 0;
          timeUntilNextSoundRef.current = timeRemaining;
          setTimeUntilNextSound(timeRemaining);
        }
      } catch (error) {
        // Ignore messaging errors during polling
      }
    };

    // Poll every second to get accurate countdown from background
    pollInterval = window.setInterval(pollBackgroundState, 1000);

    // Initial poll
    pollBackgroundState();

    return () => {
      if (pollInterval !== null) {
        window.clearInterval(pollInterval);
      }
    };
  }, [isPaused, isRunning]);

  const sendMessage = (action: string, payload?: Record<string, unknown>) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
        chrome.runtime.sendMessage({ action, ...payload });
      }
    } catch {
      // Ignore messaging errors
    }
  };

  const handleStart = () => {
    if (minMinutes >= maxMinutes) {
      alert('Min must be less than Max');
      return;
    }

    setIsPaused(false);

    // In popup: open dedicated small window and let that instance own the timers
    if (launchesWindowOnStart) {
      try {
        const url =
          typeof chrome !== 'undefined' && chrome.runtime?.getURL
            ? chrome.runtime.getURL('index.html')
            : '/index.html';

        if (typeof chrome !== 'undefined' && (chrome as any).windows) {
          (chrome as any).windows.create(
            {
              url: url + '?autostart=true',
              type: 'popup',
              width: 420,
              height: 520,
              focused: true,
            },
            (createdWindow: any) => {
              if (createdWindow?.id) {
                chrome.runtime.sendMessage({
                  type: 'REGISTER_FOCUS_WINDOW',
                  windowId: createdWindow.id,
                  width: 420,
                  height: 520,
                });
              }
            },
          );
        } else if (typeof chrome !== 'undefined' && (chrome as any).tabs) {
          (chrome as any).tabs.create({ url: url + '?autostart=true' });
        } else {
          window.open(
            url + '?autostart=true',
            '_blank',
            'width=420,height=520',
          );
        }

        isRunningRef.current = true;
        setIsRunning(true);
        sendMessage('START_TIMER', {
          minMinutes,
          maxMinutes,
          selectedSound,
          customSounds,
        });
      } catch (error) {
        console.error('Error opening focus window:', error);
      }

      return;
    }

    isRunningRef.current = true;
    setIsRunning(true);
    sendMessage('START_TIMER', {
      minMinutes,
      maxMinutes,
      selectedSound,
      customSounds,
    });
  };

  const handleStop = () => {
    isRunningRef.current = false;
    setIsRunning(false);
    setIsPaused(false);
    setTimeUntilNextSound(0);
    timeUntilNextSoundRef.current = 0;

    sendMessage('STOP_TIMER', { completed: true });
  };

  const handlePause = () => {
    if (!isRunning || isPaused) return;
    isRunningRef.current = false;
    setIsPaused(true);

    sendMessage('PAUSE_TIMER');
  };

  const handleResume = () => {
    if (!isRunning || !isPaused) return;
    isRunningRef.current = true;
    setIsPaused(false);
    sendMessage('RESUME_TIMER');
  };

  // Auto-start from URL parameter
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === 'true' && !isRunning) {
        handleStart();
      }
    }
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
    <div className='w-full bg-background p-3'>
      {/* Note: Header is now in PopupApp */}

      {/* Time Interval Section */}
      <div className='bg-card rounded-lg p-2 border border-border mb-3'>
        <div className='flex items-center gap-2 mb-2'>
          <Clock className='w-3 h-3 text-muted-foreground' />
          <span className='text-xs font-medium text-foreground'>
            Interval Range
          </span>
        </div>

        <div className='flex items-center gap-2'>
          <div className='flex-1'>
            <label
              htmlFor='min-input'
              className='block text-xs text-muted-foreground mb-1'
            >
              Min
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
              className='w-full h-8 px-2 rounded text-xs bg-secondary border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              aria-label='Minimum interval in minutes'
            />
          </div>

          <span className='text-muted-foreground flex-shrink-0 mt-4'>—</span>

          <div className='flex-1'>
            <label
              htmlFor='max-input'
              className='block text-xs text-muted-foreground mb-1'
            >
              Max
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
      <div className='bg-card rounded-lg p-2 border border-border mb-3'>
        <div className='flex items-center gap-2 mb-2'>
          <Music className='w-3 h-3 text-muted-foreground' />
          <span className='text-xs font-medium text-foreground'>
            Alert Sound
          </span>
        </div>

        <div className='flex gap-1 items-end'>
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
            onClick={async () => {
              try {
                // Send to background to ensure offscreen doc exists
                await chrome.runtime.sendMessage({
                  type: 'PREVIEW_SOUND',
                  payload: {
                    selectedSound,
                    customSounds,
                  },
                });
              } catch (e) {
                console.error('Preview sound failed:', e);
              }
            }}
            className='h-10 px-3 rounded-lg bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-all flex items-center gap-1.5 shrink-0'
            aria-label='Preview selected sound'
            title='Preview sound'
          >
            <Play className='w-4 h-4' />
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
      <div className='grid grid-cols-3 gap-3'>
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
          onClick={isPaused ? handleResume : handlePause}
          disabled={!isRunning}
          className='flex-1 h-12 rounded-xl bg-secondary text-foreground font-semibold text-sm shadow-button hover:bg-accent active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2'
          aria-label={isPaused ? 'Resume focus session' : 'Pause focus session'}
        >
          {isPaused ? (
            <Play className='w-4 h-4' fill='currentColor' />
          ) : (
            <Pause className='w-4 h-4' />
          )}
          {isPaused ? 'Resume' : 'Pause'}
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
                {isPaused ? 'Paused' : 'Next Sound In'}
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
                      isPaused
                        ? 0
                        : (1 - timeUntilNextSound / (maxMinutes * 60 * 1000)) *
                            100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
          <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
            {isPaused ? (
              <span className='inline-flex h-2 w-2 rounded-full bg-muted-foreground/60' />
            ) : (
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-success'></span>
              </span>
            )}
            {isPaused ? 'Paused' : 'Active'} • Interval: {minMinutes}–
            {maxMinutes} min
          </div>
        </div>
      )}
    </div>
  );
};

export default RandomFocusSound;
