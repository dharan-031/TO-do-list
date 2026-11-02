import React, { useState } from 'react';
import { Habit, DailyLog } from '../utils/streakLogic';
import { BookOpen, Sparkles, Dumbbell, Heart, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface ActivityJournalProps {
  habits: Habit[];
  dailyLogs: DailyLog[];
}

export const ActivityJournal: React.FC<ActivityJournalProps> = ({ habits, dailyLogs }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const activeLogs = dailyLogs
    .filter((l) => l.minutesSpent > 0 || l.completed)
    .filter((l) => (selectedFilter === 'all' ? true : l.habitId === selectedFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const logsByDate: Record<string, DailyLog[]> = {};
  for (const log of activeLogs) {
    if (!logsByDate[log.date]) {
      logsByDate[log.date] = [];
    }
    logsByDate[log.date].push(log);
  }

  const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a));

  const getIcon = (category: string) => {
    switch (category) {
      case 'learning':
        return <Sparkles className="w-4 h-4 text-red-400" />;
      case 'reading':
        return <BookOpen className="w-4 h-4 text-red-400" />;
      case 'fitness':
        return <Dumbbell className="w-4 h-4 text-red-400" />;
      default:
        return <Heart className="w-4 h-4 text-red-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Journal Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-[#101017] border border-[#262638]">
        <div>
          <h3 className="font-serif text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-red-500" />
            Daily Practice Journal
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            Reflections, takeaways, and milestones recorded along your path.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-[#09090f] p-1 rounded-xl border border-[#262638]">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedFilter === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Logs
          </button>
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedFilter(h.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedFilter === h.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      {sortedDates.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#101017] border border-[#262638]">
          <p className="font-serif italic text-slate-400 text-sm">No entries recorded for this view.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {sortedDates.map((date) => {
            const dayLogs = logsByDate[date];
            const totalDayMinutes = dayLogs.reduce((acc, curr) => acc + curr.minutesSpent, 0);

            return (
              <div
                key={date}
                className="rounded-2xl bg-[#101017] border border-[#262638] p-5 space-y-4 shadow-sm"
              >
                {/* Date Header */}
                <div className="flex items-baseline justify-between border-b border-[#222232] pb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-base font-bold text-white">{date}</span>
                    <span className="text-xs font-serif italic text-red-400">
                      ({new Date(date).toLocaleDateString('en-US', { weekday: 'long' })})
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-red-400 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-red-500" />
                    <span>{totalDayMinutes} min total</span>
                  </div>
                </div>

                {/* Grid of habits on this day */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {dayLogs.map((log) => {
                    const habit = habits.find((h) => h.id === log.habitId);
                    if (!habit) return null;

                    return (
                      <div
                        key={`${log.date}-${log.habitId}`}
                        className="p-3.5 rounded-xl bg-[#09090f] border border-[#232334] space-y-2 hover:border-red-500/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getIcon(habit.category)}
                            <span className="font-serif font-bold text-sm text-white">
                              {habit.name}
                            </span>
                          </div>
                          {log.completed && (
                            <CheckCircle2 className="w-4 h-4 text-red-500" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                          <span className="text-white font-bold">{log.minutesSpent}</span>
                          <span>/ {habit.targetMinutes}m</span>
                        </div>

                        {log.notes && (
                          <div className="p-2 rounded-lg bg-[#14141f] border border-[#232334] text-xs font-serif italic text-slate-200">
                            "{log.notes}"
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
