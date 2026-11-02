'use client';

import React, { useState } from 'react';
import { LocationPoint, PaymentMethod, ServiceType } from '@/lib/types';
import { useDandeli } from '@/lib/DandeliContext';
import { TEGAL_LOCATIONS } from '@/lib/data';
import { calculateDistanceKm, calculateDurationMins, formatRupiah } from '@/lib/store';
import { InteractiveMap } from '@/components/common/InteractiveMap';
import {
  Bike,
  MapPin,
  Navigation,
  Tag,
  Wallet,
  Banknote,
  QrCode,
  X,
  ChevronRight,
  ShieldCheck,
  Check,
  Maximize2,
  Crosshair,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingRideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultService?: ServiceType;
}

export function BookingRideModal({
  isOpen,
  onClose,
  defaultService = 'RIDE_MOTOR',
}: BookingRideModalProps) {
  const { state, createOrder } = useDandeli();
  const [serviceType] = useState<ServiceType>('RIDE_MOTOR');
  const [pickup, setPickup] = useState<LocationPoint>(TEGAL_LOCATIONS[0]); // Kantor Pusat DANDELI (Danawarih)
  const [destination, setDestination] = useState<LocationPoint>(TEGAL_LOCATIONS[4]); // Alun-alun Slawi
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DANDELI_WALLET');
  const [voucherCode, setVoucherCode] = useState<string>('DANDELITEGAL');
  const [isBooking, setIsBooking] = useState(false);

  // Map point selection mode: null, 'PICKUP', or 'DESTINATION'
  const [mapPickerTarget, setMapPickerTarget] = useState<'PICKUP' | 'DESTINATION' | null>(null);

  if (!isOpen) return null;

  const distanceKm = calculateDistanceKm(pickup.lat, pickup.lng, destination.lat, destination.lng);
  const durationMins = calculateDurationMins(distanceKm);

  const pricing =
    state.pricingRules.find((p) => p.serviceType === 'RIDE_MOTOR') || state.pricingRules[0];
  const distanceFare = distanceKm * pricing.perKmRate;
  const rawSubtotal = Math.max(pricing.minimumFare, pricing.baseFare + distanceFare + pricing.platformFee);

  let discount = 0;
  if (voucherCode) {
    const promo = state.promotions.find(
      (p) => p.code.toUpperCase() === voucherCode.toUpperCase() && p.isActive
    );
    if (promo) {
      discount = Math.min((rawSubtotal * promo.discountPercentage) / 100, promo.maxDiscount);
    }
  }

  const finalTotal = Math.max(0, Math.round(rawSubtotal - discount));

  const handleBookNow = async () => {
    setIsBooking(true);
    try {
      await createOrder({
        serviceType: 'RIDE_MOTOR',
        pickupLocation: pickup,
        destinationLocation: destination,
        paymentMethod,
        voucherCode: discount > 0 ? voucherCode : undefined,
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
      setIsBooking(false);
    }
  };

  const handleMapSelect = (point: LocationPoint) => {
    if (mapPickerTarget === 'PICKUP') {
      setPickup(point);
    } else if (mapPickerTarget === 'DESTINATION') {
      setDestination(point);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Pesan DANDELI Ride Motor</h2>
              <p className="text-xs text-slate-500">Kabupaten & Kota Tegal · Berpusat di Danawarih Balapulang</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Service Banner */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Bike className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                  Layanan Resmi DANDELI
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  DANDELI Motor Express
                </h4>
                <p className="text-[11px] text-slate-500">Mitra pengemudi terlatih dengan helm SNI standar</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block">Tarif Mulai</span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {formatRupiah(pricing.minimumFare)}
              </span>
            </div>
          </div>

          {/* Interactive Map Point Picker Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                Peta Penjemputan & Tujuan (Google Maps)
              </label>
              {mapPickerTarget ? (
                <button
                  type="button"
                  onClick={() => setMapPickerTarget(null)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Selesai Tandai Titik
                </button>
              ) : (
                <span className="text-[11px] text-slate-400">Tersinkronisasi Driver</span>
              )}
            </div>

            {/* Embedded Interactive Map */}
            <InteractiveMap
              pickupLocation={pickup}
              destinationLocation={destination}
              nearbyDrivers={state.drivers.map((d) => ({
                id: d.id,
                lat: d.currentLocation.lat,
                lng: d.currentLocation.lng,
                vehicleType: d.vehicleType,
                name: d.name,
              }))}
              interactiveSelect={!!mapPickerTarget}
              selectionType={mapPickerTarget || 'PICKUP'}
              onSelectLocation={handleMapSelect}
              className="h-48 w-full"
            />
          </div>

          {/* Location Pickers (Pickup & Destination) with "Pilih Titik di Peta" */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            {/* Pickup */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  TITIK JEMPUT PELANGGAN
                </label>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget(mapPickerTarget === 'PICKUP' ? null : 'PICKUP')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    mapPickerTarget === 'PICKUP'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  {mapPickerTarget === 'PICKUP' ? 'Sedang Ditandai di Peta' : 'Pilih Titik di Peta'}
                </button>
              </div>

              <select
                value={pickup.name}
                onChange={(e) => {
                  const loc = TEGAL_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setPickup(loc);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {/* Current custom point option if created from map */}
                {!TEGAL_LOCATIONS.some((l) => l.name === pickup.name) && (
                  <option value={pickup.name}>📍 {pickup.name}</option>
                )}
                {TEGAL_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="truncate max-w-[280px]">{pickup.address}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {/* Destination */}
            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                  TITIK TUJUAN / ANTAR
                </label>
                <button
                  type="button"
                  onClick={() => setMapPickerTarget(mapPickerTarget === 'DESTINATION' ? null : 'DESTINATION')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    mapPickerTarget === 'DESTINATION'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300 hover:bg-red-200'
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  {mapPickerTarget === 'DESTINATION' ? 'Sedang Ditandai di Peta' : 'Pilih Titik di Peta'}
                </button>
              </div>

              <select
                value={destination.name}
                onChange={(e) => {
                  const loc = TEGAL_LOCATIONS.find((l) => l.name === e.target.value);
                  if (loc) setDestination(loc);
                }}
                className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {!TEGAL_LOCATIONS.some((l) => l.name === destination.name) && (
                  <option value={destination.name}>📍 {destination.name}</option>
                )}
                {TEGAL_LOCATIONS.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                <span className="truncate max-w-[280px]">{destination.address}</span>
                <span className="font-mono text-[10px] text-slate-400 shrink-0">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {/* Trip Metrics */}
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl text-xs text-emerald-900 dark:text-emerald-300">
            <span>Estimasi Jarak: <strong className="tabular-nums">{distanceKm} km</strong></span>
            <span>·</span>
            <span>Waktu Tempuh: <strong className="tabular-nums">~{durationMins} menit</strong></span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Asuransi DANDELI
            </span>
          </div>

          {/* Promo Voucher */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-emerald-600 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Kode Promo (misal: DANDELIBARU)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
              />
            </div>
            {discount > 0 && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                Hemat {formatRupiah(discount)}
              </span>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('DANDELI_WALLET')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'DANDELI_WALLET'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] leading-tight">DANDELI Wallet</span>
                <span className="text-[9px] text-slate-500 tabular-nums">
                  {formatRupiah(state.user.walletBalance)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'CASH'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] leading-tight">Tunai (Cash)</span>
                <span className="text-[9px] text-slate-500">Bayar ke Driver</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1 ${
                  paymentMethod === 'QRIS'
                    ? 'border-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] leading-tight">QRIS / E-Wallet</span>
                <span className="text-[9px] text-slate-500">Scan Instan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Action */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-slate-500 block">Total Biaya Perjalanan</span>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                {formatRupiah(finalTotal)}
              </span>
              {discount > 0 && (
                <span className="text-xs text-slate-400 line-through tabular-nums">
                  {formatRupiah(rawSubtotal)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleBookNow}
            disabled={isBooking}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isBooking ? 'Mencari Mitra...' : 'Pesan DANDELI Motor'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
