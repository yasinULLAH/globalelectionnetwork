'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ELECTIONS } from '@/lib/mockData';
import type { Candidate, LiveUpdate, User, ElectionConfig } from '@/types';

interface AppState {
  candidates: Candidate[];
  totalVotesCast: number;
  seatsDeclared: number;
  nationalTurnout: number;
  liveUpdates: LiveUpdate[];
  user: User | null;
  isLive: boolean;
  likedCandidates: Set<string>;
  activeElection: ElectionConfig;
  setActiveElection: (e: ElectionConfig) => void;
  login: (email: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  toggleLike: (candidateId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [totalVotesCast, setTotalVotesCast] = useState(0);
  const [seatsDeclared, setSeatsDeclared] = useState(0);
  const [nationalTurnout, setNationalTurnout] = useState(0);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [isLive, setIsLive] = useState(false);
  const [activeElection, setActiveElection] = useState<ElectionConfig>(ELECTIONS[0]);

  // Load real active election from DB
  useEffect(() => {
    fetch('/api/elections/active')
      .then(r => r.json())
      .then(data => {
        if (data.election) {
          const e = data.election;
          const electionConfig: ElectionConfig = {
            id: e.id,
            name: e.name,
            country: e.country,
            electionType: e.election_type,
            region: e.region,
            province: e.province,
            date: e.date,
            status: e.status,
            totalSeats: e.total_seats,
            totalRegisteredVoters: e.total_registered_voters,
            description: e.description,
            flagEmoji: e.flag_emoji,
          };
          setActiveElection(electionConfig);
          setIsLive(e.status === 'live');

          // Always fetch candidates
          fetch(`/api/candidates?electionId=${e.id}`)
            .then(r => r.json())
            .then(data => {
              if (data.candidates) {
                setCandidates(data.candidates);
                // Compute totalVotesCast from candidate votes
                const total = data.candidates.reduce((s: number, c: { votes: number }) => s + (c.votes || 0), 0);
                setTotalVotesCast(total);
                // Compute seats declared (candidates with votes > 0 per constituency, count unique constituencies)
                const withVotes = new Set(data.candidates.filter((c: { votes: number }) => c.votes > 0).map((c: { constituencyId: string }) => c.constituencyId));
                setSeatsDeclared(withVotes.size);
              }
            })
            .catch(() => {});

          // Only fetch live updates if election is live
          if (e.status === 'live') {
            fetch(`/api/live-updates?electionId=${e.id}`)
              .then(r => r.json())
              .then(data => {
                if (data.updates) {
                  setLiveUpdates(data.updates);
                }
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => { /* keep mockData fallback */ });
  }, []);

  const login = useCallback(async (email: string, password: string, role: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const toggleLike = useCallback((candidateId: string) => {
    setLikedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(candidateId)) {
        next.delete(candidateId);
        setCandidates(cs => cs.map(c => c.id === candidateId ? { ...c, likes: c.likes - 1 } : c));
      } else {
        next.add(candidateId);
        setCandidates(cs => cs.map(c => c.id === candidateId ? { ...c, likes: c.likes + 1 } : c));
      }
      return next;
    });
  }, []);

  return (
    <AppContext.Provider value={{
      candidates, totalVotesCast, seatsDeclared, nationalTurnout,
      liveUpdates, user, isLive, likedCandidates,
      activeElection, setActiveElection,
      login, logout, toggleLike,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
