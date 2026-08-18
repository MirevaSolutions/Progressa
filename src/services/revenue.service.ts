import { supabase } from '@/lib/supabase';
import { Revenue } from '@/types/revenue';

export type RevenuePayload = {
  amount: number;
  date: string;
  description: string;
};

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

export async function createRevenue(
  payload: RevenuePayload
): Promise<Revenue> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('revenues')
    .insert({
      ...payload,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

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

export async function deleteRevenue(
  id: string
): Promise<void> {
  const { error } = await supabase
    .from('revenues')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function getRevenuesByYear(
  year: number
): Promise<Revenue[]> {
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