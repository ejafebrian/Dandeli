'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { LocationPoint, PackageDetails, PaymentMethod } from '@/lib/types';
import { TEGAL_LOCATIONS } from '@/lib/data';
import { calculateDistanceKm, formatRupiah } from '@/lib/store';
import { Package, FileText, Box, ShieldCheck, X, ChevronRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingSendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingSendModal({ isOpen, onClose }: BookingSendModalProps) {
  const { state, createOrder } = useDandeli();
  const [category, setCategory] = useState<'DOKUMEN' | 'PAKET_KECIL' | 'PAKET_SEDANG'>('PAKET_KECIL');
  const [description, setDescription] = useState('Baju dan oleh-oleh khas Tegal');
  const [weightKg, setWeightKg] = useState(2);
  const [senderName, setSenderName] = useState(state.user.name);
  const [senderPhone, setSenderPhone] = useState(state.user.phone);
  const [recipientName, setRecipientName] = useState('Siti Rahmawati (Balapulang)');
  const [recipientPhone, setRecipientPhone] = useState('0813-7744-1122');
  const [pickup, setPickup] = useState<LocationPoint>(TEGAL_LOCATIONS[0]); // Danawarih
  const [destination, setDestination] = useState<LocationPoint>(TEGAL_LOCATIONS[2]); // Pasar Balapulang
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DANDELI_WALLET');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const distanceKm = calculateDistanceKm(pickup.lat, pickup.lng, destination.lat, destination.lng);
  const weightMultiplier = category === 'DOKUMEN' ? 1.0 : category === 'PAKET_KECIL' ? 1.1 : 1.35;
  const baseCost = 11000 + distanceKm * 2800 * weightMultiplier + 2500;
  const finalCost = Math.max(13000, Math.round(baseCost));

  // Security OTP PIN for package handover
  const securityPin = '7842';

  const handleBookSend = async () => {
    setIsSubmitting(true);
    try {
      const packageDetails: PackageDetails = {
        category,
        description,
        weightKg,
        senderName,
        senderPhone,
        recipientName,
        recipientPhone,
        securityPin,
      };

      await createOrder({
        serviceType: 'SEND',
        pickupLocation: pickup,
        destinationLocation: destination,
        paymentMethod,
        packageDetails,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });

      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">DANDELI Send</h2>
              <p className="text-xs text-slate-500">Kirim barang & dokumen instan aman dengan PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Package Category Grid */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
              Jenis Paket & Barang
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCategory('DOKUMEN');
                  setWeightKg(0.5);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  category === 'DOKUMEN'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold leading-tight">Dokumen</span>
                <span className="text-[10px] text-slate-500">&lt; 1 kg</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('PAKET_KECIL');
                  setWeightKg(2);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  category === 'PAKET_KECIL'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Package className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold leading-tight">Paket Kecil</span>
                <span className="text-[10px] text-slate-500">1 - 5 kg</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCategory('PAKET_SEDANG');
                  setWeightKg(8);
                }}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  category === 'PAKET_SEDANG'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Box className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-bold leading-tight">Paket Sedang</span>
                <span className="text-[10px] text-slate-500">5 - 15 kg</span>
              </button>
            </div>
          </div>

          {/* Package Description */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Deskripsi Barang
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Dokumen kontrak penting, baju, kue..."
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Sender & Recipient Inputs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Data Pengirim
              </span>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Nama Pengirim"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-1.5 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                placeholder="No HP Pengirim"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Data Penerima
              </span>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Nama Penerima"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 mb-1.5 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                placeholder="No HP Penerima"
                className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Pickup & Dropoff Presets */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                ALAMAT PENJEMPUTAN BARANG
              </label>
              <select
                value={pickup.name}
                onChange={(e) => {
                  const loc = TEGAL_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setPickup(loc);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {TEGAL_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                ALAMAT PENGANTARAN PENERIMA
              </label>
              <select
                value={destination.name}
                onChange={(e) => {
                  const loc = TEGAL_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setDestination(loc);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {TEGAL_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security PIN Handover Card */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                  PIN Keamanan Serah Terima
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400">
                  Wajib diberikan kepada kurir saat serah paket
                </span>
              </div>
            </div>
            <span className="font-mono text-base font-black tracking-widest text-amber-800 dark:text-amber-200 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
              {securityPin}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-500 block">Total Ongkos Kirim</span>
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              {formatRupiah(finalCost)}
            </span>
          </div>

          <button
            onClick={handleBookSend}
            disabled={isSubmitting}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            {isSubmitting ? 'Memproses...' : 'Pesan DANDELI Send'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
