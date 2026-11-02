'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { Order } from '@/lib/types';
import { InteractiveMap } from '@/components/common/InteractiveMap';
import { formatRupiah } from '@/lib/store';
import {
  Navigation,
  Phone,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Send,
  AlertTriangle,
  User,
  Package,
  Utensils,
  Lock,
} from 'lucide-react';
import Image from 'next/image';
import confetti from 'canvas-confetti';

interface DriverActiveOrderViewProps {
  order: Order;
  onFinish?: () => void;
}

export function DriverActiveOrderView({ order }: DriverActiveOrderViewProps) {
  const { advanceDriverOrderStatus, sendChatMessage, cancelOrder } = useDandeli();
  const [chatOpen, setChatOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const [pinInput, setPinInput] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendChatMessage(order.id, 'DRIVER', chatText);
    setChatText('');
  };

  const handleNextStep = () => {
    // If Send order and currently at destination, verify PIN
    if (order.serviceType === 'SEND' && order.status === 'DELIVERING_PACKAGE') {
      if (pinInput !== (order.packageDetails?.securityPin || '7842')) {
        alert('PIN Serah Terima Salah! Minta 4-digit PIN dari penerima paket.');
        return;
      }
    }

    advanceDriverOrderStatus(order.id);

    if (
      order.status === 'TRIP_STARTED' ||
      order.status === 'DELIVERING_FOOD' ||
      order.status === 'DELIVERING_PACKAGE'
    ) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    }
  };

  const getNextActionLabel = () => {
    switch (order.status) {
      case 'DRIVER_ASSIGNED':
        return '🚀 Meluncur ke Titik Jemput';
      case 'HEADING_TO_PICKUP':
        return '📍 Saya Sudah Tiba di Titik Jemput';
      case 'ARRIVED_AT_PICKUP':
        if (order.serviceType === 'FOOD') return '🥡 Makanan Siap & Mulai Antar';
        if (order.serviceType === 'SEND') return '📦 Paket Diterima & Mulai Antar';
        return '🟢 Penumpang Naik & Mulai Jalan';
      case 'TRIP_STARTED':
      case 'DELIVERING_FOOD':
      case 'DELIVERING_PACKAGE':
        return '🏁 Selesaikan Order & Tagih';
      default:
        return 'Lanjut';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Navigation HUD Card */}
      <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Navigation className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-emerald-400 block">
                NAVIGASI DANDELI GPS
              </span>
              <p className="text-xs font-bold text-slate-200">
                {order.status === 'HEADING_TO_PICKUP' || order.status === 'DRIVER_ASSIGNED'
                  ? `Jemput: ${order.pickupLocation.name}`
                  : `Antar: ${order.destinationLocation.name}`}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-800">
            {order.distanceKm} KM
          </span>
        </div>

        {/* Turn-by-turn guidance strip */}
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs text-slate-300">
          <span>Rute: Jl. Jend. Sudirman → Jl. Thamrin</span>
          <span className="text-emerald-400 font-bold">Lancar</span>
        </div>
      </div>

      {/* Live Map */}
      <div className="p-2 bg-slate-100 dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-800">
        <InteractiveMap
          pickupLocation={order.pickupLocation}
          destinationLocation={order.destinationLocation}
          driverLocation={order.driverCurrentLocation}
          className="h-48 w-full rounded-2xl"
        />
      </div>

      {/* Customer Info Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-200 border border-emerald-500">
              <Image
                src={order.userAvatar || '/images/avatar_user_hendra.svg'}
                alt={order.userName}
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                {order.userName}
              </h4>
              <p className="text-[11px] font-mono text-slate-500">{order.userPhone}</p>
              <span className="text-[10px] text-emerald-600 font-semibold">
                Bayar: {order.paymentMethod.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatOpen(!chatOpen)}
              aria-label="Chat penumpang"
              className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center hover:bg-emerald-200 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
            <a
              href={`tel:${order.userPhone}`}
              aria-label="Telepon penumpang"
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Send Delivery PIN Input requirement if delivering package */}
        {order.serviceType === 'SEND' && order.status === 'DELIVERING_PACKAGE' && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Verifikasi PIN Serah Terima Paket</span>
            </div>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              Minta 4-digit PIN dari penerima ({order.packageDetails?.recipientName}) sebelum menyerahkan barang:
            </p>
            <input
              type="text"
              placeholder="Ketik 4-digit PIN (default: 7842)"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              className="w-full text-center font-mono font-bold tracking-widest text-sm p-2 rounded-xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-white"
              maxLength={4}
            />
          </div>
        )}

        {/* In-app chat dialog */}
        {chatOpen && (
          <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1 text-xs">
              {order.chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl max-w-[85%] ${
                    msg.sender === 'DRIVER'
                      ? 'ml-auto bg-emerald-600 text-white'
                      : 'mr-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-70 block text-right">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="flex gap-2">
              <input
                type="text"
                placeholder="Pesan ke penumpang..."
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                className="flex-1 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                aria-label="Kirim"
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {/* Step Progression CTA Button */}
        <button
          onClick={handleNextStep}
          className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          {getNextActionLabel()}
        </button>
      </div>
    </div>
  );
}
