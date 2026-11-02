'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  ShieldCheck,
  Plus,
  Tag,
  Copy,
  Check,
  Building2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function UserWalletTab() {
  const { state, topUpWallet } = useDandeli();
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [amountSelected, setAmountSelected] = useState(100000);
  const [methodSelected, setMethodSelected] = useState('BCA Virtual Account');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const presets = [50000, 100000, 200000, 500000];
  const methods = [
    { name: 'BCA Virtual Account', icon: Building2 },
    { name: 'Mandiri Virtual Account', icon: Building2 },
    { name: 'QRIS Real-time Settlement', icon: QrCode },
  ];

  const handleConfirmTopUp = () => {
    topUpWallet(amountSelected, methodSelected);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTopUpModalOpen(false);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Wallet Master Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-950 p-6 text-white shadow-xl shadow-emerald-900/20">
        {/* Aerodynamic decorative background shapes */}
        <div className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-4 bottom-4 opacity-15">
          <Wallet className="w-28 h-28" />
        </div>

        <div className="relative z-10 flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-300"></span>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-100">
                DANDELI WALLET
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-semibold text-white backdrop-blur-xs flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Terverifikasi OJK / BI
            </span>
          </div>

          <div>
            <span className="text-xs text-emerald-200">Saldo Aktif Tersedia</span>
            <h2 className="text-3xl font-black tracking-tight tabular-nums mt-0.5">
              {formatRupiah(state.user.walletBalance)}
            </h2>
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-200 pt-2 border-t border-white/15">
            <span>Nomor Akun: {state.user.phone}</span>
            <span>Status: Aktif</span>
          </div>
        </div>
      </div>

      {/* Quick Wallet Actions */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          onClick={() => setTopUpModalOpen(true)}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1.5 shadow-xs hover:border-emerald-500 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Top Up</span>
        </button>

        <button
          onClick={() => alert('Fitur Transfer Sesama Pengguna DANDELI: Masukkan nomor ponsel tujuan.')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1.5 shadow-xs hover:border-emerald-500 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Kirim</span>
        </button>

        <button
          onClick={() => alert('Simulasi Scan QRIS DANDELI: Siap membayar di merchant rekanan offline.')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1.5 shadow-xs hover:border-emerald-500 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Bayar QRIS</span>
        </button>

        <button
          onClick={() => alert('Tarik Saldo ke Rekening Bank terdaftar akan diproses dalam 1-5 menit.')}
          className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center gap-1.5 shadow-xs hover:border-emerald-500 transition-all active:scale-95"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">Tarik Tunai</span>
        </button>
      </div>

      {/* Promo Vouchers Available */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
            Voucher & Promo Aktif
          </h3>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {state.promotions.filter((p) => p.isActive).length} Promo
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.promotions.map((promo) => (
            <div
              key={promo.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400">
                    {promo.code}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{promo.title}</h4>
                <p className="text-[11px] text-slate-500 leading-snug">{promo.description}</p>
                <div className="text-[10px] text-slate-400 pt-1">
                  Berlaku hingga: {promo.validUntil}
                </div>
              </div>

              <button
                onClick={() => handleCopyCode(promo.code)}
                className="shrink-0 p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 text-slate-700 dark:text-slate-200 transition-colors"
                title="Salin Kode Promo"
              >
                {copiedCode === promo.code ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History Mutations */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Mutasi Transaksi Terakhir
        </h3>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden shadow-xs">
          {state.walletTransactions.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">Belum ada riwayat mutasi</div>
          ) : (
            state.walletTransactions.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'TOPUP' || tx.type === 'REFUND' || tx.type === 'EARNING'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tx.type === 'TOPUP' || tx.type === 'REFUND' || tx.type === 'EARNING' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {tx.description}
                    </h5>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>{new Date(tx.timestamp).toLocaleString('id-ID')}</span>
                      <span>·</span>
                      <span className="font-semibold text-emerald-600">{tx.method}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-black tabular-nums block ${
                      tx.type === 'TOPUP' || tx.type === 'REFUND' || tx.type === 'EARNING'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {tx.type === 'TOPUP' || tx.type === 'REFUND' || tx.type === 'EARNING' ? '+' : '-'}
                    {formatRupiah(tx.amount)}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase">
                    {tx.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Interactive Top Up Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Top Up DANDELI Wallet
                </h3>
                <p className="text-xs text-slate-500">Pilih nominal dan saluran pembayaran</p>
              </div>
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Pilih Nominal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountSelected(val)}
                    className={`py-3 px-4 rounded-xl border font-bold text-xs tabular-nums text-center transition-all ${
                      amountSelected === val
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {formatRupiah(val)}
                  </button>
                ))}
              </div>
            </div>

            {/* Methods */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                Metode Pembayaran
              </label>
              <div className="space-y-2">
                {methods.map((m) => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setMethodSelected(m.name)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                        methodSelected === m.name
                          ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span>{m.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-semibold">Instan</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleConfirmTopUp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
              >
                Konfirmasi Top Up {formatRupiah(amountSelected)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
