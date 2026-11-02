export interface TodoSubtask {
  id: string;
  title: string;
  completed: boolean;
}

export type HabitCategory =
  | 'learning'
  | 'reading'
  | 'fitness'
  | 'wellness'
  | 'productivity'
  | 'custom'
  | 'task';

export interface TodoItem {
  id: string;
  habitId?: string; // linked to core habit 'learn' | 'read' | 'exercise' or custom
  title: string;
  category: HabitCategory;
  completed: boolean;
  targetMinutes: number; // e.g. 20
  minutesSpent: number;
  date: string; // YYYY-MM-DD
  reminderTime?: string;
  priority: 'high' | 'medium' | 'low';
  subtasks: TodoSubtask[];
  notes?: string;
  createdAt: string;
}
