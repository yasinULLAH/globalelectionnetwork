'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import PartyBarChart from '@/components/charts/PartyBarChart';
import VotePieChart from '@/components/charts/VotePieChart';
import TurnoutAreaChart from '@/components/charts/TurnoutAreaChart';
import { useApp } from '@/context/AppContext';
import { CONSTITUENCIES, PARTIES, RESULT_ENTRIES, ELECTION_META } from '@/lib/mockData';
import { getPartyById, formatNumber, timeAgo, statusColor } from '@/lib/utils';

export default function ResultsPage() {
  const { candidates, totalVotesCast, seatsDeclared, nationalTurnout } = useApp();
  const [filterConstituency, setFilterConstituency] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'constituency' | 'submissions'>('overview');

  const filtered = filterConstituency === 'all'
    ? CONSTITUENCIES
    : CONSTITUENCIES.filter(c => c.id === filterConstituency);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Page hero */}
      <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 60%, #065f46 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <span className="flex items-center gap-1.5 text-[11px] font-black text-white bg-red-500/20 border border-red-400/40 px-3 py-1.5 rounded-full">
                  <span className="live-dot" style={{ width: 6, height: 6 }} /> LIVE
                </span>
                <span className="text-white/40 text-xs">{ELECTION_META.date}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Live Results</h1>
              <p className="text-white/55 text-sm">
                {seatsDeclared}/{ELECTION_META.totalSeats} seats declared · <span className="text-green-300 font-semibold">{nationalTurnout.toFixed(1)}% turnout</span>
              </p>
            </div>
            <div className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-center">
              <div className="text-2xl font-black text-white num">{formatNumber(totalVotesCast)}</div>
              <div className="text-white/50 text-[11px] font-semibold uppercase tracking-wide mt-0.5">Total Votes</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-200">
          {(['overview', 'constituency', 'submissions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-bold capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-brand-700 border-brand-600'
                  : 'text-slate-400 border-transparent hover:text-slate-700'
              }`}>
              {tab === 'overview' ? '📊 Overview' : tab === 'constituency' ? '🗺️ By Constituency' : '📋 Submissions'}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h2 className="section-title text-base">Party-wise Results</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="text-left px-5 py-3">Party</th>
                      <th className="text-right px-5 py-3">Seats</th>
                      <th className="text-right px-5 py-3 hidden sm:table-cell">Votes</th>
                      <th className="text-right px-5 py-3">Vote %</th>
                      <th className="px-5 py-3 hidden md:table-cell">Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...PARTIES].filter(p => p.seats > 0).sort((a, b) => b.seats - a.seats).map(p => {
                      const pct = ((p.totalVotes / totalVotesCast) * 100).toFixed(1);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full shrink-0" style={{ background: p.color }} />
                              <div>
                                <div className="font-bold text-slate-900">{p.shortName}</div>
                                <div className="text-slate-400 text-xs flex items-center gap-2">
                                  {p.name}
                                  <div className="flex items-center gap-1.5 ml-1">
                                    {p.facebookUrl && (
                                      <a href={p.facebookUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-600">
                                        <Facebook size={10} />
                                      </a>
                                    )}
                                    {p.twitterUrl && (
                                      <a href={p.twitterUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-sky-400">
                                        <Twitter size={10} />
                                      </a>
                                    )}
                                    {p.instagramUrl && (
                                      <a href={p.instagramUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-pink-600">
                                        <Instagram size={10} />
                                      </a>
                                    )}
                                    {p.youtubeUrl && (
                                      <a href={p.youtubeUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-red-600">
                                        <Youtube size={10} />
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-xl font-black text-slate-900 num">{p.seats}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right text-slate-600 num text-sm hidden sm:table-cell">{formatNumber(p.totalVotes)}</td>
                          <td className="px-5 py-3.5 text-right font-bold" style={{ color: p.color }}>{pct}%</td>
                          <td className="px-5 py-3.5 w-36 hidden md:table-cell">
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${pct}%`, background: p.color }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card p-5">
                <h3 className="section-title text-base mb-0.5">📊 Seats by Party</h3>
                <p className="text-xs text-slate-400 mb-4">Declared seats</p>
                <PartyBarChart height={240} />
              </div>
              <div className="card p-5">
                <h3 className="section-title text-base mb-0.5">🗳️ Vote Share</h3>
                <p className="text-xs text-slate-400 mb-2">Total vote distribution</p>
                <VotePieChart height={250} />
              </div>
            </div>

            <div className="card p-5">
              <h3 className="section-title text-base mb-0.5">📈 Turnout Trend</h3>
              <p className="text-xs text-slate-400 mb-4">Cumulative voter turnout throughout election day</p>
              <TurnoutAreaChart height={220} />
            </div>
          </div>
        )}

        {/* ── CONSTITUENCY ── */}
        {activeTab === 'constituency' && (
          <div>
            <div className="mb-5">
              <select value={filterConstituency} onChange={e => setFilterConstituency(e.target.value)} className="input-field max-w-sm">
                <option value="all">All Constituencies</option>
                {CONSTITUENCIES.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              {filtered.map(con => {
                const conCandidates = [...candidates].filter(c => c.constituencyId === con.id).sort((a, b) => b.votes - a.votes);
                const conTotal = conCandidates.reduce((s, c) => s + c.votes, 0);
                const reportPct = ((con.reportedStations / con.totalStations) * 100).toFixed(0);
                return (
                  <div key={con.id} className="card overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[11px] font-black bg-slate-900 text-white px-2 py-0.5 rounded-lg">{con.code}</span>
                          <span className="font-extrabold text-slate-900">{con.name}</span>
                          <span className="text-slate-400 text-xs">{con.district}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{con.registeredVoters.toLocaleString()} voters</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">{con.reportedStations}/{con.totalStations} stations</span>
                        <div className="progress-bar w-20"><div className="progress-fill" style={{ width: `${reportPct}%`, background: '#16a34a' }} /></div>
                        <span className="font-bold text-brand-600">{reportPct}%</span>
                      </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {conCandidates.map((c, i) => {
                        const party = getPartyById(c.partyId);
                        const pct = conTotal ? ((c.votes / conTotal) * 100).toFixed(1) : '0';
                        return (
                          <div key={c.id} className={`px-5 py-3.5 flex items-center gap-4 ${i === 0 ? 'bg-green-50/60' : 'hover:bg-slate-50'} transition-colors`}>
                            <div className="text-slate-400 text-xs font-black w-4 shrink-0">{i + 1}</div>
                            {c.photoUrl ? (
                              <img src={c.photoUrl} alt={c.name} className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-white text-sm font-bold" style={{ background: party?.color }}>{c.initials}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                                {i === 0 && <span className="badge badge-emerald">▲ Leading</span>}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: party?.color }} />
                                <span className="text-xs font-bold" style={{ color: party?.color }}>{party?.shortName}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-black text-slate-900 num">{formatNumber(c.votes)}</div>
                              <div className="text-xs font-bold" style={{ color: party?.color }}>{pct}%</div>
                            </div>
                            <div className="w-24 hidden sm:block">
                              <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%`, background: party?.color }} /></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS ── */}
        {activeTab === 'submissions' && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="section-title text-base">Observer Submissions</h2>
              <span className="badge badge-slate">{RESULT_ENTRIES.length} records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left px-5 py-3">Candidate</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Station</th>
                    <th className="text-right px-5 py-3">Votes</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Submitted</th>
                    <th className="text-center px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {RESULT_ENTRIES.map(r => {
                    const party = getPartyById(r.partyId);
                    return (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: party?.color }} />
                            <div>
                              <div className="font-semibold text-slate-900">{r.candidateName}</div>
                              <div className="text-xs font-bold" style={{ color: party?.color }}>{party?.shortName}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-sm hidden md:table-cell">{r.pollingStationName}</td>
                        <td className="px-5 py-3 text-right font-black text-slate-900 num">{r.votes.toLocaleString()}</td>
                        <td className="px-5 py-3 text-slate-400 text-xs hidden sm:table-cell">{timeAgo(r.submittedAt)}</td>
                        <td className="px-5 py-3 text-center">
                          {r.flagged ? <span className="badge badge-amber">⚠ Flagged</span>
                            : r.verified ? <span className="badge badge-emerald">✓ Verified</span>
                            : <span className="badge badge-slate">Pending</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
