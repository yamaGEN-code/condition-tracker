'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_VERSION } from '@/lib/version';

const tabs = [
  { href: '/', label: '今日' },
  { href: '/input', label: '入力' },
  { href: '/charts', label: 'グラフ' },
  { href: '/weekly', label: '週次' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-bottom">
      <div className="flex">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center py-3 text-sm font-medium transition-colors ${
              pathname === tab.href
                ? 'text-blue-600'
                : 'text-gray-400'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <p className="text-center text-[9px] text-gray-300 pb-0.5 leading-none">
        v{APP_VERSION}
      </p>
    </nav>
  );
}
