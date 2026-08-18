import { supabase } from '@/lib/supabase';
import { Goal, GoalType } from '@/types/goal';

export type GoalPayload = {
  type: GoalType;
  year: number;
  month?: number;
  target_amount: number;
};

/**
 * =========================================================
 * UTILISATEUR CONNECTÉ
 * =========================================================
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
 * =========================================================
 * RÉCUPÉRER LES OBJECTIFS D'UNE ANNÉE
 * =========================================================
 *
 * RLS s'occupe de ne retourner que les objectifs
 * appartenant à l'utilisateur connecté.
 */

export async function getGoalsByYear(
  year: number
): Promise<Goal[]> {
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('year', year)
    .order('type', { ascending: true });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * =========================================================
 * CRÉER UN OBJECTIF
 * =========================================================
 */

export async function createGoal(
  payload: GoalPayload
): Promise<Goal> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      type: payload.type,
      year: payload.year,
      month:
        payload.type === 'monthly'
          ? payload.month ?? null
          : null,
      target_amount: payload.target_amount,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * =========================================================
 * MODIFIER UN OBJECTIF
 * =========================================================
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
 * =========================================================
 * SUPPRIMER UN OBJECTIF
 * =========================================================
 */

export async function deleteGoal(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * =========================================================
 * CRÉER OU MODIFIER UN OBJECTIF
 * =========================================================
 */

export async function upsertGoal(
  type: GoalType,
  year: number,
  amount: number,
  month?: number,
  existingGoal?: Goal
): Promise<Goal> {

  if (existingGoal) {
    return updateGoal(
      existingGoal.id,
      amount
    );
  }

  const payload: GoalPayload = {
    type,
    year,
    target_amount: amount,
  };

  if (
    type === 'monthly' &&
    month !== undefined
  ) {
    payload.month = month;
  }

  return createGoal(payload);
}