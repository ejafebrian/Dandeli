'use client';

import React from 'react';
import { UserApp } from '@/components/user/UserApp';
import { DriverApp } from '@/components/driver/DriverApp';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import { Smartphone, Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export function EcosystemSimulator() {
  const { state } = useDandeli();

  const activeOrdersCount = state.orders.filter(
    (o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 font-sans">
      {/* Ecosystem Interactive Demonstration Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white border border-emerald-800/60 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
              SIMULASI SINKRONISASI REAL-TIME DANDELI
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight">
            Uji Alur Pesanan: Pelanggan (Kiri) ↔ Mitra Driver (Kanan)
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Pesan layanan <strong>Ride / Food / Send</strong> pada aplikasi User di sisi kiri. Order akan langsung diteruskan ke aplikasi Driver di sisi kanan secara real-time dengan timer penerimaan order 30 detik!
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 backdrop-blur-xs">
          <div>
            <span className="text-[10px] text-emerald-300 block">Order Aktif</span>
            <span className="text-base font-bold text-white tabular-nums">
              {activeOrdersCount}
            </span>
          </div>
          <div className="w-px h-6 bg-white/20"></div>
          <div>
            <span className="text-[10px] text-emerald-300 block">Saldo User</span>
            <span className="text-base font-bold text-emerald-400 tabular-nums">
              {formatRupiah(state.user.walletBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Side-by-side Dual Android Viewport Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-center">
        {/* Left Column: DANDELI USER Phone Viewport */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
              1. DANDELI USER (Pelanggan)
            </span>
            <span className="text-xs text-slate-500">Android Touch Shell</span>
          </div>

          {/* Android Mobile Frame Mockup */}
          <div className="w-full max-w-[410px] rounded-[44px] p-3 bg-slate-900 shadow-2xl border-4 border-slate-700/80 ring-1 ring-black/40">
            {/* Notch / Speaker bar */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Screen View */}
            <div className="rounded-[32px] overflow-hidden bg-white dark:bg-slate-950 h-[680px] overflow-y-auto border border-slate-800 shadow-inner">
              <UserApp />
            </div>

            {/* Home indicator bar */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2.5"></div>
          </div>
        </div>

        {/* Right Column: DANDELI DRIVER Phone Viewport */}
        <div className="flex flex-col items-center">
          <div className="mb-2 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500 text-xs font-bold shadow-xs">
              2. DANDELI DRIVER (Mitra Pengemudi)
            </span>
            <span className="text-xs text-slate-500">Android Touch Shell</span>
          </div>

          {/* Android Mobile Frame Mockup */}
          <div className="w-full max-w-[410px] rounded-[44px] p-3 bg-slate-900 shadow-2xl border-4 border-emerald-900/60 ring-1 ring-black/40">
            {/* Notch / Speaker bar */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
              <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
            </div>

            {/* Screen View */}
            <div className="rounded-[32px] overflow-hidden bg-slate-950 h-[680px] overflow-y-auto border border-slate-800 shadow-inner">
              <DriverApp />
            </div>

            {/* Home indicator bar */}
            <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2.5"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
