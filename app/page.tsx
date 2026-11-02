'use client';

import React, { useState, useEffect } from 'react';
import { DandeliProvider } from '@/lib/DandeliContext';
import { AppSwitcher, AppMode } from '@/components/common/AppSwitcher';
import { EcosystemSimulator } from '@/components/common/EcosystemSimulator';
import { UserApp } from '@/components/user/UserApp';
import { DriverApp } from '@/components/driver/DriverApp';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { ArchitectureDocs } from '@/components/docs/ArchitectureDocs';
import { AlertTriangle } from 'lucide-react';

export default function HomePage() {
  const [mode, setMode] = useState<AppMode>('SIMULATOR');
  const [phoneFrame, setPhoneFrame] = useState(true);
  const [showQuotaWarning, setShowQuotaWarning] = useState(false);

  useEffect(() => {
    const handler = () => setShowQuotaWarning(true);
    window.addEventListener('gmp-quota-exceeded', handler);
    return () => window.removeEventListener('gmp-quota-exceeded', handler);
  }, []);

  return (
    <DandeliProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors">
        {/* Google Maps Quota Warning Banner if prototype quota is reached */}
        {showQuotaWarning && (
          <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs text-center font-bold sticky top-0 z-50 flex items-center justify-center gap-2 shadow-md">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950" />
            <span>
              Batas kuota harian kunci prototipe Google Maps Platform tercapai. Peta beralih ke mode vektor DANDELI. Kunci produksi dapat diatur di Google Cloud Console.
            </span>
          </div>
        )}

        {/* Universal Top Switcher */}
        <AppSwitcher
          currentMode={mode}
          onSelectMode={setMode}
          phoneFrame={phoneFrame}
          onTogglePhoneFrame={() => setPhoneFrame(!phoneFrame)}
        />

        {/* Content based on Active Mode */}
        <div className="flex-1 flex flex-col">
          {mode === 'SIMULATOR' && <EcosystemSimulator />}

          {mode === 'USER' && (
            <div className="flex-1 py-4 sm:py-6 flex items-center justify-center">
              {phoneFrame ? (
                /* Android Phone Frame Mockup */
                <div className="w-full max-w-[420px] rounded-[48px] p-3 bg-slate-900 shadow-2xl border-4 border-slate-700 ring-1 ring-black/40">
                  <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
                    <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="rounded-[36px] overflow-hidden bg-white dark:bg-slate-950 h-[720px] overflow-y-auto border border-slate-800 shadow-inner">
                    <UserApp />
                  </div>
                  <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2.5"></div>
                </div>
              ) : (
                <div className="w-full max-w-xl mx-auto">
                  <UserApp />
                </div>
              )}
            </div>
          )}

          {mode === 'DRIVER' && (
            <div className="flex-1 py-4 sm:py-6 flex items-center justify-center">
              {phoneFrame ? (
                /* Android Phone Frame Mockup */
                <div className="w-full max-w-[420px] rounded-[48px] p-3 bg-slate-900 shadow-2xl border-4 border-emerald-900/70 ring-1 ring-black/40">
                  <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-slate-900 mr-2"></div>
                    <div className="w-10 h-1 bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="rounded-[36px] overflow-hidden bg-slate-950 h-[720px] overflow-y-auto border border-slate-800 shadow-inner">
                    <DriverApp />
                  </div>
                  <div className="w-32 h-1 bg-slate-600 rounded-full mx-auto mt-2.5"></div>
                </div>
              ) : (
                <div className="w-full max-w-xl mx-auto">
                  <DriverApp />
                </div>
              )}
            </div>
          )}

          {mode === 'ADMIN' && <AdminDashboard />}

          {mode === 'DOCS' && <ArchitectureDocs />}
        </div>
      </div>
    </DandeliProvider>
  );
}
