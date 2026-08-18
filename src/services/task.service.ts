import { supabase } from '@/lib/supabase';
import {
  Task,
  TaskPriority,
  TaskStatus,
  CalendarEventType,
} from '@/types/task';

export type TaskInput = {
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  reminder: number | null;
  type: CalendarEventType;
};

/**
 * Récupère l'utilisateur actuellement connecté.
 */
async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Utilisateur non connecté.');
  }

  return user.id;
}

/**
 * Récupère les tâches d'un mois.
 */
export async function getTasksByMonth(
  year: number,
  month: number
): Promise<Task[]> {
  const start = `${year}-${String(month).padStart(2, '0')}-01`;

  const lastDay = new Date(year, month, 0).getDate();

  const end = `${year}-${String(month).padStart(2, '0')}-${String(
    lastDay
  ).padStart(2, '0')}`;

  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .gte('date', start)
    .lte('date', end)
    .order('start_time', {
      ascending: true,
      nullsFirst: false,
    });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Crée une nouvelle tâche.
 */
export async function createTask(
  input: TaskInput
): Promise<Task> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('calendar_events')
    .insert({
      ...input,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Modifie une tâche.
 */
export async function updateTask(
  id: string,
  input: Partial<TaskInput>
): Promise<Task> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('calendar_events')
    .update(input)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Supprime une tâche.
 */
export async function deleteTask(
  id: string
): Promise<void> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
}

/**
 * Modifie uniquement le statut d'une tâche.
 */
export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<Task> {
  return updateTask(id, {
    status,
  });
}