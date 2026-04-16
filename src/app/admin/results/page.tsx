'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { Check, AlertCircle, Trash2, ShieldCheck, Flag } from 'lucide-react';

interface Result {
  id: string; candidate_name: string; polling_station_name: string;
  votes: number; submitted_at: string; submitted_by: string;
  verified: boolean; flagged: boolean;
  party_color?: string; party_short?: string;
}

export default function AdminResultsPage() {
  const { activeElection } = useApp();
  const electionId = activeElection?.id ?? 'el-gb-2024';

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<'all'|'pending'|'verified'|'flagged'>('all');
  const [toast, setToast]     = useState<{msg:string;ok:boolean}|null>(null);
  const [acting, setActing]   = useState<string|null>(null);

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/results?electionId=${electionId}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } finally { setLoading(false); }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  const filtered = results.filter(r => {
    if (filter === 'pending')  return !r.verified && !r.flagged;
    if (filter === 'verified') return r.verified;
    if (filter === 'flagged')  return r.flagged;
    return true;
  });

  const act = async (id: string, payload: object) => {
    setActing(id);
    await fetch(`/api/results/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    await load();
    setActing(null);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this result entry?')) return;
    setActing(id);
    await fetch(`/api/results/${id}`, { method: 'DELETE' });
    showToast('Result entry removed');
    await load();
    setActing(null);
  };

  const fmt = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff/60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h/24)}d ago`;
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.ok ? <Check size={15}/> : <AlertCircle size={15}/>} {toast.msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="page-title">📋 Result Submissions</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {results.length} entries ·{' '}
              <span className="text-green-600 font-semibold">{results.filter(r=>r.verified).length} verified</span> ·{' '}
              <span className="text-amber-600 font-semibold">{results.filter(r=>r.flagged).length} flagged</span>
            </p>
          </div>
          <div className="flex gap-1">
            {(['all','pending','verified','flagged'] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                  filter === f ? 'bg-sky-50 text-sky-700 border-sky-200' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Candidate</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Station</th>
                  <th className="text-right px-4 py-3">Votes</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Submitted</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400">No results found</td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${r.flagged ? 'bg-amber-50/40' : ''} ${acting === r.id ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {r.party_color && <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: r.party_color }}/>}
                        <div>
                          <div className="font-semibold text-slate-900">{r.candidate_name}</div>
                          {r.party_short && <div className="text-xs font-semibold" style={{ color: r.party_color }}>{r.party_short}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{r.polling_station_name}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{r.votes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden sm:table-cell">{fmt(r.submitted_at)}</td>
                    <td className="px-4 py-3 text-center">
                      {r.flagged
                        ? <span className="badge bg-amber-100 text-amber-700">⚠ Flagged</span>
                        : r.verified
                          ? <span className="badge bg-green-100 text-green-700">✓ Verified</span>
                          : <span className="badge bg-slate-100 text-slate-500">Pending</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        {!r.verified && (
                          <button onClick={() => act(r.id, { verified: true, flagged: false })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all" title="Verify">
                            <ShieldCheck size={14}/>
                          </button>
                        )}
                        {!r.flagged && (
                          <button onClick={() => act(r.id, { flagged: true, verified: false })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" title="Flag">
                            <Flag size={14}/>
                          </button>
                        )}
                        {r.flagged && (
                          <button onClick={() => act(r.id, { flagged: false })}
                            className="text-xs font-semibold text-sky-600 hover:bg-sky-50 px-2 py-1 rounded-lg transition-colors" title="Clear flag">
                            Clear
                          </button>
                        )}
                        <button onClick={() => handleDelete(r.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all" title="Delete">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
}
