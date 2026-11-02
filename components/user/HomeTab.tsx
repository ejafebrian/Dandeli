'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import { DandeliLogo } from '@/components/common/DandeliLogo';
import { InteractiveMap } from '@/components/common/InteractiveMap';
import { JAKARTA_LOCATIONS } from '@/lib/data';
import { ServiceType } from '@/lib/types';
import {
  Bike,
  Utensils,
  Package,
  Wallet,
  Plus,
  ArrowUpRight,
  Search,
  MapPin,
  Tag,
  Star,
  ChevronRight,
  ShieldCheck,
  Bell,
  Navigation,
} from 'lucide-react';
import Image from 'next/image';

interface HomeTabProps {
  onOpenRide: (type: ServiceType) => void;
  onOpenFood: () => void;
  onOpenSend: () => void;
  onOpenWallet: () => void;
  onOpenActiveOrder: () => void;
}

export function HomeTab({
  onOpenRide,
  onOpenFood,
  onOpenSend,
  onOpenWallet,
  onOpenActiveOrder,
}: HomeTabProps) {
  const { state } = useDandeli();
  const [searchQuery, setSearchQuery] = useState('');

  const activeOrder = state.orders.find((o) => o.id === state.activeOrderId);
  const onlineDrivers = state.drivers.filter((d) => d.status === 'ONLINE_IDLE');

  const filteredLocations = searchQuery
    ? JAKARTA_LOCATIONS.filter((l) =>
        l.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : JAKARTA_LOCATIONS.slice(0, 3);

  return (
    <div className="space-y-4 pb-6">
      {/* Top App Bar */}
      <div className="flex items-center justify-between pt-1">
        <DandeliLogo size="md" showSlogan={true} />

        <div className="flex items-center gap-2">
          {/* Notification bell simulation */}
          <button
            onClick={() => alert('Semua notifikasi DANDELI telah dibaca.')}
            aria-label="Notifikasi"
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* User mini avatar */}
          <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
            <Image
              src={state.user.avatar}
              alt={state.user.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Active Order Sticky Alert (if user has active trip) */}
      {activeOrder && activeOrder.status !== 'COMPLETED' && activeOrder.status !== 'CANCELLED' && (
        <div
          onClick={onOpenActiveOrder}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 cursor-pointer flex items-center justify-between transition-transform active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-white animate-ping"></span>
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-200">
                Pesanan Sedang Berlangsung
              </span>
              <h4 className="text-xs font-bold leading-tight">
                {activeOrder.serviceType.replace('_', ' ')} · {activeOrder.status.replace('_', ' ')}
              </h4>
              <p className="text-[11px] text-emerald-100 mt-0.5 truncate">
                Tujuan: {activeOrder.destinationLocation.name}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 shrink-0" />
        </div>
      )}

      {/* Wallet Quick Bar */}
      <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              DANDELI Wallet
            </span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white tabular-nums">
              {formatRupiah(state.user.walletBalance)}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenWallet}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          Top Up
        </button>
      </div>

      {/* Main 3 Services Navigation Grid (Ride Motor, Food, Send) */}
      <div>
        <div className="grid grid-cols-3 gap-3">
          {/* Ride Motor */}
          <button
            onClick={() => onOpenRide('RIDE_MOTOR')}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors shadow-xs">
              <Bike className="w-7 h-7" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">DANDELI Ride</span>
              <span className="text-[10px] text-slate-400 block">Motor Cepat</span>
            </div>
          </button>

          {/* DANDELI Food */}
          <button
            onClick={onOpenFood}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors shadow-xs">
              <Utensils className="w-7 h-7" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">DANDELI Food</span>
              <span className="text-[10px] text-slate-400 block">Pesan Makan</span>
            </div>
          </button>

          {/* DANDELI Send */}
          <button
            onClick={onOpenSend}
            className="flex flex-col items-center gap-2 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 group-hover:bg-emerald-600 group-hover:text-white text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors shadow-xs">
              <Package className="w-7 h-7" />
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">DANDELI Send</span>
              <span className="text-[10px] text-slate-400 block">Kirim Paket</span>
            </div>
          </button>
        </div>
      </div>

      {/* Live Map Radar Section with Google Maps Integration */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              Armada Motor Sekitar Anda (Google Maps)
            </h3>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {onlineDrivers.length} Mitra Motor Online
          </span>
        </div>

        <InteractiveMap
          pickupLocation={JAKARTA_LOCATIONS[0]}
          nearbyDrivers={state.drivers.map((d) => ({
            id: d.id,
            lat: d.currentLocation.lat,
            lng: d.currentLocation.lng,
            vehicleType: d.vehicleType,
            name: d.name,
          }))}
          className="h-44 w-full"
        />
      </div>

      {/* Destination Quick Search */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Mau ke mana hari ini? Cari lokasi atau mall..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Quick Location List */}
        <div className="space-y-1.5">
          {filteredLocations.map((loc) => (
            <div
              key={loc.name}
              onClick={() => onOpenRide('RIDE_MOTOR')}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {loc.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{loc.address}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Promo Banner Strip */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
        <div>
          <span className="text-[10px] font-bold tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded-md text-emerald-100">
            PROMO KHUSUS HARI INI
          </span>
          <h4 className="text-sm font-black mt-1">Diskon 50% DANDELI Ride Motor</h4>
          <p className="text-xs text-emerald-100 mt-0.5">Gunakan kode voucher: <strong>DANDELIBARU</strong></p>
        </div>
        <button
          onClick={() => onOpenRide('RIDE_MOTOR')}
          className="px-3 py-1.5 bg-white text-emerald-800 text-xs font-bold rounded-xl shadow-xs hover:bg-emerald-50 transition-colors shrink-0"
        >
          Pesan Motor
        </button>
      </div>
    </div>
  );
}
