import { DailyRecord, AppConfig } from './types';

const RECORDS_KEY = 'condition-records';
const CONFIG_KEY = 'condition-config';

export const DEFAULT_CONFIG: AppConfig = {
  startWeight: 72,
  goalWeight: 68,
  stretchGoalWeight: 66,
  targetDate: '2026-09-25',
  startDate: '2026-07-08',
};

export function getConfig(): AppConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const saved = localStorage.getItem(CONFIG_KEY);
  return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
}

export function saveConfig(config: AppConfig): void {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}

export function getAllRecords(): DailyRecord[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(RECORDS_KEY);
  if (!saved) return [];
  return JSON.parse(saved) as DailyRecord[];
}

export function getRecord(date: string): DailyRecord | null {
  return getAllRecords().find(r => r.date === date) ?? null;
}

export function saveRecord(record: DailyRecord): void {
  const records = getAllRecords();
  const idx = records.findIndex(r => r.date === record.date);
  if (idx >= 0) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  records.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
}

export function getLatestRecord(): DailyRecord | null {
  const records = getAllRecords();
  return records.length > 0 ? records[records.length - 1] : null;
}

export function getRecentRecords(days: number): DailyRecord[] {
  const records = getAllRecords();
  return records.slice(-days);
}

export function getWeekRecords(endDate: string): DailyRecord[] {
  const records = getAllRecords();
  const end = new Date(endDate);
  const start = new Date(endDate);
  start.setDate(start.getDate() - 6);
  return records.filter(r => {
    const d = new Date(r.date);
    return d >= start && d <= end;
  });
}
