'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { LocationPoint } from '@/lib/types';
import { Bike, Plus, Minus, Compass, MapPin, Layers } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBeYuW2508CuiAJdvuA3qkveke4vbvoLgM';

interface InteractiveMapProps {
  pickupLocation?: LocationPoint;
  destinationLocation?: LocationPoint;
  driverLocation?: { lat: number; lng: number; heading?: number };
  nearbyDrivers?: Array<{
    id: string;
    lat: number;
    lng: number;
    vehicleType?: 'MOTOR';
    name?: string;
  }>;
  interactiveSelect?: boolean;
  selectionType?: 'PICKUP' | 'DESTINATION';
  onSelectLocation?: (point: LocationPoint) => void;
  className?: string;
  showRoute?: boolean;
}

// Fallback reverse-geocoding helper based on Kabupaten & Kota Tegal coordinate zones
// Berpusat di Desa Danawarih, Kecamatan Balapulang dan sekitarnya
function getApproximateTegalAddress(lat: number, lng: number): { name: string; address: string } {
  // Landmarks in Kab. & Kota Tegal for nearest neighbor matching
  const knownPlaces = [
    {
      name: 'Kantor Pusat DANDELI Danawarih',
      address: 'Jl. Raya Danawarih No. 1, Desa Danawarih, Balapulang, Kab. Tegal',
      lat: -7.1005,
      lng: 109.1412,
    },
    {
      name: 'Jembatan Gantung Danawarih & Kali Gung',
      address: 'Kawasan Wisata Religi Makam Ki Gede Sebayu, Danawarih, Kab. Tegal',
      lat: -7.0988,
      lng: 109.1430,
    },
    {
      name: 'Pasar Balapulang',
      address: 'Jl. Raya Balapulang, Balapulang Kulon, Kec. Balapulang, Kab. Tegal',
      lat: -7.0682,
      lng: 109.1195,
    },
    {
      name: 'Pertigaan Yomani / Sentra Martabak Lebaksiu',
      address: 'Jl. Raya Yomani - Guci, Lebaksiu Lor, Kec. Lebaksiu, Kab. Tegal',
      lat: -7.0425,
      lng: 109.1428,
    },
    {
      name: 'Alun-alun Hanggawana Slawi',
      address: 'Jl. Ahmad Yani, Procot, Kec. Slawi, Kab. Tegal',
      lat: -6.9855,
      lng: 109.1384,
    },
    {
      name: 'Stasiun Kereta Api Slawi',
      address: 'Jl. Letjen Suprapto, Kudaile, Kec. Slawi, Kab. Tegal',
      lat: -6.9802,
      lng: 109.1345,
    },
    {
      name: 'Exit Tol Adiwerna & Singkil',
      address: 'Jl. Raya Singkil, Adiwerna, Kab. Tegal',
      lat: -6.9378,
      lng: 109.1312,
    },
    {
      name: 'Sentra Tahu Aci Banjaran Adiwerna',
      address: 'Jl. Raya Banjaran, Adiwerna, Kab. Tegal',
      lat: -6.9550,
      lng: 109.1330,
    },
    {
      name: 'Alun-alun Kota Tegal & Masjid Agung',
      address: 'Jl. Pancasila No. 1, Mangkukusuman, Kota Tegal',
      lat: -6.8672,
      lng: 109.1388,
    },
    {
      name: 'Stasiun Besar Kereta Api Tegal',
      address: 'Jl. Semi No. 1, Slerok, Kec. Tegal Timur, Kota Tegal',
      lat: -6.8647,
      lng: 109.1419,
    },
    {
      name: 'Pacific Mall Tegal',
      address: 'Jl. Mayjend Sutoyo No. 35, Pekauman, Kota Tegal',
      lat: -6.8710,
      lng: 109.1235,
    },
    {
      name: 'Pemandian Air Panas Guci Bumijawa',
      address: 'Jl. Objek Wisata Guci, Kec. Bumijawa / Bojong, Kab. Tegal',
      lat: -7.2140,
      lng: 109.1670,
    },
  ];

  let closest = knownPlaces[0];
  let minDistance = Number.MAX_VALUE;

  for (const place of knownPlaces) {
    const d = Math.hypot(place.lat - lat, place.lng - lng);
    if (d < minDistance) {
      minDistance = d;
      closest = place;
    }
  }

  // If reasonably close to a known landmark in Tegal/Danawarih, reference it
  if (minDistance < 0.015) {
    return {
      name: closest.name,
      address: closest.address,
    };
  }

  // Generative descriptive address for Tegal region
  const latStr = lat.toFixed(4);
  const lngStr = lng.toFixed(4);
  return {
    name: `Titik Peta Tegal (${latStr}, ${lngStr})`,
    address: `Kawasan Kab. & Kota Tegal (Danawarih, Balapulang, Slawi & Sekitarnya) [${latStr}, ${lngStr}]`,
  };
}

