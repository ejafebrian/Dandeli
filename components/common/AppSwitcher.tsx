'use client';

import React from 'react';
import { DandeliLogo } from './DandeliLogo';
import { Smartphone, Bike, LayoutDashboard, Layers, Zap, RotateCcw, Moon, Sun, SmartphoneCharging } from 'lucide-react';
import { useDandeli } from '@/lib/DandeliContext';

export type AppMode = 'USER' | 'DRIVER' | 'ADMIN' | 'SIMULATOR' | 'DOCS';

interface AppSwitcherProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
  phoneFrame: boolean;
  onTogglePhoneFrame: () => void;
}

export function AppSwitcher({
  currentMode,
  onSelectMode,
  phoneFrame,
  onTogglePhoneFrame,
}: AppSwitcherProps) {
  const { resetAllData } = useDandeli();

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <DandeliLogo size="sm" showSlogan={false} />
          <span className="hidden sm:inline-block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            Ekosistem Terintegrasi
          </span>
        </div>

        {/* Mode Selector Segmented Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectMode('SIMULATOR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              currentMode === 'SIMULATOR'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden md:inline">⚡ Dual Simulator</span>
            <span className="md:hidden">Simulator</span>
          </button>

          <button
            onClick={() => onSelectMode('USER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              currentMode === 'USER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>1. User App</span>
          </button>

          <button
            onClick={() => onSelectMode('DRIVER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              currentMode === 'DRIVER'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>2. Driver App</span>
          </button>

          <button
            onClick={() => onSelectMode('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              currentMode === 'ADMIN'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>3. Admin</span>
          </button>

          <button
            onClick={() => onSelectMode('DOCS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all ${
              currentMode === 'DOCS'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Arsitektur & API</span>
            <span className="lg:hidden">Docs</span>
          </button>
        </div>

        {/* Right Utility Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {(currentMode === 'USER' || currentMode === 'DRIVER') && (
            <button
              onClick={onTogglePhoneFrame}
              title={phoneFrame ? 'Ubah ke Tampilan Penuh' : 'Ubah ke Frame Android'}
              className={`p-2 rounded-xl text-xs font-semibold border transition-colors ${
                phoneFrame
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <SmartphoneCharging className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={toggleDark}
            title="Toggle Dark Mode"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors"
          >
            <Moon className="w-4 h-4" />
          </button>

          <button
            onClick={resetAllData}
            title="Reset Data Demo"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-500 hover:text-red-600 border border-slate-200 dark:border-slate-700 hover:bg-red-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
