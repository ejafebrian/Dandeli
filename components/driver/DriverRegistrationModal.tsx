'use client';

import React, { useState } from 'react';
import { useDandeli } from '@/lib/DandeliContext';
import { DriverProfile } from '@/lib/types';
import { Bike, Car, FileText, Check, X, Shield, UploadCloud } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DriverRegistrationModal({
  isOpen,
  onClose,
}: DriverRegistrationModalProps) {
  const { registerDriver } = useDandeli();
  const [name, setName] = useState('Rudi Hartono');
  const [phone, setPhone] = useState('0813-5566-7788');
  const [vehicleType] = useState<'MOTOR'>('MOTOR');
  const [vehiclePlate, setVehiclePlate] = useState('B 5590 ABC');
  const [vehicleModel, setVehicleModel] = useState('Honda PCX 160');
  const [ktpNumber, setKtpNumber] = useState('3171098234780001');
  const [simNumber, setSimNumber] = useState('981273645012');
  const [stnkNumber, setStnkNumber] = useState('STNK-8821-B5590ABC');
  const [bankName, setBankName] = useState('Bank Central Asia (BCA)');
  const [accountNumber, setAccountNumber] = useState('5420192837');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerDriver({
      name,
      phone,
      vehicleType: 'MOTOR',
      vehiclePlate,
      vehicleModel,
      documents: {
        ktpNumber,
        simNumber,
        stnkNumber,
        ktpUploaded: true,
        simUploaded: true,
        stnkUploaded: true,
      },
      bankAccount: {
        bankName,
        accountNumber,
        accountHolder: name,
      },
    });

    setSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pendaftaran Mitra Pengemudi DANDELI Motor
            </h3>
            <p className="text-xs text-slate-500">Bergabung sebagai mitra rider dan raih pendapatan fleksibel</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Pendaftaran Berhasil Dikirim!
            </h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Dokumen KTP, SIM, dan STNK Anda telah masuk ke antrean verifikasi Admin DANDELI. Akun dapat langsung diuji di simulator!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {/* Vehicle Type Choice */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Armada Mitra
              </label>
              <div className="p-3 rounded-xl border border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                <Bike className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="text-xs font-bold block">DANDELI Motor (Sepeda Motor)</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                    Layanan Ride, Food Delivery, dan Send Kurir Kilat
                  </span>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nama Lengkap Sesuai KTP
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nomor HP Aktif (WhatsApp)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Plat Nomor Polisi
                </label>
                <input
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Tipe / Model Kendaraan
                </label>
                <input
                  type="text"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Documents Upload Simulation */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Unggah Dokumen Resmi (Simulasi Otomatis Siap)
              </label>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <UploadCloud className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block text-slate-800 dark:text-slate-200">
                    Foto KTP
                  </span>
                  <span className="text-[9px] text-emerald-600">✓ Siap Unggah</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <UploadCloud className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block text-slate-800 dark:text-slate-200">
                    Foto SIM C/A
                  </span>
                  <span className="text-[9px] text-emerald-600">✓ Siap Unggah</span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <UploadCloud className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] font-bold block text-slate-800 dark:text-slate-200">
                    Foto STNK
                  </span>
                  <span className="text-[9px] text-emerald-600">✓ Siap Unggah</span>
                </div>
              </div>
            </div>

            {/* Bank Payout Info */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nama Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Bank Central Asia (BCA)">BCA</option>
                  <option value="Bank Mandiri">Mandiri</option>
                  <option value="Bank Rakyat Indonesia (BRI)">BRI</option>
                  <option value="Bank BNI">BNI</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Kirim Pendaftaran Mitra
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
