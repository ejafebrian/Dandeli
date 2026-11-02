'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import { Wallet, ArrowDownLeft, Building2, TrendingUp, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export function DriverEarningsTab() {
  const { currentDriver, withdrawDriverBalance, state } = useDandeli();
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(100000);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  if (!currentDriver) return null;

  const handleWithdraw = () => {
    if (withdrawAmount > currentDriver.walletBalance) {
      alert('Saldo tidak mencukupi untuk penarikan ini.');
      return;
    }
    withdrawDriverBalance(currentDriver.id, withdrawAmount);
    setWithdrawSuccess(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    setTimeout(() => {
      setWithdrawSuccess(false);
      setWithdrawModalOpen(false);
    }, 1500);
  };

  // Filter wallet transactions for this driver
  const driverTx = state.walletTransactions.filter(
    (tx) => tx.userIdOrDriverId === currentDriver.id
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Driver Balance Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400">
              SALDO MITRA DANDELI
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {currentDriver.vehiclePlate}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-400">Total Saldo Dompet Driver</span>
          <h2 className="text-3xl font-black tabular-nums tracking-tight text-white mt-0.5">
            {formatRupiah(currentDriver.walletBalance)}
          </h2>
        </div>

        <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            <span className="block text-[10px] uppercase">Rekening Pencairan</span>
            <span className="font-semibold text-slate-200">
              {currentDriver.bankAccount.bankName} · {currentDriver.bankAccount.accountNumber}
            </span>
          </div>

          <button
            onClick={() => setWithdrawModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
          >
            Tarik Dana
          </button>
        </div>
      </div>

      {/* Daily Performance Metrics */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            Trip Hari Ini
          </span>
          <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
            6
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            Penerimaan
          </span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
            98.5%
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-xs">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block">
            Rating Mitra
          </span>
          <span className="text-lg font-black text-amber-500 tabular-nums">
            ★ {currentDriver.rating}
          </span>
        </div>
      </div>

      {/* Financial Split Explanatory Card */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-2">
        <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-emerald-600" /> Skema Komisi DANDELI Adil
        </h4>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Mitra mengantongi <strong>85%</strong> dari total argo pelanggan. Komisi platform 15% digunakan untuk asuransi kecelakaan Jasaraharja, operasional sistem, dan server map real-time.
        </p>
      </div>

      {/* Driver Mutations */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          Riwayat Pendapatan & Penarikan
        </h3>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700/80 divide-y divide-slate-100 dark:divide-slate-700/60 overflow-hidden shadow-xs">
          {driverTx.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Belum ada mutasi hari ini. Selesaikan order untuk menambah saldo!
            </div>
          ) : (
            driverTx.map((tx) => (
              <div key={tx.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      tx.type === 'EARNING'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                      {tx.description}
                    </h5>
                    <span className="text-[10px] text-slate-400">
                      {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-xs font-black tabular-nums ${
                    tx.type === 'EARNING' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'
                  }`}
                >
                  {tx.type === 'EARNING' ? '+' : '-'}
                  {formatRupiah(tx.amount)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Pencairan Dana ke Rekening
              </h3>
              <button
                onClick={() => setWithdrawModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {withdrawSuccess ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Pencairan Berhasil Diproses!
                </h4>
                <p className="text-[11px] text-slate-500">
                  Dana sebesar {formatRupiah(withdrawAmount)} telah ditransfer ke {currentDriver.bankAccount.bankName}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px]">Tujuan Transfer</span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {currentDriver.bankAccount.bankName}
                  </p>
                  <p className="font-mono text-slate-600 dark:text-slate-400">
                    {currentDriver.bankAccount.accountNumber} a/n {currentDriver.bankAccount.accountHolder}
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Nominal Pencairan
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    max={currentDriver.walletBalance}
                    step={10000}
                    className="w-full text-base font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white tabular-nums"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Maksimal: {formatRupiah(currentDriver.walletBalance)}
                  </span>
                </div>

                <button
                  onClick={handleWithdraw}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                >
                  Konfirmasi Tarik Sekarang
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
