/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Habit,
  DailyLog,
  formatDateKey,
  calculateStreak,
  calculateOverallLifestyleStreak,
  getMilestoneMessage,
} from './utils/streakLogic';
import {
  DEFAULT_HABITS,
  INITIAL_NOTIFICATIONS,
  generateInitialLogs,
  generateInitialTodos,
  AppNotificationItem,
} from './data/defaultData';
import { TodoItem } from './types/todo';
import { Header, NavTab } from './components/Header';
import { OverallStatsBanner } from './components/OverallStatsBanner';
import { TodoListTracker } from './components/TodoListTracker';
import { HabitCard } from './components/HabitCard';
import { CalendarHeatmap } from './components/CalendarHeatmap';
import { ActivityJournal } from './components/ActivityJournal';
import { ActiveTimerModal } from './components/ActiveTimerModal';
import { NotificationModal } from './components/NotificationModal';
import { AddEditHabitModal } from './components/AddEditHabitModal';
import {
  playChimeSound,
  playFanfareSound,
  sendBrowserNotification,
  flashTabNotification,
  unlockAudio,
} from './utils/audioAndNotifications';
import confetti from 'canvas-confetti';
import { RotateCcw, Plus, Bell, AlertTriangle, Feather, Flame } from 'lucide-react';

const STORAGE_KEYS = {
  HABITS: 'chronos_habits_v4',
  LOGS: 'chronos_logs_v4',
  TODOS: 'chronos_todos_v4',
  NOTIFICATIONS: 'chronos_notifications_v4',
  SOUND: 'chronos_sound_v4',
};

