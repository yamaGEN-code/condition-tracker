'use client';

import { useState, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import { getAllRecords, getConfig } from '@/lib/storage';
import { computeDerivedSeries, formatSignedInt, formatSignedDecimal1 } from '@/lib/calc';
import type { AppConfig, DailyRecord } from '@/lib/types';
import type { DerivedRecord } from '@/lib/calc';

function avg(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function fmt(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

function lastSunday(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().split('T')[0];
}

function buildGptText(
  records: DerivedRecord[],
  startDate: string,
  endDate: string,
  config: AppConfig,
  weightAvgStats: {
    startMovingAvg: number | null;
    endMovingAvg: number | null;
    movingAvgChange: number | null;
  },
  calorieStats: { calorieSum: number; calorieDays: number },
): string {
  const firstWeight = records[0]?.weight ?? 0;
  const lastWeight = records[records.length - 1]?.weight ?? 0;
  const change = lastWeight - firstWeight;
  const avgWeight = avg(records.map(r => r.weight));
  const avgSleep = avg(records.map(r => r.sleepScore));
  const avgPain = avg(records.map(r => r.pain));
  const avgMood = avg(records.map(r => r.mood));
  const avgSteps = avg(records.map(r => r.steps));
  const drinkHome = records.filter(r => r.drinkHome).length;
  const drinkOut = records.filter(r => r.drinkOut).length;
  const { startMovingAvg, endMovingAvg, movingAvgChange } = weightAvgStats;
  const { calorieSum, calorieDays } = calorieStats;
  const snack = {
    none: records.filter(r => r.snack === 'none').length,
    little: records.filter(r => r.snack === 'little').length,
    moderate: records.filter(r => r.snack === 'moderate').length,
    excessive: records.filter(r => r.snack === 'excessive').length,
  };
  const meal = {
    light: records.filter(r => r.mealSize === 'light').length,
    normal: records.filter(r => r.mealSize === 'normal').length,
    large: records.filter(r => r.mealSize === 'large').length,
  };
  const training = records.filter(r => r.training).length;

  return `9月下旬の渓流釣行に向けたコンディション管理の週次集計です。
目標は${config.goalWeight}kg以下、できれば${config.stretchGoalWeight}kgです。
今週のデータをもとに、体重管理・睡眠・歩行量・筋トレ・飲酒・間食・渡渉コンディションの観点から、傾向分析と来週の重点ポイントを提案してください。

【期間】
${fmt(startDate)}〜${fmt(endDate)}

【体重】
開始：${firstWeight.toFixed(1)}kg
終了：${lastWeight.toFixed(1)}kg
変化：${change >= 0 ? '+' : ''}${change.toFixed(1)}kg
平均：${avgWeight.toFixed(1)}kg

【7日移動平均体重】
開始：${startMovingAvg !== null ? `${startMovingAvg.toFixed(1)}kg` : 'データ不足'}
終了：${endMovingAvg !== null ? `${endMovingAvg.toFixed(1)}kg` : 'データ不足'}
変化：${movingAvgChange !== null ? `${formatSignedDecimal1(movingAvgChange)}kg` : 'データ不足'}

【カロリー収支】
7日間合計：${calorieDays > 0 ? `${formatSignedInt(calorieSum)}kcal` : 'データ不足'}
入力日数：${calorieDays}日／7日

【睡眠】
平均スコア：${Math.round(avgSleep)}点

【身体の痛み】
平均：${avgPain.toFixed(1)} / 4

【気分】
平均：${avgMood.toFixed(1)} / 4

【歩数】
平均：${Math.round(avgSteps).toLocaleString('ja-JP')}歩

【飲酒】
自宅飲酒：${drinkHome}日
外飲酒：${drinkOut}日

【間食】
なし：${snack.none}日
少し：${snack.little}日
多め：${snack.moderate}日
過多：${snack.excessive}日

【食事量】
軽め：${meal.light}日
普通：${meal.normal}日
多め：${meal.large}日

【筋トレ】
実施：${training}日`;
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

export default function WeeklyPage() {
  const [endDate, setEndDate] = useState(lastSunday());
  const [allRecords, setAllRecords] = useState<DailyRecord[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfig(getConfig());
    setAllRecords(getAllRecords());
  }, []);

  if (!config) return null;

  const startDate = addDays(endDate, -6);
  const derivedAll = computeDerivedSeries(allRecords);
  const records = derivedAll.filter(r => r.date >= startDate && r.date <= endDate);
  const hasData = records.length > 0;

  const firstWeight = records[0]?.weight ?? 0;
  const lastWeight = records[records.length - 1]?.weight ?? 0;
  const weightChange = lastWeight - firstWeight;
  const avgWeight = avg(records.map(r => r.weight));
  const avgSleep = avg(records.map(r => r.sleepScore));
  const avgPain = avg(records.map(r => r.pain));
  const avgMood = avg(records.map(r => r.mood));
  const avgSteps = avg(records.map(r => r.steps));
  const drinkHome = records.filter(r => r.drinkHome).length;
  const drinkOut = records.filter(r => r.drinkOut).length;
  const training = records.filter(r => r.training).length;

  const startMovingAvg = derivedAll.find(r => r.date === startDate)?.movingAvgWeight ?? null;
  const endMovingAvg = derivedAll.find(r => r.date === endDate)?.movingAvgWeight ?? null;
  const movingAvgChange =
    startMovingAvg !== null && endMovingAvg !== null ? endMovingAvg - startMovingAvg : null;

  const calorieEntries = records
    .map(r => r.calorieBalance)
    .filter((v): v is number => typeof v === 'number');
  const calorieSum = calorieEntries.reduce((a, b) => a + b, 0);
  const calorieDays = calorieEntries.length;

  const gptText = hasData
    ? buildGptText(
        records,
        startDate,
        endDate,
        config,
        { startMovingAvg, endMovingAvg, movingAvgChange },
        { calorieSum, calorieDays },
      )
    : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(gptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-base font-bold text-gray-700 mb-4">週次集計</h1>

        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm mb-4">
          <button
            onClick={() => setEndDate(addDays(endDate, -7))}
            className="text-blue-600 text-lg px-2 py-1"
          >
            ◀
          </button>
          <span className="text-sm text-gray-700 font-medium">
            {fmt(startDate)} 〜 {fmt(endDate)}
          </span>
          <button
            onClick={() => setEndDate(addDays(endDate, 7))}
            className="text-blue-600 text-lg px-2 py-1"
          >
            ▶
          </button>
        </div>

        {!hasData ? (
          <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">
            この週のデータがありません
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">体重</p>
              <div className="grid grid-cols-2 gap-x-4">
                <Row label="開始" value={`${firstWeight.toFixed(1)}kg`} />
                <Row label="終了" value={`${lastWeight.toFixed(1)}kg`} />
                <Row
                  label="変化"
                  value={`${weightChange >= 0 ? '+' : ''}${weightChange.toFixed(1)}kg`}
                />
                <Row label="平均" value={`${avgWeight.toFixed(1)}kg`} />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">7日移動平均体重</p>
              <div className="grid grid-cols-2 gap-x-4">
                <Row
                  label="開始"
                  value={startMovingAvg !== null ? `${startMovingAvg.toFixed(1)}kg` : 'データ不足'}
                />
                <Row
                  label="終了"
                  value={endMovingAvg !== null ? `${endMovingAvg.toFixed(1)}kg` : 'データ不足'}
                />
                <Row
                  label="変化"
                  value={movingAvgChange !== null ? `${formatSignedDecimal1(movingAvgChange)}kg` : 'データ不足'}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">カロリー収支</p>
              <Row
                label="7日間合計"
                value={calorieDays > 0 ? `${formatSignedInt(calorieSum)}kcal` : 'データ不足'}
              />
              <Row label="入力日数" value={`${calorieDays}日／7日`} />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">コンディション</p>
              <Row label="平均睡眠スコア" value={`${Math.round(avgSleep)}点`} />
              <Row label="身体の痛み（平均）" value={`${avgPain.toFixed(1)} / 4`} />
              <Row label="気分（平均）" value={`${avgMood.toFixed(1)} / 4`} />
              <Row label="平均歩数" value={`${Math.round(avgSteps).toLocaleString('ja-JP')}歩`} />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">飲酒・筋トレ</p>
              <Row label="自宅飲酒" value={`${drinkHome}日`} />
              <Row label="外飲酒" value={`${drinkOut}日`} />
              <Row label="筋トレ実施" value={`${training}日`} />
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs font-bold text-gray-400 mb-2">間食・食事量</p>
              <div className="grid grid-cols-2 gap-x-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">間食</p>
                  {(['none', 'little', 'moderate', 'excessive'] as const).map(k => {
                    const labels = { none: 'なし', little: '少し', moderate: '多め', excessive: '過多' };
                    const count = records.filter(r => r.snack === k).length;
                    return (
                      <Row key={k} label={labels[k]} value={`${count}日`} />
                    );
                  })}
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">食事量</p>
                  {(['light', 'normal', 'large'] as const).map(k => {
                    const labels = { light: '軽め', normal: '普通', large: '多め' };
                    const count = records.filter(r => r.mealSize === k).length;
                    return (
                      <Row key={k} label={labels[k]} value={`${count}日`} />
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-bold text-blue-700">GPTへ相談するテキスト</p>
                <button
                  onClick={handleCopy}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {copied ? 'コピー完了' : 'コピー'}
                </button>
              </div>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed bg-white rounded-lg p-3">
                {gptText}
              </pre>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
