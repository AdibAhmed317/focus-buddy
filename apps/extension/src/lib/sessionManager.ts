// Types for focus session tracking
export interface FocusSession {
  id: string;
  startTime: number; // Unix timestamp
  endTime: number | null; // Unix timestamp or null if ongoing
  duration: number; // Duration in milliseconds
  soundsPlayed: number; // Number of focus reminders during session
  status: 'active' | 'paused' | 'completed' | 'cancelled';
}

export interface SessionStats {
  totalSessions: number;
  totalFocusTime: number; // milliseconds
  longestSession: number; // milliseconds
  currentStreak: number; // consecutive days with at least one session
  todayFocusTime: number; // milliseconds
  weekFocusTime: number; // milliseconds
}

// Session manager for background script
export class SessionManager {
  private currentSession: FocusSession | null = null;
  private readonly STORAGE_KEY = 'focusSessions';
  private readonly MAX_SESSIONS = 1000; // Keep last 1000 sessions

  async startSession(): Promise<FocusSession> {
    const session: FocusSession = {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      soundsPlayed: 0,
      status: 'active',
    };

    this.currentSession = session;
    await this.saveSessions();
    return session;
  }

  async pauseSession(): Promise<void> {
    if (this.currentSession && this.currentSession.status === 'active') {
      this.currentSession.status = 'paused';
      this.currentSession.duration = Date.now() - this.currentSession.startTime;
      await this.saveSessions();
    }
  }

  async resumeSession(): Promise<void> {
    if (this.currentSession && this.currentSession.status === 'paused') {
      this.currentSession.status = 'active';
      // Adjust start time to account for pause
      this.currentSession.startTime = Date.now() - this.currentSession.duration;
      await this.saveSessions();
    }
  }

  async incrementSoundCount(): Promise<void> {
    if (this.currentSession) {
      this.currentSession.soundsPlayed++;
      await this.saveSessions();
    }
  }

  async endSession(
    status: 'completed' | 'cancelled' = 'completed',
  ): Promise<FocusSession | null> {
    if (!this.currentSession) return null;

    this.currentSession.endTime = Date.now();
    this.currentSession.duration =
      this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.status = status;

    const completedSession = { ...this.currentSession };
    this.currentSession = null;

    await this.saveSessions();
    return completedSession;
  }

  getCurrentSession(): FocusSession | null {
    return this.currentSession;
  }

  async getSessions(): Promise<FocusSession[]> {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEY]);
      return result[this.STORAGE_KEY] || [];
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  async getStats(): Promise<SessionStats> {
    const sessions = await this.getSessions();
    const completedSessions = sessions.filter((s) => s.status === 'completed');

    const totalSessions = completedSessions.length;
    const totalFocusTime = completedSessions.reduce(
      (sum, s) => sum + s.duration,
      0,
    );
    const longestSession = Math.max(
      ...completedSessions.map((s) => s.duration),
      0,
    );

    // Calculate today's focus time
    const todayStart = new Date().setHours(0, 0, 0, 0);
    const todayFocusTime = completedSessions
      .filter((s) => s.startTime >= todayStart)
      .reduce((sum, s) => sum + s.duration, 0);

    // Calculate this week's focus time
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekFocusTime = completedSessions
      .filter((s) => s.startTime >= weekStart.getTime())
      .reduce((sum, s) => sum + s.duration, 0);

    // Calculate streak
    const currentStreak = this.calculateStreak(completedSessions);

    return {
      totalSessions,
      totalFocusTime,
      longestSession,
      currentStreak,
      todayFocusTime,
      weekFocusTime,
    };
  }

  private calculateStreak(sessions: FocusSession[]): number {
    if (sessions.length === 0) return 0;

    // Group sessions by day
    const sessionsByDay = new Map<string, boolean>();
    sessions.forEach((session) => {
      const date = new Date(session.startTime).toDateString();
      sessionsByDay.set(date, true);
    });

    // Check consecutive days from today backwards
    let streak = 0;
    let currentDate = new Date();

    while (true) {
      const dateStr = currentDate.toDateString();
      if (sessionsByDay.has(dateStr)) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        // Allow one day gap only if we haven't started counting yet
        if (
          streak === 0 &&
          currentDate.toDateString() === new Date().toDateString()
        ) {
          currentDate.setDate(currentDate.getDate() - 1);
          continue;
        }
        break;
      }
    }

    return streak;
  }

  private async saveSessions(): Promise<void> {
    try {
      const sessions = await this.getSessions();

      // Add current session if it exists
      let allSessions = sessions;
      if (this.currentSession) {
        // Update or add current session
        const index = sessions.findIndex(
          (s) => s.id === this.currentSession!.id,
        );
        if (index >= 0) {
          allSessions[index] = this.currentSession;
        } else {
          allSessions = [this.currentSession, ...sessions];
        }
      }

      // Keep only recent sessions
      if (allSessions.length > this.MAX_SESSIONS) {
        allSessions = allSessions.slice(0, this.MAX_SESSIONS);
      }

      await chrome.storage.local.set({ [this.STORAGE_KEY]: allSessions });
    } catch (error) {
      console.error('Failed to save sessions:', error);
    }
  }

  async clearHistory(): Promise<void> {
    await chrome.storage.local.set({ [this.STORAGE_KEY]: [] });
    this.currentSession = null;
  }
}
