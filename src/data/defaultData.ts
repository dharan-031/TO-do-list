import { Habit, DailyLog, formatDateKey, shiftDateKey } from '../utils/streakLogic';

export const DEFAULT_HABITS: Habit[] = [
  {
    id: 'learn',
    name: 'Learn Something New',
    category: 'learning',
    color: 'violet',
    icon: 'Sparkles',
    targetMinutes: 20,
    description: 'Dedicate 20 focused minutes to explore new concepts, skills, language, or tech.',
    reminderTime: '09:00',
    reminderEnabled: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'read',
    name: 'Daily Deep Reading',
    category: 'reading',
    color: 'amber',
    icon: 'BookOpen',
    targetMinutes: 20,
    description: 'Read high-signal non-fiction books, essays, or long-form intellectual articles.',
    reminderTime: '14:30',
    reminderEnabled: true,
    createdAt: '2026-10-01',
  },
  {
    id: 'exercise',
    name: 'Body & Physical Exercise',
    category: 'fitness',
    color: 'emerald',
    icon: 'Dumbbell',
    targetMinutes: 20,
    description: 'HIIT, strength training, calisthenics, running, or active mobility work.',
    reminderTime: '18:00',
    reminderEnabled: true,
    createdAt: '2026-10-01',
  },
];

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'streak' | 'reminder' | 'milestone' | 'timer' | 'system';
  timestamp: string;
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Welcome to Chronos Tracker',
    message: 'Your 3 core lifestyle habits are primed: 20 min learning, reading, and fitness.',
    type: 'system',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
  },
  {
    id: 'notif-2',
    title: 'Daily Streak Fuel',
    message: 'Complete all 3 habits today to keep your Overall Lifestyle Streak glowing!',
    type: 'streak',
    timestamp: 'Today at 08:00',
    read: false,
  },
];

/**
 * Generates an engaging initial dataset so the user has immediate streak and heatmap visualization
 */
export function generateInitialLogs(todayKey: string): DailyLog[] {
  const logs: DailyLog[] = [];

  // Seed 14 days of realistic historical activity leading up to yesterday
  const historicalTopics = [
    { habit: 'learn', notes: ['Quantum Computing basics', 'TypeScript 5.8 features', 'Spanish vocabulary drill', 'System architecture patterns', 'Cognitive psychology bias', 'AI Prompt engineering heuristics'] },
    { habit: 'read', notes: ['Thinking, Fast and Slow (Ch. 3-4)', 'Atomic Habits (Law 3)', 'Deep Work by Cal Newport', 'The Psychology of Money', 'Meditations by Marcus Aurelius', 'Sapiens (The Scientific Revolution)'] },
    { habit: 'exercise', notes: ['Zone 2 Cardio Run 3.5km', 'Full Body Dumbbell Circuit', 'Core & Mobility Yoga Flow', 'Kettlebell Swings & Pushups', 'Calisthenics & Pullups', 'High Intensity Interval Training'] }
  ];

  for (let i = 14; i >= 1; i--) {
    const dKey = shiftDateKey(todayKey, -i);
    // Let's create an awesome 10-day active streak from day -10 to day -1
    const isActiveStreakDay = i <= 10;

    if (isActiveStreakDay) {
      // All 3 completed!
      logs.push(
        {
          date: dKey,
          habitId: 'learn',
          completed: true,
          minutesSpent: 20 + (i % 3) * 5,
          notes: historicalTopics[0].notes[i % historicalTopics[0].notes.length],
        },
        {
          date: dKey,
          habitId: 'read',
          completed: true,
          minutesSpent: 20 + (i % 2) * 10,
          notes: historicalTopics[1].notes[i % historicalTopics[1].notes.length],
        },
        {
          date: dKey,
          habitId: 'exercise',
          completed: true,
          minutesSpent: 25 + (i % 2) * 5,
          notes: historicalTopics[2].notes[i % historicalTopics[2].notes.length],
        }
      );
    } else if (i === 12 || i === 13) {
      // partial days
      logs.push(
        {
          date: dKey,
          habitId: 'learn',
          completed: true,
          minutesSpent: 20,
          notes: 'Algorithms refresher',
        },
        {
          date: dKey,
          habitId: 'exercise',
          completed: true,
          minutesSpent: 20,
          notes: 'Quick stretch & bodyweight session',
        }
      );
    }
  }

  // Today's initial state: reading already completed with 20m, learning and exercise ready to track!
  logs.push({
    date: todayKey,
    habitId: 'read',
    completed: true,
    minutesSpent: 20,
    notes: 'Read "Atomic Habits" - The 4 Laws of Behavior Change',
  });

  return logs;
}

export function generateInitialTodos(todayKey: string): import('../types/todo').TodoItem[] {
  return [
    {
      id: 'todo-learn-today',
      habitId: 'learn',
      title: '20 min Learning: Explore New Concept',
      category: 'learning',
      completed: false,
      targetMinutes: 20,
      minutesSpent: 0,
      date: todayKey,
      priority: 'high',
      subtasks: [
        { id: 'st-1', title: '10m Focus on technical concept / language', completed: false },
        { id: 'st-2', title: '10m Active recall & note synthesis', completed: false },
      ],
      createdAt: todayKey,
    },
    {
      id: 'todo-read-today',
      habitId: 'read',
      title: '20 min Deep Reading: Non-Fiction Book',
      category: 'reading',
      completed: true,
      targetMinutes: 20,
      minutesSpent: 20,
      date: todayKey,
      priority: 'high',
      notes: 'Read "Atomic Habits" - The 4 Laws of Behavior Change',
      subtasks: [
        { id: 'st-3', title: 'Read Chapter 4 & 5', completed: true },
        { id: 'st-4', title: 'Highlight 3 actionable insights', completed: true },
      ],
      createdAt: todayKey,
    },
    {
      id: 'todo-exercise-today',
      habitId: 'exercise',
      title: '20 min Fitness & Exercise: HIIT & Strength',
      category: 'fitness',
      completed: false,
      targetMinutes: 20,
      minutesSpent: 0,
      date: todayKey,
      priority: 'high',
      subtasks: [
        { id: 'st-5', title: '5m Dynamic warmup & stretching', completed: false },
        { id: 'st-6', title: '15m Dumbbell circuit or cardio intervals', completed: false },
      ],
      createdAt: todayKey,
    },
  ];
}
