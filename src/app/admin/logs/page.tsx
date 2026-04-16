'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { timeAgo, updateTypeColor, updateTypeIcon } from '@/lib/utils';

export default function AdminLogsPage() {
  const { liveUpdates } = useApp();

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">🔐 Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-0.5">Live activity feed · {liveUpdates.length} entries</p>
      </div>
      <div className="card divide-y divide-slate-100">
        {liveUpdates.map(u => {
          const borderColor =
            u.type === 'result'    ? 'border-brand-400' :
            u.type === 'alert'     ? 'border-red-400' :
            u.type === 'milestone' ? 'border-amber-400' :
            'border-slate-300';
          return (
            <div key={u.id} className={`px-4 py-3.5 flex items-start gap-3 border-l-4 ${borderColor}`}>
              <span className="text-lg shrink-0 mt-0.5">{updateTypeIcon(u.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-800 font-medium">{u.message}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-xs text-slate-400">{timeAgo(u.timestamp)}</span>
                  {u.constituencyCode && (
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{u.constituencyCode}</span>
                  )}
                  <span className="badge badge-slate capitalize">{u.type}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
