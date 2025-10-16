export interface Reward {
  id: number;
  title: string;
  description: string;
  category?: string;
  cost: number;
  stock_limit?: number;
  max_claims_per_user?: number;
  icon?: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}
