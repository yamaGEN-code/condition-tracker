'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import { saveRecord, getRecord } from '@/lib/storage';
import type { DailyRecord, SnackLevel, MealSize } from '@/lib/types';

function today(): string {
  return new Date().toISOString().split('T')[0];
}

const SNACK_OPTIONS: { value: SnackLevel; label: string }[] = [
  { value: 'none', label: 'なし' },
  { value: 'little', label: '少し' },
  { value: 'moderate', label: '多め' },
  { value: 'excessive', label: '過多' },
];

const MEAL_OPTIONS: { value: MealSize; label: string }[] = [
  { value: 'light', label: '軽め' },
  { value: 'normal', label: '普通' },
  { value: 'large', label: '多め' },
];

function SegmentButtons<T extends string>({
  options,
  value,
  onChange,
  activeClass,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  activeClass: string;
}) {
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value === opt.value
              ? activeClass
              : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NumberRow({
  count,
  value,
  onChange,
  activeClass,
}: {
  count: number;
  value: number;
  onChange: (v: number) => void;
  activeClass: string;
}) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
            value === i ? activeClass : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}
        >
          {i}
        </button>
      ))}
    </div>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {children}
    </div>
  );
}

export default function InputPage() {
  const router = useRouter();
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState('');
  const [sleepScore, setSleepScore] = useState('');
  const [pain, setPain] = useState(0);
  const [mood, setMood] = useState(2);
  const [drinkHome, setDrinkHome] = useState(false);
  const [drinkOut, setDrinkOut] = useState(false);
  const [snack, setSnack] = useState<SnackLevel>('none');
  const [mealSize, setMealSize] = useState<MealSize>('normal');
  const [steps, setSteps] = useState('');
  const [training, setTraining] = useState(false);
  const [calorieBalance, setCalorieBalance] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getRecord(date);
    if (existing) {
      setWeight(existing.weight.toString());
      setSleepScore(existing.sleepScore.toString());
      setPain(existing.pain);
      setMood(existing.mood);
      setDrinkHome(existing.drinkHome);
      setDrinkOut(existing.drinkOut);
      setSnack(existing.snack);
      setMealSize(existing.mealSize);
      setSteps(existing.steps.toString());
      setTraining(existing.training);
      setCalorieBalance(
        typeof existing.calorieBalance === 'number' ? existing.calorieBalance.toString() : ''
      );
    } else {
      setWeight('');
      setSleepScore('');
      setPain(0);
      setMood(2);
      setDrinkHome(false);
      setDrinkOut(false);
      setSnack('none');
      setMealSize('normal');
      setSteps('');
      setTraining(false);
      setCalorieBalance('');
    }
  }, [date]);

  const handleSave = () => {
    const parsedCalorie = parseInt(calorieBalance, 10);
    const record: DailyRecord = {
      date,
      weight: parseFloat(weight) || 0,
      sleepScore: parseInt(sleepScore) || 0,
      pain,
      mood,
      drinkHome,
      drinkOut,
      snack,
      mealSize,
      steps: parseInt(steps) || 0,
      training,
      calorieBalance:
        calorieBalance.trim() === '' || Number.isNaN(parsedCalorie) ? undefined : parsedCalorie,
    };
    saveRecord(record);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push('/');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-base font-bold text-gray-700 mb-4">記録を入力</h1>

        <div className="space-y-3">
          <Card label="日付">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </Card>

          <Card label="体重 (kg)">
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              placeholder="例: 71.5"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </Card>

          <Card label="1日のカロリー収支（Huaweiヘルス）">
            <input
              type="number"
              inputMode="numeric"
              step="1"
              value={calorieBalance}
              onChange={e => setCalorieBalance(e.target.value)}
              placeholder="例: -463"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Huawei Healthの「カロリー収支」を入力してください。赤字はマイナス、黒字はプラスで入力します。
            </p>
          </Card>

          <Card label="睡眠スコア（Huaweiヘルス）">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="100"
              value={sleepScore}
              onChange={e => setSleepScore(e.target.value)}
              placeholder="例: 82"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </Card>

          <Card label="身体の痛み（0=なし / 4=強い）">
            <NumberRow
              count={5}
              value={pain}
              onChange={setPain}
              activeClass="bg-red-500 text-white border-red-500"
            />
          </Card>

          <Card label="今日の気分（0=とても悪い / 4=とても良い）">
            <NumberRow
              count={5}
              value={mood}
              onChange={setMood}
              activeClass="bg-green-500 text-white border-green-500"
            />
          </Card>

          <Card label="前日の飲酒">
            <div className="flex gap-3">
              <button
                onClick={() => setDrinkHome(v => !v)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  drinkHome
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                自宅　{drinkHome ? 'あり' : 'なし'}
              </button>
              <button
                onClick={() => setDrinkOut(v => !v)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  drinkOut
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                外飲み　{drinkOut ? 'あり' : 'なし'}
              </button>
            </div>
          </Card>

          <Card label="前日の間食">
            <SegmentButtons
              options={SNACK_OPTIONS}
              value={snack}
              onChange={setSnack}
              activeClass="bg-purple-500 text-white border-purple-500"
            />
          </Card>

          <Card label="前日の食事量">
            <SegmentButtons
              options={MEAL_OPTIONS}
              value={mealSize}
              onChange={setMealSize}
              activeClass="bg-teal-500 text-white border-teal-500"
            />
          </Card>

          <Card label="前日の歩数（Huaweiヘルス）">
            <input
              type="number"
              inputMode="numeric"
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder="例: 8500"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </Card>

          <Card label="前日の筋トレ">
            <div className="flex gap-2">
              <button
                onClick={() => setTraining(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  training
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                した
              </button>
              <button
                onClick={() => setTraining(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  !training
                    ? 'bg-gray-300 text-gray-700 border-gray-300'
                    : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                しない
              </button>
            </div>
          </Card>

          <button
            onClick={handleSave}
            disabled={!weight || saved}
            className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
              saved
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white disabled:bg-gray-300 disabled:text-gray-400'
            }`}
          >
            {saved ? '保存しました' : '保存する'}
          </button>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
