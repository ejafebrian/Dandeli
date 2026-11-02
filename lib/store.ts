'use client';

import {
  DriverProfile,
  LocationPoint,
  Merchant,
  Order,
  OrderStatus,
  PricingRule,
  Promotion,
  ServiceType,
  SupportTicket,
  UserProfile,
  WalletTransaction,
} from './types';
import {
  INITIAL_DRIVERS,
  INITIAL_MERCHANTS,
  INITIAL_PRICING_RULES,
  INITIAL_PROMOTIONS,
  INITIAL_TICKETS,
  INITIAL_USER,
  JAKARTA_LOCATIONS,
} from './data';

// Helper to calculate distance in km using Haversine formula
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawDist = R * c;
  // Apply urban road detour factor (~1.25x straight line)
  return Math.max(1.2, Number((rawDist * 1.25).toFixed(1)));
}

// Calculate duration in minutes based on distance
export function calculateDurationMins(distKm: number): number {
  // Average urban speed ~22 km/h + 3 mins traffic buffer
  return Math.max(5, Math.round((distKm / 22) * 60 + 3));
}

// Format Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Store state interface
export interface DandeliState {
  user: UserProfile;
  drivers: DriverProfile[];
  merchants: Merchant[];
  pricingRules: PricingRule[];
  promotions: Promotion[];
  tickets: SupportTicket[];
  orders: Order[];
  activeOrderId: string | null;
  walletTransactions: WalletTransaction[];
  currentDriverId: string; // The driver profile currently viewed in Driver app
  incomingOrderForDriver: Order | null;
  incomingOrderTimer: number; // seconds left for driver to accept
}

export const STORAGE_KEY = 'dandeli_ecosystem_state_v2';

export function loadStateFromStorage(): DandeliState | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: DandeliState = JSON.parse(stored);
      // Sanitize any legacy avatars
      if (parsed.user && parsed.user.avatar?.includes('unsplash')) {
        parsed.user.avatar = INITIAL_USER.avatar;
      }
      if (parsed.drivers) {
        parsed.drivers = parsed.drivers.map((d, i) => ({
          ...d,
          avatar: d.avatar?.includes('unsplash')
            ? INITIAL_DRIVERS[i]?.avatar || INITIAL_DRIVERS[0].avatar
            : d.avatar,
        }));
      }
      return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse stored state', e);
  }
  return null;
}

export function getDefaultState(): DandeliState {

  // Initial pre-completed order for realistic history
  const samplePastOrder: Order = {
    id: 'ord-hist-01',
    orderNumber: 'DND-20261101-0982',
    serviceType: 'RIDE_MOTOR',
    status: 'COMPLETED',
    userId: INITIAL_USER.id,
    userName: INITIAL_USER.name,
    userPhone: INITIAL_USER.phone,
    userAvatar: INITIAL_USER.avatar,
    driverId: INITIAL_DRIVERS[0].id,
    driverName: INITIAL_DRIVERS[0].name,
    driverPhone: INITIAL_DRIVERS[0].phone,
    driverAvatar: INITIAL_DRIVERS[0].avatar,
    driverVehiclePlate: INITIAL_DRIVERS[0].vehiclePlate,
    driverRating: INITIAL_DRIVERS[0].rating,
    pickupLocation: JAKARTA_LOCATIONS[0],
    destinationLocation: JAKARTA_LOCATIONS[2],
    distanceKm: 4.8,
    estimatedDurationMins: 16,
    fareBreakdown: {
      baseFare: 10000,
      distanceFare: 12480,
      platformFee: 2500,
      discount: 0,
      subtotal: 24980,
      totalFare: 25000,
      driverEarnings: 21250,
      platformCommission: 3750,
    },
    paymentMethod: 'DANDELI_WALLET',
    paymentStatus: 'PAID',
    chatMessages: [
      {
        id: 'msg-1',
        sender: 'DRIVER',
        text: 'Halo kak, saya sudah di lobi barat Grand Indonesia ya.',
        timestamp: '14:32',
      },
      {
        id: 'msg-2',
        sender: 'USER',
        text: 'Baik pak, saya sedang turun dari eskalator lobi.',
        timestamp: '14:33',
      },
    ],
    ratingGiven: 5,
    reviewText: 'Driver sangat ramah, motor bersih dan helm wangi!',
    createdAt: '2026-11-01T14:30:00Z',
    updatedAt: '2026-11-01T14:52:00Z',
  };

  return {
    user: INITIAL_USER,
    drivers: INITIAL_DRIVERS,
    merchants: INITIAL_MERCHANTS,
    pricingRules: INITIAL_PRICING_RULES,
    promotions: INITIAL_PROMOTIONS,
    tickets: INITIAL_TICKETS,
    orders: [samplePastOrder],
    activeOrderId: null,
    walletTransactions: [
      {
        id: 'tx-01',
        userIdOrDriverId: INITIAL_USER.id,
        type: 'TOPUP',
        amount: 200000,
        description: 'Top Up DANDELI Wallet via BCA Virtual Account',
        method: 'BCA VA',
        status: 'COMPLETED',
        timestamp: '2026-11-01T10:15:00Z',
      },
      {
        id: 'tx-02',
        userIdOrDriverId: INITIAL_USER.id,
        type: 'PAYMENT',
        amount: 25000,
        description: 'Pembayaran Ride Motor DND-20261101-0982',
        method: 'DANDELI_WALLET',
        status: 'COMPLETED',
        timestamp: '2026-11-01T14:52:00Z',
      },
    ],
    currentDriverId: INITIAL_DRIVERS[0].id,
    incomingOrderForDriver: null,
    incomingOrderTimer: 0,
  };
}

export const getInitialState = getDefaultState;

export function saveStateToStorage(state: DandeliState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new CustomEvent('dandeli_sync', { detail: state }));
    } catch (e) {
      console.warn('Failed to save state to localStorage', e);
    }
  }
}
