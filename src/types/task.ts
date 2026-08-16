export type Task = {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'done' | 'not_done' | 'pending';
  reminder: number | null;
  created_at: string;
  updated_at: string;
};