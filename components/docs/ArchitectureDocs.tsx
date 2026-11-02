'use client';

import React, { useState } from 'react';
import { Database, Server, Smartphone, Layers, ShieldCheck, Code2, Terminal, ExternalLink, Play } from 'lucide-react';

export function ArchitectureDocs() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'orders_get' | 'orders_post' | 'stats_get'>('orders_post');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  const testApi = async (endpoint: string, method: string, body?: any) => {
    setIsLoadingApi(true);
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      setApiResponse(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setApiResponse(JSON.stringify({ error: e.message }, null, 2));
    } finally {
      setIsLoadingApi(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-16 font-sans">
      {/* Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <span className="text-xs font-mono font-bold text-emerald-600 uppercase tracking-widest">
          DOKUMENTASI TEKNIS & ARSITEKTUR
        </span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          Arsitektur Ekosistem Terpadu DANDELI
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Spesifikasi sistem backend, skema database relasional (ERD), diagram komponen, dan dokumentasi REST API.
        </p>
      </div>

      {/* 1. High Level Component Architecture */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. High-Level System Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
              <Smartphone className="w-4 h-4" />
              <span>Client Apps Layer</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>DANDELI User App:</strong> Mobile UI (PWA/Android), Maps, Wallet, Order Ride/Food/Send.</li>
              <li>• <strong>DANDELI Driver App:</strong> Order Radar, GPS Navigasi, Step machine, Earning Withdraw.</li>
              <li>• <strong>DANDELI Admin Dashboard:</strong> Enterprise control, Pricing, Users, Drivers, CS.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
              <Server className="w-4 h-4" />
              <span>Backend Core & Realtime Engine</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>Node.js / Next.js API Routes:</strong> RESTful endpoints, JWT Auth, RBAC.</li>
              <li>• <strong>Matching Algorithm:</strong> Haversine radius search, vehicle filter, timeout fallback.</li>
              <li>• <strong>Real-time Sync Bus:</strong> WebSocket / Broadcast channel event bus.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-purple-900 dark:text-purple-300">
              <Database className="w-4 h-4" />
              <span>Database & Cloud Infrastructure</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-400">
              <li>• <strong>PostgreSQL + PostGIS:</strong> Spatial geo queries, indexed tables, UUID keys.</li>
              <li>• <strong>Redis:</strong> Driver location caching, active order locks, rate limiting.</li>
              <li>• <strong>Google Maps SDK:</strong> Places Autocomplete, Geocoding, Directions API.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Database Schema & ERD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Database Schema & Entity-Relationship Diagram (ERD)
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Struktur tabel relasional terstandarisasi dengan Foreign Key, Index Geospasial, dan Audit Log:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-mono space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block border-b pb-1">
              table: users
            </span>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
              <div>id (UUID PK)</div>
              <div>name (VARCHAR)</div>
              <div>phone (VARCHAR UNIQUE)</div>
              <div>email (VARCHAR)</div>
              <div>wallet_balance (BIGINT)</div>
              <div>created_at (TIMESTAMP)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-mono space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block border-b pb-1">
              table: drivers
            </span>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
              <div>id (UUID PK)</div>
              <div>name (VARCHAR)</div>
              <div>vehicle_type (ENUM)</div>
              <div>vehicle_plate (VARCHAR)</div>
              <div>status (ENUM)</div>
              <div>lat, lng (GEOGRAPHY)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-mono space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block border-b pb-1">
              table: orders
            </span>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
              <div>id (UUID PK)</div>
              <div>order_number (VARCHAR)</div>
              <div>user_id (FK users)</div>
              <div>driver_id (FK drivers)</div>
              <div>service_type (ENUM)</div>
              <div>total_fare (BIGINT)</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 font-mono space-y-1.5">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 block border-b pb-1">
              table: wallets & tx
            </span>
            <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-0.5">
              <div>id (UUID PK)</div>
              <div>user_or_driver_id (UUID)</div>
              <div>amount (BIGINT)</div>
              <div>type (ENUM)</div>
              <div>status (ENUM)</div>
              <div>created_at (TIMESTAMP)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Interactive API Playground */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Interactive Live REST API Explorer
          </h2>
        </div>
        <p className="text-xs text-slate-500">
          Uji langsung respon API backend DANDELI secara real-time:
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setSelectedEndpoint('orders_get');
              testApi('/api/orders', 'GET');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              selectedEndpoint === 'orders_get'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            GET /api/orders
          </button>

          <button
            onClick={() => {
              setSelectedEndpoint('orders_post');
              testApi('/api/orders', 'POST', {
                serviceType: 'RIDE_MOTOR',
                pickupLocation: { name: 'Grand Indonesia', lat: -6.1951, lng: 106.8209 },
                destinationLocation: { name: 'SCBD Sudirman', lat: -6.2243, lng: 106.8098 },
                paymentMethod: 'DANDELI_WALLET',
              });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              selectedEndpoint === 'orders_post'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            POST /api/orders (Create Order)
          </button>

          <button
            onClick={() => {
              setSelectedEndpoint('stats_get');
              testApi('/api/stats', 'GET');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
              selectedEndpoint === 'stats_get'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            GET /api/stats (Admin Stats)
          </button>
        </div>

        {/* Output Screen */}
        <div className="p-4 rounded-2xl bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto min-h-36 max-h-64 border border-slate-800">
          {isLoadingApi ? (
            <div className="text-slate-500 animate-pulse">Menghubungi endpoint DANDELI...</div>
          ) : apiResponse ? (
            <pre>{apiResponse}</pre>
          ) : (
            <div className="text-slate-500">Klik salah satu tombol endpoint di atas untuk menguji API.</div>
          )}
        </div>
      </div>
    </div>
  );
}
