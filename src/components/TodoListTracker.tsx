import React, { useState } from 'react';
import {
  Check,
  Plus,
  Play,
  Flame,
  ChevronDown,
  ChevronRight,
  Sparkles,
  BookOpen,
  Dumbbell,
  Heart,
  CheckSquare,
  Trash2,
  ListTodo,
} from 'lucide-react';
import { TodoItem } from '../types/todo';
import { Habit, StreakInfo } from '../utils/streakLogic';

interface TodoListTrackerProps {
  todos: TodoItem[];
  habits: Habit[];
  habitStreaks: Record<string, StreakInfo>;
  onToggleTodo: (todoId: string) => void;
  onAddTodo: (newTodo: Omit<TodoItem, 'id' | 'createdAt'>) => void;
  onDeleteTodo: (todoId: string) => void;
  onAddMinutesToTodo: (todoId: string, minutes: number) => void;
  onToggleSubtask: (todoId: string, subtaskId: string) => void;
  onAddSubtask: (todoId: string, subtaskTitle: string) => void;
  onStartTimerForTodo: (todo: TodoItem) => void;
  onUpdateTodoNotes: (todoId: string, notes: string) => void;
  todayKey: string;
}

export const TodoListTracker: React.FC<TodoListTrackerProps> = ({
  todos,
  habits,
  habitStreaks,
  onToggleTodo,
  onAddTodo,
  onDeleteTodo,
  onAddMinutesToTodo,
  onToggleSubtask,
  onAddSubtask,
  onStartTimerForTodo,
  onUpdateTodoNotes,
  todayKey,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'core'>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TodoItem['category']>('learning');
  const [newMinutes, setNewMinutes] = useState<number>(20);
  const [expandedTodoIds, setExpandedTodoIds] = useState<Set<string>>(new Set());
  const [subtaskInputs, setSubtaskInputs] = useState<Record<string, string>>({});
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Filtered todos for today
  const todayTodos = todos.filter((t) => t.date === todayKey);

  const filteredTodos = todayTodos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'core') return !!t.habitId;
    return true;
  });

  const totalCount = todayTodos.length;
  const completedCount = todayTodos.filter((t) => t.completed).length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTodo({
      title: newTitle.trim(),
      category: newCategory,
      completed: false,
      targetMinutes: newMinutes,
      minutesSpent: 0,
      date: todayKey,
      priority: 'high',
      subtasks: [],
    });

    setNewTitle('');
  };

  const toggleExpand = (id: string) => {
    setExpandedTodoIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubtaskSubmit = (todoId: string) => {
    const text = (subtaskInputs[todoId] || '').trim();
    if (!text) return;
    onAddSubtask(todoId, text);
    setSubtaskInputs((prev) => ({ ...prev, [todoId]: '' }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'learning':
        return <Sparkles className="w-4 h-4 text-red-400" />;
      case 'reading':
        return <BookOpen className="w-4 h-4 text-red-400" />;
      case 'fitness':
        return <Dumbbell className="w-4 h-4 text-red-400" />;
      case 'wellness':
        return <Heart className="w-4 h-4 text-red-400" />;
      default:
        return <CheckSquare className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Add Entry Box */}
      <div className="rounded-2xl bg-[#101017] border border-[#262638] p-4 sm:p-5 shadow-lg">
        <form onSubmit={handleCreateTodo} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Write a new practice or task (e.g. 20m Spanish, Read Ch 4, Calisthenics)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
              />
              <ListTodo className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TodoItem['category'])}
                className="px-3 py-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-xs text-white focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value="learning" className="bg-[#101017] text-white">Learning</option>
                <option value="reading" className="bg-[#101017] text-white">Reading</option>
                <option value="fitness" className="bg-[#101017] text-white">Exercise</option>
                <option value="wellness" className="bg-[#101017] text-white">Wellness</option>
                <option value="task" className="bg-[#101017] text-white">Task</option>
              </select>

              <select
                value={newMinutes}
                onChange={(e) => setNewMinutes(Number(e.target.value))}
                className="px-3 py-2.5 rounded-xl bg-[#09090f] border border-[#262638] text-xs text-white font-mono focus:outline-none focus:border-red-500 cursor-pointer"
              >
                <option value={20} className="bg-[#101017] text-white">20 min</option>
                <option value={15} className="bg-[#101017] text-white">15 min</option>
                <option value={10} className="bg-[#101017] text-white">10 min</option>
                <option value={30} className="bg-[#101017] text-white">30 min</option>
                <option value={0} className="bg-[#101017] text-white">No timer</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all active:scale-95 flex items-center gap-1.5 shrink-0 shadow-md shadow-red-950/50 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Practice
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Checklist Header & Segmented Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#101017] border border-[#262638]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h3 className="font-serif text-lg font-bold text-white">
              Today's Checklist
            </h3>
            <span className="text-xs font-mono text-slate-400">
              ({completedCount} of {totalCount} completed)
            </span>
          </div>

          {/* Red Progress Rule */}
          <div className="w-48 h-1 rounded-full bg-[#1c1c28] overflow-hidden">
            <div
              className="h-full bg-red-600 transition-all duration-500 rounded-full"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-1 bg-[#09090f] p-1 rounded-xl border border-[#262638]">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-red-600/20 text-white border border-red-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'pending'
                ? 'bg-red-600/20 text-white border border-red-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending ({totalCount - completedCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filter === 'completed'
                ? 'bg-red-600/20 text-white border border-red-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fulfilled ({completedCount})
          </button>
          <button
            onClick={() => setFilter('core')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              filter === 'core'
                ? 'bg-red-600/20 text-white border border-red-500/50 shadow-sm'
                : 'text-slate-400 hover:text-red-400'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-500" />
            20m Pillars
          </button>
        </div>
      </div>

      {/* To-Do Items List */}
      {filteredTodos.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#101017] border border-[#262638]">
          <p className="font-serif italic text-slate-400 text-sm">
            No practices found in this filter. Keep your quiet momentum unbroken.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTodos.map((todo) => {
            const isExpanded = expandedTodoIds.has(todo.id);
            const parentHabit = habits.find((h) => h.id === todo.habitId);
            const habitStreak = todo.habitId ? habitStreaks[todo.habitId] : undefined;
            const subtasks = todo.subtasks || [];
            const completedSubtasks = subtasks.filter((s) => s.completed).length;

            return (
              <div
                key={todo.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  todo.completed
                    ? 'bg-[#151013] border-red-950/70 shadow-sm'
                    : 'bg-[#111119] border-[#232334] hover:border-red-500/40 shadow-md'
                }`}
              >
                {/* Main Item Row */}
                <div className="p-4 sm:p-5 flex items-center justify-between gap-3 sm:gap-4">
                  {/* Left: Checkbox + Icon + Title */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Tactile Red Checkbox */}
                    <button
                      type="button"
                      onClick={() => onToggleTodo(todo.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        todo.completed
                          ? 'bg-red-600 border-red-500 text-white shadow-sm shadow-red-950/50'
                          : 'border-slate-500 hover:border-red-400 text-transparent bg-[#09090f]'
                      }`}
                      aria-label={`Mark ${todo.title} as ${todo.completed ? 'incomplete' : 'complete'}`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    {/* Category Icon */}
                    <div className="w-8 h-8 rounded-lg bg-[#09090f] border border-[#262638] flex items-center justify-center shrink-0">
                      {getCategoryIcon(todo.category)}
                    </div>

                    {/* Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span
                          className={`text-sm sm:text-base font-medium truncate ${
                            todo.completed
                              ? 'line-through text-slate-400'
                              : 'text-white'
                          }`}
                        >
                          {todo.title}
                        </span>
                      </div>

                      {/* Quiet Unboxed Metadata with · separator */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                        <span className="capitalize text-slate-300">{todo.category}</span>

                        {habitStreak && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="flex items-center gap-0.5 text-red-400 font-mono">
                              <Flame className="w-3 h-3 text-red-500" />
                              {habitStreak.currentStreak}d
                            </span>
                          </>
                        )}

                        {todo.targetMinutes > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="font-mono text-slate-300">
                              {todo.minutesSpent}/{todo.targetMinutes}m
                            </span>
                          </>
                        )}

                        {subtasks.length > 0 && (
                          <>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <button
                              onClick={() => toggleExpand(todo.id)}
                              className="text-xs text-red-400 hover:text-red-300 underline cursor-pointer"
                            >
                              {completedSubtasks}/{subtasks.length} steps
                            </button>
                          </>
                        )}
                      </div>

                      {/* Optional Note excerpt */}
                      {todo.notes && (
                        <p className="text-xs text-slate-400 font-serif italic mt-1 truncate">
                          "{todo.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Action Tools: +5m, +20m, Timer, and Details */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {/* Quick Minute Stamps */}
                    {!todo.completed && todo.targetMinutes > 0 && (
                      <div className="hidden sm:flex items-center gap-1">
                        <button
                          onClick={() => onAddMinutesToTodo(todo.id, 5)}
                          title="Log 5 minutes"
                          className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-[#181826] border border-[#2c2c3e] text-slate-200 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer"
                        >
                          +5m
                        </button>
                        <button
                          onClick={() => onAddMinutesToTodo(todo.id, 20)}
                          title="Log 20 minutes"
                          className="px-2 py-1 text-xs font-mono font-medium rounded-lg bg-[#181826] border border-[#2c2c3e] text-slate-200 hover:text-white hover:border-red-500/50 transition-colors cursor-pointer"
                        >
                          +20m
                        </button>
                      </div>
                    )}

                    {/* Launch Focus Timer */}
                    {todo.targetMinutes > 0 && (
                      <button
                        onClick={() => onStartTimerForTodo(todo)}
                        className="px-2.5 sm:px-3 py-1 text-xs font-semibold rounded-lg bg-red-600/20 hover:bg-red-600/30 text-white border border-red-500/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current text-red-500" />
                        <span className="hidden sm:inline">Timer</span>
                      </button>
                    )}

                    {/* Expand Subtasks / Details Toggle */}
                    <button
                      onClick={() => toggleExpand(todo.id)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                      aria-label="Toggle subtasks and notes"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-red-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    {/* Delete Custom Todo */}
                    {!todo.habitId && (
                      <button
                        onClick={() => onDeleteTodo(todo.id)}
                        className="p-1 text-slate-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Subtask & Notes Drawer */}
                {isExpanded && (
                  <div className="border-t border-[#232334] bg-[#0c0c14] p-4 sm:p-5 space-y-4">
                    {/* Subtasks Section */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-serif italic text-slate-400">
                        <span>Action Steps & Subtasks</span>
                        <span className="font-mono text-slate-500">
                          {completedSubtasks} of {subtasks.length} done
                        </span>
                      </div>

                      {/* Subtasks List */}
                      <div className="space-y-1.5">
                        {subtasks.map((st) => (
                          <div
                            key={st.id}
                            className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-[#14141f] transition-colors"
                          >
                            <button
                              type="button"
                              onClick={() => onToggleSubtask(todo.id, st.id)}
                              className={`w-4 h-4 rounded border flex items-center justify-center transition-all cursor-pointer ${
                                st.completed
                                  ? 'bg-red-600 border-red-500 text-white'
                                  : 'border-slate-500 hover:border-red-400 bg-[#09090f]'
                              }`}
                            >
                              {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>
                            <span
                              className={`text-xs flex-1 ${
                                st.completed
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-200'
                              }`}
                            >
                              {st.title}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Add Subtask Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          value={subtaskInputs[todo.id] || ''}
                          onChange={(e) =>
                            setSubtaskInputs((prev) => ({ ...prev, [todo.id]: e.target.value }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleSubtaskSubmit(todo.id);
                            }
                          }}
                          placeholder="Add a step (e.g. Chapter 3, 10 reps pushups)..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-[#09090f] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSubtaskSubmit(todo.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#181826] border border-[#2c2c3e] hover:border-red-500/50 text-xs font-medium text-white transition-colors cursor-pointer"
                        >
                          Add Step
                        </button>
                      </div>
                    </div>

                    {/* Reflection / Daily Note */}
                    <div className="pt-2 border-t border-[#1e1e2d]">
                      {editingNotesId === todo.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={notesDraft}
                            onChange={(e) => setNotesDraft(e.target.value)}
                            placeholder="Jot what you learned, pages completed, or personal takeaway..."
                            className="w-full px-3 py-2 rounded-xl bg-[#09090f] border border-[#262638] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                            rows={2}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingNotesId(null)}
                              className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onUpdateTodoNotes(todo.id, notesDraft);
                                setEditingNotesId(null);
                              }}
                              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-semibold text-white"
                            >
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-serif italic text-slate-400">
                            {todo.notes ? `"${todo.notes}"` : 'No notes written yet.'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setNotesDraft(todo.notes || '');
                              setEditingNotesId(todo.id);
                            }}
                            className="text-xs text-red-400 hover:text-red-300 underline font-medium cursor-pointer"
                          >
                            {todo.notes ? 'Edit note' : '+ Write daily note'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Craft quotation footer banner */}
      <div className="p-4 rounded-xl bg-[#101017] border border-[#262638] flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-red-500 shrink-0" />
          <span className="font-serif italic text-white">
            "Small daily efforts compound into mastery. Twenty minutes of reading, learning, or movement is enough to change your trajectory."
          </span>
        </div>
        <button
          onClick={() => {
            const firstActive = filteredTodos.find((t) => !t.completed && t.targetMinutes > 0);
            if (firstActive) onStartTimerForTodo(firstActive);
          }}
          className="text-red-400 hover:text-red-300 underline font-bold whitespace-nowrap ml-4 cursor-pointer"
        >
          Start 20m focus timer →
        </button>
      </div>
    </div>
  );
};
