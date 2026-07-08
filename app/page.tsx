'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { getLatestRecord, getConfig } from '@/lib/storage';
import type { DailyRecord, AppConfig } from '@/lib/types';

function calcStatus(config: AppConfig, currentWeight: number) {
  const start = new Date(config.startDate);
  const end = new Date(config.targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.ceil((end.getTime() - start.getTime()) / 86400000);
  const elapsed = Math.max(0, Math.ceil((today.getTime() - start.getTime()) / 86400000));
  const daysRemaining = Math.max(0, Math.ceil((end.getTime() - today.getTime()) / 86400000));
  const required = config.startWeight - config.goalWeight;
  const expected = config.startWeight - (elapsed / totalDays) * required;

  let mark: string;
  let label: string;
  if (currentWeight <= expected) {
    mark = '🟢'; label = '順調';
  } else if (currentWeight <= expected + 0.5) {
    mark = '🟡'; label = '少し遅れ';
  } else {
    mark = '🔴'; label = '要注意';
  }

  return { mark, label, daysRemaining };
}

function RecordDisplay({ record, config }: { record: DailyRecord; config: AppConfig }) {
  const { mark, label, daysRemaining } = calcStatus(config, record.weight);
  const toGoal = Math.max(0, record.weight - config.goalWeight);

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-400 mb-1">最新体重　{record.date}</p>
            <p className="text-4xl font-bold text-gray-900 tracking-tight">
              {record.weight.toFixed(1)}
              <span className="text-lg font-normal text-gray-400 ml-1">kg</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl leading-none">{mark}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">目標まであと</p>
          <p className="text-2xl font-bold text-blue-600">
            {toGoal.toFixed(1)}
            <span className="text-sm font-normal text-gray-400 ml-1">kg</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">目標 {config.goalWeight}kg</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-gray-400 mb-1">釣行まであと</p>
          <p className="text-2xl font-bold text-orange-500">
            {daysRemaining}
            <span className="text-sm font-normal text-gray-400 ml-1">日</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">{config.targetDate}</p>
        </div>
      </div>

      <Link
        href="/input"
        className="block w-full bg-blue-600 text-white text-center py-3 rounded-2xl text-sm font-medium"
      >
        今日の記録を入力
      </Link>
    </div>
  );
}

export default function TodayPage() {
  const [record, setRecord] = useState<DailyRecord | null>(null);
  const [config, setConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    setConfig(getConfig());
    setRecord(getLatestRecord());
  }, []);

  if (!config) return null;

  const today = new Date();
  const dateStr = today.toLocaleDateString('ja-JP', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'short',
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        <h1 className="text-base font-bold text-gray-700 mb-1">コンディション管理</h1>
        <p className="text-xs text-gray-400 mb-6">{dateStr}</p>

        {record ? (
          <RecordDisplay record={record} config={config} />
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
            <p className="text-gray-400 text-sm mb-4">まだデータがありません</p>
            <Link
              href="/input"
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium"
            >
              最初の記録を入力
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
