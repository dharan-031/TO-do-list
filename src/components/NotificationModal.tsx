import React, { useState } from 'react';
import {
  X,
  Bell,
  Volume2,
  Trash2,
  Clock,
  Send,
  ShieldCheck,
  ExternalLink,
  Flame,
} from 'lucide-react';
import { AppNotificationItem } from '../data/defaultData';
import { Habit } from '../utils/streakLogic';
import {
  requestNotificationPermission,
  sendBrowserNotification,
  playChimeSound,
  playFanfareSound,
  flashTabNotification,
  isInIframe,
} from '../utils/audioAndNotifications';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotificationItem[];
  onClearNotifications: () => void;
  onAddNotification: (title: string, message: string, type: AppNotificationItem['type']) => void;
  habits: Habit[];
  onUpdateHabitReminder: (habitId: string, reminderTime: string, enabled: boolean) => void;
  soundEnabled: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onClearNotifications,
  onAddNotification,
  habits,
  onUpdateHabitReminder,
  soundEnabled,
}) => {
  const inIframe = typeof window !== 'undefined' ? isInIframe() : false;
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'denied'
  );
  const [testSent, setTestSent] = useState(false);
  const [soundTested, setSoundTested] = useState(false);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      sendBrowserNotification('Practice Reminders Active', {
        body: 'You will receive gentle nudges to keep your daily rhythm unbroken.',
      });
      onAddNotification(
        'Reminders Enabled',
        'System notifications are now active for daily practice check-ins.',
        'system'
      );
    }
  };

  const handleSendTestNotification = () => {
    if (soundEnabled) playChimeSound();
    flashTabNotification('Time for 20m Learning');

    const title = 'Daily Rhythm Nudge';
    const message = 'Ready for twenty minutes of reading, learning, or movement? Your quiet momentum awaits.';

    sendBrowserNotification(title, {
      body: message,
    });

    onAddNotification(title, message, 'reminder');

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  const handleTestSound = () => {
    playChimeSound();
    setTimeout(() => playFanfareSound(), 400);
    setSoundTested(true);
    setTimeout(() => setSoundTested(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0d0d14] border border-red-950/80 shadow-2xl overflow-hidden red-glow">
        {/* Header */}
        <div className="p-6 border-b border-[#222232] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-900/60 flex items-center justify-center text-red-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-white tracking-tight">
                Daily Reminders & Audio
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Configure quiet audio chimes and scheduled practice nudges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#181826] rounded-xl transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Iframe Notice & Standalone Tab Link */}
          {inIframe && (
            <div className="p-4 rounded-xl bg-[#151013] border border-red-950/70 flex items-start gap-3">
              <Flame className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-2">
                <p className="text-slate-300 font-serif italic">
                  <strong>Preview Notice:</strong> Embedded preview frames restrict OS desktop push notifications. Chronos provides full <strong>in-app harmonic chimes, tab title alerts, and visual banners</strong> right here.
                </p>
                {typeof window !== 'undefined' && (
                  <a
                    href={window.location.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                  >
                    Open Standalone Window <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Permission Status Box */}
          <div className="p-4 rounded-2xl bg-[#101017] border border-[#262638] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-serif italic text-slate-300">
                  Desktop Push Notifications:
                </span>
              </div>
              <span
                className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full capitalize border ${
                  permission === 'granted'
                    ? 'bg-red-950/50 text-red-400 border-red-800'
                    : 'bg-[#181824] text-slate-400 border-[#2c2c3e]'
                }`}
              >
                {permission}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-sans">
              {permission === 'granted'
                ? 'Desktop notifications are active. You will receive alerts when timers complete or scheduled practice times arrive.'
                : 'Test harmonic audio or dispatch a live practice notification below.'}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {permission !== 'granted' && !inIframe && (
                <button
                  onClick={handleRequestPermission}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Enable OS Notifications
                </button>
              )}

              <button
                onClick={handleSendTestNotification}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {testSent ? 'Chime Dispatched!' : 'Test Chime & Tab Alert'}
              </button>

              <button
                onClick={handleTestSound}
                className="px-3.5 py-1.5 rounded-xl bg-[#161624] hover:bg-[#202030] text-white font-medium text-xs border border-[#2c2c3e] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5 text-red-400" />
                {soundTested ? 'Playing Harmony!' : 'Test Sound Chime'}
              </button>
            </div>
          </div>

          {/* Scheduled Routine Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif italic text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-red-500" />
                Scheduled Daily Practice Times
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">Local time</span>
            </div>

            <div className="space-y-2">
              {habits.map((habit) => (
                <div
                  key={habit.id}
                  className="p-3.5 rounded-xl bg-[#101017] border border-[#262638] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#09090f] border border-[#262638] flex items-center justify-center font-serif text-sm font-bold text-white">
                      {habit.name[0]}
                    </div>
                    <div>
                      <div className="font-serif font-bold text-sm text-white">
                        {habit.name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {habit.targetMinutes} minutes daily
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="time"
                      value={habit.reminderTime || '09:00'}
                      onChange={(e) =>
                        onUpdateHabitReminder(habit.id, e.target.value, habit.reminderEnabled)
                      }
                      className="px-2 py-1 rounded-lg bg-[#09090f] border border-[#262638] text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={habit.reminderEnabled}
                        onChange={(e) =>
                          onUpdateHabitReminder(habit.id, habit.reminderTime, e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-[#20202e] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* In-App Notifications History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-serif italic text-slate-300">
                Recent Alerts ({notifications.length})
              </h4>
              {notifications.length > 0 && (
                <button
                  onClick={onClearNotifications}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs font-serif italic text-slate-500 py-3 text-center">
                No alerts yet recorded.
              </p>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#101017] border border-[#262638] flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-serif font-bold text-white">{item.title}</div>
                      <div className="text-slate-400 mt-0.5">{item.message}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#09090f] border-t border-[#222232] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
