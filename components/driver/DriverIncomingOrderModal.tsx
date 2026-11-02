'use client';

import React from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { Order } from '@/lib/types';
import { formatRupiah } from '@/lib/store';
import { Bike, Utensils, Package, MapPin, Check, X, Clock, AlertCircle } from 'lucide-react';

interface DriverIncomingOrderModalProps {
  order: Order;
  timeLeft: number;
}

export function DriverIncomingOrderModal({
  order,
  timeLeft,
}: DriverIncomingOrderModalProps) {
  const { acceptOrderAsDriver, rejectOrderAsDriver } = useDandeli();

  const getIcon = () => {
    switch (order.serviceType) {
      case 'RIDE_MOTOR':
        return <Bike className="w-5 h-5 text-emerald-400" />;
      case 'FOOD':
        return <Utensils className="w-5 h-5 text-emerald-400" />;
      case 'SEND':
        return <Package className="w-5 h-5 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-white w-full max-w-sm rounded-3xl p-5 border-2 border-emerald-500 shadow-2xl space-y-4 relative overflow-hidden">
        {/* Pulsing Alert Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-950 flex items-center justify-center border border-emerald-700/60">
              {getIcon()}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 block">
                ORDER MASUK!
              </span>
              <h3 className="text-xs font-bold text-white">
                {order.serviceType.replace('_', ' ')} · {order.distanceKm} km
              </h3>
            </div>
          </div>

          {/* 30s Countdown Timer Ring */}
          <div className="relative w-10 h-10 flex items-center justify-center">
            <span className="font-mono text-xs font-black text-amber-400">{timeLeft}s</span>
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="20" cy="20" r="16" fill="none" stroke="#334155" strokeWidth="3" />
              <circle
                cx="20"
                cy="20"
                r="16"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray="100"
                strokeDashoffset={100 - (timeLeft / 30) * 100}
                className="transition-all duration-1000"
              />
            </svg>
          </div>
        </div>

        {/* Driver Net Payout Highlight */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-700/60 text-center">
          <span className="text-[11px] text-emerald-300 block">Pendapatan Bersih Mitra</span>
          <h2 className="text-2xl font-black text-white tabular-nums tracking-tight">
            {formatRupiah(order.fareBreakdown.driverEarnings)}
          </h2>
          <span className="text-[10px] text-slate-400">
            Metode: {order.paymentMethod.replace('_', ' ')}
          </span>
        </div>

        {/* Route Details */}
        <div className="space-y-2 text-xs bg-slate-850 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1 shrink-0"></span>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block uppercase">Jemput Penumpang / Restoran</span>
              <p className="font-bold text-slate-200 truncate">{order.pickupLocation.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{order.pickupLocation.address}</p>
            </div>
          </div>

          <div className="w-0.5 h-2 bg-slate-700 ml-1"></div>

          <div className="flex items-start gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 mt-1 shrink-0"></span>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block uppercase">Tujuan Pengantaran</span>
              <p className="font-bold text-slate-200 truncate">{order.destinationLocation.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{order.destinationLocation.address}</p>
            </div>
          </div>
        </div>

        {/* Accept / Reject Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => rejectOrderAsDriver(order.id)}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <X className="w-4 h-4" /> Tolak
          </button>

          <button
            onClick={() => acceptOrderAsDriver(order.id)}
            className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5 transition-transform active:scale-95"
          >
            <Check className="w-4 h-4" /> TERIMA ORDER
          </button>
        </div>
      </div>
    </div>
  );
}
