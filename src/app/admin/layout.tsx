'use client';

import React from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useApp();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'linear-gradient(150deg, #052e16 0%, #064e3b 60%, #0a6640 100%)' }}>
        <div className="text-center bg-white rounded-3xl shadow-hover p-10 max-w-sm w-full">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Access Restricted</h1>
          <p className="text-slate-500 text-sm mb-6">You must be logged in as an administrator to access this panel.</p>
          <Link href="/login" className="btn-primary w-full justify-center">Go to Login →</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto min-w-0">{children}</main>
    </div>
  );
}