export default function App() {
  const todayKey = useMemo(() => formatDateKey(new Date()), []);

  // 1. Habits State
  const [habits, setHabits] = useState<Habit[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_HABITS;
  });

  // 2. Logs State
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateInitialLogs(todayKey);
  });

  // 3. Todos State (Primary To-Do List)
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TODOS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateInitialTodos(todayKey);
  });

  // 4. Notifications State
  const [notifications, setNotifications] = useState<AppNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_NOTIFICATIONS;
  });

  // 5. Sound & Navigation State (Default to 'todo'!)
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (saved !== null) return JSON.parse(saved);
    } catch {}
    return true;
  });

  const [activeTab, setActiveTab] = useState<NavTab>('todo');
  const [activeTimerHabit, setActiveTimerHabit] = useState<Habit | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [bannerToast, setBannerToast] = useState<{ title: string; desc: string } | null>(null);

  // Persistence
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch {}
  }, [habits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(dailyLogs));
    } catch {}
  }, [dailyLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todos));
    } catch {}
  }, [todos]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch {}
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  // Periodic Reminder Checker
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentHoursMins = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;

      habits.forEach((habit) => {
        if (habit.reminderEnabled && habit.reminderTime === currentHoursMins) {
          const log = dailyLogs.find((l) => l.date === todayKey && l.habitId === habit.id);
          if (!log || !log.completed) {
            const notifTitle = `Reminder: ${habit.name}`;
            const notifMsg = `Time for your daily ${habit.targetMinutes} minutes! Keep your quiet momentum.`;

            sendBrowserNotification(notifTitle, { body: notifMsg });
            flashTabNotification(`Reminder: ${habit.name}`);
            if (soundEnabled) playChimeSound();

            addNotification(notifTitle, notifMsg, 'reminder');
          }
        }
      });
    };

    const interval = setInterval(checkReminders, 25000);
    return () => clearInterval(interval);
  }, [habits, dailyLogs, todayKey, soundEnabled]);

  // Computed Streaks
  const overallStreak = useMemo(() => {
    return calculateOverallLifestyleStreak(habits, dailyLogs, todayKey);
  }, [habits, dailyLogs, todayKey]);

  const habitStreaks = useMemo(() => {
    const map: Record<string, ReturnType<typeof calculateStreak>> = {};
    for (const h of habits) {
      map[h.id] = calculateStreak(h.id, dailyLogs, todayKey);
    }
    return map;
  }, [habits, dailyLogs, todayKey]);

  // Today's summary numbers
  const todayLogs = useMemo(() => {
    return dailyLogs.filter((l) => l.date === todayKey);
  }, [dailyLogs, todayKey]);

  const completedTodayCount = useMemo(() => {
    return habits.filter((h) => {
      const log = todayLogs.find((l) => l.habitId === h.id);
      return log?.completed;
    }).length;
  }, [habits, todayLogs]);

  const totalMinutesToday = useMemo(() => {
    return todayLogs.reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);
  }, [todayLogs]);

  const allTimeMinutes = useMemo(() => {
    return dailyLogs.reduce((acc, curr) => acc + (curr.minutesSpent || 0), 0);
  }, [dailyLogs]);

  // Notification helper
  const addNotification = (
    title: string,
    message: string,
    type: AppNotificationItem['type'] = 'system'
  ) => {
    const newItem: AppNotificationItem = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications((prev) => [newItem, ...prev.slice(0, 30)]);

    setBannerToast({ title, desc: message });
    setTimeout(() => {
      setBannerToast(null);
    }, 4500);
  };

  // --- TO-DO LIST INTERACTIONS ---

  const handleToggleTodo = (todoId: string) => {
    unlockAudio();
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    const willBeCompleted = !todo.completed;
    const newMinutesSpent = willBeCompleted
      ? Math.max(todo.minutesSpent, todo.targetMinutes || 0)
      : todo.minutesSpent;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              completed: willBeCompleted,
              minutesSpent: newMinutesSpent,
              subtasks: willBeCompleted
                ? t.subtasks.map((st) => ({ ...st, completed: true }))
                : t.subtasks,
            }
          : t
      )
    );

    if (todo.habitId) {
      handleToggleComplete(todo.habitId);
    } else {
      if (willBeCompleted) {
        if (soundEnabled) playChimeSound();
        addNotification(`✓ Completed Practice`, `Fulfillled: "${todo.title}"`, 'system');
      }
    }
  };

  const handleAddTodo = (newTodoData: Omit<TodoItem, 'id' | 'createdAt'>) => {
    const newTodo: TodoItem = {
      ...newTodoData,
      id: `todo-${Date.now()}`,
      createdAt: todayKey,
    };
    setTodos((prev) => [newTodo, ...prev]);
    addNotification('Practice Added', `"${newTodo.title}" added to today's list.`);
  };

  const handleDeleteTodo = (todoId: string) => {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    setTodos((prev) => prev.filter((t) => t.id !== todoId));
    addNotification('Practice Removed', `Removed "${todo.title}".`);
  };

  const handleAddMinutesToTodo = (todoId: string, minutes: number) => {
    unlockAudio();
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;

    if (soundEnabled) playChimeSound();

    const newMins = todo.minutesSpent + minutes;
    const autoDone = todo.targetMinutes > 0 && newMins >= todo.targetMinutes;

    setTodos((prev) =>
      prev.map((t) =>
        t.id === todoId
          ? {
              ...t,
              minutesSpent: newMins,
              completed: t.completed || autoDone,
            }
          : t
      )
    );

    if (todo.habitId) {
      handleAddMinutes(todo.habitId, minutes);
    } else {
      addNotification(`+${minutes}m Logged`, `"${todo.title}" total: ${newMins}m`);
    }
  };

  const handleToggleSubtask = (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((t) => {
        if (t.id !== todoId) return t;
        const newSubtasks = t.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, completed: !st.completed } : st
        );
        const allDone = newSubtasks.length > 0 && newSubtasks.every((st) => st.completed);
        return {
          ...t,
          subtasks: newSubtasks,
          completed: allDone || t.completed,
        };
      })
    );
  };

  const handleAddSubtask = (todoId: string, subtaskTitle: string) => {
    const newSubtask = {
      id: `st-${Date.now()}`,
      title: subtaskTitle,
      completed: false,
    };
    setTodos((prev) =>
      prev.map((t) => (t.id === todoId ? { ...t, subtasks: [...t.subtasks, newSubtask] } : t))
    );
  };

  const handleStartTimerForTodo = (todo: TodoItem) => {
    unlockAudio();
    if (todo.habitId) {
      const h = habits.find((item) => item.id === todo.habitId);
      if (h) {
        setActiveTimerHabit(h);
        return;
      }
    }
    setActiveTimerHabit({
      id: todo.id,
      name: todo.title,
      category: todo.category,
      color: 'amber',
      icon: 'CheckSquare',
      targetMinutes: todo.targetMinutes || 20,
      description: `Devoted time to: ${todo.title}`,
      reminderTime: '09:00',
      reminderEnabled: false,
      createdAt: todayKey,
    });
  };

  const handleUpdateTodoNotes = (todoId: string, notes: string) => {
    setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, notes } : t)));
    const todo = todos.find((t) => t.id === todoId);
    if (todo?.habitId) {
      handleUpdateNotes(todo.habitId, notes);
    }
  };

  // --- HABIT CARD ACTIONS ---

  const handleToggleComplete = (habitId: string) => {
    unlockAudio();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    const existingLog = dailyLogs.find((l) => l.date === todayKey && l.habitId === habitId);
    const willBeCompleted = !existingLog?.completed;

    let updatedLogs: DailyLog[];

    if (existingLog) {
      updatedLogs = dailyLogs.map((l) => {
        if (l.date === todayKey && l.habitId === habitId) {
          const newCompleted = !l.completed;
          const newMinutes = newCompleted
            ? Math.max(l.minutesSpent, habit.targetMinutes)
            : l.minutesSpent;
          return {
            ...l,
            completed: newCompleted,
            minutesSpent: newMinutes,
          };
        }
        return l;
      });
    } else {
      updatedLogs = [
        ...dailyLogs,
        {
          date: todayKey,
          habitId,
          completed: true,
          minutesSpent: habit.targetMinutes,
        },
      ];
    }

    setDailyLogs(updatedLogs);

    setTodos((prev) =>
      prev.map((t) =>
        t.habitId === habitId
          ? {
              ...t,
              completed: willBeCompleted,
              minutesSpent: willBeCompleted
                ? Math.max(t.minutesSpent, habit.targetMinutes)
                : t.minutesSpent,
            }
          : t
      )
    );

    if (willBeCompleted) {
      if (soundEnabled) playChimeSound();

      const otherHabitsDone = habits
        .filter((h) => h.id !== habitId)
        .every((h) => {
          const l = updatedLogs.find((item) => item.date === todayKey && item.habitId === h.id);
          return l?.completed;
        });

      if (otherHabitsDone) {
        if (soundEnabled) setTimeout(() => playFanfareSound(), 300);
        confetti({
          particleCount: 85,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#e29d52', '#78b394', '#a79cd9', '#b85d56'],
        });

        const newStreakVal = overallStreak.currentStreak + (overallStreak.isCompletedToday ? 0 : 1);
        const milestoneMsg = getMilestoneMessage(newStreakVal);

        addNotification(
          'All Daily Practices Fulfillled Today',
          milestoneMsg || `You completed your 20m learning, reading & exercise rhythm. Streak is ${newStreakVal} days!`,
          'streak'
        );
      } else {
        addNotification(
          `✓ ${habit.name} Fulfillled`,
          `20 focused minutes logged for today.`,
          'timer'
        );
      }
    }
  };

  const handleAddMinutes = (habitId: string, additionalMinutes: number) => {
    unlockAudio();
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    if (soundEnabled) playChimeSound();

    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === todayKey && l.habitId === habitId);
      if (existing) {
        const newMinutes = existing.minutesSpent + additionalMinutes;
        const autoCompleted = newMinutes >= habit.targetMinutes;
        return prev.map((l) =>
          l.date === todayKey && l.habitId === habitId
            ? { ...l, minutesSpent: newMinutes, completed: l.completed || autoCompleted }
            : l
        );
      } else {
        const autoCompleted = additionalMinutes >= habit.targetMinutes;
        return [
          ...prev,
          {
            date: todayKey,
            habitId,
            minutesSpent: additionalMinutes,
            completed: autoCompleted,
          },
        ];
      }
    });

    setTodos((prev) =>
      prev.map((t) => {
        if (t.habitId === habitId) {
          const newM = t.minutesSpent + additionalMinutes;
          return {
            ...t,
            minutesSpent: newM,
            completed: t.completed || (t.targetMinutes > 0 && newM >= t.targetMinutes),
          };
        }
        return t;
      })
    );

    addNotification(
      `+${additionalMinutes}m Logged: ${habit.name}`,
      `Total today: ${(todayLogs.find((l) => l.habitId === habitId)?.minutesSpent || 0) + additionalMinutes} min`,
      'timer'
    );
  };

  const handleUpdateNotes = (habitId: string, notes: string) => {
    setDailyLogs((prev) => {
      const existing = prev.find((l) => l.date === todayKey && l.habitId === habitId);
      if (existing) {
        return prev.map((l) =>
          l.date === todayKey && l.habitId === habitId ? { ...l, notes } : l
        );
      } else {
        return [
          ...prev,
          {
            date: todayKey,
            habitId,
            minutesSpent: 0,
            completed: false,
            notes,
          },
        ];
      }
    });
  };

  const handleFinishTimerSession = (habitId: string, minutes: number, notes?: string) => {
    unlockAudio();
    const habit = habits.find((h) => h.id === habitId);

    if (habit) {
      setDailyLogs((prev) => {
        const existing = prev.find((l) => l.date === todayKey && l.habitId === habitId);
        const newMinutes = (existing?.minutesSpent || 0) + minutes;
        const autoCompleted = newMinutes >= habit.targetMinutes;
        const combinedNotes = notes
          ? existing?.notes
            ? `${existing.notes} | ${notes}`
            : notes
          : existing?.notes;

        if (existing) {
          return prev.map((l) =>
            l.date === todayKey && l.habitId === habitId
              ? {
                  ...l,
                  minutesSpent: newMinutes,
                  completed: l.completed || autoCompleted,
                  notes: combinedNotes,
                }
              : l
          );
        } else {
          return [
            ...prev,
            {
              date: todayKey,
              habitId,
              minutesSpent: newMinutes,
              completed: autoCompleted,
              notes: combinedNotes,
            },
          ];
        }
      });
    }

    setTodos((prev) =>
      prev.map((t) => {
        if (t.habitId === habitId || t.id === habitId) {
          const newM = t.minutesSpent + minutes;
          return {
            ...t,
            minutesSpent: newM,
            completed: true,
            notes: notes || t.notes,
          };
        }
        return t;
      })
    );

    addNotification(
      `Session Logged: ${habit?.name || 'Practice'}`,
      `Recorded ${minutes} focused minutes. ${notes ? `Note: "${notes}"` : ''}`,
      'timer'
    );
  };

  const handleSaveHabit = (habitData: Partial<Habit> & { name: string; targetMinutes: number }) => {
    if (editingHabit) {
      setHabits((prev) =>
        prev.map((h) => (h.id === editingHabit.id ? ({ ...h, ...habitData } as Habit) : h))
      );
      addNotification('Habit Updated', `Changes to "${habitData.name}" have been saved.`);
    } else {
      const newHabit: Habit = {
        id: `habit-${Date.now()}`,
        name: habitData.name,
        targetMinutes: habitData.targetMinutes || 20,
        category: habitData.category || 'learning',
        color: habitData.color || 'amber',
        icon: 'Sparkles',
        description: habitData.description || `Daily ${habitData.targetMinutes}m devotion`,
        reminderTime: habitData.reminderTime || '09:00',
        reminderEnabled: true,
        createdAt: todayKey,
      };
      setHabits((prev) => [...prev, newHabit]);

      setTodos((prev) => [
        {
          id: `todo-${newHabit.id}`,
          habitId: newHabit.id,
          title: `${newHabit.targetMinutes}m ${newHabit.name}`,
          category: newHabit.category,
          completed: false,
          targetMinutes: newHabit.targetMinutes,
          minutesSpent: 0,
          date: todayKey,
          priority: 'high',
          subtasks: [],
          createdAt: todayKey,
        },
        ...prev,
      ]);

      addNotification('Practice Added', `Started tracking "${newHabit.name}".`);
    }
    setEditingHabit(null);
  };

  const handleDeleteHabit = (habitId: string) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setTodos((prev) => prev.filter((t) => t.habitId !== habitId));
    addNotification('Habit Removed', `"${habit.name}" removed from routine.`);
  };

  const handleUpdateHabitReminder = (habitId: string, reminderTime: string, enabled: boolean) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === habitId ? { ...h, reminderTime, reminderEnabled: enabled } : h))
    );
  };

  const handlePerformReset = (mode: 'sample' | 'blank') => {
    setShowResetConfirmModal(false);
    if (mode === 'sample') {
      const freshLogs = generateInitialLogs(todayKey);
      const freshTodos = generateInitialTodos(todayKey);
      setHabits(DEFAULT_HABITS);
      setDailyLogs(freshLogs);
      setTodos(freshTodos);
      setNotifications(INITIAL_NOTIFICATIONS);
      addNotification('Ledger Restored', 'Sample 10-day active streak restored.');
    } else {
      setHabits(DEFAULT_HABITS);
      setDailyLogs([]);
      setTodos(
        DEFAULT_HABITS.map((h) => ({
          id: `todo-${h.id}-fresh`,
          habitId: h.id,
          title: `20 min ${h.name}`,
          category: h.category,
          completed: false,
          targetMinutes: 20,
          minutesSpent: 0,
          date: todayKey,
          priority: 'high',
          subtasks: [],
          createdAt: todayKey,
        }))
      );
      setNotifications([
        {
          id: 'fresh-start',
          title: 'Day One',
          message: 'Welcome to your clean slate. Twenty quiet minutes for learning, reading, and moving.',
          type: 'system',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        },
      ]);
      addNotification('Day One Begun', 'All records cleared. Welcome to Day 1.');
    }
  };

  const handleQuickTimer = () => {
    unlockAudio();
    const pendingHabit =
      habits.find((h) => {
        const log = todayLogs.find((l) => l.habitId === h.id);
        return !log?.completed;
      }) || habits[0];
    if (pendingHabit) setActiveTimerHabit(pendingHabit);
  };

  const handleTestAlertNow = () => {
    unlockAudio();
    if (soundEnabled) playChimeSound();
    flashTabNotification('Time for 20m Learning');
    sendBrowserNotification('Chronos Daily Reminder', {
      body: 'Ready for 20 minutes of learning or reading? Your streak is counting on you!',
    });
    addNotification(
      'Daily Reminder Chime',
      'Harmonic chime sounded and tab alert signaled.',
      'reminder'
    );
  };

  return (
    <div className="min-h-screen bg-red-dark text-white flex flex-col font-sans selection:bg-red-600/40 selection:text-white">
      {/* Toast Notification Popup */}
      {bannerToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-xl bg-[#101017] border border-red-500/60 p-4 shadow-2xl shadow-red-950/60 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-900/60 flex items-center justify-center text-red-500 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-serif font-bold text-white">{bannerToast.title}</h4>
            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{bannerToast.desc}</p>
          </div>
          <button
            onClick={() => setBannerToast(null)}
            className="text-slate-500 hover:text-white text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        overallStreak={overallStreak}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenAddHabit={() => {
          setEditingHabit(null);
          setIsAddEditModalOpen(true);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onStartQuickTimer={handleQuickTimer}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner with Progress Rings & Overall Streak */}
        <OverallStatsBanner
          overallStreak={overallStreak}
          completedTodayCount={completedTodayCount}
          totalHabitsCount={habits.length}
          totalMinutesToday={totalMinutesToday}
          allTimeMinutes={allTimeMinutes}
          onOpenNotifications={() => setIsNotificationModalOpen(true)}
        />

        {/* Tab 1: Daily To-Do List Tracker (PRIMARY VIEW) */}
        {activeTab === 'todo' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
                  <span>Daily Practices</span>
                  <span className="font-serif italic text-xs text-red-400">
                    · {todayKey}
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Check off each practice as you complete it. Showing up for twenty minutes keeps your momentum alive.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleTestAlertNow}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-xs text-white font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Test chime sound and browser tab notification"
                >
                  <Bell className="w-3.5 h-3.5 text-red-500" />
                  Test Chime
                </button>
                <button
                  onClick={() => setIsNotificationModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#12121b] hover:bg-[#1a1a26] border border-[#262638] text-xs text-slate-300 hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Reminders
                </button>
              </div>
            </div>

            {/* The To-Do List Component */}
            <TodoListTracker
              todos={todos}
              habits={habits}
              habitStreaks={habitStreaks}
              onToggleTodo={handleToggleTodo}
              onAddTodo={handleAddTodo}
              onDeleteTodo={handleDeleteTodo}
              onAddMinutesToTodo={handleAddMinutesToTodo}
              onToggleSubtask={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onStartTimerForTodo={handleStartTimerForTodo}
              onUpdateTodoNotes={handleUpdateTodoNotes}
              todayKey={todayKey}
            />

            {/* Quiet Red-Dark Note */}
            <div className="p-4 rounded-xl bg-[#101017] border border-[#262638] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Flame className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-serif italic text-slate-200">
                  "Small daily efforts compound quietly into mastery. Twenty minutes is enough to change your mind and body."
                </span>
              </div>
              <button
                onClick={handleQuickTimer}
                className="text-red-400 hover:text-red-300 font-bold underline shrink-0 cursor-pointer"
              >
                Start 20m focus timer →
              </button>
            </div>
          </section>
        )}

        {/* Tab 2: Pillar Cards View */}
        {activeTab === 'cards' && (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                  Lifestyle Pillars
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Individual study, reading, and fitness pillars with timers and log history.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingHabit(null);
                    setIsAddEditModalOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-md shadow-red-950/60 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Custom Pillar
                </button>
              </div>
            </div>

            {/* Grid of Habit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {habits.map((habit) => {
                const log = todayLogs.find((l) => l.habitId === habit.id);
                const streak = habitStreaks[habit.id] || {
                  currentStreak: 0,
                  bestStreak: 0,
                  isCompletedToday: false,
                  lastCompletedDate: null,
                  totalDaysCompleted: 0,
                  totalMinutes: 0,
                };

                return (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    log={log}
                    streak={streak}
                    onToggleComplete={handleToggleComplete}
                    onAddMinutes={handleAddMinutes}
                    onUpdateNotes={handleUpdateNotes}
                    onStartTimer={(h) => setActiveTimerHabit(h)}
                    onEditHabit={(h) => {
                      setEditingHabit(h);
                      setIsAddEditModalOpen(true);
                    }}
                    onDeleteHabit={handleDeleteHabit}
                  />
                );
              })}
            </div>
          </section>
        )}

        {/* Tab 3: Consistency Heatmap Matrix */}
        {activeTab === 'heatmap' && (
          <section className="space-y-6">
            <CalendarHeatmap habits={habits} dailyLogs={dailyLogs} todayKey={todayKey} />
          </section>
        )}

        {/* Tab 4: Daily Activity & Reflection Journal */}
        {activeTab === 'journal' && (
          <section className="space-y-6">
            <ActivityJournal habits={habits} dailyLogs={dailyLogs} />
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1e1e2d] bg-[#09090d] py-6 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-white">Chronos</span>
            <span className="text-red-500">·</span>
            <span>Red & Dark Edition</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Configure Reminders
            </button>
            <button
              onClick={() => setShowResetConfirmModal(true)}
              className="hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset / Start Fresh
            </button>
          </div>
        </div>
      </footer>

      {/* Reset Confirmation In-App Modal (Safe for iframes) */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-[#0d0d14] border border-red-950/80 p-6 text-center space-y-4 shadow-2xl red-glow">
            <div className="w-12 h-12 rounded-xl bg-red-950/40 border border-red-900/60 text-red-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg font-bold text-white">Reset Tracker Data</h3>
            <p className="text-xs text-slate-400">
              Choose how you want to reset your daily practice ledger.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => handlePerformReset('blank')}
                className="w-full py-2.5 rounded-xl bg-[#14141f] hover:bg-[#1c1c2a] border border-[#262638] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Start Clean From Scratch (Day 1)
              </button>
              <button
                onClick={() => handlePerformReset('sample')}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors shadow-md shadow-red-950/60 cursor-pointer"
              >
                Load Realistic 10-Day Sample Streak
              </button>
              <button
                onClick={() => setShowResetConfirmModal(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Focus Countdown Timer Modal */}
      {activeTimerHabit && (
        <ActiveTimerModal
          habit={activeTimerHabit}
          onClose={() => setActiveTimerHabit(null)}
          onFinishSession={handleFinishTimerSession}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Notifications & Reminders Center Modal */}
      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notifications={notifications}
        onClearNotifications={() => setNotifications([])}
        onAddNotification={addNotification}
        habits={habits}
        onUpdateHabitReminder={handleUpdateHabitReminder}
        soundEnabled={soundEnabled}
      />

      {/* Add or Edit Habit Modal */}
      <AddEditHabitModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingHabit(null);
        }}
        onSaveHabit={handleSaveHabit}
        initialHabit={editingHabit}
      />
    </div>
  );
}
