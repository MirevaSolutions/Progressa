export type GoalType = 'monthly' | 'annual';

export type Goal = {
  id: string;
  user_id: string;
  type: GoalType;
  year: number;
  month: number | null;
  target_amount: number;
  created_at: string;
  updated_at: string;
};