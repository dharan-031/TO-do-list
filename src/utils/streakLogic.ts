export interface DailyLog {
  date: string; // YYYY-MM-DD
  habitId: string;
  completed: boolean;
  minutesSpent: number;
  notes?: string;
  sessions?: Array<{
    id: string;
    timestamp: string;
    minutes: number;
    note?: string;
  }>;
}

export interface Habit {
  id: string;
  name: string;
  category: 'learning' | 'reading' | 'fitness' | 'wellness' | 'productivity' | 'custom' | 'task';
  color: string;
  icon: string;
  targetMinutes: number;
  description: string;
  reminderTime: string;
  reminderEnabled: boolean;
  createdAt: string;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  totalDaysCompleted: number;
  totalMinutes: number;
  isCompletedToday: boolean;
}

/**
 * Format a Date to YYYY-MM-DD in local time
 */
export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add or subtract days from a YYYY-MM-DD date string
 */
export function shiftDateKey(dateKey: string, deltaDays: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + deltaDays);
  return formatDateKey(date);
}

/**
 * Calculate streak for a single habit based on dailyLogs
 */
export function calculateStreak(habitId: string, logs: DailyLog[], todayKey: string): StreakInfo {
  const habitLogs = logs.filter((l) => l.habitId === habitId && l.completed);
  
  // Set of dates where habit was completed
  const completedDateSet = new Set(habitLogs.map((l) => l.date));
  const isCompletedToday = completedDateSet.has(todayKey);

  const totalDaysCompleted = completedDateSet.size;
  const totalMinutes = logs
    .filter((l) => l.habitId === habitId)
    .reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);

  // Find last completed date
  const sortedDates = Array.from(completedDateSet).sort();
  const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  // Calculate current streak:
  // If completed today, start counting backward from today.
  // If not completed today, start checking from yesterday.
  let currentStreak = 0;
  let checkDate = isCompletedToday ? todayKey : shiftDateKey(todayKey, -1);

  while (completedDateSet.has(checkDate)) {
    currentStreak++;
    checkDate = shiftDateKey(checkDate, -1);
  }

  // Calculate best/longest historical streak
  let bestStreak = 0;
  if (sortedDates.length > 0) {
    let runningStreak = 1;
    bestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const expectedNext = shiftDateKey(prevDate, 1);

      if (currDate === expectedNext) {
        runningStreak++;
        if (runningStreak > bestStreak) {
          bestStreak = runningStreak;
        }
      } else if (currDate !== prevDate) {
        runningStreak = 1;
      }
    }
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return {
    currentStreak,
    bestStreak,
    lastCompletedDate,
    totalDaysCompleted,
    totalMinutes,
    isCompletedToday,
  };
}

/**
 * Calculate overall lifestyle streak where ALL core habits were completed on that day
 */
