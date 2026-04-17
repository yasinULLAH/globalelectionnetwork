'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import CandidateCard from '@/components/dashboard/CandidateCard';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/context/AppContext';
import { getPartyById } from '@/lib/utils';

export default function CandidatesPage() {
  const { candidates, activeElection } = useApp();
  const [search, setSearch] = useState('');
  const [filterParty, setFilterParty] = useState('all');
  const [filterConstituency, setFilterConstituency] = useState('all');
  const [sortBy, setSortBy] = useState<'votes' | 'likes' | 'name'>('votes');
  const [parties, setParties] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);

  useEffect(() => {
    if (activeElection.id) {
      fetch(`/api/parties?electionId=${activeElection.id}`).then(r => r.json()).then(d => setParties(d.parties || [])).catch(() => {});
      fetch(`/api/constituencies?electionId=${activeElection.id}`).then(r => r.json()).then(d => setConstituencies(d.constituencies || [])).catch(() => {});
    }
  }, [activeElection.id]);

  const totalVotes = candidates.reduce((s, c) => s + c.votes, 0);

  const filtered = useMemo(() => {
    return candidates
      .filter(c => {
        const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
        const matchParty = filterParty === 'all' || c.partyId === filterParty;
        const matchConst = filterConstituency === 'all' || c.constituencyId === filterConstituency;
        return matchSearch && matchParty && matchConst;
      })
      .sort((a, b) => {
        if (sortBy === 'votes') return b.votes - a.votes;
        if (sortBy === 'likes') return b.likes - a.likes;
        return a.name.localeCompare(b.name);
      });
  }, [candidates, search, filterParty, filterConstituency, sortBy]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Page header */}
      <div style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 60%, #065f46 100%)' }}>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">Candidates</h1>
          <p className="text-white/55 text-sm">
            Browse all candidates across GB &amp; AJK · <span className="text-green-300 font-semibold">{filtered.length} showing</span>
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search candidates…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field flex-1 min-w-[180px]"
          />
          <select value={filterParty} onChange={e => setFilterParty(e.target.value)} className="input-field w-auto">
            <option value="all">All Parties</option>
            {parties.map((p: any) => <option key={p.id} value={p.id}>{p.short_name || p.name}</option>)}
          </select>
          <select value={filterConstituency} onChange={e => setFilterConstituency(e.target.value)} className="input-field w-auto">
            <option value="all">All Constituencies</option>
            {constituencies.map((c: any) => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as 'votes' | 'likes' | 'name')} className="input-field w-auto">
            <option value="votes">Most Votes</option>
            <option value="likes">Most Liked</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {candidates.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-lg font-bold text-slate-700">No candidates found</p>
            <p className="text-sm text-slate-400 mt-1">Candidates will appear here once added to the election</p>
          </div>
        )}

        {/* Grouped by constituency */}
        {candidates.length > 0 && filterConstituency === 'all' && filterParty === 'all' && !search ? (
          <div className="space-y-8">
            {constituencies.map((con: any) => {
              const conCandidates = [...candidates]
                .filter(c => c.constituencyId === con.id)
                .sort((a, b) => b.votes - a.votes);
              if (!conCandidates.length) return null;
              const conTotal = conCandidates.reduce((s, c) => s + c.votes, 0);
              const winner = conCandidates[0];
              const winnerParty = parties.find((p: any) => p.id === winner?.partyId) || getPartyById(winner?.partyId);

              return (
                <div key={con.id}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-[11px] font-black bg-slate-900 text-white px-2.5 py-1 rounded-lg">{con.code}</span>
                        <h2 className="text-lg font-extrabold text-slate-900">{con.name}</h2>
                        <span className="text-xs text-slate-400">{con.district}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {con.registered_voters?.toLocaleString() || '—'} voters
                      </p>
                    </div>
                    {winner && (
                      <div className="text-right shrink-0">
                        <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Leading</p>
                        <p className="text-sm font-black" style={{ color: winnerParty?.color }}>{winner.name.split(' ').slice(-1)[0]}</p>
                        <p className="text-xs font-bold" style={{ color: winnerParty?.color }}>{winnerParty?.shortName}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 overflow-x-auto py-3 -my-3 px-0.5">
                    {conCandidates.map((c, i) => (
                      <CandidateCard key={c.id} candidate={c} rank={i + 1} totalVotes={conTotal} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {filtered.map((c, i) => (
              <CandidateCard key={c.id} candidate={c} rank={i + 1} totalVotes={totalVotes} />
            ))}
            {!filtered.length && (
              <div className="col-span-full text-center py-20">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-lg font-bold text-slate-700">No candidates found</p>
                <p className="text-sm text-slate-400 mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
