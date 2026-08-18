export type TaskPriority =
  | 'low'
  | 'medium'
  | 'high';

export type TaskStatus =
  | 'pending'
  | 'completed';

export type CalendarEventType =
  | 'revenue'
  | 'goal'
  | 'reminder'
  | 'other';

export type Task = {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  reminder: number | null;
  type: CalendarEventType;
  created_at: string;
  updated_at: string;
};