// Inner Google Maps Controller to handle camera and clicks
function MapEventHandler({
  interactiveSelect,
  selectionType,
  onSelectLocation,
}: {
  interactiveSelect?: boolean;
  selectionType?: 'PICKUP' | 'DESTINATION';
  onSelectLocation?: (point: LocationPoint) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !interactiveSelect || !onSelectLocation) return;

    const clickListener = map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      // Check if geocoder is available
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const geocoder = new (window as any).google.maps.Geocoder();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const place = results[0];
            const primaryName = place.address_components?.[0]?.long_name || 'Titik Peta';
            onSelectLocation({
              name: `${selectionType === 'DESTINATION' ? 'Tujuan' : 'Jemput'}: ${primaryName}`,
              address: place.formatted_address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
              lat,
              lng,
            });
          } else {
            const fallback = getApproximateTegalAddress(lat, lng);
            onSelectLocation({
              name: `${selectionType === 'DESTINATION' ? 'Tujuan' : 'Jemput'}: ${fallback.name}`,
              address: fallback.address,
              lat,
              lng,
            });
          }
        });
      } else {
        const fallback = getApproximateTegalAddress(lat, lng);
        onSelectLocation({
          name: `${selectionType === 'DESTINATION' ? 'Tujuan' : 'Jemput'}: ${fallback.name}`,
          address: fallback.address,
          lat,
          lng,
        });
      }
    });

    return () => {
      google.maps.event.removeListener(clickListener);
    };
  }, [map, interactiveSelect, selectionType, onSelectLocation]);

  return null;
}

