import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/AppContext';

export const metadata: Metadata = {
  title: 'Global Election Network | Pakistan 2024',
  description: 'Real-time election monitoring platform — live results, candidate profiles, and observer management.',
  keywords: ['election', 'pakistan', 'results', 'live', 'monitoring', 'observer'],
  openGraph: {
    title: 'Global Election Network | Pakistan 2024',
    description: 'National election observation and live results platform.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-navy-900 text-slate-100 min-h-screen">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
