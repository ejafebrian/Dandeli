export type ServiceType = 'RIDE_MOTOR' | 'FOOD' | 'SEND';

export type OrderStatus =
  | 'SEARCHING_DRIVER'
  | 'DRIVER_ASSIGNED'
  | 'HEADING_TO_PICKUP'
  | 'ARRIVED_AT_PICKUP'
  | 'TRIP_STARTED'
  | 'DELIVERING_FOOD'
  | 'DELIVERING_PACKAGE'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'DANDELI_WALLET' | 'CASH' | 'QRIS' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FAILED';

export type DriverStatus = 'OFFLINE' | 'ONLINE_IDLE' | 'BUSY_ON_TRIP';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
  verificationStatus: VerificationStatus;
  walletBalance: number;
  savedAddresses: {
    home?: LocationPoint;
    work?: LocationPoint;
  };
  createdAt: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  vehicleType: 'MOTOR';
  vehiclePlate: string;
  vehicleModel: string;
  rating: number;
  totalTrips: number;
  status: DriverStatus;
  verificationStatus: VerificationStatus;
  currentLocation: {
    lat: number;
    lng: number;
    heading: number;
  };
  documents: {
    ktpNumber: string;
    simNumber: string;
    stnkNumber: string;
    ktpUploaded: boolean;
    simUploaded: boolean;
    stnkUploaded: boolean;
  };
  walletBalance: number;
  bankAccount: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  isPopular?: boolean;
}

export interface Merchant {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  estimatedPrepTimeMinutes: number;
  imageUrl: string;
  menus: MenuItem[];
  commissionRate: number; // e.g. 0.20 for 20%
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface PackageDetails {
  category: 'DOKUMEN' | 'PAKET_KECIL' | 'PAKET_SEDANG';
  description: string;
  weightKg: number;
  recipientName: string;
  recipientPhone: string;
  senderName: string;
  senderPhone: string;
  securityPin: string;
  proofImageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  serviceType: ServiceType;
  status: OrderStatus;
  userId: string;
  userName: string;
  userPhone: string;
  userAvatar: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverAvatar?: string;
  driverVehiclePlate?: string;
  driverRating?: number;
  pickupLocation: LocationPoint;
  destinationLocation: LocationPoint;
  distanceKm: number;
  estimatedDurationMins: number;
  fareBreakdown: {
    baseFare: number;
    distanceFare: number;
    platformFee: number;
    discount: number;
    subtotal: number;
    totalFare: number;
    driverEarnings: number;
    platformCommission: number;
  };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  voucherCodeApplied?: string;
  // Specific to Food
  merchantId?: string;
  merchantName?: string;
  merchantAddress?: string;
  items?: OrderItem[];
  // Specific to Send
  packageDetails?: PackageDetails;
  // Live GPS simulation
  driverCurrentLocation?: {
    lat: number;
    lng: number;
  };
  chatMessages: Array<{
    id: string;
    sender: 'USER' | 'DRIVER' | 'SYSTEM';
    text: string;
    timestamp: string;
  }>;
  ratingGiven?: number;
  reviewText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PricingRule {
  id: string;
  serviceType: ServiceType;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  platformFee: number;
  surgeMultiplier: number;
  isSurgeActive: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  title: string;
  description: string;
  discountPercentage: number;
  maxDiscount: number;
  minTransaction: number;
  validUntil: string;
  applicableServices: ServiceType[];
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  userIdOrDriverId: string;
  type: 'TOPUP' | 'PAYMENT' | 'EARNING' | 'WITHDRAW' | 'REFUND';
  amount: number;
  description: string;
  method: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  reporterType: 'USER' | 'DRIVER' | 'MERCHANT';
  reporterName: string;
  subject: string;
  category: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
}
