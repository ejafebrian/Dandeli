'use client';

import React, { useState, useEffect } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { Order, OrderStatus } from '@/lib/types';
import { InteractiveMap } from '@/components/common/InteractiveMap';
import { formatRupiah } from '@/lib/store';
import {
  Phone,
  MessageSquare,
  ShieldAlert,
  Share2,
  X,
  Star,
  Send,
  AlertTriangle,
  CheckCircle2,
  Bike,
  Utensils,
  Package,
} from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface ActiveOrderTrackingModalProps {
  order: Order;
  onClose: () => void;
}

export function ActiveOrderTrackingModal({
  order,
  onClose,
}: ActiveOrderTrackingModalProps) {
  const {
    cancelOrder,
    sendChatMessage,
    submitRating,
    advanceDriverOrderStatus,
  } = useDandeli();

  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [sosModalOpen, setSosModalOpen] = useState(false);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewNote, setReviewNote] = useState('Pelayanan sangat memuaskan, driver sopan!');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Status readable label & badge styling
  const getStatusDetails = (status: OrderStatus) => {
    switch (status) {
      case 'SEARCHING_DRIVER':
        return {
          title: 'Mencari Mitra Terdekat...',
          subtitle: 'Menghubungkan ke armada DANDELI terdekat di radius Anda',
          color: 'bg-amber-500',
        };
      case 'DRIVER_ASSIGNED':
        return {
          title: 'Mitra Ditemukan!',
          subtitle: 'Mitra pengemudi telah menerima pesanan Anda',
          color: 'bg-emerald-600',
        };
      case 'HEADING_TO_PICKUP':
        return {
          title: 'Driver Menuju Titik Jemput',
          subtitle: 'Estimasi kedatangan ~4 menit lagi',
          color: 'bg-emerald-600',
        };
      case 'ARRIVED_AT_PICKUP':
        return {
          title: 'Driver Telah Tiba!',
          subtitle: 'Silakan temui mitra pengemudi di titik jemput',
          color: 'bg-blue-600',
        };
      case 'TRIP_STARTED':
        return {
          title: 'Perjalanan Berlangsung',
          subtitle: 'Menuju lokasi tujuan dengan aman & nyaman',
          color: 'bg-indigo-600',
        };
      case 'DELIVERING_FOOD':
        return {
          title: 'Makanan Sedang Diantar',
          subtitle: 'Driver sedang melaju membawa pesanan makanan Anda',
          color: 'bg-amber-600',
        };
      case 'DELIVERING_PACKAGE':
        return {
          title: 'Paket Sedang Diantar',
          subtitle: 'Kurir sedang dalam perjalanan ke alamat penerima',
          color: 'bg-indigo-600',
        };
      case 'COMPLETED':
        return {
          title: 'Pesanan Selesai!',
          subtitle: 'Terima kasih telah mempercayai layanan DANDELI',
          color: 'bg-emerald-700',
        };
      case 'CANCELLED':
        return {
          title: 'Pesanan Dibatalkan',
          subtitle: 'Pesanan telah dibatalkan',
          color: 'bg-red-600',
        };
      default:
        return {
          title: 'Status Pesanan',
          subtitle: '',
          color: 'bg-slate-600',
        };
    }
  };

  const statusInfo = getStatusDetails(order.status);

  // Fire celebratory confetti upon completion
  useEffect(() => {
    if (order.status === 'COMPLETED' && !ratingSubmitted) {
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
      });
    }
  }, [order.status, ratingSubmitted]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendChatMessage(order.id, 'USER', chatText);
    setChatText('');
  };

  const handleSubmitRating = () => {
    submitRating(order.id, ratingVal, reviewNote);
    setRatingSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[94vh] overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                Live Tracking DANDELI
              </span>
              <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                {order.orderNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
              <button
                onClick={() => setSosModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-1 hover:bg-red-200 transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                SOS
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Notification Banner */}
        <div className={`px-5 py-3 text-white flex items-center justify-between ${statusInfo.color}`}>
          <div>
            <h3 className="text-sm font-bold leading-tight">{statusInfo.title}</h3>
            <p className="text-[11px] text-white/90 leading-tight mt-0.5">{statusInfo.subtitle}</p>
          </div>
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => advanceDriverOrderStatus(order.id)}
              className="px-3 py-1 bg-white text-slate-900 text-[11px] font-bold rounded-lg shadow-sm hover:bg-slate-100 transition-transform active:scale-95"
            >
              Simulasi Maju ⏩
            </button>
          )}
        </div>

        {/* Live Interactive Map */}
        <div className="p-3 bg-slate-100 dark:bg-slate-800/30">
          <InteractiveMap
            pickupLocation={order.pickupLocation}
            destinationLocation={order.destinationLocation}
            driverLocation={order.driverCurrentLocation}
            className="h-44 sm:h-52 w-full rounded-2xl"
          />
        </div>

        {/* Driver Card & Order Details */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Driver Profile Info (if assigned) */}
          {order.driverName && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-200 border border-emerald-500">
                  <Image
                    src={order.driverAvatar || '/images/avatar_driver_budi.svg'}
                    alt={order.driverName}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {order.driverName}
                    <span className="flex items-center text-[10px] text-amber-500 font-semibold">
                      <Star className="w-3 h-3 fill-amber-500" /> {order.driverRating || 4.9}
                    </span>
                  </h4>
                  <p className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                    {order.driverVehiclePlate || 'B 4521 TZX'}
                  </p>
                  <p className="text-[10px] text-slate-500">{order.serviceType.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setChatOpen(!chatOpen)}
                  aria-label="Chat driver"
                  className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <a
                  href={`tel:${order.driverPhone || '0812345678'}`}
                  aria-label="Telepon driver"
                  className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

          {/* In-app Chat Drawer */}
          {chatOpen && (
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Pesan Langsung ke Mitra
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {order.chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-xl max-w-[85%] ${
                      msg.sender === 'USER'
                        ? 'ml-auto bg-emerald-600 text-white rounded-tr-none'
                        : msg.sender === 'DRIVER'
                        ? 'mr-auto bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                        : 'mx-auto bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] text-center'
                    }`}
                  >
                    <p className="leading-snug">{msg.text}</p>
                    <span className="text-[9px] opacity-70 block text-right mt-0.5">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quick message replies */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {['Saya sudah di lobi', 'Jangan dibunyikan klakson', 'Tolong bawa helm'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => sendChatMessage(order.id, 'USER', q)}
                    className="px-2.5 py-1 text-[10px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg whitespace-nowrap text-slate-700 dark:text-slate-300 hover:bg-slate-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendChat} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ketik pesan..."
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Kirim pesan"
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center justify-center"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Route Summary */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Jemput</span>
                <p className="font-semibold text-slate-900 dark:text-white">{order.pickupLocation.name}</p>
                <p className="text-[11px] text-slate-500">{order.pickupLocation.address}</p>
              </div>
            </div>
            <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700 ml-1"></div>
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1 shrink-0"></span>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Tujuan</span>
                <p className="font-semibold text-slate-900 dark:text-white">{order.destinationLocation.name}</p>
                <p className="text-[11px] text-slate-500">{order.destinationLocation.address}</p>
              </div>
            </div>
          </div>

          {/* Fare Summary & Payment */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs">
            <span className="text-slate-600 dark:text-slate-400">
              Metode: <strong className="text-slate-900 dark:text-white">{order.paymentMethod.replace('_', ' ')}</strong>
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
              {formatRupiah(order.fareBreakdown.totalFare)}
            </span>
          </div>

          {/* Rating Modal Section if Completed */}
          {order.status === 'COMPLETED' && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Beri Ulasan Perjalanan Ini
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Bagaimana pengalaman Anda bersama mitra {order.driverName}?
              </p>

              {/* Star Rating Selector */}
              <div className="flex items-center justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingVal(star)}
                    className="p-1 text-amber-500 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= ratingVal ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="Tulis ulasan Anda..."
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                rows={2}
              />

              <button
                onClick={handleSubmitRating}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors"
              >
                {ratingSubmitted ? '✓ Ulasan Terkirim!' : 'Kirim Ulasan & Selesai'}
              </button>
            </div>
          )}

          {/* Cancel button if order not yet completed */}
          {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
            <button
              onClick={() => {
                cancelOrder(order.id, 'Dibatalkan oleh pelanggan');
                onClose();
              }}
              className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-colors"
            >
              Batalkan Pesanan
            </button>
          )}
        </div>
      </div>

      {/* SOS Modal */}
      {sosModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-5 border border-red-200 dark:border-red-900 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bantuan Darurat (SOS)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Sinyal darurat dan koordinat GPS Anda akan segera dikirimkan ke Satgas Keamanan DANDELI & Kontak Darurat.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  alert('Panggilan Darurat DANDELI SafeLine terhubung ke 110 & Tim Respons Cepat 24 Jam.');
                  setSosModalOpen(false);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
              >
                Hubungi Call Center Darurat (110)
              </button>
              <button
                onClick={() => setSosModalOpen(false)}
                className="w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
