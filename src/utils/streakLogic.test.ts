import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDateKey,
  shiftDateKey,
  calculateStreak,
  calculateOverallLifestyleStreak,
  getMilestoneMessage,
  getCalendarHeatmapData,
  Habit,
  DailyLog,
} from './streakLogic';

test('formatDateKey formats date properly', () => {
  const d = new Date(2026, 10, 1); // Month is 0-indexed, so 10 is November
  assert.equal(formatDateKey(d), '2026-11-01');
});

test('shiftDateKey adds and subtracts days accurately', () => {
  assert.equal(shiftDateKey('2026-11-01', 1), '2026-11-02');
  assert.equal(shiftDateKey('2026-11-01', -1), '2026-10-31');
  assert.equal(shiftDateKey('2026-03-01', -1), '2026-02-28');
});

test('calculateStreak returns 0 when no logs exist', () => {
  const result = calculateStreak('learn', [], '2026-11-01');
  assert.equal(result.currentStreak, 0);
  assert.equal(result.bestStreak, 0);
  assert.equal(result.isCompletedToday, false);
});

test('calculateStreak calculates continuous streak up to today', () => {
  const today = '2026-11-01';
  const logs: DailyLog[] = [
    { date: '2026-10-29', habitId: 'learn', completed: true, minutesSpent: 20 },
    { date: '2026-10-30', habitId: 'learn', completed: true, minutesSpent: 25 },
    { date: '2026-10-31', habitId: 'learn', completed: true, minutesSpent: 20 },
    { date: '2026-11-01', habitId: 'learn', completed: true, minutesSpent: 20 },
  ];

  const result = calculateStreak('learn', logs, today);
  assert.equal(result.currentStreak, 4);
  assert.equal(result.bestStreak, 4);
  assert.equal(result.isCompletedToday, true);
  assert.equal(result.totalDaysCompleted, 4);
  assert.equal(result.totalMinutes, 85);
});

test('calculateStreak retains streak from yesterday if not yet completed today', () => {
  const today = '2026-11-01';
  const logs: DailyLog[] = [
    { date: '2026-10-30', habitId: 'read', completed: true, minutesSpent: 20 },
    { date: '2026-10-31', habitId: 'read', completed: true, minutesSpent: 30 },
  ];

  const result = calculateStreak('read', logs, today);
  assert.equal(result.currentStreak, 2);
  assert.equal(result.bestStreak, 2);
  assert.equal(result.isCompletedToday, false);
});

test('calculateStreak breaks when day before yesterday was missed', () => {
  const today = '2026-11-01';
  const logs: DailyLog[] = [
    { date: '2026-10-28', habitId: 'exercise', completed: true, minutesSpent: 30 },
    { date: '2026-10-29', habitId: 'exercise', completed: true, minutesSpent: 30 },
    // 2026-10-30 missed
    // 2026-10-31 missed
  ];

  const result = calculateStreak('exercise', logs, today);
  assert.equal(result.currentStreak, 0);
  assert.equal(result.bestStreak, 2);
  assert.equal(result.isCompletedToday, false);
});

test('calculateOverallLifestyleStreak requires ALL habits to count for the day', () => {
  const habits: Habit[] = [
    {
      id: 'learn',
      name: '20m Learning',
      category: 'learning',
      color: 'indigo',
      icon: 'BookOpen',
      targetMinutes: 20,
      description: 'Learn something new',
      reminderTime: '09:00',
      reminderEnabled: true,
      createdAt: '2026-10-01',
    },
    {
      id: 'read',
      name: 'Reading',
      category: 'reading',
      color: 'amber',
      icon: 'BookMarked',
      targetMinutes: 20,
      description: 'Read a book',
      reminderTime: '14:00',
      reminderEnabled: true,
      createdAt: '2026-10-01',
    },
    {
      id: 'exercise',
      name: 'Exercising',
      category: 'fitness',
      color: 'emerald',
      icon: 'Dumbbell',
      targetMinutes: 20,
      description: 'Workout & sweat',
      reminderTime: '18:00',
      reminderEnabled: true,
      createdAt: '2026-10-01',
    },
  ];

  const today = '2026-11-01';
  const logs: DailyLog[] = [
    // Yesterday: all 3 completed
    { date: '2026-10-31', habitId: 'learn', completed: true, minutesSpent: 20 },
    { date: '2026-10-31', habitId: 'read', completed: true, minutesSpent: 20 },
    { date: '2026-10-31', habitId: 'exercise', completed: true, minutesSpent: 25 },
    // Today: only 2 completed so far
    { date: '2026-11-01', habitId: 'learn', completed: true, minutesSpent: 20 },
    { date: '2026-11-01', habitId: 'read', completed: true, minutesSpent: 20 },
  ];

  const result = calculateOverallLifestyleStreak(habits, logs, today);
  assert.equal(result.isCompletedToday, false);
  assert.equal(result.currentStreak, 1); // From yesterday
});

test('getMilestoneMessage returns milestone titles', () => {
  assert.equal(getMilestoneMessage(7), '7-Day Warrior! A full unbroken week.');
  assert.equal(getMilestoneMessage(21), '21-Day Habit Master! Neuroplasticity unlocked.');
  assert.equal(getMilestoneMessage(4), null);
});

test('getCalendarHeatmapData returns correct number of items', () => {
  const data = getCalendarHeatmapData('all', [], 14, '2026-11-01');
  assert.equal(data.length, 14);
  assert.equal(data[13].date, '2026-11-01');
  assert.equal(data[0].date, '2026-10-19');
});
