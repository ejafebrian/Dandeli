'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import {
  DandeliState,
  getDefaultState,
  loadStateFromStorage,
  saveStateToStorage,
  calculateDistanceKm,
  calculateDurationMins,
  STORAGE_KEY,
} from './store';
import {
  DriverProfile,
  LocationPoint,
  Merchant,
  Order,
  OrderItem,
  OrderStatus,
  PackageDetails,
  PaymentMethod,
  PricingRule,
  Promotion,
  ServiceType,
  SupportTicket,
  UserProfile,
} from './types';

interface CreateOrderParams {
  serviceType: ServiceType;
  pickupLocation: LocationPoint;
  destinationLocation: LocationPoint;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  items?: OrderItem[];
  merchantId?: string;
  merchantName?: string;
  merchantAddress?: string;
  packageDetails?: PackageDetails;
}

interface DandeliContextType {
  state: DandeliState;
  // User Actions
  createOrder: (params: CreateOrderParams) => Promise<Order>;
  cancelOrder: (orderId: string, reason?: string) => void;
  sendChatMessage: (orderId: string, sender: 'USER' | 'DRIVER', text: string) => void;
  submitRating: (orderId: string, rating: number, review: string) => void;
  topUpWallet: (amount: number, method: string) => void;
  // Driver Actions
  currentDriver: DriverProfile | undefined;
  setCurrentDriverId: (id: string) => void;
  toggleDriverOnline: (driverId: string) => void;
  acceptOrderAsDriver: (orderId: string) => void;
  rejectOrderAsDriver: (orderId: string) => void;
  advanceDriverOrderStatus: (orderId: string) => void;
  withdrawDriverBalance: (driverId: string, amount: number) => void;
  registerDriver: (formData: Partial<DriverProfile>) => void;
  // Admin Actions
  updateDriverStatusByAdmin: (driverId: string, verification: 'VERIFIED' | 'REJECTED' | 'PENDING', isSuspended?: boolean) => void;
  updatePricingRule: (rule: PricingRule) => void;
  addPromotion: (promo: Promotion) => void;
  togglePromotion: (id: string, active: boolean) => void;
  updateMerchant: (merchant: Merchant) => void;
  addMerchant: (merchant: Merchant) => void;
  resolveTicket: (ticketId: string) => void;
  resetAllData: () => void;
}

const DandeliContext = createContext<DandeliContextType | null>(null);

