export interface Badge {
  id: number;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  type: 'tasks_completed' | 'checkins_completed' | 'streak' | 'avg_energy' | 'urgent_tasks' | 'gems_earned' | 'custom';
  target_value: number;
  period: 'all' | 'week' | 'month' | 'year';
  custom_condition?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
