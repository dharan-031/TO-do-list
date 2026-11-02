import React from 'react';
import { Flame, Clock, Award, CheckCircle2 } from 'lucide-react';
import { StreakInfo, getMilestoneMessage } from '../utils/streakLogic';

interface OverallStatsBannerProps {
  overallStreak: StreakInfo;
  completedTodayCount: number;
  totalHabitsCount: number;
  totalMinutesToday: number;
  allTimeMinutes: number;
  onOpenNotifications: () => void;
}

export const OverallStatsBanner: React.FC<OverallStatsBannerProps> = ({
  overallStreak,
  completedTodayCount,
  totalHabitsCount,
  totalMinutesToday,
  allTimeMinutes,
}) => {
  const completionPercentage =
    totalHabitsCount > 0 ? Math.round((completedTodayCount / totalHabitsCount) * 100) : 0;

  const milestones = [3, 7, 14, 21, 30, 60, 100];
  const nextMilestone =
    milestones.find((m) => m > overallStreak.currentStreak) || overallStreak.currentStreak + 10;
  const daysUntilNext = nextMilestone - overallStreak.currentStreak;
  const currentMilestoneMsg = getMilestoneMessage(overallStreak.currentStreak);

  // SVG Circular progress
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="relative rounded-2xl bg-[#101017] border border-[#262638] p-5 sm:p-6 shadow-xl overflow-hidden red-glow-subtle">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Column: Progress Ring & Daily Practice Title */}
        <div className="md:col-span-5 flex items-center gap-5">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-[#1c1c28]"
                strokeWidth="6"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="text-red-500 transition-all duration-700 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="url(#crimson-gradient)"
                fill="transparent"
              />
              <defs>
                <linearGradient id="crimson-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ff3b53" />
                  <stop offset="100%" stopColor="#dc2626" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-lg font-bold font-mono text-white">
                {completionPercentage}%
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="font-serif italic text-red-400">Today's Rhythm</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-white font-mono">{totalMinutesToday}m logged</span>
              {completedTodayCount === totalHabitsCount && totalHabitsCount > 0 && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 inline text-red-500" /> Complete
                  </span>
                </>
              )}
            </div>

            <h2 className="font-serif text-xl font-bold text-white tracking-tight">
              {completedTodayCount} of {totalHabitsCount} practices fulfilled
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-sans">
              20 focused minutes for learning, reading, and moving your body.
            </p>
          </div>
        </div>

        {/* Right Column: 3 Crimson & Dark Ledger Blocks */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Streak Block */}
          <div className="p-3.5 rounded-xl bg-[#14141f] border border-[#262638] hover:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-serif italic text-slate-300">Current Streak</span>
              <Flame className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-red-500">
                {overallStreak.currentStreak}
              </span>
              <span className="text-xs text-slate-400">days</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">
              Best: {overallStreak.bestStreak}d
            </div>
          </div>

          {/* Time Invested Block */}
          <div className="p-3.5 rounded-xl bg-[#14141f] border border-[#262638] hover:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-serif italic text-slate-300">Dedicated Time</span>
              <Clock className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white">
                {Math.floor(allTimeMinutes / 60)}h {allTimeMinutes % 60}m
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-sans">
              {overallStreak.totalDaysCompleted} complete days
            </div>
          </div>

          {/* Next Milestone Block */}
          <div className="col-span-2 sm:col-span-1 p-3.5 rounded-xl bg-[#14141f] border border-[#262638] hover:border-red-500/40 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-serif italic text-slate-300">Milestone</span>
              <Award className="w-3.5 h-3.5 text-red-400" />
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold font-mono text-white">
                {daysUntilNext}
              </span>
              <span className="text-xs text-slate-400">days to go</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-sans">
              for {nextMilestone}-day mark
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Encouragement */}
      {currentMilestoneMsg && (
        <div className="mt-4 pt-3 border-t border-[#222232] flex items-center gap-2 text-xs text-white bg-red-950/25 px-3.5 py-2 rounded-xl border border-red-900/50">
          <Award className="w-4 h-4 text-red-400 shrink-0" />
          <span className="font-serif italic text-white">{currentMilestoneMsg}</span>
        </div>
      )}
    </div>
  );
};
