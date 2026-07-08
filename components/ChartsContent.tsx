'use client';

import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import type { DailyRecord, AppConfig } from '@/lib/types';

const SNACK_LABELS: Record<string, string> = {
  none: 'なし', little: '少し', moderate: '多め', excessive: '過多',
};
const MEAL_LABELS: Record<string, string> = {
  light: '軽め', normal: '普通', large: '多め',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h2 className="text-sm font-bold text-gray-600 mb-3">{title}</h2>
      {children}
    </div>
  );
}

export default function ChartsContent({
  records,
  config,
}: {
  records: DailyRecord[];
  config: AppConfig;
}) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 text-center text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  const data = records.map(r => ({
    date: r.date.slice(5),
    weight: r.weight,
    sleep: r.sleepScore,
    steps: r.steps,
    pain: r.pain,
    mood: r.mood,
  }));

  const weights = records.map(r => r.weight);
  const weightMin = Math.floor(Math.min(...weights) - 0.5);
  const weightMax = Math.ceil(Math.max(...weights) + 0.5);

  return (
    <div className="space-y-4">
      <Section title="体重推移">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[weightMin, weightMax]} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [`${v.toFixed(1)}kg`, '体重']} />
            <ReferenceLine
              y={config.goalWeight}
              stroke="#ef4444"
              strokeDasharray="4 4"
              label={{ value: `目標${config.goalWeight}`, fontSize: 9, fill: '#ef4444', position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      <Section title="睡眠スコア推移">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [v, 'スコア']} />
            <Bar dataKey="sleep" fill="#6366f1" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="歩数推移">
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(v: number) => [`${v.toLocaleString('ja-JP')}歩`, '歩数']} />
            <Bar dataKey="steps" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Section>

      <Section title="身体の痛み・気分の推移">
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis domain={[0, 4]} ticks={[0, 1, 2, 3, 4]} tick={{ fontSize: 10 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line
              type="monotone"
              dataKey="pain"
              name="痛み"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              name="気分"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Section>

      <Section title="飲酒・間食・筋トレ">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left pb-2 font-medium">日付</th>
                <th className="text-center pb-2 font-medium">自宅飲</th>
                <th className="text-center pb-2 font-medium">外飲み</th>
                <th className="text-center pb-2 font-medium">間食</th>
                <th className="text-center pb-2 font-medium">食事量</th>
                <th className="text-center pb-2 font-medium">筋トレ</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.date} className="border-b border-gray-50">
                  <td className="py-1.5 text-gray-600">{r.date.slice(5)}</td>
                  <td className="text-center">{r.drinkHome ? '●' : '–'}</td>
                  <td className="text-center">{r.drinkOut ? '●' : '–'}</td>
                  <td className="text-center text-gray-600">{SNACK_LABELS[r.snack]}</td>
                  <td className="text-center text-gray-600">{MEAL_LABELS[r.mealSize]}</td>
                  <td className="text-center">{r.training ? '●' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
