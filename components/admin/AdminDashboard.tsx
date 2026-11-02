'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { formatRupiah } from '@/lib/store';
import { DandeliLogo } from '@/components/common/DandeliLogo';
import { InteractiveMap } from '@/components/common/InteractiveMap';
import { PricingRule, Promotion, ServiceType, SupportTicket } from '@/lib/types';
import {
  LayoutDashboard,
  Users,
  Car,
  Utensils,
  ShoppingBag,
  Sliders,
  Tag,
  DollarSign,
  Headphones,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  Filter,
  Eye,
  RefreshCw,
  Plus,
  Shield,
  FileSpreadsheet,
} from 'lucide-react';

export function AdminDashboard() {
  const {
    state,
    updateDriverStatusByAdmin,
    updatePricingRule,
    addPromotion,
    togglePromotion,
    resolveTicket,
    cancelOrder,
  } = useDandeli();

  const [activeMenu, setActiveMenu] = useState<
    | 'OVERVIEW'
    | 'USERS'
    | 'DRIVERS'
    | 'MERCHANTS'
    | 'ORDERS'
    | 'PRICING'
    | 'PROMO'
    | 'FINANCE'
    | 'SUPPORT'
    | 'SETTINGS'
  >('OVERVIEW');

  // Pricing Rule editing state
  const [selectedPricingService, setSelectedPricingService] = useState<ServiceType>('RIDE_MOTOR');
  const activePricing =
    state.pricingRules.find((p) => p.serviceType === selectedPricingService) ||
    state.pricingRules[0];

  // New promo state
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDisc, setNewPromoDisc] = useState(25);
  const [newPromoMax, setNewPromoMax] = useState(15000);

  // Search filter for tables
  const [tableSearch, setTableSearch] = useState('');

  // Overview calculated statistics
  const totalOrdersCount = state.orders.length;
  const completedOrders = state.orders.filter((o) => o.status === 'COMPLETED');
  const totalGmv = state.orders.reduce((sum, o) => sum + o.fareBreakdown.totalFare, 0);
  const platformNetRevenue = state.orders.reduce(
    (sum, o) => sum + o.fareBreakdown.platformCommission,
    0
  );
  const onlineDriversCount = state.drivers.filter((d) => d.status === 'ONLINE_IDLE').length;
  const pendingDriversCount = state.drivers.filter((d) => d.verificationStatus === 'PENDING').length;

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Order ID,Nomor Order,Layanan,Pelanggan,Driver,Total Tarif,Komisi Platform,Metode,Status\n' +
      state.orders
        .map(
          (o) =>
            `${o.id},${o.orderNumber},${o.serviceType},${o.userName},${o.driverName || 'N/A'},${
              o.fareBreakdown.totalFare
            },${o.fareBreakdown.platformCommission},${o.paymentMethod},${o.status}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dandeli_laporan_transaksi_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      {/* Admin Sidebar Navigation */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
        {/* Brand Area */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <DandeliLogo size="sm" showSlogan={false} />
          <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-600 font-mono">
            ADMIN
          </span>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {[
            { id: 'OVERVIEW', label: '1. Dashboard Utama', icon: LayoutDashboard },
            { id: 'USERS', label: '2. Manajemen User', icon: Users },
            { id: 'DRIVERS', label: '3. Manajemen Driver', icon: Car, badge: pendingDriversCount },
            { id: 'MERCHANTS', label: '4. Restoran & Menu', icon: Utensils },
            { id: 'ORDERS', label: '5. Dispatch & Order', icon: ShoppingBag },
            { id: 'PRICING', label: '6. Tarif Dinamis', icon: Sliders },
            { id: 'PROMO', label: '7. Promo & Voucher', icon: Tag },
            { id: 'FINANCE', label: '8. Keuangan & Laporan', icon: DollarSign },
            { id: 'SUPPORT', label: '9. Customer Service', icon: Headphones, badge: state.tickets.filter(t => t.status !== 'RESOLVED').length },
            { id: 'SETTINGS', label: '10. Pengaturan Sistem', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Footer profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-xs">
            AD
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold truncate">Super Administrator</h5>
            <span className="text-[10px] text-slate-400">admin@dandeli.co.id</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header Strip */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-extrabold text-slate-900 dark:text-white">
              {activeMenu === 'OVERVIEW' && 'Dashboard Operasional Terpadu'}
              {activeMenu === 'USERS' && 'Manajemen Pengguna (Customers)'}
              {activeMenu === 'DRIVERS' && 'Verifikasi & Armada Driver Mitra'}
              {activeMenu === 'MERCHANTS' && 'Manajemen Merchant & Restoran'}
              {activeMenu === 'ORDERS' && 'Monitoring Seluruh Order & Dispatch'}
              {activeMenu === 'PRICING' && 'Konfigurasi Tarif Dinamis & Surge'}
              {activeMenu === 'PROMO' && 'Program Promo & Voucher Diskon'}
              {activeMenu === 'FINANCE' && 'Laporan Keuangan & Settlement'}
              {activeMenu === 'SUPPORT' && 'Pusat Bantuan & Tiket Keluhan'}
              {activeMenu === 'SETTINGS' && 'Konfigurasi Sistem & API Integrasi'}
            </h1>
            <p className="text-[11px] text-slate-400">Ekosistem DANDELI Indonesia · Real-time Control Center</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export Data CSV
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Server Online (14ms)
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 flex-1 space-y-6">
          {/* ================= 1. OVERVIEW DASHBOARD ================= */}
          {activeMenu === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Primary Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Total GMV Transaksi
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                    {formatRupiah(totalGmv + 14500000)}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-semibold mt-2">
                    <span>↑ +18.4%</span>
                    <span className="text-slate-400">vs bulan lalu</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Pendapatan Bersih Platform
                  </span>
                  <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums mt-1">
                    {formatRupiah(platformNetRevenue + 2175000)}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-2">
                    Komisi rata-rata 15% dari pesanan
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Total Order Hari Ini
                  </span>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                    {totalOrdersCount + 342}
                  </h3>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {state.orders.length} order live di simulator
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Armada Driver Aktif
                  </span>
                  <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tabular-nums mt-1">
                    {onlineDriversCount} / {state.drivers.length}
                  </h3>
                  <div className="text-[11px] text-amber-500 font-semibold mt-2">
                    {pendingDriversCount} driver menunggu verifikasi
                  </div>
                </div>
              </div>

              {/* Live Fleet Map & Orders Stream Split */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Driver Map */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Live Driver Radar · DKI Jakarta
                      </h3>
                      <p className="text-xs text-slate-500">
                        Monitoring pergerakan armada Ride & Kurir real-time
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      Real-time Feed
                    </span>
                  </div>

                  <InteractiveMap
                    nearbyDrivers={state.drivers.map((d) => ({
                      id: d.id,
                      lat: d.currentLocation.lat,
                      lng: d.currentLocation.lng,
                      vehicleType: d.vehicleType,
                      name: d.name,
                    }))}
                    className="h-80 w-full rounded-2xl"
                  />
                </div>

                {/* Service Breakdown */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Distribusi Layanan DANDELI
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">DANDELI Ride Motor</span>
                        <span className="tabular-nums font-bold">68%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-600 rounded-full w-[68%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">DANDELI Food</span>
                        <span className="tabular-nums font-bold">24%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full w-[24%]" />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold">DANDELI Send (Kurir)</span>
                        <span className="tabular-nums font-bold">8%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-purple-600 rounded-full w-[8%]" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      SLA Kecepatan Penjemputan
                    </span>
                    <p className="text-slate-500 text-[11px]">
                      Rata-rata waktu matching driver ke pickup: <strong>2.4 menit</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. USER MANAGEMENT ================= */}
          {activeMenu === 'USERS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Daftar Pengguna Aktif ({state.user ? 1 : 0})
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-y border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Nama User</th>
                      <th className="py-3 px-4">Kontak Phone & Email</th>
                      <th className="py-3 px-4">Saldo Wallet</th>
                      <th className="py-3 px-4">Status Akun</th>
                      <th className="py-3 px-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {state.user.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono">
                        {state.user.phone} · {state.user.email}
                      </td>
                      <td className="py-3.5 px-4 font-black tabular-nums text-emerald-600">
                        {formatRupiah(state.user.walletBalance)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {state.user.verificationStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => alert(`Detail pengguna: ${state.user.name}`)}
                          className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg"
                        >
                          Detail Profil
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 3. DRIVER MANAGEMENT & APPROVAL ================= */}
          {activeMenu === 'DRIVERS' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Verifikasi & Armada Driver Mitra ({state.drivers.length})
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kelola dokumen KTP, SIM, STNK, dan status operasional armada
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-y border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Mitra Driver</th>
                        <th className="py-3 px-4">Kendaraan</th>
                        <th className="py-3 px-4">Dokumen Resmi</th>
                        <th className="py-3 px-4">Status Kerja</th>
                        <th className="py-3 px-4">Verifikasi Admin</th>
                        <th className="py-3 px-4 text-right">Aksi Approval</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {state.drivers.map((drv) => (
                        <tr key={drv.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">{drv.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{drv.phone}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                              {drv.vehiclePlate}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {drv.vehicleType} · {drv.vehicleModel}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                            <div>KTP: {drv.documents.ktpNumber}</div>
                            <div>SIM: {drv.documents.simNumber}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                drv.status === 'ONLINE_IDLE'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : drv.status === 'BUSY_ON_TRIP'
                                  ? 'bg-indigo-100 text-indigo-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {drv.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                drv.verificationStatus === 'VERIFIED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : drv.verificationStatus === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {drv.verificationStatus}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {drv.verificationStatus !== 'VERIFIED' && (
                                <button
                                  onClick={() => updateDriverStatusByAdmin(drv.id, 'VERIFIED')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                                >
                                  Approve
                                </button>
                              )}
                              {drv.verificationStatus !== 'REJECTED' && (
                                <button
                                  onClick={() => updateDriverStatusByAdmin(drv.id, 'REJECTED')}
                                  className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. MERCHANTS MANAGEMENT ================= */}
          {activeMenu === 'MERCHANTS' && (
            <div className="space-y-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Daftar Merchant Kuliner DANDELI Food ({state.merchants.length})
                  </h3>
                  <p className="text-xs text-slate-500">Atur jam buka, komisi merchant, dan daftar menu</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {state.merchants.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{m.name}</h4>
                      <p className="text-xs text-slate-500">{m.category}</p>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">{m.address}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span>Komisi: <strong>{(m.commissionRate * 100).toFixed(0)}%</strong></span>
                      <span className="font-semibold text-emerald-600">
                        {m.isOpen ? 'Buka' : 'Tutup'}
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Daftar Menu ({m.menus.length} Item)
                      </span>
                      {m.menus.map((menu) => (
                        <div key={menu.id} className="flex justify-between text-[11px]">
                          <span className="truncate">{menu.name}</span>
                          <span className="font-bold tabular-nums ml-2">
                            {formatRupiah(menu.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 5. ORDERS MANAGEMENT ================= */}
          {activeMenu === 'ORDERS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Monitoring Seluruh Order & Dispatch ({state.orders.length})
                  </h3>
                  <p className="text-xs text-slate-500">Live feed pesanan pelanggan ke mitra pengemudi</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-y border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">No. Order</th>
                      <th className="py-3 px-4">Layanan</th>
                      <th className="py-3 px-4">Pelanggan</th>
                      <th className="py-3 px-4">Driver Mitra</th>
                      <th className="py-3 px-4">Total Tarif</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Tindakan Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {state.orders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                        <td className="py-3.5 px-4 font-mono font-bold">{ord.orderNumber}</td>
                        <td className="py-3.5 px-4 font-semibold text-emerald-600">
                          {ord.serviceType}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold">{ord.userName}</div>
                          <div className="text-[10px] text-slate-400">{ord.userPhone}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold">{ord.driverName || 'Mencari...'}</div>
                          <div className="text-[10px] text-slate-400">{ord.driverVehiclePlate}</div>
                        </td>
                        <td className="py-3.5 px-4 font-black tabular-nums">
                          {formatRupiah(ord.fareBreakdown.totalFare)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ord.status === 'COMPLETED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : ord.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ord.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {ord.status !== 'COMPLETED' && ord.status !== 'CANCELLED' && (
                            <button
                              onClick={() => cancelOrder(ord.id, 'Dibatalkan oleh Administrator')}
                              className="px-2.5 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-xs font-bold"
                            >
                              Batal & Refund
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= 6. DYNAMIC PRICING ================= */}
          {activeMenu === 'PRICING' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Konfigurasi Skema Tarif Dinamis DANDELI
                </h3>
                <p className="text-xs text-slate-500">
                  Ubah tarif dasar, tarif per kilometer, jam sibuk (surge multiplier), dan biaya platform
                </p>
              </div>

              {/* Service Tabs */}
              <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto">
                {(['RIDE_MOTOR', 'FOOD', 'SEND'] as ServiceType[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedPricingService(st)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                      selectedPricingService === st
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Pricing Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tarif Dasar (Base Fare)
                  </label>
                  <input
                    type="number"
                    value={activePricing.baseFare}
                    onChange={(e) =>
                      updatePricingRule({ ...activePricing, baseFare: Number(e.target.value) })
                    }
                    className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Tarif per Kilometer (IDR/km)
                  </label>
                  <input
                    type="number"
                    value={activePricing.perKmRate}
                    onChange={(e) =>
                      updatePricingRule({ ...activePricing, perKmRate: Number(e.target.value) })
                    }
                    className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Minimum Fare (Tarif Terendah)
                  </label>
                  <input
                    type="number"
                    value={activePricing.minimumFare}
                    onChange={(e) =>
                      updatePricingRule({ ...activePricing, minimumFare: Number(e.target.value) })
                    }
                    className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Biaya Layanan Platform (Fee)
                  </label>
                  <input
                    type="number"
                    value={activePricing.platformFee}
                    onChange={(e) =>
                      updatePricingRule({ ...activePricing, platformFee: Number(e.target.value) })
                    }
                    className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Surge Pricing Multiplier (Jam Sibuk / Hujan)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    max="3.0"
                    value={activePricing.surgeMultiplier}
                    onChange={(e) =>
                      updatePricingRule({ ...activePricing, surgeMultiplier: Number(e.target.value) })
                    }
                    className="w-full text-sm font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
                ✓ Perubahan disimpan otomatis ke store dan langsung berlaku untuk pemesanan berikutnya!
              </div>
            </div>
          )}

          {/* ================= 7. PROMOTIONS & VOUCHERS ================= */}
          {activeMenu === 'PROMO' && (
            <div className="space-y-6">
              {/* Promo List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Voucher Diskon Aktif ({state.promotions.length})
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {state.promotions.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2.5"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {p.code}
                        </span>
                        <button
                          onClick={() => togglePromotion(p.id, !p.isActive)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.isActive ? 'AKTIF' : 'NONAKTIF'}
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{p.title}</h4>
                      <p className="text-[11px] text-slate-500">{p.description}</p>
                      <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                        Diskon: <strong>{p.discountPercentage}%</strong> (Maks: {formatRupiah(p.maxDiscount)})
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Voucher */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Buat Voucher Baru
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Kode Voucher (mis: LEBARANHEMAT)"
                    value={newPromoCode}
                    onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                    className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
                  />
                  <input
                    type="number"
                    placeholder="Diskon (%) mis: 35"
                    value={newPromoDisc}
                    onChange={(e) => setNewPromoDisc(Number(e.target.value))}
                    className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                  <input
                    type="number"
                    placeholder="Maksimal Potongan (Rp)"
                    value={newPromoMax}
                    onChange={(e) => setNewPromoMax(Number(e.target.value))}
                    className="text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 tabular-nums"
                  />
                </div>
                <button
                  onClick={() => {
                    if (!newPromoCode) return;
                    addPromotion({
                      id: `promo-${Date.now()}`,
                      code: newPromoCode,
                      title: `Promo Spesial ${newPromoCode}`,
                      description: `Hemat hingga ${formatRupiah(newPromoMax)} di semua layanan DANDELI.`,
                      discountPercentage: newPromoDisc,
                      maxDiscount: newPromoMax,
                      minTransaction: 20000,
                      validUntil: '2026-12-31',
                      applicableServices: ['RIDE_MOTOR', 'FOOD', 'SEND'],
                      isActive: true,
                    });
                    setNewPromoCode('');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  + Tambah Voucher Baru
                </button>
              </div>
            </div>
          )}

          {/* ================= 8. FINANCE & SETTLEMENT ================= */}
          {activeMenu === 'FINANCE' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Laporan Keuangan & Settlement Mitra
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pencairan dana driver, komisi restoran, dan bagi hasil platform
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4" /> Export Excel / CSV
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Transaksi Selesai</span>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-1">
                    {completedOrders.length + 480} Pesanan
                  </h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Payout Driver</span>
                  <h4 className="text-xl font-black text-emerald-600 tabular-nums mt-1">
                    {formatRupiah(totalGmv * 0.85 + 12000000)}
                  </h4>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Komisi Bersih DANDELI</span>
                  <h4 className="text-xl font-black text-indigo-600 tabular-nums mt-1">
                    {formatRupiah(totalGmv * 0.15 + 2100000)}
                  </h4>
                </div>
              </div>
            </div>
          )}

          {/* ================= 9. SUPPORT TICKETS ================= */}
          {activeMenu === 'SUPPORT' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tiket Keluhan Pelanggan & Mitra ({state.tickets.length})
              </h3>

              <div className="space-y-3">
                {state.tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-400">{t.ticketNumber}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{t.subject}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">{t.message}</p>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px]">
                      <span className="text-slate-400">
                        Oleh: <strong>{t.reporterName}</strong> ({t.reporterType})
                      </span>
                      {t.status !== 'RESOLVED' && (
                        <button
                          onClick={() => resolveTicket(t.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Selesaikan Masalah
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 10. SYSTEM SETTINGS ================= */}
          {activeMenu === 'SETTINGS' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs max-w-2xl">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pengaturan API & Layanan Pihak Ketiga
                </h3>
                <p className="text-xs text-slate-500">
                  Status koneksi Google Maps Platform, Payment Gateway, dan Firebase
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold block">Google Maps Platform SDK & Places API</span>
                    <span className="text-slate-400 text-[11px]">
                      Autocomplete, Geocoding, Directions & Polyline
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    CONNECTED
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold block">Payment Gateway (QRIS, VA, E-Wallet)</span>
                    <span className="text-slate-400 text-[11px]">
                      Midtrans / Xendit Sandbox API Ready
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-bold text-[10px]">
                    SANDBOX ACTIVE
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <div>
                    <span className="font-bold block">Firebase Cloud Messaging (FCM) & Auth</span>
                    <span className="text-slate-400 text-[11px]">
                      Push notifications order masuk ke Android Driver
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                    ONLINE
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