export function DandeliProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DandeliState>(getDefaultState);
  const [, startTransition] = useTransition();

  // Hydrate state from localStorage after mount to ensure identical SSR & initial client render
  useEffect(() => {
    const stored = loadStateFromStorage();
    if (stored) {
      queueMicrotask(() => {
        setState(stored);
      });
    }
  }, []);

  // Listen to cross-tab / cross-component sync
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<DandeliState>;
      if (customEvent.detail) {
        setState(customEvent.detail);
      }
    };
    window.addEventListener('dandeli_sync', handleSync);
    return () => window.removeEventListener('dandeli_sync', handleSync);
  }, []);

  // Sync state changes to storage
  const updateState = useCallback((updater: (prev: DandeliState) => DandeliState) => {
    setState((prev) => {
      const next = updater(prev);
      saveStateToStorage(next);
      return next;
    });
  }, []);

  // Timer countdown for incoming driver order
  useEffect(() => {
    if (!state.incomingOrderForDriver || state.incomingOrderTimer <= 0) return;

    const timer = setInterval(() => {
      updateState((prev) => {
        if (!prev.incomingOrderForDriver) return prev;
        if (prev.incomingOrderTimer <= 1) {
          // Timeout: auto-reassign to next driver or simulate auto-acceptance in user view
          return {
            ...prev,
            incomingOrderForDriver: null,
            incomingOrderTimer: 0,
          };
        }
        return {
          ...prev,
          incomingOrderTimer: prev.incomingOrderTimer - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [state.incomingOrderForDriver, state.incomingOrderTimer, updateState]);

  // Current active driver in view
  const currentDriver = state.drivers.find((d) => d.id === state.currentDriverId) || state.drivers[0];

  // 1. CREATE ORDER (User books)
  const createOrder = useCallback(
    async (params: CreateOrderParams): Promise<Order> => {
      const distKm = calculateDistanceKm(
        params.pickupLocation.lat,
        params.pickupLocation.lng,
        params.destinationLocation.lat,
        params.destinationLocation.lng
      );
      const estDuration = calculateDurationMins(distKm);

      const pricing =
        state.pricingRules.find((p) => p.serviceType === params.serviceType) ||
        state.pricingRules[0];

      const rawDistanceFare = distKm * pricing.perKmRate;
      let subtotal = pricing.baseFare + rawDistanceFare + pricing.platformFee;
      if (params.items && params.items.length > 0) {
        const itemsTotal = params.items.reduce((sum, it) => sum + it.price * it.quantity, 0);
        subtotal += itemsTotal;
      }
      subtotal = Math.max(pricing.minimumFare, subtotal);

      // Check voucher discount
      let discount = 0;
      if (params.voucherCode) {
        const foundPromo = state.promotions.find(
          (p) => p.code.toUpperCase() === params.voucherCode?.toUpperCase() && p.isActive
        );
        if (foundPromo && subtotal >= foundPromo.minTransaction) {
          discount = Math.min(
            (subtotal * foundPromo.discountPercentage) / 100,
            foundPromo.maxDiscount
          );
        }
      }

      const totalFare = Math.max(0, Math.round(subtotal - discount));
      const platformCommission = Math.round(totalFare * 0.15);
      const driverEarnings = totalFare - platformCommission;

      const orderNumber = `DND-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Matching algorithm: Find candidate motorcycle drivers
      const candidateDrivers = state.drivers.filter(
        (d) => d.status === 'ONLINE_IDLE' && d.verificationStatus === 'VERIFIED'
      );

      // Pick closest or first online driver
      const assignedDriver = candidateDrivers.length > 0 ? candidateDrivers[0] : state.drivers[0];

      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        serviceType: params.serviceType,
        status: 'SEARCHING_DRIVER',
        userId: state.user.id,
        userName: state.user.name,
        userPhone: state.user.phone,
        userAvatar: state.user.avatar,
        driverId: assignedDriver?.id,
        driverName: assignedDriver?.name,
        driverPhone: assignedDriver?.phone,
        driverAvatar: assignedDriver?.avatar,
        driverVehiclePlate: assignedDriver?.vehiclePlate,
        driverRating: assignedDriver?.rating,
        pickupLocation: params.pickupLocation,
        destinationLocation: params.destinationLocation,
        distanceKm: distKm,
        estimatedDurationMins: estDuration,
        fareBreakdown: {
          baseFare: pricing.baseFare,
          distanceFare: Math.round(rawDistanceFare),
          platformFee: pricing.platformFee,
          discount: Math.round(discount),
          subtotal: Math.round(subtotal),
          totalFare,
          driverEarnings,
          platformCommission,
        },
        paymentMethod: params.paymentMethod,
        paymentStatus: params.paymentMethod === 'DANDELI_WALLET' ? 'PAID' : 'PENDING',
        voucherCodeApplied: params.voucherCode,
        merchantId: params.merchantId,
        merchantName: params.merchantName,
        merchantAddress: params.merchantAddress,
        items: params.items,
        packageDetails: params.packageDetails,
        driverCurrentLocation: assignedDriver ? { ...assignedDriver.currentLocation } : undefined,
        chatMessages: [
          {
            id: `msg-sys-${Date.now()}`,
            sender: 'SYSTEM',
            text: `Pesanan dibuat. Sistem DANDELI mencocokkan mitra pengemudi terdekat...`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Deduct wallet if DANDELI_WALLET
      let updatedUserWallet = state.user.walletBalance;
      const newTransactions = [...state.walletTransactions];

      if (params.paymentMethod === 'DANDELI_WALLET') {
        updatedUserWallet = Math.max(0, updatedUserWallet - totalFare);
        newTransactions.unshift({
          id: `tx-${Date.now()}`,
          userIdOrDriverId: state.user.id,
          type: 'PAYMENT',
          amount: totalFare,
          description: `Pembayaran ${params.serviceType} ${orderNumber}`,
          method: 'DANDELI_WALLET',
          status: 'COMPLETED',
          timestamp: new Date().toISOString(),
        });
      }

      updateState((prev) => ({
        ...prev,
        orders: [newOrder, ...prev.orders],
        activeOrderId: newOrder.id,
        user: {
          ...prev.user,
          walletBalance: updatedUserWallet,
        },
        walletTransactions: newTransactions,
        incomingOrderForDriver: newOrder,
        incomingOrderTimer: 30, // 30 seconds to accept
      }));

      // Simulate immediate match after 2 seconds for smooth UX if in user view
      setTimeout(() => {
        updateState((prev) => {
          const ord = prev.orders.find((o) => o.id === newOrder.id);
          if (!ord || ord.status !== 'SEARCHING_DRIVER') return prev;

          const updatedOrder: Order = {
            ...ord,
            status: 'DRIVER_ASSIGNED',
            chatMessages: [
              ...ord.chatMessages,
              {
                id: `msg-drv-${Date.now()}`,
                sender: 'DRIVER',
                text: `Halo kak ${prev.user.name}, saya ${ord.driverName}. Saya sedang menuju titik penjemputan.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ],
            updatedAt: new Date().toISOString(),
          };

          return {
            ...prev,
            orders: prev.orders.map((o) => (o.id === newOrder.id ? updatedOrder : o)),
            drivers: prev.drivers.map((d) =>
              d.id === ord.driverId ? { ...d, status: 'BUSY_ON_TRIP' } : d
            ),
          };
        });
      }, 2500);

      return newOrder;
    },
    [state, updateState]
  );

  // 2. CANCEL ORDER
  const cancelOrder = useCallback(
    (orderId: string, reason = 'Dibatalkan oleh pengguna') => {
      updateState((prev) => {
        const ord = prev.orders.find((o) => o.id === orderId);
        if (!ord) return prev;

        // Refund if wallet
        let updatedUserBalance = prev.user.walletBalance;
        const newTx = [...prev.walletTransactions];
        if (ord.paymentMethod === 'DANDELI_WALLET' && ord.paymentStatus === 'PAID') {
          updatedUserBalance += ord.fareBreakdown.totalFare;
          newTx.unshift({
            id: `tx-ref-${Date.now()}`,
            userIdOrDriverId: prev.user.id,
            type: 'REFUND',
            amount: ord.fareBreakdown.totalFare,
            description: `Pengembalian dana pembatalan ${ord.orderNumber}`,
            method: 'DANDELI_WALLET',
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
          });
        }

        return {
          ...prev,
          orders: prev.orders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'CANCELLED',
                  paymentStatus: ord.paymentMethod === 'DANDELI_WALLET' ? 'REFUNDED' : 'FAILED',
                  chatMessages: [
                    ...o.chatMessages,
                    {
                      id: `msg-sys-${Date.now()}`,
                      sender: 'SYSTEM',
                      text: `Pesanan dibatalkan. Alasan: ${reason}`,
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    },
                  ],
                  updatedAt: new Date().toISOString(),
                }
              : o
          ),
          activeOrderId: prev.activeOrderId === orderId ? null : prev.activeOrderId,
          incomingOrderForDriver: prev.incomingOrderForDriver?.id === orderId ? null : prev.incomingOrderForDriver,
          incomingOrderTimer: prev.incomingOrderForDriver?.id === orderId ? 0 : prev.incomingOrderTimer,
          user: {
            ...prev.user,
            walletBalance: updatedUserBalance,
          },
          walletTransactions: newTx,
          drivers: prev.drivers.map((d) =>
            d.id === ord.driverId ? { ...d, status: 'ONLINE_IDLE' } : d
          ),
        };
      });
    },
    [updateState]
  );

  // 3. DRIVER ACCEPTS ORDER
  const acceptOrderAsDriver = useCallback(
    (orderId: string) => {
      updateState((prev) => {
        const ord = prev.orders.find((o) => o.id === orderId);
        if (!ord) return prev;

        const updatedOrder: Order = {
          ...ord,
          status: 'DRIVER_ASSIGNED',
          driverId: prev.currentDriverId,
          driverName: prev.drivers.find((d) => d.id === prev.currentDriverId)?.name || ord.driverName,
          chatMessages: [
            ...ord.chatMessages,
            {
              id: `msg-sys-${Date.now()}`,
              sender: 'SYSTEM',
              text: `Mitra pengemudi telah menerima pesanan Anda.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
          updatedAt: new Date().toISOString(),
        };

        return {
          ...prev,
          orders: prev.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
          incomingOrderForDriver: null,
          incomingOrderTimer: 0,
          drivers: prev.drivers.map((d) =>
            d.id === prev.currentDriverId ? { ...d, status: 'BUSY_ON_TRIP' } : d
          ),
        };
      });
    },
    [updateState]
  );

  // 4. DRIVER REJECTS ORDER
  const rejectOrderAsDriver = useCallback(
    (orderId: string) => {
      updateState((prev) => ({
        ...prev,
        incomingOrderForDriver: null,
        incomingOrderTimer: 0,
      }));
    },
    [updateState]
  );

  // 5. ADVANCE DRIVER ORDER STATUS (Step by step flow)
  const advanceDriverOrderStatus = useCallback(
    (orderId: string) => {
      updateState((prev) => {
        const ord = prev.orders.find((o) => o.id === orderId);
        if (!ord) return prev;

        let nextStatus: OrderStatus = ord.status;
        let systemNote = '';

        if (ord.status === 'DRIVER_ASSIGNED') {
          nextStatus = 'HEADING_TO_PICKUP';
          systemNote = 'Mitra sedang berkendara menuju titik penjemputan.';
        } else if (ord.status === 'HEADING_TO_PICKUP') {
          nextStatus = 'ARRIVED_AT_PICKUP';
          systemNote = 'Mitra telah tiba di titik penjemputan!';
        } else if (ord.status === 'ARRIVED_AT_PICKUP') {
          if (ord.serviceType === 'FOOD') {
            nextStatus = 'DELIVERING_FOOD';
            systemNote = 'Pesanan makanan telah diambil dan dalam perjalanan ke alamat Anda.';
          } else if (ord.serviceType === 'SEND') {
            nextStatus = 'DELIVERING_PACKAGE';
            systemNote = 'Paket telah dijemput dan sedang diantar ke penerima.';
          } else {
            nextStatus = 'TRIP_STARTED';
            systemNote = 'Perjalanan dimulai. Semoga selamat sampai tujuan!';
          }
        } else if (
          ord.status === 'TRIP_STARTED' ||
          ord.status === 'DELIVERING_FOOD' ||
          ord.status === 'DELIVERING_PACKAGE'
        ) {
          nextStatus = 'COMPLETED';
          systemNote = 'Pesanan telah selesai! Terima kasih menggunakan DANDELI.';
        }

        // Handle completion payouts
        let updatedDrivers = [...prev.drivers];
        let updatedTransactions = [...prev.walletTransactions];

        if (nextStatus === 'COMPLETED') {
          const earning = ord.fareBreakdown.driverEarnings;
          updatedDrivers = updatedDrivers.map((d) => {
            if (d.id === ord.driverId) {
              return {
                ...d,
                status: 'ONLINE_IDLE',
                walletBalance: d.walletBalance + earning,
                totalTrips: d.totalTrips + 1,
              };
            }
            return d;
          });

          updatedTransactions.unshift({
            id: `tx-earn-${Date.now()}`,
            userIdOrDriverId: ord.driverId || '',
            type: 'EARNING',
            amount: earning,
            description: `Pendapatan order ${ord.orderNumber}`,
            method: 'DANDELI_WALLET',
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
          });
        }

        const updatedOrder: Order = {
          ...ord,
          status: nextStatus,
          paymentStatus: nextStatus === 'COMPLETED' ? 'PAID' : ord.paymentStatus,
          chatMessages: systemNote
            ? [
                ...ord.chatMessages,
                {
                  id: `msg-sys-${Date.now()}`,
                  sender: 'SYSTEM',
                  text: systemNote,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]
            : ord.chatMessages,
          updatedAt: new Date().toISOString(),
        };

        return {
          ...prev,
          orders: prev.orders.map((o) => (o.id === orderId ? updatedOrder : o)),
          drivers: updatedDrivers,
          walletTransactions: updatedTransactions,
          activeOrderId: nextStatus === 'COMPLETED' ? null : prev.activeOrderId,
        };
      });
    },
    [updateState]
  );

  // 6. CHAT
  const sendChatMessage = useCallback(
    (orderId: string, sender: 'USER' | 'DRIVER', text: string) => {
      if (!text.trim()) return;
      updateState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                chatMessages: [
                  ...o.chatMessages,
                  {
                    id: `msg-${Date.now()}`,
                    sender,
                    text: text.trim(),
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  },
                ],
              }
            : o
        ),
      }));
    },
    [updateState]
  );

  // 7. SUBMIT RATING
  const submitRating = useCallback(
    (orderId: string, rating: number, review: string) => {
      updateState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) =>
          o.id === orderId ? { ...o, ratingGiven: rating, reviewText: review } : o
        ),
      }));
    },
    [updateState]
  );

  // 8. TOP UP WALLET
  const topUpWallet = useCallback(
    (amount: number, method: string) => {
      updateState((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          walletBalance: prev.user.walletBalance + amount,
        },
        walletTransactions: [
          {
            id: `tx-top-${Date.now()}`,
            userIdOrDriverId: prev.user.id,
            type: 'TOPUP',
            amount,
            description: `Top Up DANDELI Wallet via ${method}`,
            method,
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
          },
          ...prev.walletTransactions,
        ],
      }));
    },
    [updateState]
  );

  // 9. DRIVER WITHDRAW
  const withdrawDriverBalance = useCallback(
    (driverId: string, amount: number) => {
      updateState((prev) => {
        const drv = prev.drivers.find((d) => d.id === driverId);
        if (!drv || drv.walletBalance < amount) return prev;

        return {
          ...prev,
          drivers: prev.drivers.map((d) =>
            d.id === driverId ? { ...d, walletBalance: d.walletBalance - amount } : d
          ),
          walletTransactions: [
            {
              id: `tx-wd-${Date.now()}`,
              userIdOrDriverId: driverId,
              type: 'WITHDRAW',
              amount,
              description: `Pencairan dana ke ${drv.bankAccount.bankName} (${drv.bankAccount.accountNumber})`,
              method: 'BANK_TRANSFER',
              status: 'COMPLETED',
              timestamp: new Date().toISOString(),
            },
            ...prev.walletTransactions,
          ],
        };
      });
    },
    [updateState]
  );

  // 10. TOGGLE DRIVER ONLINE
  const toggleDriverOnline = useCallback(
    (driverId: string) => {
      updateState((prev) => ({
        ...prev,
        drivers: prev.drivers.map((d) => {
          if (d.id === driverId) {
            const nextStatus = d.status === 'OFFLINE' ? 'ONLINE_IDLE' : 'OFFLINE';
            return { ...d, status: nextStatus };
          }
          return d;
        }),
      }));
    },
    [updateState]
  );

  // 11. ADMIN DRIVER VERIFICATION
  const updateDriverStatusByAdmin = useCallback(
    (driverId: string, verification: 'VERIFIED' | 'REJECTED' | 'PENDING', isSuspended = false) => {
      updateState((prev) => ({
        ...prev,
        drivers: prev.drivers.map((d) =>
          d.id === driverId
            ? {
                ...d,
                verificationStatus: verification,
                status: isSuspended ? 'OFFLINE' : d.status,
              }
            : d
        ),
      }));
    },
    [updateState]
  );

  // 12. UPDATE PRICING
  const updatePricingRule = useCallback(
    (rule: PricingRule) => {
      updateState((prev) => ({
        ...prev,
        pricingRules: prev.pricingRules.map((r) => (r.id === rule.id ? rule : r)),
      }));
    },
    [updateState]
  );

  // 13. PROMOTIONS
  const addPromotion = useCallback(
    (promo: Promotion) => {
      updateState((prev) => ({
        ...prev,
        promotions: [promo, ...prev.promotions],
      }));
    },
    [updateState]
  );

  const togglePromotion = useCallback(
    (id: string, active: boolean) => {
      updateState((prev) => ({
        ...prev,
        promotions: prev.promotions.map((p) => (p.id === id ? { ...p, isActive: active } : p)),
      }));
    },
    [updateState]
  );

  // 14. MERCHANTS
  const updateMerchant = useCallback(
    (merchant: Merchant) => {
      updateState((prev) => ({
        ...prev,
        merchants: prev.merchants.map((m) => (m.id === merchant.id ? merchant : m)),
      }));
    },
    [updateState]
  );

  const addMerchant = useCallback(
    (merchant: Merchant) => {
      updateState((prev) => ({
        ...prev,
        merchants: [merchant, ...prev.merchants],
      }));
    },
    [updateState]
  );

  // 15. RESOLVE TICKET
  const resolveTicket = useCallback(
    (ticketId: string) => {
      updateState((prev) => ({
        ...prev,
        tickets: prev.tickets.map((t) => (t.id === ticketId ? { ...t, status: 'RESOLVED' } : t)),
      }));
    },
    [updateState]
  );

  // 16. DRIVER REGISTRATION
  const registerDriver = useCallback(
    (formData: Partial<DriverProfile>) => {
      const newDriver: DriverProfile = {
        id: `drv-${Date.now()}`,
        name: formData.name || 'Mitra Baru DANDELI',
        phone: formData.phone || '0812-0000-0000',
        avatar: '/images/avatar_driver_budi.svg',
        vehicleType: formData.vehicleType || 'MOTOR',
        vehiclePlate: formData.vehiclePlate || 'B 1234 ABC',
        vehicleModel: formData.vehicleModel || 'Honda Vario 125',
        rating: 5.0,
        totalTrips: 0,
        status: 'OFFLINE',
        verificationStatus: 'PENDING',
        currentLocation: {
          lat: -6.195,
          lng: 106.82,
          heading: 0,
        },
        documents: {
          ktpNumber: formData.documents?.ktpNumber || '3171000000000000',
          simNumber: formData.documents?.simNumber || 'SIM-99881122',
          stnkNumber: formData.documents?.stnkNumber || 'STNK-99881122',
          ktpUploaded: true,
          simUploaded: true,
          stnkUploaded: true,
        },
        walletBalance: 50000,
        bankAccount: {
          bankName: formData.bankAccount?.bankName || 'BCA',
          accountNumber: formData.bankAccount?.accountNumber || '1234567890',
          accountHolder: formData.name || 'Mitra Baru',
        },
      };

      updateState((prev) => ({
        ...prev,
        drivers: [newDriver, ...prev.drivers],
        currentDriverId: newDriver.id,
      }));
    },
    [updateState]
  );

  // 17. RESET DEMO DATA
  const resetAllData = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    const freshState = getDefaultState();
    setState(freshState);
    saveStateToStorage(freshState);
  }, []);

  const setCurrentDriverId = useCallback(
    (id: string) => {
      updateState((prev) => ({ ...prev, currentDriverId: id }));
    },
    [updateState]
  );

  return (
    <DandeliContext.Provider
      value={{
        state,
        createOrder,
        cancelOrder,
        sendChatMessage,
        submitRating,
        topUpWallet,
        currentDriver,
        setCurrentDriverId,
        toggleDriverOnline,
        acceptOrderAsDriver,
        rejectOrderAsDriver,
        advanceDriverOrderStatus,
        withdrawDriverBalance,
        registerDriver,
        updateDriverStatusByAdmin,
        updatePricingRule,
        addPromotion,
        togglePromotion,
        updateMerchant,
        addMerchant,
        resolveTicket,
        resetAllData,
      }}
    >
      {children}
    </DandeliContext.Provider>
  );
}

export function useDandeli() {
  const ctx = useContext(DandeliContext);
  if (!ctx) {
    throw new Error('useDandeli must be used within a DandeliProvider');
  }
  return ctx;
}
