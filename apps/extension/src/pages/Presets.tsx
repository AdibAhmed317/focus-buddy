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
import { Save, Trash2, Play, Edit2, Check, X, Shield } from 'lucide-react';
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

interface BlockedSite {
  id: string;
  url: string;
  addedAt: number;
}

interface FocusPreset {
  id: string;
  name: string;
  minMinutes: number;
  maxMinutes: number;
  sound: string;
  blockedSites?: BlockedSite[];
  createdAt: number;
}

export default function Presets() {
  const navigate = useNavigate();
  const { isPro } = usePro();
  const [presets, setPresets] = useState<FocusPreset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newWebsite, setNewWebsite] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    minMinutes: 2,
    maxMinutes: 10,
    sound: 'chime',
    blockedSites: [] as BlockedSite[],
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
      // Update blocklist if preset has blocked sites
      const blockedSites = preset.blockedSites || [];
      if (blockedSites.length > 0) {
        await chrome.runtime.sendMessage({
          type: 'UPDATE_BLOCKLIST',
          sites: blockedSites,
        });
      }

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
      blockedSites: [...(preset.blockedSites || [])],
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      minMinutes: 2,
      maxMinutes: 10,
      sound: 'chime',
      blockedSites: [],
    });
    setNewWebsite('');
    setEditingId(null);
  };

  const addBlockedSiteToPreset = () => {
    if (!newWebsite.trim()) return;

    let url = newWebsite.trim().toLowerCase();
    url = url.replace(/^https?:\/\//, '');
    url = url.replace(/^www\./, '');
    url = url.replace(/\/$/, '');

    if (!url.includes('.')) return;

    if (formData.blockedSites.some((site) => site.url === url)) return;

    const newSite: BlockedSite = {
      id: crypto.randomUUID(),
      url,
      addedAt: Date.now(),
    };

    setFormData({
      ...formData,
      blockedSites: [...formData.blockedSites, newSite],
    });
    setNewWebsite('');
  };

  const removeBlockedSiteFromPreset = (id: string) => {
    setFormData({
      ...formData,
      blockedSites: formData.blockedSites.filter((site) => site.id !== id),
    });
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const freeLimit = 2;
  const canAddMore = isPro || presets.length < freeLimit;

  return (
    <div className='bg-background p-3 flex flex-col gap-3 text-sm h-full'>
      <div className='w-full flex-1 overflow-auto min-h-0'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-lg font-semibold'>Focus Presets</h1>
            <p className='text-xs text-muted-foreground mt-1'>
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
          <div className='mb-4 flex justify-between items-center'>
            <div>
              {!isPro && (
                <Badge variant='secondary' className='text-xs'>
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

                  {/* Website Blocking Section */}
                  <div className='border-t pt-4'>
                    <Label className='text-sm font-semibold flex items-center gap-2 mb-2'>
                      <Shield className='w-4 h-4' />
                      Websites to Block (Optional)
                    </Label>
                    <div className='flex gap-2 mb-3'>
                      <Input
                        placeholder='e.g., youtube.com'
                        value={newWebsite}
                        onChange={(e) => setNewWebsite(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && addBlockedSiteToPreset()
                        }
                        className='text-xs h-8'
                      />
                      <Button
                        type='button'
                        onClick={addBlockedSiteToPreset}
                        size='sm'
                        variant='outline'
                        className='h-8 px-2'
                      >
                        Add
                      </Button>
                    </div>
                    {formData.blockedSites.length > 0 && (
                      <div className='space-y-1.5 bg-muted/50 rounded p-2'>
                        {formData.blockedSites.map((site) => (
                          <div
                            key={site.id}
                            className='flex items-center justify-between text-xs p-1.5 bg-background rounded border'
                          >
                            <span className='font-medium'>{site.url}</span>
                            <Button
                              type='button'
                              onClick={() =>
                                removeBlockedSiteFromPreset(site.id)
                              }
                              variant='ghost'
                              size='sm'
                              className='h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600'
                            >
                              <X className='w-3 h-3' />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
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
            <div className='mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
              <p className='text-xs text-orange-700 mb-2'>
                Free users can save up to {freeLimit} presets. Upgrade to Pro
                for unlimited presets.
              </p>
              <Button
                onClick={handleUpgrade}
                size='sm'
                className='bg-orange-500 hover:bg-orange-600 text-xs h-8'
              >
                Upgrade to Pro
              </Button>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {presets.length === 0 ? (
              <Card className='col-span-full'>
                <CardContent className='py-8 text-center'>
                  <Save className='w-10 h-10 mx-auto text-muted-foreground mb-3' />
                  <p className='text-xs text-muted-foreground'>
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
                    <CardTitle className='flex items-center justify-between text-base'>
                      <span className='truncate'>{preset.name}</span>
                      <div className='flex gap-1 flex-shrink-0'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => startEdit(preset)}
                          className='h-8 w-8 p-0'
                        >
                          <Edit2 className='w-3 h-3' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => deletePreset(preset.id)}
                          className='h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600'
                        >
                          <Trash2 className='w-3 h-3' />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className='space-y-1.5 mb-3'>
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>Interval:</span>
                        <span className='font-medium'>
                          {preset.minMinutes}-{preset.maxMinutes} min
                        </span>
                      </div>
                      <div className='flex justify-between text-xs'>
                        <span className='text-muted-foreground'>Sound:</span>
                        <span className='font-medium capitalize'>
                          {preset.sound}
                        </span>
                      </div>
                      {(preset.blockedSites?.length ?? 0) > 0 && (
                        <div className='flex justify-between text-xs'>
                          <span className='text-muted-foreground'>
                            Blocked Sites:
                          </span>
                          <span className='font-medium text-orange-600'>
                            {preset.blockedSites?.length}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={() => applyPreset(preset)}
                      className='w-full gap-2 text-xs h-8'
                      size='sm'
                    >
                      <Play className='w-3 h-3' />
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
