'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import { DandeliLogo } from '@/components/common/DandeliLogo';
import { InteractiveMap } from '@/components/common/InteractiveMap';
import { DriverIncomingOrderModal } from './DriverIncomingOrderModal';
import { DriverActiveOrderView } from './DriverActiveOrderView';
import { DriverEarningsTab } from './DriverEarningsTab';
import { DriverRegistrationModal } from './DriverRegistrationModal';
import {
  Power,
  Navigation,
  Wallet,
  Clock,
  UserPlus,
  Star,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Bike,
  Car,
} from 'lucide-react';
import Image from 'next/image';

export function DriverApp() {
  const {
    state,
    currentDriver,
    setCurrentDriverId,
    toggleDriverOnline,
  } = useDandeli();

  const [driverTab, setDriverTab] = useState<'DASHBOARD' | 'EARNINGS' | 'HISTORY'>('DASHBOARD');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  if (!currentDriver) return null;

  const isOnline = currentDriver.status !== 'OFFLINE';

  // Check if this driver has an active assigned order
  const activeDriverOrder = state.orders.find(
    (o) =>
      o.driverId === currentDriver.id &&
      o.status !== 'COMPLETED' &&
      o.status !== 'CANCELLED' &&
      o.status !== 'SEARCHING_DRIVER'
  );

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-800">
      {/* Scrollable Driver Screen */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24 space-y-4">
        {/* Top Driver Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <DandeliLogo size="sm" variant="light" />
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
              MITRA
            </span>
          </div>

          {/* Switch Driver Profile Dropdown for easy multi-vehicle testing */}
          <select
            value={currentDriver.id}
            onChange={(e) => setCurrentDriverId(e.target.value)}
            className="text-[11px] font-semibold bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 focus:outline-none"
          >
            {state.drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.vehicleType} - {d.vehiclePlate})
              </option>
            ))}
          </select>
        </div>

        {/* If driver has an active trip in progress, prioritize Active Order Navigation View! */}
        {activeDriverOrder ? (
          <DriverActiveOrderView order={activeDriverOrder} />
        ) : driverTab === 'EARNINGS' ? (
          <DriverEarningsTab />
        ) : driverTab === 'HISTORY' ? (
          /* Driver Past Trips */
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Riwayat Perjalanan Mitra</h3>
            {state.orders
              .filter((o) => o.driverId === currentDriver.id)
              .map((ord) => (
                <div
                  key={ord.id}
                  className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-400">
                      {ord.serviceType.replace('_', ' ')}
                    </span>
                    <span className="font-black text-white tabular-nums">
                      +{formatRupiah(ord.fareBreakdown.driverEarnings)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {ord.pickupLocation.name} → {ord.destinationLocation.name}
                  </p>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                    <span>{ord.orderNumber}</span>
                    <span className="text-emerald-500 font-bold uppercase">{ord.status}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Driver Home Dashboard */
          <>
            {/* Driver Profile & Online/Offline Toggle */}
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-emerald-500">
                  <Image
                    src={currentDriver.avatar}
                    alt={currentDriver.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate flex items-center gap-1.5">
                    {currentDriver.name}
                    {currentDriver.verificationStatus === 'VERIFIED' && (
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                  </h3>
                  <p className="text-xs font-mono font-bold text-slate-400">
                    {currentDriver.vehiclePlate} · {currentDriver.vehicleModel}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span className="text-amber-400 font-bold">★ {currentDriver.rating}</span>
                    <span>·</span>
                    <span>{currentDriver.totalTrips} Trip Selesai</span>
                  </div>
                </div>
              </div>

              {/* Toggle Online Button */}
              <button
                onClick={() => toggleDriverOnline(currentDriver.id)}
                className={`px-3.5 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0 ${
                  isOnline
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/50 ring-2 ring-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </button>
            </div>

            {/* Income Glance Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Pendapatan Hari Ini
                </span>
                <span className="text-lg font-black text-emerald-400 tabular-nums">
                  {formatRupiah(currentDriver.walletBalance)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Status Akun
                </span>
                <span
                  className={`text-xs font-black uppercase ${
                    currentDriver.verificationStatus === 'VERIFIED'
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }`}
                >
                  {currentDriver.verificationStatus}
                </span>
              </div>
            </div>

            {/* Live GPS Radar Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
                  {isOnline ? 'Radar Aktif · Menunggu Order Masuk' : 'Radar Non-Aktif (Driver Offline)'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {currentDriver.currentLocation.lat}, {currentDriver.currentLocation.lng}
                </span>
              </div>

              <InteractiveMap
                driverLocation={currentDriver.currentLocation}
                className="h-56 w-full rounded-2xl"
              />
            </div>

            {/* New Driver Register Banner Shortcut */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-white">Ingin Jadi Mitra Baru?</h4>
                <p className="text-[11px] text-slate-400">Daftarkan motor atau mobil Anda</p>
              </div>
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Daftar Mitra
              </button>
            </div>
          </>
        )}
      </div>

      {/* Driver Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-6">
        <div className="grid grid-cols-3 items-center text-center">
          <button
            onClick={() => setDriverTab('DASHBOARD')}
            className={`flex flex-col items-center gap-1 min-h-[44px] justify-center transition-colors ${
              driverTab === 'DASHBOARD'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Navigation className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Radar Kerja</span>
          </button>

          <button
            onClick={() => setDriverTab('EARNINGS')}
            className={`flex flex-col items-center gap-1 min-h-[44px] justify-center transition-colors ${
              driverTab === 'EARNINGS'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Pendapatan</span>
          </button>

          <button
            onClick={() => setDriverTab('HISTORY')}
            className={`flex flex-col items-center gap-1 min-h-[44px] justify-center transition-colors ${
              driverTab === 'HISTORY'
                ? 'text-emerald-400 font-bold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Riwayat</span>
          </button>
        </div>
      </nav>

      {/* Incoming Order Radar Modal */}
      {state.incomingOrderForDriver && (
        <DriverIncomingOrderModal
          order={state.incomingOrderForDriver}
          timeLeft={state.incomingOrderTimer}
        />
      )}

      {/* Mitra Registration Modal */}
      <DriverRegistrationModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
      />
    </div>
  );
}
