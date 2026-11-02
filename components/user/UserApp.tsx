'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { HomeTab } from './HomeTab';
import { UserHistoryTab } from './UserHistoryTab';
import { UserWalletTab } from './UserWalletTab';
import { UserProfileTab } from './UserProfileTab';
import { BookingRideModal } from './BookingRideModal';
import { BookingFoodModal } from './BookingFoodModal';
import { BookingSendModal } from './BookingSendModal';
import { ActiveOrderTrackingModal } from './ActiveOrderTrackingModal';
import { ServiceType, Order } from '@/lib/types';
import { Home, Clock, Wallet, User as UserIcon } from 'lucide-react';

export function UserApp() {
  const { state } = useDandeli();
  const [activeTab, setActiveTab] = useState<'HOME' | 'HISTORY' | 'WALLET' | 'PROFILE'>('HOME');

  // Modals state
  const [rideModalOpen, setRideModalOpen] = useState(false);
  const [rideServiceType, setRideServiceType] = useState<ServiceType>('RIDE_MOTOR');
  const [foodModalOpen, setFoodModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  const activeOrder = state.orders.find((o) => o.id === state.activeOrderId);

  const handleOpenRide = (type: ServiceType) => {
    setRideServiceType(type);
    setRideModalOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-200 dark:border-slate-800">
      {/* Scrollable Main Body */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
        {activeTab === 'HOME' && (
          <HomeTab
            onOpenRide={handleOpenRide}
            onOpenFood={() => setFoodModalOpen(true)}
            onOpenSend={() => setSendModalOpen(true)}
            onOpenWallet={() => setActiveTab('WALLET')}
            onOpenActiveOrder={() => {
              if (activeOrder) setInspectOrder(activeOrder);
            }}
          />
        )}

        {activeTab === 'HISTORY' && (
          <UserHistoryTab onSelectOrder={(ord) => setInspectOrder(ord)} />
        )}

        {activeTab === 'WALLET' && <UserWalletTab />}

        {activeTab === 'PROFILE' && <UserProfileTab />}
      </div>

      {/* Floating Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-2 px-6">
        <div className="grid grid-cols-4 items-center">
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex flex-col items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center ${
              activeTab === 'HOME'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Beranda</span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`flex flex-col items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center ${
              activeTab === 'HISTORY'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Aktivitas</span>
          </button>

          <button
            onClick={() => setActiveTab('WALLET')}
            className={`flex flex-col items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center ${
              activeTab === 'WALLET'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Wallet</span>
          </button>

          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex flex-col items-center gap-1 transition-colors min-h-[44px] min-w-[44px] justify-center ${
              activeTab === 'PROFILE'
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px] leading-tight">Akun</span>
          </button>
        </div>
      </nav>

      {/* Booking Modals */}
      <BookingRideModal
        isOpen={rideModalOpen}
        onClose={() => setRideModalOpen(false)}
        defaultService={rideServiceType}
      />

      <BookingFoodModal
        isOpen={foodModalOpen}
        onClose={() => setFoodModalOpen(false)}
      />

      <BookingSendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
      />

      {/* Live Tracking Inspection Modal */}
      {inspectOrder && (
        <ActiveOrderTrackingModal
          order={inspectOrder}
          onClose={() => setInspectOrder(null)}
        />
      )}
    </div>
  );
}
