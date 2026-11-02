import React, { useState } from 'react';
import { Habit, DailyLog, getCalendarHeatmapData } from '../utils/streakLogic';
import { Calendar as CalendarIcon } from 'lucide-react';

interface CalendarHeatmapProps {
  habits: Habit[];
  dailyLogs: DailyLog[];
  todayKey: string;
}

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  habits,
  dailyLogs,
  todayKey,
}) => {
  const [selectedHabitId, setSelectedHabitId] = useState<string | 'all'>('all');
  const [hoveredDay, setHoveredDay] = useState<{
    date: string;
    count: number;
    minutes: number;
    level: number;
    notes?: string[];
  } | null>(null);

  // 12 weeks = 84 days
  const heatmapData = getCalendarHeatmapData(selectedHabitId, dailyLogs, 84, todayKey);

  // Vivid Crimson & Ruby Red Intensity Scale
  const getColorClass = (level: number) => {
    if (level === 0) return 'bg-[#14141e] border-[#222230]';

    switch (level) {
      case 1:
        return 'bg-[#450a0a] border-[#6b1414] text-red-300';
      case 2:
        return 'bg-[#7f1d1d] border-[#991b1b] text-red-200';
      case 3:
        return 'bg-[#b91c1c] border-[#dc2626] text-white';
      case 4:
        return 'bg-[#ef4444] border-[#f87171] text-white shadow-sm shadow-red-900/50';
      default:
        return 'bg-[#ef4444] border-[#f87171]';
    }
  };

  const weeks: Array<typeof heatmapData> = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const handleMouseEnter = (day: typeof heatmapData[0]) => {
    const dayLogs = dailyLogs.filter(
      (l) => l.date === day.date && (selectedHabitId === 'all' || l.habitId === selectedHabitId) && l.notes
    );
    const notes = dayLogs.map((l) => {
      const h = habits.find((item) => item.id === l.habitId);
      return `${h?.name || 'Habit'}: ${l.notes}`;
    });

    setHoveredDay({
      ...day,
      notes,
    });
  };

  const totalDaysActive = heatmapData.filter((d) => d.count > 0 || d.minutes > 0).length;
  const totalMinutesInWindow = heatmapData.reduce((acc, d) => acc + d.minutes, 0);

  return (
    <div className="rounded-2xl bg-[#101017] border border-[#262638] p-6 shadow-xl space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-red-500" />
            <h3 className="font-serif text-xl font-bold text-white tracking-tight">
              12-Week Consistency Matrix
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 font-sans">
            A visual record of quiet daily devotion over the past 84 days.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1 bg-[#09090f] p-1 rounded-xl border border-[#262638]">
          <button
            onClick={() => setSelectedHabitId('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              selectedHabitId === 'all'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Practices
          </button>
          {habits.map((h) => (
            <button
              key={h.id}
              onClick={() => setSelectedHabitId(h.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                selectedHabitId === h.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {h.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[620px]">
          {/* Weekday Labels & Cells Grid */}
          <div className="flex gap-1.5">
            {/* Days of week column */}
            <div className="flex flex-col justify-between text-[10px] font-mono text-slate-500 pr-2 pt-5 pb-1 select-none">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Weeks columns */}
            <div className="flex gap-1.5">
              {weeks.map((week, wIndex) => {
                const firstDayOfWeek = week[0];
                const dateObj = new Date(firstDayOfWeek.date);
                const showMonthLabel =
                  wIndex === 0 || dateObj.getDate() <= 7;
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

                return (
                  <div key={wIndex} className="flex flex-col gap-1.5">
                    {/* Month header tag */}
                    <div className="h-4 text-[10px] font-mono text-slate-400 select-none">
                      {showMonthLabel ? monthName : ''}
                    </div>

                    {/* 7 days in this week */}
                    {week.map((day) => {
                      const isToday = day.date === todayKey;
                      const colorClass = getColorClass(day.level);

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={() => handleMouseEnter(day)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className={`w-4 h-4 rounded-md border transition-transform duration-150 hover:scale-125 cursor-pointer relative ${colorClass} ${
                            isToday ? 'ring-2 ring-white ring-offset-2 ring-offset-[#09090b]' : ''
                          }`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip on hover */}
      {hoveredDay && (
        <div className="p-3 rounded-xl bg-[#0a0a0f] border border-red-500/50 text-xs space-y-1 shadow-2xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-slate-300">
            <span className="font-mono font-bold text-white">{hoveredDay.date}</span>
            <span className="text-red-400 font-mono font-semibold">
              {hoveredDay.minutes} min logged
            </span>
          </div>
          <p className="text-slate-400">
            {hoveredDay.count > 0
              ? `${hoveredDay.count} practice(s) completed on this day.`
              : 'Rest or unrecorded day.'}
          </p>
          {hoveredDay.notes && hoveredDay.notes.length > 0 && (
            <div className="pt-1 mt-1 border-t border-[#262638] space-y-0.5">
              {hoveredDay.notes.map((n, i) => (
                <div key={i} className="text-white font-serif italic text-[11px]">
                  "{n}"
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Heatmap Legend and Overall Window Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#1e1e2d] text-xs">
        <div className="flex items-center gap-4 text-slate-400">
          <div>
            <span className="font-mono font-bold text-white">{totalDaysActive}</span> of 84 days active
          </div>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <div>
            <span className="font-mono font-bold text-white">{Math.floor(totalMinutesInWindow / 60)}h {totalMinutesInWindow % 60}m</span> total practice
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="font-serif italic text-slate-400">Less</span>
          <div className="w-3.5 h-3.5 rounded-sm bg-[#14141e] border border-[#222230]" />
          <div className="w-3.5 h-3.5 rounded-sm bg-[#450a0a] border border-[#6b1414]" />
          <div className="w-3.5 h-3.5 rounded-sm bg-[#7f1d1d] border border-[#991b1b]" />
          <div className="w-3.5 h-3.5 rounded-sm bg-[#b91c1c] border border-[#dc2626]" />
          <div className="w-3.5 h-3.5 rounded-sm bg-[#ef4444] border border-[#f87171]" />
          <span className="font-serif italic text-white font-semibold">20m Goal</span>
        </div>
      </div>
    </div>
  );
};
