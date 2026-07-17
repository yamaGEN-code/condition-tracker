import type { DailyRecord } from './types';

export interface DerivedRecord extends DailyRecord {
  cumulativeCalorie: number | null; // 記録開始日からの累積カロリー収支。データが一度もない期間はnull
  movingAvgWeight: number | null; // 当日を含む直近7日の体重移動平均。7日分そろわない場合はnull
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

// records は日付昇順で全期間分を渡すこと。累積・移動平均は表示期間外の過去データにも依存するため。
export function computeDerivedSeries(records: DailyRecord[]): DerivedRecord[] {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  let runningCalorie: number | null = null;

  return sorted.map(r => {
    if (typeof r.calorieBalance === 'number') {
      runningCalorie = (runningCalorie ?? 0) + r.calorieBalance;
    }

    const windowStart = addDays(r.date, -6);
    const window = sorted.filter(x => x.date >= windowStart && x.date <= r.date);
    const movingAvgWeight =
      window.length >= 7
        ? Math.round((window.reduce((sum, x) => sum + x.weight, 0) / window.length) * 10) / 10
        : null;

    return { ...r, cumulativeCalorie: runningCalorie, movingAvgWeight };
  });
}

export function formatSignedInt(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toLocaleString('ja-JP')}`;
}

export function formatSignedDecimal1(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}`;
}
