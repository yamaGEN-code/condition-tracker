export type SnackLevel = 'none' | 'little' | 'moderate' | 'excessive';
export type MealSize = 'light' | 'normal' | 'large';

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  weight: number; // 0.1kg単位
  sleepScore: number; // Huaweiヘルスのスコア
  pain: number; // 0-4
  mood: number; // 0-4
  drinkHome: boolean;
  drinkOut: boolean;
  snack: SnackLevel;
  mealSize: MealSize;
  steps: number;
  training: boolean;
  calorieBalance?: number; // Huaweiヘルスの「カロリー収支」kcal。赤字はマイナス、黒字はプラス。未入力はundefined
}

export interface AppConfig {
  startWeight: number;
  goalWeight: number;
  stretchGoalWeight: number;
  targetDate: string; // YYYY-MM-DD
  startDate: string; // YYYY-MM-DD
}