export function InteractiveMap({
  pickupLocation,
  destinationLocation,
  driverLocation,
  nearbyDrivers = [],
  interactiveSelect = false,
  selectionType = 'PICKUP',
  onSelectLocation,
  className = 'h-64 w-full',
  showRoute = true,
}: InteractiveMapProps) {
  const [mapType, setMapType] = useState<'GOOGLE' | 'VECTOR'>('GOOGLE');
  const [vectorZoom, setVectorZoom] = useState(1);
  const [vectorOffset, setVectorOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Compute map center (Default: Corridor Kabupaten Tegal, Danawarih & Balapulang)
  const center = useMemo(() => {
    if (pickupLocation) {
      return { lat: pickupLocation.lat, lng: pickupLocation.lng };
    }
    if (destinationLocation) {
      return { lat: destinationLocation.lat, lng: destinationLocation.lng };
    }
    if (driverLocation) {
      return { lat: driverLocation.lat, lng: driverLocation.lng };
    }
    return { lat: -7.0450, lng: 109.1350 }; // Pusat koridor Danawarih - Balapulang - Slawi
  }, [pickupLocation, destinationLocation, driverLocation]);

  // Vector map coordinate conversion centered around Danawarih/Balapulang/Slawi/Tegal
  const baseLat = -7.04;
  const baseLng = 109.135;
  const scale = 1400;

  const coordToSvg = (lat: number, lng: number) => {
    const x = 300 + (lng - baseLng) * scale * vectorZoom + vectorOffset.x;
    const y = 200 - (lat - baseLat) * scale * vectorZoom + vectorOffset.y;
    return { x, y };
  };

  const svgToCoord = (svgX: number, svgY: number) => {
    const lng = baseLng + (svgX - 300 - vectorOffset.x) / (scale * vectorZoom);
    const lat = baseLat - (svgY - 200 - vectorOffset.y) / (scale * vectorZoom);
    return { lat, lng };
  };

  const pickupSvg = pickupLocation
    ? coordToSvg(pickupLocation.lat, pickupLocation.lng)
    : { x: 290, y: 260 };

  const destSvg = destinationLocation
    ? coordToSvg(destinationLocation.lat, destinationLocation.lng)
    : { x: 310, y: 130 };

  const driverSvg = driverLocation
    ? coordToSvg(driverLocation.lat, driverLocation.lng)
    : null;

  // Handle Pan in Vector mode
  const handleMouseDown = (e: React.MouseEvent) => {
    if (interactiveSelect) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - vectorOffset.x, y: e.clientY - vectorOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setVectorOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Handle direct click in Vector mode to pick point
  const handleVectorMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!interactiveSelect || !onSelectLocation) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 600;
    const clickY = ((e.clientY - rect.top) / rect.height) * 400;

    const coords = svgToCoord(clickX, clickY);
    const fallback = getApproximateTegalAddress(coords.lat, coords.lng);
    onSelectLocation({
      name: `${selectionType === 'DESTINATION' ? 'Tujuan' : 'Jemput'}: ${fallback.name}`,
      address: fallback.address,
      lat: Number(coords.lat.toFixed(5)),
      lng: Number(coords.lng.toFixed(5)),
    });
  };

  // Arterial road paths representing Tegal - Slawi - Lebaksiu - Balapulang - Danawarih axis
  const streets = [
    // Jalan Raya Tegal - Purwokerto (North to South spine)
    'M 305 10 L 305 110 L 310 180 L 290 260 L 275 320 L 285 390',
    // Jalan Raya Yomani - Guci (East towards Mount Slamet / Guci)
    'M 310 180 L 410 240 L 480 320 L 520 380',
    // Jalan Raya Balapulang - Danawarih (Connecting Balapulang to Danawarih & Kali Gung)
    'M 275 320 L 330 335 L 360 360',
    // Slawi West-East bypass (Jatibarang / Pangkah)
    'M 120 115 L 305 110 L 490 120',
    // Adiwerna Tol connector
    'M 160 55 L 305 60 L 450 50',
  ];

  return (
    <div className={`relative overflow-hidden rounded-2xl select-none border border-slate-200/80 dark:border-slate-800 ${className}`}>
      {mapType === 'GOOGLE' ? (
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <div className="w-full h-full relative">
            <Map
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              mapId="DEMO_MAP_ID"
              defaultCenter={center}
              center={center}
              defaultZoom={12}
              zoomControl={true}
              streetViewControl={false}
              mapTypeControl={false}
              fullscreenControl={false}
              className="w-full h-full"
            >
              <MapEventHandler
                interactiveSelect={interactiveSelect}
                selectionType={selectionType}
                onSelectLocation={onSelectLocation}
              />

              {/* Titik Jemput (Pickup) Pin */}
              {pickupLocation && (
                <AdvancedMarker
                  position={{ lat: pickupLocation.lat, lng: pickupLocation.lng }}
                  title={`Titik Jemput: ${pickupLocation.name}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
                      Jemput: {pickupLocation.name.replace(/^(Jemput:\s*)/, '')}
                    </span>
                    <Pin background="#059669" glyphColor="#ffffff" borderColor="#064e3b" scale={1.1} />
                  </div>
                </AdvancedMarker>
              )}

              {/* Titik Tujuan (Destination) Pin */}
              {destinationLocation && (
                <AdvancedMarker
                  position={{ lat: destinationLocation.lat, lng: destinationLocation.lng }}
                  title={`Titik Antar: ${destinationLocation.name}`}
                >
                  <div className="flex flex-col items-center">
                    <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold shadow-md whitespace-nowrap mb-1">
                      Tujuan: {destinationLocation.name.replace(/^(Tujuan:\s*)/, '')}
                    </span>
                    <Pin background="#ef4444" glyphColor="#ffffff" borderColor="#991b1b" scale={1.1} />
                  </div>
                </AdvancedMarker>
              )}

              {/* Active Assigned Driver Pin */}
              {driverLocation && (
                <AdvancedMarker
                  position={{ lat: driverLocation.lat, lng: driverLocation.lng }}
                  title="Posisi Driver DANDELI Tegal"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-8 h-8 rounded-full bg-emerald-500/40 animate-ping"></span>
                    <div className="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white text-white flex items-center justify-center shadow-lg">
                      <Bike className="w-4 h-4" />
                    </div>
                  </div>
                </AdvancedMarker>
              )}

              {/* Nearby Motor Drivers */}
              {nearbyDrivers.map((drv) => (
                <AdvancedMarker
                  key={drv.id}
                  position={{ lat: drv.lat, lng: drv.lng }}
                  title={drv.name || 'Mitra DANDELI Motor Tegal'}
                >
                  <div className="w-6 h-6 rounded-full bg-emerald-700 border border-white text-white flex items-center justify-center shadow-md hover:scale-125 transition-transform">
                    <Bike className="w-3 h-3" />
                  </div>
                </AdvancedMarker>
              ))}
            </Map>
          </div>
        </APIProvider>
      ) : (
        /* Vector Map Fallback View */
        <div
          className="w-full h-full bg-[#e8ece9] dark:bg-[#1a2327] cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg
            className="w-full h-full"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid slice"
            onClick={handleVectorMapClick}
          >
            <defs>
              <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Green zones / Hutan Lindung & Kawasan Danawarih / Guci */}
            <path d="M 220 280 Q 250 260 280 290 Q 290 340 230 350 Z" fill="#d4ebd7" className="dark:fill-[#1b3425] opacity-70" />
            <path d="M 380 280 Q 450 250 490 310 Q 460 370 390 350 Z" fill="#d4ebd7" className="dark:fill-[#1b3425] opacity-60" />
            <path d="M 120 80 Q 180 70 190 120 Q 150 150 100 130 Z" fill="#d4ebd7" className="dark:fill-[#1b3425] opacity-50" />

            {/* Kali Gung River (Melintasi Danawarih, Balapulang, Slawi hingga Laut Jawa di Tegal) */}
            <path d="M 360 410 Q 340 330 320 240 T 330 110 T 315 -20" stroke="#b8d5e5" strokeWidth="12" fill="none" strokeLinecap="round" className="dark:stroke-[#183244]" />

            {/* Secondary Road Network */}
            <g stroke="#ffffff" strokeWidth="4" strokeLinecap="round" opacity="0.9" className="dark:stroke-[#2b353b]">
              <line x1="80" y1="180" x2="480" y2="190" />
              <line x1="100" y1="260" x2="520" y2="270" />
              <line x1="220" y1="20" x2="230" y2="380" />
              <line x1="390" y1="10" x2="410" y2="380" />
            </g>

            {/* Primary Arterial Streets */}
            {streets.map((d, idx) => (
              <path key={idx} d={d} stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" className="dark:stroke-[#37454d]" />
            ))}

            {/* Street central line */}
            {streets.map((d, idx) => (
              <path key={`center-${idx}`} d={d} stroke="#fcd34d" strokeWidth="2" strokeDasharray="8 6" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.8" className="dark:opacity-50" />
            ))}

            {/* Landmarks text */}
            <text x="315" y="30" fill="#64748b" fontSize="10" fontWeight="bold" className="dark:fill-[#94a3b8]">KOTA TEGAL</text>
            <text x="315" y="105" fill="#64748b" fontSize="10" fontWeight="bold" className="dark:fill-[#94a3b8]">SLAWI (Pemkab Tegal)</text>
            <text x="320" y="175" fill="#64748b" fontSize="9" fontWeight="600" className="dark:fill-[#94a3b8]">LEBAKSIU / YOMANI</text>
            <text x="195" y="265" fill="#64748b" fontSize="9" fontWeight="600" className="dark:fill-[#94a3b8]">BALAPULANG</text>
            <text x="340" y="335" fill="#047857" fontSize="10" fontWeight="bold" className="dark:fill-[#10b981]">★ DANAWARIH (Pusat DANDELI)</text>
            <text x="440" y="375" fill="#64748b" fontSize="9" fontWeight="600" className="dark:fill-[#94a3b8]">WISATA GUCI</text>

            {/* Simulated Route Polyline */}
            {showRoute && pickupLocation && destinationLocation && (
              <g>
                <path
                  d={`M ${pickupSvg.x} ${pickupSvg.y} Q ${(pickupSvg.x + destSvg.x) / 2 + 20} ${(pickupSvg.y + destSvg.y) / 2 - 10} ${destSvg.x} ${destSvg.y}`}
                  stroke="#047857"
                  strokeWidth="7"
                  fill="none"
                  strokeLinecap="round"
                  opacity="0.25"
                />
                <path
                  d={`M ${pickupSvg.x} ${pickupSvg.y} Q ${(pickupSvg.x + destSvg.x) / 2 + 20} ${(pickupSvg.y + destSvg.y) / 2 - 10} ${destSvg.x} ${destSvg.y}`}
                  stroke="url(#routeGrad)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Destination Pin */}
            {destinationLocation && (
              <g transform={`translate(${destSvg.x - 14}, ${destSvg.y - 28})`} filter="url(#shadow)">
                <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z" fill="#ef4444" />
                <circle cx="14" cy="14" r="5" fill="#ffffff" />
                <text x="14" y="38" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#dc2626">Tujuan</text>
              </g>
            )}

            {/* Pickup Pin */}
            {pickupLocation && (
              <g transform={`translate(${pickupSvg.x - 14}, ${pickupSvg.y - 28})`} filter="url(#shadow)">
                <circle cx="14" cy="14" r="16" fill="#10b981" opacity="0.3" className="animate-ping" />
                <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26c0-7.732-6.268-14-14-14z" fill="#059669" />
                <circle cx="14" cy="14" r="5" fill="#ffffff" />
                <text x="14" y="38" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#047857">Jemput</text>
              </g>
            )}

            {/* Nearby Drivers Markers */}
            {nearbyDrivers.map((drv) => {
              const pt = coordToSvg(drv.lat, drv.lng);
              return (
                <g key={drv.id} transform={`translate(${pt.x - 10}, ${pt.y - 10})`} filter="url(#shadow)">
                  <circle cx="10" cy="10" r="10" fill="#064e3b" />
                  <circle cx="10" cy="10" r="8" fill="#059669" />
                  <path d="M6 12 L10 6 L14 12 Z" fill="white" />
                </g>
              );
            })}

            {/* Assigned Driver Marker */}
            {driverSvg && (
              <g transform={`translate(${driverSvg.x - 14}, ${driverSvg.y - 14})`} filter="url(#shadow)">
                <circle cx="14" cy="14" r="16" fill="#059669" opacity="0.4" className="animate-pulse" />
                <circle cx="14" cy="14" r="12" fill="#111827" />
                <circle cx="14" cy="14" r="10" fill="#10b981" />
                <polygon points="14,6 20,20 14,17 8,20" fill="white" />
              </g>
            )}
          </svg>
        </div>
      )}

      {/* Floating Instructions Banner when user is selecting point */}
      {interactiveSelect && (
        <div className="absolute top-3 left-3 right-14 z-20 bg-emerald-600 text-white px-3 py-2 rounded-xl shadow-lg flex items-center justify-between text-xs font-semibold backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2 truncate">
            <MapPin className="w-4 h-4 text-emerald-200 shrink-0" />
            <span className="truncate">
              Klik pada peta untuk menentukan {selectionType === 'DESTINATION' ? 'Titik Antar / Tujuan' : 'Titik Penjemputan'}
            </span>
          </div>
        </div>
      )}

      {/* Floating Map Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5 z-20">
        <button
          onClick={() => setMapType((m) => (m === 'GOOGLE' ? 'VECTOR' : 'GOOGLE'))}
          aria-label="Ganti mode peta"
          title={mapType === 'GOOGLE' ? 'Mode Google Maps (Klik untuk beralih ke Mode Vektor)' : 'Mode Vektor (Klik untuk beralih ke Google Maps)'}
          className="w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:scale-95 transition-transform"
        >
          <Layers className="w-4 h-4" />
        </button>

        {mapType === 'VECTOR' && (
          <>
            <button
              onClick={() => setVectorZoom((z) => Math.min(z + 0.25, 2.5))}
              aria-label="Zoom in"
              className="w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVectorZoom((z) => Math.max(z - 0.25, 0.6))}
              aria-label="Zoom out"
              className="w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-95 transition-transform"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setVectorZoom(1);
                setVectorOffset({ x: 0, y: 0 });
              }}
              aria-label="Reset position"
              className="w-9 h-9 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:scale-95 transition-transform"
            >
              <Compass className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Real-time GPS & Sync Badge */}
      <div className="absolute left-3 bottom-3 px-2.5 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 z-10">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>
          {mapType === 'GOOGLE'
            ? 'Google Maps API · Kab. & Kota Tegal (Pusat: Danawarih)'
            : 'GPS DANDELI Live · Balapulang & Tegal Sekitarnya'}
        </span>
      </div>
    </div>
  );
}
