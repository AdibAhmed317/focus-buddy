import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProFeatureLock } from '@/components/ProFeatureLock';
import { usePro } from '@/contexts/ProContext';
import {
  Save,
  Trash2,
  Play,
  Timer,
  BarChart3,
  Shield,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FocusPreset {
  id: string;
  name: string;
  minMinutes: number;
  maxMinutes: number;
  sound: string;
  createdAt: number;
}

export default function Presets() {
  const navigate = useNavigate();
  const { isPro } = usePro();
  const [presets, setPresets] = useState<FocusPreset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    minMinutes: 2,
    maxMinutes: 10,
    sound: 'chime',
  });

  useEffect(() => {
    if (!isPro) return;
    loadPresets();
  }, [isPro]);

  const loadPresets = async () => {
    try {
      const result = await chrome.storage.local.get(['focusPresets']);
      setPresets(result.focusPresets || []);
    } catch (error) {
      console.error('Failed to load presets:', error);
    }
  };

  const savePreset = async () => {
    if (!formData.name.trim()) return;

    if (editingId) {
      // Update existing preset
      const updatedPresets = presets.map((p) =>
        p.id === editingId ? { ...p, ...formData } : p,
      );
      setPresets(updatedPresets);
      await chrome.storage.local.set({ focusPresets: updatedPresets });
      setEditingId(null);
    } else {
      // Create new preset
      const newPreset: FocusPreset = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: Date.now(),
      };
      const updatedPresets = [...presets, newPreset];
      setPresets(updatedPresets);
      await chrome.storage.local.set({ focusPresets: updatedPresets });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const deletePreset = async (id: string) => {
    const updatedPresets = presets.filter((p) => p.id !== id);
    setPresets(updatedPresets);
    await chrome.storage.local.set({ focusPresets: updatedPresets });
  };

  const applyPreset = async (preset: FocusPreset) => {
    try {
      await chrome.runtime.sendMessage({
        type: 'START_TIMER',
        minMinutes: preset.minMinutes,
        maxMinutes: preset.maxMinutes,
        selectedSound: preset.sound,
      });
      navigate('/');
    } catch (error) {
      console.error('Failed to apply preset:', error);
    }
  };

  const startEdit = (preset: FocusPreset) => {
    setEditingId(preset.id);
    setFormData({
      name: preset.name,
      minMinutes: preset.minMinutes,
      maxMinutes: preset.maxMinutes,
      sound: preset.sound,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', minMinutes: 2, maxMinutes: 10, sound: 'chime' });
    setEditingId(null);
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const freeLimit = 2;
  const canAddMore = isPro || presets.length < freeLimit;

  return (
    <div className='min-h-screen bg-background p-2 md:p-4 flex flex-col'>
      {/* Navigation Bar */}
      <div className='w-full mb-4'>
        <div className='flex items-center justify-center bg-card rounded-lg px-2 py-2 border border-border overflow-x-auto'>
          <div className='flex gap-2 md:gap-3 flex-shrink-0'>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-10 justify-center'
              onClick={() => navigate('/')}
            >
              <Timer className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Focus</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-9 justify-center'
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Analytics</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-9 justify-center'
              onClick={() => navigate('/blocking')}
            >
              <Shield className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Blocking</span>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='gap-1.5 md:gap-2 text-xs md:text-sm px-3 py-2 h-9 justify-center'
            >
              <Save className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Presets</span>
            </Button>
          </div>
        </div>
      </div>

      <div className='w-full flex-1 overflow-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold'>Focus Presets</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Save and quickly apply your favorite focus settings
            </p>
          </div>
        </div>

        <ProFeatureLock
          featureName='Focus Presets'
          description='Save unlimited focus presets with custom intervals and sounds. Free users get 2 presets.'
          onUpgrade={handleUpgrade}
          isLocked={false}
        >
          <div className='mb-6 flex justify-between items-center'>
            <div>
              {!isPro && (
                <Badge variant='secondary'>
                  {presets.length}/{freeLimit} presets used
                </Badge>
              )}
            </div>
            <Dialog
              open={isDialogOpen}
              onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button disabled={!canAddMore}>
                  <Save className='w-4 h-4 mr-2' />
                  New Preset
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingId ? 'Edit Preset' : 'Create New Preset'}
                  </DialogTitle>
                  <DialogDescription>
                    Save a preset for quick access to your favorite focus
                    settings.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div>
                    <Label htmlFor='name'>Preset Name</Label>
                    <Input
                      id='name'
                      placeholder='e.g., Deep Focus, Quick Break'
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='min'>Min Minutes</Label>
                      <Input
                        id='min'
                        type='number'
                        min='1'
                        value={formData.minMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minMinutes: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor='max'>Max Minutes</Label>
                      <Input
                        id='max'
                        type='number'
                        min='1'
                        value={formData.maxMinutes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            maxMinutes: parseInt(e.target.value) || 1,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor='sound'>Sound</Label>
                    <select
                      id='sound'
                      className='w-full px-3 py-2 border rounded-md'
                      value={formData.sound}
                      onChange={(e) =>
                        setFormData({ ...formData, sound: e.target.value })
                      }
                    >
                      <option value='chime'>Chime</option>
                      <option value='bell'>Bell</option>
                      <option value='gong'>Gong</option>
                      <option value='ding'>Ding</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={savePreset}>
                    {editingId ? 'Update' : 'Create'} Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {!canAddMore && (
            <div className='mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg'>
              <p className='text-sm text-orange-700 mb-2'>
                Free users can save up to {freeLimit} presets. Upgrade to Pro
                for unlimited presets.
              </p>
              <Button
                onClick={handleUpgrade}
                size='sm'
                className='bg-orange-500 hover:bg-orange-600'
              >
                Upgrade to Pro
              </Button>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {presets.length === 0 ? (
              <Card className='col-span-full'>
                <CardContent className='py-12 text-center'>
                  <Save className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                  <p className='text-muted-foreground'>
                    No presets yet. Create your first preset above!
                  </p>
                </CardContent>
              </Card>
            ) : (
              presets.map((preset) => (
                <Card
                  key={preset.id}
                  className='hover:shadow-md transition-shadow'
                >
                  <CardHeader>
                    <CardTitle className='flex items-center justify-between'>
                      <span>{preset.name}</span>
                      <div className='flex gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => startEdit(preset)}
                        >
                          <Edit2 className='w-4 h-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deletePreset(preset.id)}
                          className='hover:bg-red-50 hover:text-red-600'
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-2 mb-4'>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Interval:</span>
                        <span className='font-medium'>
                          {preset.minMinutes}-{preset.maxMinutes} min
                        </span>
                      </div>
                      <div className='flex justify-between text-sm'>
                        <span className='text-muted-foreground'>Sound:</span>
                        <span className='font-medium capitalize'>
                          {preset.sound}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={() => applyPreset(preset)}
                      className='w-full gap-2'
                    >
                      <Play className='w-4 h-4' />
                      Start Focus
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ProFeatureLock>
      </div>
    </div>
  );
}
