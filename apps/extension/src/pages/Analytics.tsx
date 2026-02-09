import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProFeatureLock } from '@/components/ProFeatureLock';
import { usePro } from '@/contexts/ProContext';
import {
  Calendar,
  Clock,
  Flame,
  TrendingUp,
  Trophy,
  ArrowLeft,
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
      <div className='p-4'>
        <h1 className='text-lg font-bold mb-4'>Focus Analytics</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className='bg-background p-3 flex flex-col gap-3 text-sm h-full'>
      <div className='w-full flex-1 overflow-auto min-h-0'>
        <h1 className='text-lg font-semibold mb-4'>Focus Analytics</h1>

        <ProFeatureLock
          featureName='Focus Analytics & History'
          description='Track your focus sessions, view detailed statistics, and see your progress over time.'
          onUpgrade={handleUpgrade}
          isLocked={!isPro}
        >
          {stats && (
            <>
              {/* Stats Grid */}
              <div className='grid grid-cols-1 gap-2 mb-4'>
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Today</CardTitle>
                    <Clock className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    <div className='text-lg font-bold'>
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
                    <div className='text-lg font-bold'>
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
                    <div className='text-lg font-bold'>
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
                    <div className='text-lg font-bold'>
                      {stats.totalSessions}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      Completed sessions
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* All-Time Stats */}
              <Card className='mb-4'>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-base'>
                    <TrendingUp className='h-4 w-4' />
                    All-Time Stats
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Your overall focus journey
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      Total Focus Time
                    </p>
                    <p className='text-lg font-bold'>
                      {formatDuration(stats.totalFocusTime)}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs text-muted-foreground'>
                      Longest Session
                    </p>
                    <p className='text-lg font-bold'>
                      {formatDuration(stats.longestSession)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Recent Sessions</CardTitle>
                  <CardDescription className='text-xs'>
                    Your last 10 focus sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {sessions.length === 0 ? (
                    <p className='text-xs text-muted-foreground'>
                      No sessions yet. Start focusing to see your history!
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {sessions.map((session) => (
                        <div
                          key={session.id}
                          className='flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors'
                        >
                          <div className='flex-1'>
                            <div className='flex items-center gap-2'>
                              <span className='text-xs font-medium'>
                                {formatDate(session.startTime)}
                              </span>
                              <span
                                className={`text-[11px] px-2 py-0.5 rounded-full ${
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
                            <p className='text-[11px] text-muted-foreground mt-0.5'>
                              {session.soundsPlayed} reminder
                              {session.soundsPlayed !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className='text-right'>
                            <p className='text-xs font-semibold'>
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
