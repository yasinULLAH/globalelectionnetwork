'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { getPartyById, formatNumber } from '@/lib/utils';
import type { Candidate } from '@/types';

interface Props {
  candidate: Candidate;
  rank?: number;
  totalVotes?: number;
  showLike?: boolean;
}

export default function CandidateCard({ candidate, rank, totalVotes, showLike = true }: Props) {
  const { likedCandidates, toggleLike } = useApp();
  const party = getPartyById(candidate.partyId);
  const isLiked = likedCandidates.has(candidate.id);
  const share = totalVotes ? ((candidate.votes / totalVotes) * 100).toFixed(1) : null;

  return (
    <div className="card card-hover p-4 flex flex-col gap-3 min-w-[240px]">
      {/* Rank + Avatar + Info */}
      <div className="flex items-start gap-3">
        {rank && (
          <div className="text-xs font-black shrink-0 mt-1 w-5 text-center"
            style={{ color: party?.color }}>
            {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
          </div>
        )}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {candidate.photoUrl ? (
            <img src={candidate.photoUrl} alt={candidate.name}
              className="w-11 h-11 rounded-xl object-cover shrink-0 border border-slate-200 shadow-sm" />
          ) : (
            <div className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-white font-bold text-base shadow-sm"
              style={{ background: `linear-gradient(135deg, ${party?.color ?? '#6b7280'}, ${party?.color ?? '#6b7280'}bb)` }}>
              {candidate.initials}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-extrabold text-slate-900 text-sm leading-tight truncate">{candidate.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{candidate.profession}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: party?.color }} />
              <span className="text-xs font-bold" style={{ color: party?.color }}>{party?.shortName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Votes + bar */}
      <div>
        <div className="flex justify-between items-end mb-1">
          <span className="text-xl font-black text-slate-900 num">{formatNumber(candidate.votes)}</span>
          {share && <span className="text-xs font-bold text-slate-400">{share}%</span>}
        </div>
        {share && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${share}%`, background: party?.color }} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400">Age <span className="font-semibold text-slate-600">{candidate.age}</span></span>
        {showLike && (
          <button onClick={() => toggleLike(candidate.id)}
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border transition-all ${
              isLiked
                ? 'text-rose-600 bg-rose-50 border-rose-200'
                : 'text-slate-400 border-slate-200 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50'
            }`}>
            <span>{isLiked ? '❤️' : '🤍'}</span>
            <span>{formatNumber(candidate.likes)}</span>
          </button>
        )}
      </div>
    </div>
  );
}
