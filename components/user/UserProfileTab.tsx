'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import {
  User,
  Phone,
  Mail,
  ShieldCheck,
  MapPin,
  Moon,
  Sun,
  HelpCircle,
  LogOut,
  ChevronRight,
  Headphones,
  Check,
} from 'lucide-react';
import Image from 'next/image';

export function UserProfileTab() {
  const { state, resetAllData } = useDandeli();
  const [isDark, setIsDark] = useState(false);
  const [csModalOpen, setCsModalOpen] = useState(false);
  const [csMessage, setCsMessage] = useState('');
  const [csSuccess, setCsSuccess] = useState(false);

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleSendCS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csMessage.trim()) return;
    setCsSuccess(true);
    setTimeout(() => {
      setCsSuccess(false);
      setCsModalOpen(false);
      setCsMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Profile Header Card */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-emerald-500 shadow-md">
          <Image
            src={state.user.avatar}
            alt={state.user.name}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white truncate">
              {state.user.name}
            </h3>
            <span className="shrink-0 inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
              <ShieldCheck className="w-3 h-3" /> Terverifikasi
            </span>
          </div>

          <p className="text-xs text-slate-500 font-mono mt-0.5">{state.user.phone}</p>
          <p className="text-xs text-slate-400 truncate">{state.user.email}</p>
        </div>
      </div>

      {/* Account Settings Menu */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden shadow-xs">
        {/* Saved Addresses */}
        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Alamat Tersimpan</h4>
              <p className="text-[11px] text-slate-400">Rumah & Kantor untuk pesan cepat</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Dark Mode Switcher */}
        <div
          onClick={toggleDarkMode}
          className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
              {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Mode Tampilan</h4>
              <p className="text-[11px] text-slate-400">
                {isDark ? 'Mode Gelap (Aktif)' : 'Mode Terang (Aktif)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Toggle theme"
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isDark ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Customer Service / Help Center */}
        <div
          onClick={() => setCsModalOpen(true)}
          className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pusat Bantuan DANDELI Care</h4>
              <p className="text-[11px] text-slate-400">Hubungi CS 24/7 untuk keluhan & tiket</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Reset State Demo Data */}
        <div
          onClick={resetAllData}
          className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-red-600">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-red-600 dark:text-red-400">Reset Demo Data Ekosistem</h4>
              <p className="text-[11px] text-slate-400">Kembalikan data pesanan dan driver ke awal</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400">v1.0 DANDELI</span>
        </div>
      </div>

      {/* Customer Service Modal */}
      {csModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  DANDELI Care 24 Jam
                </h3>
              </div>
              <button
                onClick={() => setCsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                ✕
              </button>
            </div>

            {csSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Tiket Bantuan Terkirim!
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tim operasional DANDELI akan merespons dalam waktu 5-15 menit.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendCS} className="space-y-3">
                <p className="text-xs text-slate-500">
                  Tuliskan pertanyaan, kendala saldo, atau keluhan perjalanan Anda di bawah ini:
                </p>
                <textarea
                  value={csMessage}
                  onChange={(e) => setCsMessage(e.target.value)}
                  placeholder="Ceritakan kendala Anda..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Kirim Tiket Keluhan
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
