import { supabase } from '@/lib/supabase';
import { Goal, GoalType } from '@/types/goal';

export type GoalPayload = {
  type: GoalType;
  year: number;
  month?: number;
  target_amount: number;
};

/**
 * Récupère les objectifs d'une année.
 *
 * La sécurité des données est assurée par RLS côté PostgreSQL.
 */
export async function getGoalsByYear(year: number): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('year', year)
    .order('type');

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Crée un objectif.
 */
export async function createGoal(
  payload: GoalPayload
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Modifie un objectif existant.
 */
export async function updateGoal(
  id: string,
  targetAmount: number
): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .update({
      target_amount: targetAmount,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Crée ou modifie un objectif.
 */
export async function upsertGoal(
  type: GoalType,
  year: number,
  amount: number,
  month?: number,
  existingGoal?: Goal
): Promise<Goal> {
  if (existingGoal) {
    return updateGoal(existingGoal.id, amount);
  }

  const payload: GoalPayload = {
    type,
    year,
    target_amount: amount,
  };

  if (type === 'monthly' && month !== undefined) {
    payload.month = month;
  }

  return createGoal(payload);
}