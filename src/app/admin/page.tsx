'use client';

import React from 'react';
import PartyBarChart from '@/components/charts/PartyBarChart';
import TurnoutAreaChart from '@/components/charts/TurnoutAreaChart';
import { useApp } from '@/context/AppContext';
import { RESULT_ENTRIES, OBSERVERS, PARTIES, ELECTION_META } from '@/lib/mockData';
import { formatNumber, timeAgo } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { candidates, totalVotesCast, seatsDeclared, nationalTurnout, liveUpdates } = useApp();

  const flagged = RESULT_ENTRIES.filter(r => r.flagged).length;
  const verified = RESULT_ENTRIES.filter(r => r.verified).length;
  const activeObservers = OBSERVERS.filter(o => o.status === 'active').length;

  const statItems = [
    { label: 'Total Votes', value: formatNumber(totalVotesCast), icon: '🗳️', color: 'brand' },
    { label: `Seats (${ELECTION_META.totalSeats})`, value: String(seatsDeclared), icon: '🏆', color: 'sky' },
    { label: 'Turnout', value: `${nationalTurnout.toFixed(1)}%`, icon: '📊', color: 'amber' },
    { label: 'Active Obs.', value: String(activeObservers), icon: '👁️', color: 'brand' },
    { label: 'Verified', value: String(verified), icon: '✅', color: 'brand' },
    { label: 'Flagged', value: String(flagged), icon: '⚠️', color: 'red' },
  ];
  const colorMap: Record<string,string> = {
    brand: 'bg-brand-50 border-brand-200 text-brand-800',
    sky:   'bg-sky-50 border-sky-200 text-sky-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    red:   'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">Real-time overview · <span className="text-brand-600 font-semibold">System Online</span></p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {statItems.map(s => (
          <div key={s.label} className={`card border p-3 text-center ${colorMap[s.color]}`}>
            <div className="text-lg mb-0.5">{s.icon}</div>
            <div className="text-xl font-black num">{s.value}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 card p-4">
          <h3 className="section-title text-base mb-3">📈 Turnout Progression</h3>
          <TurnoutAreaChart height={200} />
        </div>
        <div className="card p-4">
          <h3 className="section-title text-base mb-3">🏛 Seats by Party</h3>
          <PartyBarChart height={200} />
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
            <h3 className="section-title text-base">Recent Submissions</h3>
            <a href="/admin/results" className="text-xs font-semibold text-brand-600 hover:text-brand-700">View all →</a>
          </div>
          <div className="divide-y divide-slate-100">
            {RESULT_ENTRIES.slice(0, 5).map(r => (
              <div key={r.id} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{r.candidateName}</div>
                  <div className="text-xs text-slate-400">{r.pollingStationName} · {timeAgo(r.submittedAt)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm num">{r.votes.toLocaleString()}</span>
                  {r.flagged ? <span className="badge badge-amber">⚠ Flag</span>
                    : r.verified ? <span className="badge badge-emerald">✓ OK</span>
                    : <span className="badge badge-slate">Pending</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
            <h3 className="section-title text-base">Live Activity</h3>
            <span className="live-dot" />
          </div>
          <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
            {liveUpdates.slice(0, 10).map(u => (
              <div key={u.id} className="text-xs border-l-2 border-brand-300 pl-2.5 py-0.5">
                <span className="text-slate-700">{u.message}</span>
                <span className="block text-slate-400 mt-0.5">{timeAgo(u.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System status */}
      <div className="mt-4 card p-4">
        <h3 className="section-title text-base mb-3">🖥 System Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{l:'Data API',s:'online',t:'12ms'},{l:'WebSocket',s:'online',t:'4ms'},{l:'Observer Net',s:'online',t:'89ms'},{l:'AI Fraud Det.',s:'active',t:'AI'}].map(item => (
            <div key={item.l} className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className={`w-2 h-2 rounded-full live-pulse ${item.s === 'active' ? 'bg-amber-400' : 'bg-brand-500'}`} />
              <div>
                <div className="text-xs font-bold text-slate-900">{item.l}</div>
                <div className="text-[10px] text-slate-400">{item.t}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
