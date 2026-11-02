import React from 'react';
import { Flame, Bell, Plus, Volume2, VolumeX, CheckSquare, Sparkles, Calendar, BookOpen } from 'lucide-react';
import { StreakInfo } from '../utils/streakLogic';
import { AppNotificationItem } from '../data/defaultData';

export type NavTab = 'todo' | 'cards' | 'heatmap' | 'journal';

interface HeaderProps {
  overallStreak: StreakInfo;
  notifications: AppNotificationItem[];
  onOpenNotifications: () => void;
  onOpenAddHabit: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onStartQuickTimer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  overallStreak,
  notifications,
  onOpenNotifications,
  onOpenAddHabit,
  soundEnabled,
  onToggleSound,
  activeTab,
  onTabChange,
  onStartQuickTimer,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="border-b border-[#20202e] bg-[#0c0c12]/92 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone: Crisp white typography with vibrant red accent */}
        <div className="flex items-baseline gap-2.5">
          <a
            href="/"
            className="font-serif text-2xl font-bold tracking-tight text-white hover:text-red-400 transition-colors flex items-center gap-1.5"
          >
            <span>Chronos</span>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          </a>
          <span className="text-xs text-red-400 font-serif italic hidden sm:inline">
            daily practice
          </span>
        </div>

        {/* Center Navigation Tabs: High-contrast Dark & Red Segmented Controls */}
        <nav className="flex items-center bg-[#12121b] p-1 rounded-xl border border-[#222232]">
          <button
            onClick={() => onTabChange('todo')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'todo'
                ? 'bg-[#221316] text-white shadow-sm border border-red-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-red-500" />
            To-Do List
          </button>
          <button
            onClick={() => onTabChange('cards')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cards'
                ? 'bg-[#221316] text-white shadow-sm border border-red-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-red-400" />
            Pillars
          </button>
          <button
            onClick={() => onTabChange('heatmap')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'heatmap'
                ? 'bg-[#221316] text-white shadow-sm border border-red-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-red-400" />
            Heatmap
          </button>
          <button
            onClick={() => onTabChange('journal')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'journal'
                ? 'bg-[#221316] text-white shadow-sm border border-red-500/50'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            Journal
          </button>
        </nav>

        {/* Right Action Tools: Crimson badges and sharp white buttons */}
        <div className="flex items-center gap-2.5">
          {/* Crimson streak indicator */}
          <div
            title={`${overallStreak.currentStreak} consecutive days of completed practices`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191114] border border-red-900/50 text-red-400 text-xs font-medium"
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span className="font-mono font-bold text-white">{overallStreak.currentStreak}</span>
            <span className="hidden sm:inline text-slate-400">day streak</span>
          </div>

          {/* Bold Crimson 20m Focus Timer button with pure white text */}
          <button
            onClick={onStartQuickTimer}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950/60 active:scale-95 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            20m Timer
          </button>

          {/* Add Habit Button */}
          <button
            onClick={onOpenAddHabit}
            title="Create Custom Habit"
            className="p-2 rounded-lg bg-[#12121b] border border-[#222232] hover:border-red-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Create custom habit"
          >
            <Plus className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute ambient chime' : 'Enable ambient chime'}
            className="p-2 rounded-lg bg-[#12121b] border border-[#222232] hover:border-red-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-red-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            title="Daily Reminders & Alerts"
            className="relative p-2 rounded-lg bg-[#12121b] border border-[#222232] hover:border-red-500/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-[#09090b]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
