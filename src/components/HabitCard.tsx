import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Dumbbell,
  Heart,
  Check,
  Flame,
  Play,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
} from 'lucide-react';
import { Habit, DailyLog, StreakInfo } from '../utils/streakLogic';

interface HabitCardProps {
  habit: Habit;
  log: DailyLog | undefined;
  streak: StreakInfo;
  onToggleComplete: (habitId: string) => void;
  onAddMinutes: (habitId: string, minutes: number) => void;
  onUpdateNotes: (habitId: string, notes: string) => void;
  onStartTimer: (habit: Habit) => void;
  onEditHabit: (habit: Habit) => void;
  onDeleteHabit: (habitId: string) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  streak,
  onToggleComplete,
  onAddMinutes,
  onUpdateNotes,
  onStartTimer,
  onEditHabit,
  onDeleteHabit,
}) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(log?.notes || '');
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = log?.completed || false;
  const minutesSpent = log?.minutesSpent || 0;
  const target = habit.targetMinutes || 20;
  const progressPercent = Math.min(100, Math.round((minutesSpent / target) * 100));

  const getIcon = () => {
    switch (habit.category) {
      case 'learning':
        return <Sparkles className="w-5 h-5 text-red-400" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-red-400" />;
      case 'fitness':
        return <Dumbbell className="w-5 h-5 text-red-400" />;
      case 'wellness':
        return <Heart className="w-5 h-5 text-red-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-white" />;
    }
  };

  const handleSaveNote = () => {
    onUpdateNotes(habit.id, noteText);
    setShowNoteInput(false);
  };

  return (
    <div
      className={`relative rounded-2xl bg-[#101017] border transition-all duration-300 shadow-md flex flex-col justify-between overflow-hidden ${
        isCompleted
          ? 'border-red-950/80 bg-[#140e11]'
          : 'border-[#262638] hover:border-red-500/40'
      }`}
    >
      {/* Top subtle red hairline accent when completed */}
      {isCompleted && (
        <div className="absolute top-0 inset-x-0 h-1 bg-red-600" />
      )}

      {/* Card Body */}
      <div className="p-5 pb-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#09090f] border border-[#262638] flex items-center justify-center shadow-inner">
              {getIcon()}
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-tight">
                {habit.name}
              </h3>
              {/* Quiet unboxed metadata */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <span className="capitalize text-slate-300">{habit.category}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="font-mono text-slate-300">{habit.targetMinutes} min daily</span>
              </div>
            </div>
          </div>

          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 rounded-xl bg-[#0d0d14] border border-[#2a2a3e] shadow-xl py-1 z-20">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEditHabit(habit);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-[#181826] flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-red-400" />
                  Edit Goal
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteHabit(habit.id);
                  }}
                  className="w-full px-3 py-1.5 text-left text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 mb-4 line-clamp-2">
          {habit.description}
        </p>

        {/* Streak and Completion Status */}
        <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-[#09090f] border border-[#222232] mb-3">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="font-mono font-bold text-white">{streak.currentStreak}</span>
            <span className="text-slate-400">day streak</span>
          </div>
          <div>
            {isCompleted ? (
              <span className="text-red-400 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-red-500 stroke-[3]" /> Fulfilled today
              </span>
            ) : (
              <span className="text-slate-400 font-mono">
                {Math.max(0, target - minutesSpent)}m left
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1 font-serif italic text-slate-300">
              <Clock className="w-3 h-3 text-red-400" /> Progress
            </span>
            <span className="font-mono font-medium text-white">
              {minutesSpent} <span className="text-slate-500">/ {target}m</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[#1c1c28] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Daily Reflection Note */}
        {showNoteInput ? (
          <div className="space-y-2 mt-2">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="What did you learn or accomplish today?"
              className="w-full p-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteInput(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
              >
                Save
              </button>
            </div>
          </div>
        ) : log?.notes ? (
          <div className="mt-2 p-2.5 rounded-xl bg-[#09090f] border border-[#222232] text-xs flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-serif italic tracking-wider text-slate-500 block">
                Today's reflection
              </span>
              <p className="text-white font-serif italic mt-0.5">"{log.notes}"</p>
            </div>
            <button
              onClick={() => setShowNoteInput(true)}
              className="text-[11px] text-red-400 hover:text-red-300 shrink-0 font-medium cursor-pointer"
            >
              Edit
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNoteInput(true)}
            className="text-xs text-slate-500 hover:text-red-400 transition-colors font-serif italic mt-1 cursor-pointer"
          >
            + Jot daily reflection
          </button>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 pt-2 border-t border-[#1e1e2d] bg-[#0c0c14] flex flex-wrap items-center justify-between gap-2">
        {/* Quick Add Minutes Stamps */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddMinutes(habit.id, 5)}
            className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-[#181826] border border-[#2c2c3e] text-slate-200 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer"
            title="Log 5 minutes"
          >
            +5m
          </button>
          <button
            onClick={() => onAddMinutes(habit.id, 10)}
            className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-[#181826] border border-[#2c2c3e] text-slate-200 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer"
            title="Log 10 minutes"
          >
            +10m
          </button>
          <button
            onClick={() => onAddMinutes(habit.id, 20)}
            className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-[#181826] border border-[#2c2c3e] text-slate-200 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer"
            title="Log 20 minutes"
          >
            +20m
          </button>
        </div>

        {/* Timer & Completion CTAs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStartTimer(habit)}
            className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-white border border-red-500/50 text-xs font-semibold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="Start countdown stopwatch"
          >
            <Play className="w-3 h-3 fill-current text-red-500" />
            Timer
          </button>

          <button
            onClick={() => onToggleComplete(habit.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer ${
              isCompleted
                ? 'bg-[#1c1214] border border-red-600 text-white'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-950/50'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-3.5 h-3.5 text-red-500 stroke-[3]" />
                Done
              </>
            ) : (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                Mark 20m
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
