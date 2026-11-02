'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { Merchant, MenuItem, OrderItem, PaymentMethod } from '@/lib/types';
import { formatRupiah, calculateDistanceKm } from '@/lib/store';
import { TEGAL_LOCATIONS } from '@/lib/data';
import { Utensils, Star, Clock, Plus, Minus, ShoppingBag, X, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface BookingFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BookingFoodModal({ isOpen, onClose }: BookingFoodModalProps) {
  const { state, createOrder } = useDandeli();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant>(state.merchants[0]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('DANDELI_WALLET');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const userLocation = TEGAL_LOCATIONS[0]; // Danawarih Balapulang as default user spot
  const deliveryDistanceKm = calculateDistanceKm(
    selectedMerchant.lat,
    selectedMerchant.lng,
    userLocation.lat,
    userLocation.lng
  );

  const deliveryFee = Math.max(10000, Math.round(9000 + deliveryDistanceKm * 2400));
  const foodSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = foodSubtotal > 0 ? foodSubtotal + deliveryFee : 0;

  const handleAddToCart = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menu.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menu.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItemId: menu.id, name: menu.name, price: menu.price, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (menuId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((i) => i.menuItemId !== menuId);
      }
      return prev.map((i) =>
        i.menuItemId === menuId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const getItemCount = (menuId: string) => {
    return cart.find((i) => i.menuItemId === menuId)?.quantity || 0;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await createOrder({
        serviceType: 'FOOD',
        pickupLocation: {
          name: selectedMerchant.name,
          address: selectedMerchant.address,
          lat: selectedMerchant.lat,
          lng: selectedMerchant.lng,
        },
        destinationLocation: userLocation,
        paymentMethod,
        items: cart,
        merchantId: selectedMerchant.id,
        merchantName: selectedMerchant.name,
        merchantAddress: selectedMerchant.address,
      });

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
      });

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Utensils className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">DANDELI Food</h2>
              <p className="text-xs text-slate-500">Pesan makanan favorit, driver siap mengantar</p>
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

        {/* Merchant Tabs */}
        <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar">
          {state.merchants.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedMerchant(m);
                setCart([]); // reset cart when changing restaurant
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedMerchant.id === m.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {m.name.split(' ')[0]} {m.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>

        {/* Merchant Banner Details */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-3.5 items-center bg-slate-50/50 dark:bg-slate-800/20">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200">
            <Image
              src={selectedMerchant.imageUrl}
              alt={selectedMerchant.name}
              fill
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {selectedMerchant.name}
            </h3>
            <p className="text-xs text-slate-500 truncate">{selectedMerchant.category}</p>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 mt-1">
              <span className="flex items-center gap-1 font-semibold text-amber-600">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {selectedMerchant.rating}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                ~{selectedMerchant.estimatedPrepTimeMinutes} mnt masak
              </span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Buka</span>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Menu Pilihan
          </div>
          {selectedMerchant.menus.map((item) => {
            const count = getItemCount(item.id);
            return (
              <div
                key={item.id}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 flex gap-3 items-center transition-all"
              >
                <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                  <p className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
                    {formatRupiah(item.price)}
                  </p>
                </div>

                {/* Counter Buttons */}
                <div className="shrink-0 flex items-center gap-1.5">
                  {count > 0 ? (
                    <div className="flex items-center bg-emerald-50 dark:bg-emerald-950/60 rounded-xl p-1 border border-emerald-200 dark:border-emerald-800">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        aria-label="Kurang satu"
                        className="w-6 h-6 rounded-lg bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 flex items-center justify-center active:scale-95 shadow-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-emerald-900 dark:text-white tabular-nums">
                        {count}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        aria-label="Tambah satu"
                        className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center active:scale-95 shadow-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform"
                    >
                      + Tambah
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Checkout Drawer when Cart has items */}
        {cart.length > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>{cart.reduce((a, b) => a + b.quantity, 0)} item makanan</span>
              <span className="tabular-nums font-semibold">{formatRupiah(foodSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Ongkir DANDELI ({deliveryDistanceKm} km)</span>
              <span className="tabular-nums font-semibold">{formatRupiah(deliveryFee)}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                  Total Pembayaran
                </span>
                <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                  {formatRupiah(totalAmount)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                {isSubmitting ? 'Memproses...' : 'Pesan DANDELI Food'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
