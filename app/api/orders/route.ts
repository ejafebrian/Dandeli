import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_DRIVERS, INITIAL_PRICING_RULES, INITIAL_USER, JAKARTA_LOCATIONS } from '@/lib/data';
import { calculateDistanceKm, calculateDurationMins } from '@/lib/store';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get('status');
  const service = searchParams.get('service');

  return NextResponse.json({
    success: true,
    message: 'DANDELI Orders retrieved',
    data: {
      total: 1,
      orders: [
        {
          id: 'ord-hist-01',
          orderNumber: 'DND-20261101-0982',
          serviceType: service || 'RIDE_MOTOR',
          status: status || 'COMPLETED',
          user: INITIAL_USER,
          pickupLocation: JAKARTA_LOCATIONS[0],
          destinationLocation: JAKARTA_LOCATIONS[2],
          totalFare: 25000,
        },
      ],
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceType, pickupLocation, destinationLocation, paymentMethod, voucherCode } = body;

    if (!serviceType || !pickupLocation || !destinationLocation) {
      return NextResponse.json(
        { success: false, error: 'serviceType, pickupLocation, and destinationLocation are required' },
        { status: 400 }
      );
    }

    const distKm = calculateDistanceKm(
      pickupLocation.lat,
      pickupLocation.lng,
      destinationLocation.lat,
      destinationLocation.lng
    );
    const estDuration = calculateDurationMins(distKm);

    const pricing =
      INITIAL_PRICING_RULES.find((p) => p.serviceType === serviceType) || INITIAL_PRICING_RULES[0];
    const baseFare = pricing.baseFare;
    const distanceFare = Math.round(distKm * pricing.perKmRate);
    const platformFee = pricing.platformFee;
    const subtotal = Math.max(pricing.minimumFare, baseFare + distanceFare + platformFee);
    const totalFare = subtotal;

    const matchedDriver = INITIAL_DRIVERS.find((d) => d.status === 'ONLINE_IDLE') || INITIAL_DRIVERS[0];

    const newOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `DND-${Date.now().toString().slice(-8)}`,
      serviceType,
      status: 'SEARCHING_DRIVER',
      pickupLocation,
      destinationLocation,
      distanceKm: distKm,
      estimatedDurationMins: estDuration,
      fareBreakdown: {
        baseFare,
        distanceFare,
        platformFee,
        subtotal,
        totalFare,
        driverEarnings: Math.round(totalFare * 0.85),
        platformCommission: Math.round(totalFare * 0.15),
      },
      matchedDriver: {
        id: matchedDriver.id,
        name: matchedDriver.name,
        plate: matchedDriver.vehiclePlate,
        rating: matchedDriver.rating,
      },
      paymentMethod: paymentMethod || 'DANDELI_WALLET',
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      message: 'Order created successfully. Finding nearest DANDELI driver...',
      order: newOrder,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
