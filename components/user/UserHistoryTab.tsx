'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import { Order, ServiceType } from '@/lib/types';
import { Bike, Utensils, Package, Star, Calendar, ChevronRight, FileText, CheckCircle2 } from 'lucide-react';

interface UserHistoryTabProps {
  onSelectOrder: (order: Order) => void;
}

export function UserHistoryTab({ onSelectOrder }: UserHistoryTabProps) {
  const { state } = useDandeli();
  const [filter, setFilter] = useState<string>('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);

  const filteredOrders = state.orders.filter((ord) => {
    if (filter === 'ALL') return true;
    return ord.serviceType === filter;
  });

  const getServiceIcon = (type: ServiceType) => {
    switch (type) {
      case 'RIDE_MOTOR':
        return <Bike className="w-4 h-4 text-emerald-600" />;
      case 'FOOD':
        return <Utensils className="w-4 h-4 text-emerald-600" />;
      case 'SEND':
        return <Package className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Riwayat Aktivitas & Pesanan</h2>
        <p className="text-xs text-slate-500">Semua perjalanan, pesan antar makanan, dan kurir Anda</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'ALL', label: 'Semua' },
          { id: 'RIDE_MOTOR', label: 'Ride Motor' },
          { id: 'FOOD', label: 'Food' },
          { id: 'SEND', label: 'Send' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              filter === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500">Belum ada riwayat pesanan untuk kategori ini.</p>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:border-emerald-500 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
                    {getServiceIcon(ord.serviceType)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {ord.serviceType.replace('_', ' ')}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">{ord.orderNumber}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums block">
                    {formatRupiah(ord.fareBreakdown.totalFare)}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      ord.status === 'COMPLETED'
                        ? 'text-emerald-600'
                        : ord.status === 'CANCELLED'
                        ? 'text-red-500'
                        : 'text-amber-500'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Locations Route */}
              <div className="text-xs space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                  <span className="truncate">{ord.pickupLocation.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0"></span>
                  <span className="truncate">{ord.destinationLocation.name}</span>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                <span className="text-[10px] text-slate-400">
                  {new Date(ord.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedReceipt(ord)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Struk
                  </button>
                  <button
                    onClick={() => onSelectOrder(ord)}
                    className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                  >
                    Detail Live
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invoice / Struk Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                DANDELI STRUK RESMI
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {selectedReceipt.orderNumber}
              </p>
            </div>

            <div className="text-xs space-y-2">
              <div className="flex justify-between text-slate-500">
                <span>Layanan</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedReceipt.serviceType}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Driver</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedReceipt.driverName || 'Armada DANDELI'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tarif Dasar</span>
                <span className="font-mono tabular-nums">
                  {formatRupiah(selectedReceipt.fareBreakdown.baseFare)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tarif Jarak ({selectedReceipt.distanceKm} km)</span>
                <span className="font-mono tabular-nums">
                  {formatRupiah(selectedReceipt.fareBreakdown.distanceFare)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Biaya Layanan & Asuransi</span>
                <span className="font-mono tabular-nums">
                  {formatRupiah(selectedReceipt.fareBreakdown.platformFee)}
                </span>
              </div>
              {selectedReceipt.fareBreakdown.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Diskon Promo</span>
                  <span className="font-mono tabular-nums">
                    -{formatRupiah(selectedReceipt.fareBreakdown.discount)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                <span>Total Dibayar</span>
                <span className="tabular-nums">
                  {formatRupiah(selectedReceipt.fareBreakdown.totalFare)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedReceipt(null)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl"
            >
              Tutup Struk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
