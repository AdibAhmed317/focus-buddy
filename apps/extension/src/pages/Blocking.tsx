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
import { ProFeatureLock } from '@/components/ProFeatureLock';
import { usePro } from '@/contexts/ProContext';
import { Shield, Trash2, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface BlockedSite {
  id: string;
  url: string;
  addedAt: number;
}

export default function Blocking() {
  const navigate = useNavigate();
  const { isPro } = usePro();
  const [blockedSites, setBlockedSites] = useState<BlockedSite[]>([]);
  const [newSite, setNewSite] = useState('');
  const [isBlockingActive, setIsBlockingActive] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isPro) return;
    loadBlockedSites();
    checkBlockingStatus();
  }, [isPro]);

  const loadBlockedSites = async () => {
    try {
      const result = await chrome.storage.local.get(['blockedSites']);
      setBlockedSites(result.blockedSites || []);
    } catch (error) {
      console.error('Failed to load blocked sites:', error);
    }
  };

  const checkBlockingStatus = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STATE' });
      setIsBlockingActive(response?.isRunning && !response?.isPaused);
    } catch (error) {
      console.error('Failed to check blocking status:', error);
    }
  };

  const addSite = async () => {
    setError('');

    if (!newSite.trim()) {
      setError('Please enter a website URL');
      return;
    }

    try {
      // Validate and normalize URL
      let url = newSite.trim().toLowerCase();

      // Remove protocol if present
      url = url.replace(/^https?:\/\//, '');

      // Remove www. prefix
      url = url.replace(/^www\./, '');

      // Remove trailing slash
      url = url.replace(/\/$/, '');

      // Basic validation
      if (!url.includes('.')) {
        setError('Please enter a valid domain (e.g., youtube.com)');
        return;
      }

      // Check if already blocked
      if (blockedSites.some((site) => site.url === url)) {
        setError('This site is already in your blocklist');
        return;
      }

      const newBlockedSite: BlockedSite = {
        id: crypto.randomUUID(),
        url,
        addedAt: Date.now(),
      };

      const updatedSites = [...blockedSites, newBlockedSite];
      setBlockedSites(updatedSites);
      await chrome.storage.local.set({ blockedSites: updatedSites });

      // Notify background script to update blocking rules
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_BLOCKLIST',
        sites: updatedSites,
      });

      if (!response?.success) {
        throw new Error('Failed to update blocking rules');
      }

      setNewSite('');
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to add website';
      setError(errorMsg);
      console.error('Error adding blocked site:', err);
    }
  };

  const removeSite = async (id: string) => {
    try {
      const updatedSites = blockedSites.filter((site) => site.id !== id);
      setBlockedSites(updatedSites);
      await chrome.storage.local.set({ blockedSites: updatedSites });

      // Notify background script to update blocking rules
      const response = await chrome.runtime.sendMessage({
        type: 'UPDATE_BLOCKLIST',
        sites: updatedSites,
      });

      if (!response?.success) {
        throw new Error('Failed to update blocking rules');
      }
    } catch (err) {
      console.error('Error removing blocked site:', err);
      // Reload sites on error
      await loadBlockedSites();
    }
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  const freeLimit = 3;
  const canAddMore = isPro || blockedSites.length < freeLimit;

  return (
    <div className='bg-background p-3 flex flex-col gap-3 text-sm h-full'>
      <div className='w-full flex-1 overflow-auto min-h-0'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h1 className='text-lg font-semibold'>Website Blocking</h1>
            <p className='text-xs text-muted-foreground mt-1'>
              Block distracting websites during focus sessions
            </p>
          </div>
          {isBlockingActive && (
            <Badge variant='default' className='bg-green-500'>
              <Shield className='w-3 h-3 mr-1' />
              Active
            </Badge>
          )}
        </div>

        {isBlockingActive && (
          <Alert className='mb-4'>
            <AlertCircle className='h-4 w-4' />
            <AlertDescription className='text-xs'>
              Website blocking is currently active. Blocked sites will be
              inaccessible until you stop your focus session.
            </AlertDescription>
          </Alert>
        )}

        <ProFeatureLock
          featureName='Website Blocking'
          description='Block unlimited distracting websites during focus sessions. Free users can block up to 3 sites.'
          onUpgrade={handleUpgrade}
          isLocked={false} // Always show UI, but limit functionality
        >
          <Card className='mb-4'>
            <CardHeader>
              <CardTitle className='text-base'>Add Website to Block</CardTitle>
              <CardDescription className='text-xs'>
                Enter the website URL (e.g., twitter.com, youtube.com,
                reddit.com)
                {!isPro && (
                  <span className='block mt-2 text-xs text-orange-600'>
                    Free: {blockedSites.length}/{freeLimit} sites used
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex gap-2'>
                <Input
                  placeholder='example.com'
                  value={newSite}
                  onChange={(e) => setNewSite(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && canAddMore && addSite()
                  }
                  disabled={!canAddMore}
                />
                <Button
                  onClick={addSite}
                  disabled={!canAddMore}
                  className='gap-2'
                >
                  <Plus className='w-4 h-4' />
                  Add
                </Button>
              </div>
              {error && <p className='text-xs text-red-500 mt-2'>{error}</p>}
              {!canAddMore && (
                <div className='mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                  <p className='text-xs text-orange-700'>
                    Free users can block up to {freeLimit} sites. Upgrade to Pro
                    for unlimited blocking.
                  </p>
                  <Button
                    onClick={handleUpgrade}
                    size='sm'
                    className='mt-2 bg-orange-500 hover:bg-orange-600'
                  >
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className='text-base'>
                Blocked Websites ({blockedSites.length})
              </CardTitle>
              <CardDescription className='text-xs'>
                These websites will be blocked during active focus sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockedSites.length === 0 ? (
                <p className='text-xs text-muted-foreground text-center py-8'>
                  No websites blocked yet. Add your first distraction above!
                </p>
              ) : (
                <div className='space-y-2'>
                  {blockedSites.map((site) => (
                    <div
                      key={site.id}
                      className='flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        <Shield className='w-3 h-3 text-muted-foreground flex-shrink-0' />
                        <div className='min-w-0'>
                          <p className='text-xs font-medium truncate'>
                            {site.url}
                          </p>
                          <p className='text-[11px] text-muted-foreground'>
                            Added {new Date(site.addedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeSite(site.id)}
                        className='hover:bg-red-50 hover:text-red-600 h-7 w-7 p-0 flex-shrink-0 ml-2'
                      >
                        <Trash2 className='w-3 h-3' />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </ProFeatureLock>
      </div>
    </div>
  );
}
