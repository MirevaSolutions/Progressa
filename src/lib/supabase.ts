import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Revenue = {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type Goal = {
  id: string;
  user_id: string;
  type: 'monthly' | 'annual';
  year: number;
  month: number | null;
  target_amount: number;
  created_at: string;
  updated_at: string;
};

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
