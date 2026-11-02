import React, { useState } from 'react';
import { X, Sparkles, Clock, Palette, Bell } from 'lucide-react';
import { Habit } from '../utils/streakLogic';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveHabit: (habitData: Partial<Habit> & { name: string; targetMinutes: number }) => void;
  initialHabit?: Habit | null;
}

export const AddEditHabitModal: React.FC<AddEditHabitModalProps> = ({
  isOpen,
  onClose,
  onSaveHabit,
  initialHabit,
}) => {
  const [name, setName] = useState(initialHabit?.name || '');
  const [targetMinutes, setTargetMinutes] = useState(initialHabit?.targetMinutes || 20);
  const [category, setCategory] = useState<Habit['category']>(initialHabit?.category || 'learning');
  const [color, setColor] = useState(initialHabit?.color || 'red');
  const [description, setDescription] = useState(initialHabit?.description || '');
  const [reminderTime, setReminderTime] = useState(initialHabit?.reminderTime || '09:00');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a practice name');
      return;
    }
    if (targetMinutes <= 0) {
      setError('Target duration must be at least 1 minute');
      return;
    }

    onSaveHabit({
      ...(initialHabit || {}),
      name: name.trim(),
      targetMinutes: Number(targetMinutes),
      category,
      color,
      description: description.trim() || `Daily ${targetMinutes} minutes dedicated to ${name.trim()}`,
      reminderTime,
      reminderEnabled: true,
    });
    onClose();
  };

  const colors = [
    { id: 'red', label: 'Crimson Red', bg: 'bg-red-600' },
    { id: 'scarlet', label: 'Ruby Scarlet', bg: 'bg-[#dc2626]' },
    { id: 'coral', label: 'Coral Flame', bg: 'bg-[#f87171]' },
    { id: 'rose', label: 'Dark Wine', bg: 'bg-[#991b1b]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0d0d14] border border-red-950/80 shadow-2xl overflow-hidden p-6 red-glow">
        <div className="flex items-center justify-between pb-4 border-b border-[#222232]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-red-500" />
            <h3 className="font-serif text-xl font-bold text-white">
              {initialHabit ? 'Edit Practice' : 'New Daily Practice'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-[#181826] rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-800 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-xs font-serif italic text-slate-300 mb-1">
              Practice Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. 20m Mindful Meditation, Spanish Practice..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-white text-sm focus:outline-none focus:border-red-500"
              required
            />
          </div>

          {/* Target Minutes and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-serif italic text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-red-400" /> Target Daily Minutes
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={targetMinutes}
                onChange={(e) => setTargetMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-white text-sm font-mono focus:outline-none focus:border-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-serif italic text-slate-300 mb-1">
                Pillar Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Habit['category'])}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-white text-sm focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="learning" className="bg-[#101017] text-white">Learning</option>
                <option value="reading" className="bg-[#101017] text-white">Reading</option>
                <option value="fitness" className="bg-[#101017] text-white">Fitness</option>
                <option value="wellness" className="bg-[#101017] text-white">Wellness</option>
              </select>
            </div>
          </div>

          {/* Color theme selector */}
          <div>
            <label className="block text-xs font-serif italic text-slate-300 mb-1.5 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-red-400" /> Crimson Ink Shade
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setColor(c.id)}
                  className={`flex-1 py-1.5 rounded-xl border text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    color === c.id
                      ? 'border-white bg-[#1a1a28] text-white shadow-sm'
                      : 'border-[#262638] bg-[#09090f] text-slate-400 hover:border-slate-500'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
                  <span className="hidden sm:inline">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-serif italic text-slate-300 mb-1">
              Intention / Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this daily practice matters to you..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#09090f] border border-[#262638] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
              rows={2}
            />
          </div>

          {/* Reminder Time */}
          <div>
            <label className="block text-xs font-serif italic text-slate-300 mb-1 flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-red-400" /> Daily Practice Time
            </label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#09090f] border border-[#262638] text-white text-xs font-mono focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2.5 border-t border-[#222232]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/60 active:scale-95 transition-all cursor-pointer"
            >
              {initialHabit ? 'Save Changes' : 'Create Practice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
