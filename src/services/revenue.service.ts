import { supabase } from '@/lib/supabase';
import { Revenue } from '@/types/revenue';

export type RevenuePayload = {
  amount: number;
  date: string;
  description: string;
};

/**
 * Récupère tous les revenus de l'utilisateur connecté.
 *
 * La sécurité reste assurée par les politiques RLS de Supabase.
 */
export async function getRevenues(): Promise<Revenue[]> {
  const { data, error } = await supabase
    .from('revenues')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

/**
 * Crée un nouveau revenu.
 */
export async function createRevenue(
  payload: RevenuePayload
): Promise<Revenue> {
  const { data, error } = await supabase
    .from('revenues')
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Modifie un revenu existant.
 */
export async function updateRevenue(
  id: string,
  payload: RevenuePayload
): Promise<Revenue> {
  const { data, error } = await supabase
    .from('revenues')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * Supprime un revenu.
 */
export async function deleteRevenue(id: string): Promise<void> {
  const { error } = await supabase
    .from('revenues')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/** */
export async function getRevenuesByYear(year: number): Promise<Revenue[]> {
  const startDate = `${year}-01-01`;
  const endDate = `${year}-12-31`;

  const { data, error } = await supabase
    .from('revenues')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}