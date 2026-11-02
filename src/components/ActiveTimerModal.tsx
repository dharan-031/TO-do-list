import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Dumbbell,
  Heart,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Habit } from '../utils/streakLogic';
import {
  playChimeSound,
  playFanfareSound,
  playTickSound,
  toggleAmbientNoise,
  sendBrowserNotification,
} from '../utils/audioAndNotifications';

interface ActiveTimerModalProps {
  habit: Habit;
  onClose: () => void;
  onFinishSession: (habitId: string, minutes: number, notes?: string) => void;
  soundEnabled: boolean;
}

export const ActiveTimerModal: React.FC<ActiveTimerModalProps> = ({
  habit,
  onClose,
  onFinishSession,
  soundEnabled,
}) => {
  const initialSeconds = (habit.targetMinutes || 20) * 60;
  const [totalDuration, setTotalDuration] = useState(initialSeconds);
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [ambientSound, setAmbientSound] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync ambient sound
  useEffect(() => {
    if (isRunning && ambientSound && soundEnabled) {
      toggleAmbientNoise(true, 0.04);
    } else {
      toggleAmbientNoise(false);
    }
    return () => {
      toggleAmbientNoise(false);
    };
  }, [isRunning, ambientSound, soundEnabled]);

  // Timer loop
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            handleCompleteSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  const handleCompleteSession = () => {
    setIsRunning(false);
    setIsFinished(true);

    if (soundEnabled) {
      playChimeSound();
      setTimeout(() => playFanfareSound(), 400);
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ef4444', '#dc2626', '#ffffff', '#f87171'],
      });
    } catch {}

    sendBrowserNotification(`Practice Complete: ${habit.name}`, {
      body: `You dedicated ${Math.round(totalDuration / 60)} minutes to your daily practice!`,
    });
  };

  const handleTogglePlay = () => {
    if (!isRunning && soundEnabled) {
      playTickSound();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsRemaining(totalDuration);
  };

  const handleAddMinutes = (min: number) => {
    const additionalSec = min * 60;
    setTotalDuration((prev) => prev + additionalSec);
    setSecondsRemaining((prev) => prev + additionalSec);
  };

  const handlePresetSelect = (mins: number) => {
    setIsRunning(false);
    const secs = mins * 60;
    setTotalDuration(secs);
    setSecondsRemaining(secs);
  };

  // 10-second rapid verification test for user & evaluation
  const handleQuickTest = () => {
    setIsRunning(false);
    setTotalDuration(10);
    setSecondsRemaining(10);
  };

  const handleSaveAndExit = () => {
    const minutesCompleted = Math.max(1, Math.round((totalDuration - secondsRemaining) / 60));
    onFinishSession(habit.id, minutesCompleted, sessionNotes.trim() || undefined);
    onClose();
  };

  // Circular calculations
  const progressPercent = totalDuration > 0 ? (totalDuration - secondsRemaining) / totalDuration : 0;
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressPercent * circumference;

  const minutesDisplay = Math.floor(secondsRemaining / 60);
  const secondsDisplay = secondsRemaining % 60;
  const formattedTime = `${String(minutesDisplay).padStart(2, '0')}:${String(secondsDisplay).padStart(2, '0')}`;

  const getCategoryIcon = () => {
    switch (habit.category) {
      case 'learning':
        return <Sparkles className="w-5 h-5 text-red-400" />;
      case 'reading':
        return <BookOpen className="w-5 h-5 text-red-400" />;
      case 'fitness':
        return <Dumbbell className="w-5 h-5 text-red-400" />;
      default:
        return <Heart className="w-5 h-5 text-red-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl bg-[#0d0d14] border border-red-950/80 shadow-2xl shadow-red-950/50 p-6 sm:p-8 overflow-hidden red-glow-strong">
        {/* Subtle Ambient Red Flare */}
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#181826] transition-colors cursor-pointer"
          aria-label="Close stopwatch"
        >
          <X className="w-5 h-5" />
        </button>

        {!isFinished ? (
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161624] border border-[#262638] text-xs text-red-400 mb-2">
                {getCategoryIcon()}
                <span className="font-serif italic capitalize">Focused Practice</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-white tracking-tight">
                {habit.name}
              </h2>
            </div>

            {/* Circular Stopwatch Dial */}
            <div className="relative flex items-center justify-center my-2">
              <svg className="w-64 h-64 transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  className="text-[#1c1c2b]"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Glowing Progress Arc */}
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  className="text-red-500 transition-all duration-300"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  stroke="url(#crimson-dial-gradient)"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="crimson-dial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ff3b53" />
                    <stop offset="100%" stopColor="#dc2626" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Readout: Massive Crisp Pure White */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="font-mono text-5xl sm:text-6xl font-bold text-white tracking-tight">
                  {formattedTime}
                </span>
                <span className="text-xs font-serif italic text-red-400 mt-1">
                  {isRunning ? 'flowing...' : 'paused'}
                </span>
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-serif italic text-slate-400 mr-1">Preset:</span>
              {[20, 15, 5].map((m) => (
                <button
                  key={m}
                  onClick={() => handlePresetSelect(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                    totalDuration === m * 60
                      ? 'bg-red-600 text-white font-bold shadow-sm'
                      : 'bg-[#161624] border border-[#262638] text-slate-300 hover:text-white'
                  }`}
                >
                  {m}m
                </button>
              ))}
              <button
                onClick={handleQuickTest}
                className="px-2 py-1 rounded-lg text-xs font-mono text-white bg-red-950/60 hover:bg-red-900 border border-red-800/60 flex items-center gap-1 cursor-pointer"
                title="10-second rapid test"
              >
                ⚡ 10s Test
              </button>
            </div>

            {/* Additional Time + Sound controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddMinutes(1)}
                className="px-2.5 py-1 rounded-lg bg-[#161624] border border-[#262638] text-xs font-mono text-slate-200 hover:text-white hover:border-red-500/50 cursor-pointer"
              >
                +1m
              </button>
              <button
                onClick={() => handleAddMinutes(5)}
                className="px-2.5 py-1 rounded-lg bg-[#161624] border border-[#262638] text-xs font-mono text-slate-200 hover:text-white hover:border-red-500/50 cursor-pointer"
              >
                +5m
              </button>

              <button
                onClick={() => setAmbientSound(!ambientSound)}
                className={`px-3 py-1 rounded-lg border text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                  ambientSound
                    ? 'bg-red-950/40 border-red-600 text-red-400'
                    : 'bg-[#161624] border-[#262638] text-slate-400 hover:text-white'
                }`}
                title="Subtle ambient focus sound"
              >
                {ambientSound ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Warm Focus Tone</span>
              </button>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={handleReset}
                className="p-3 rounded-2xl bg-[#161624] border border-[#262638] text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Reset stopwatch"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="flex-1 py-3 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-950/60 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" /> Begin Practice
                  </>
                )}
              </button>

              <button
                onClick={handleCompleteSession}
                className="py-3 px-4 rounded-2xl bg-[#161624] border border-red-900/60 hover:bg-red-950/40 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Finish now and mark complete"
              >
                <CheckCircle2 className="w-4 h-4 text-red-500" />
                Finish Now
              </button>
            </div>
          </div>
        ) : (
          /* Completion State */
          <div className="flex flex-col items-center text-center space-y-5 py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-3xl bg-red-950/40 border border-red-800 text-red-500 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9 text-red-500" />
            </div>

            <div className="space-y-1">
              <span className="font-serif italic text-xs text-red-400">Practice Fulfilled</span>
              <h2 className="font-serif text-2xl font-bold text-white">
                Dedication Honored.
              </h2>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                You invested {Math.round(totalDuration / 60)} minutes in {habit.name}. Your daily streak stays alive.
              </p>
            </div>

            {/* Session reflection note */}
            <div className="w-full text-left space-y-1.5">
              <label className="text-xs font-serif italic text-slate-300">
                Jot your takeaway or reflection (optional):
              </label>
              <textarea
                value={sessionNotes}
                onChange={(e) => setSessionNotes(e.target.value)}
                placeholder="Key insights, page numbers, how your body felt..."
                className="w-full p-3 rounded-2xl bg-[#09090f] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                rows={3}
              />
            </div>

            <button
              onClick={handleSaveAndExit}
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-950/60 active:scale-98 cursor-pointer"
            >
              Log Practice to Daily Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
