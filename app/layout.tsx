import type {Metadata} from 'next';
import './globals.css';

import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'DANDELI - Ekosistem Transportasi & Layanan Digital',
  description: 'Ekosistem transportasi online, pesan makanan khas lokal, dan kurir digital khusus Kabupaten & Kota Tegal, berpusat di Desa Danawarih, Balapulang.',
  openGraph: {
    title: 'DANDELI - Ekosistem Transportasi & Layanan Digital',
    description: 'Ekosistem transportasi online, pesan makanan khas lokal, dan kurir digital khusus Kabupaten & Kota Tegal, berpusat di Desa Danawarih, Balapulang.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DANDELI - Ekosistem Transportasi & Layanan Digital',
    description: 'Ekosistem transportasi online, pesan makanan khas lokal, dan kurir digital khusus Kabupaten & Kota Tegal, berpusat di Desa Danawarih, Balapulang.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`h-full antialiased ${plusJakartaSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="h-full bg-slate-50 text-slate-900 font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


