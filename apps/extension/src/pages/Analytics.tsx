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
import { ProFeatureLock } from '@/components/ProFeatureLock';
import { usePro } from '@/contexts/ProContext';
import {
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  Trophy,
  ArrowLeft,
  Timer,
  BarChart3,
  Shield,
  Save,
} from 'lucide-react';
import type { FocusSession, SessionStats } from '@/lib/sessionManager';

export default function Analytics() {
  const navigate = useNavigate();
  const { isPro } = usePro();
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPro) {
      setLoading(false);
      return;
    }

    loadData();
  }, [isPro]);

  const loadData = async () => {
    try {
      // Get stats
      const statsResponse = await chrome.runtime.sendMessage({
        type: 'GET_STATS',
      });
      if (statsResponse?.stats) {
        setStats(statsResponse.stats);
      }

      // Get recent sessions
      const sessionsResponse = await chrome.runtime.sendMessage({
        type: 'GET_SESSIONS',
      });
      if (sessionsResponse?.sessions) {
        setSessions(sessionsResponse.sessions.slice(0, 10)); // Show last 10 sessions
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleUpgrade = () => {
    navigate('/upgrade');
  };

  if (loading) {
    return (
      <div className='p-6'>
        <h1 className='text-2xl font-bold mb-6'>Focus Analytics</h1>
        <p>Loading...</p>
      </div>
    );
  }

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
              onClick={() => navigate('/presets')}
            >
              <Save className='w-3 h-3 md:w-4 md:h-4' />
              <span className='hidden sm:inline'>Presets</span>
            </Button>
          </div>
        </div>
      </div>

      <div className='w-full flex-1 overflow-auto'>
        <h1 className='text-2xl font-bold mb-6'>Focus Analytics</h1>

        <ProFeatureLock
          featureName='Focus Analytics & History'
          description='Track your focus sessions, view detailed statistics, and see your progress over time.'
          onUpgrade={handleUpgrade}
          isLocked={!isPro}
        >
          {stats && (
            <>
              {/* Stats Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Today</CardTitle>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {formatDuration(stats.todayFocusTime)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Focus time today
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      This Week
                    </CardTitle>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {formatDuration(stats.weekFocusTime)}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Focus time this week
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Streak
                    </CardTitle>
                    <Flame className='h-4 w-4 text-orange-500' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {stats.currentStreak}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Day{stats.currentStreak !== 1 ? 's' : ''} in a row
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>
                      Total Sessions
                    </CardTitle>
                    <Trophy className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-2xl font-bold'>
                      {stats.totalSessions}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Completed sessions
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* All-Time Stats */}
              <Card className='mb-6'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <TrendingUp className='h-5 w-5' />
                    All-Time Stats
                  </CardTitle>
                  <CardDescription>Your overall focus journey</CardDescription>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Total Focus Time
                    </p>
                    <p className='text-xl font-bold'>
                      {formatDuration(stats.totalFocusTime)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>
                      Longest Session
                    </p>
                    <p className='text-xl font-bold'>
                      {formatDuration(stats.longestSession)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sessions</CardTitle>
                  <CardDescription>Your last 10 focus sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                      No sessions yet. Start focusing to see your history!
                    </p>
                  ) : (
                    <div className='space-y-3'>
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className='flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
                        >
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-sm font-medium'>
                                {formatDate(session.startTime)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  session.status === 'completed'
                                    ? 'bg-green-100 text-green-700'
                                    : session.status === 'cancelled'
                                      ? 'bg-gray-100 text-gray-700'
                                      : session.status === 'active'
                                        ? 'bg-blue-100 text-blue-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}
                              >
                                {session.status}
                              </span>
                            </div>
                            <p className='text-xs text-muted-foreground mt-1'>
                              {session.soundsPlayed} reminder
                              {session.soundsPlayed !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-sm font-semibold'>
                              {formatDuration(session.duration)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </ProFeatureLock>
      </div>
    </div>
  );
}
