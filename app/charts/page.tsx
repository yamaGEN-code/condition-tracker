'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import BottomNav from '@/components/BottomNav';
import { getRecentRecords, getConfig } from '@/lib/storage';
import type { DailyRecord, AppConfig } from '@/lib/types';

const ChartsContent = dynamic(() => import('@/components/ChartsContent'), { ssr: false });

const PERIODS = [7, 14, 30] as const;

export default function ChartsPage() {
  const [records, setRecords] = useState<DailyRecord[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [period, setPeriod] = useState<7 | 14 | 30>(14);

  useEffect(() => {
    setConfig(getConfig());
    setRecords(getRecentRecords(period));
  }, [period]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-base font-bold text-gray-700 mb-4">グラフ</h1>

        <div className="flex gap-2 mb-4">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {p}日
            </button>
          ))}
        </div>

        {config && <ChartsContent records={records} config={config} />}
      </div>
      <BottomNav />
    </div>
  );
}
