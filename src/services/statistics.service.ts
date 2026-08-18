import { supabase } from '@/lib/supabase';
import { Revenue } from '@/types/revenue'
async function getCurrentUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Utilisateur non connecté.');

  return user.id;
}

export async function getRevenuesByYear(
  year: number
): Promise<Revenue[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('revenues')
    .select('*')
    .eq('user_id', userId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date', { ascending: true });

  if (error) throw error;

  return data ?? [];
}

export async function getAllRevenues(): Promise<Revenue[]> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('revenues')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw error;

  return data ?? [];
}