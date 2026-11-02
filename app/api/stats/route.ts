import { NextResponse } from 'next/server';
import { INITIAL_DRIVERS, INITIAL_MERCHANTS, INITIAL_USER } from '@/lib/data';

export async function GET() {
  const onlineDrivers = INITIAL_DRIVERS.filter((d) => d.status === 'ONLINE_IDLE').length;
  const verifiedDrivers = INITIAL_DRIVERS.filter((d) => d.verificationStatus === 'VERIFIED').length;
  const pendingDrivers = INITIAL_DRIVERS.filter((d) => d.verificationStatus === 'PENDING').length;

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        totalUsers: 18450,
        activeUsersToday: 3210,
        totalDrivers: INITIAL_DRIVERS.length + 420,
        onlineDrivers: onlineDrivers + 84,
        pendingDriversApproval: pendingDrivers + 12,
        totalMerchants: INITIAL_MERCHANTS.length + 158,
        totalOrdersToday: 489,
        platformGmvToday: 18450000,
        platformNetRevenueToday: 2767500, // 15% commission
      },
      serviceBreakdown: {
        rideMotor: { count: 380, gmv: 11420000 },
        food: { count: 82, gmv: 4920000 },
        send: { count: 27, gmv: 2110000 },
      },
      systemHealth: {
        googleMapsApi: 'OPERATIONAL',
        paymentGateway: 'SANDBOX_READY',
        firebaseAuthFcm: 'ACTIVE',
        databaseLatencyMs: 14,
      },
    },
  });
}