export function calculateOverallLifestyleStreak(
  habits: Habit[],
  logs: DailyLog[],
  todayKey: string
): StreakInfo {
  if (habits.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      lastCompletedDate: null,
      totalDaysCompleted: 0,
      totalMinutes: 0,
      isCompletedToday: false,
    };
  }

  const habitIds = habits.map((h) => h.id);
  const totalMinutes = logs.reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);

  // Group completed habit IDs by date
  const completedHabitsByDate: Record<string, Set<string>> = {};
  for (const log of logs) {
    if (log.completed && habitIds.includes(log.habitId)) {
      if (!completedHabitsByDate[log.date]) {
        completedHabitsByDate[log.date] = new Set();
      }
      completedHabitsByDate[log.date].add(log.habitId);
    }
  }

  // A day qualifies for full lifestyle streak if all habits active on that date were completed
  const fullDays = new Set<string>();
  for (const [date, set] of Object.entries(completedHabitsByDate)) {
    // Require habits that were created on or before this date (or at least the 3 default pillars)
    const activeHabitsOnDate = habits.filter((h) => !h.createdAt || h.createdAt <= date);
    const requiredHabits = activeHabitsOnDate.length > 0 ? activeHabitsOnDate : habits.slice(0, 3);
    const requiredIds = requiredHabits.map((h) => h.id);

    if (requiredIds.length > 0 && requiredIds.every((id) => set.has(id))) {
      fullDays.add(date);
    }
  }

  const isCompletedToday = fullDays.has(todayKey);
  const totalDaysCompleted = fullDays.size;

  const sortedDates = Array.from(fullDays).sort();
  const lastCompletedDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  let currentStreak = 0;
  let checkDate = isCompletedToday ? todayKey : shiftDateKey(todayKey, -1);

  while (fullDays.has(checkDate)) {
    currentStreak++;
    checkDate = shiftDateKey(checkDate, -1);
  }

  let bestStreak = 0;
  if (sortedDates.length > 0) {
    let runningStreak = 1;
    bestStreak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = sortedDates[i - 1];
      const currDate = sortedDates[i];
      const expectedNext = shiftDateKey(prevDate, 1);

      if (currDate === expectedNext) {
        runningStreak++;
        if (runningStreak > bestStreak) {
          bestStreak = runningStreak;
        }
      } else if (currDate !== prevDate) {
        runningStreak = 1;
      }
    }
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  return {
    currentStreak,
    bestStreak,
    lastCompletedDate,
    totalDaysCompleted,
    totalMinutes,
    isCompletedToday,
  };
}

/**
 * Return milestone celebration message if reaching a milestone
 */
export function getMilestoneMessage(streak: number): string | null {
  switch (streak) {
    case 3:
      return '3-Day Spark! Habit momentum is ignited.';
    case 7:
      return '7-Day Warrior! A full unbroken week.';
    case 14:
      return '14-Day Fortitude! Two full weeks of relentless dedication.';
    case 21:
      return '21-Day Habit Master! Neuroplasticity unlocked.';
    case 30:
      return '30-Day Legend! A whole month of personal transformation.';
    case 60:
      return '60-Day Unstoppable! The top 1% discipline mindset.';
    case 100:
      return '100-Day Titan! Century club achieved!';
    default:
      if (streak > 0 && streak % 50 === 0) {
        return `${streak}-Day Champion! Inspiring consistency.`;
      }
      return null;
  }
}

/**
 * Generate calendar heatmap data for the past N days
 */
export function getCalendarHeatmapData(
  habitId: string | 'all',
  logs: DailyLog[],
  daysCount: number,
  todayKey: string
): Array<{ date: string; count: number; minutes: number; level: number }> {
  const result: Array<{ date: string; count: number; minutes: number; level: number }> = [];

  const dateMap: Record<string, { count: number; minutes: number }> = {};
  for (const log of logs) {
    if (habitId === 'all' || log.habitId === habitId) {
      if (!dateMap[log.date]) {
        dateMap[log.date] = { count: 0, minutes: 0 };
      }
      if (log.completed) {
        dateMap[log.date].count++;
      }
      dateMap[log.date].minutes += log.minutesSpent || 0;
    }
  }

  for (let i = daysCount - 1; i >= 0; i--) {
    const dKey = shiftDateKey(todayKey, -i);
    const data = dateMap[dKey] || { count: 0, minutes: 0 };
    
    // Level from 0 to 4 based on completion or minutes
    let level = 0;
    if (habitId === 'all') {
      if (data.count >= 3) level = 4;
      else if (data.count === 2) level = 3;
      else if (data.count === 1) level = 2;
      else if (data.minutes > 0) level = 1;
    } else {
      if (data.count >= 1 && data.minutes >= 20) level = 4;
      else if (data.count >= 1) level = 3;
      else if (data.minutes >= 10) level = 2;
      else if (data.minutes > 0) level = 1;
    }

    result.push({
      date: dKey,
      count: data.count,
      minutes: data.minutes,
      level,
    });
  }

  return result;
}
