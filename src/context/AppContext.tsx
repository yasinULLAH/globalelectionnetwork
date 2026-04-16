'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CANDIDATES, ELECTION_META, LIVE_UPDATES, ELECTIONS } from '@/lib/mockData';
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
  login: (email: string, password: string, role: string) => boolean;
  logout: () => void;
  toggleLike: (candidateId: string) => void;
}

const AppContext = createContext<AppState | null>(null);

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin Malik', email: 'admin@gen.pk', role: 'admin' },
  { id: 'u2', name: 'Yasir Ali Shah', email: 'yasir.shah@gen.pk', role: 'observer', observerId: 'obs1' },
  { id: 'u3', name: 'Sana Batool', email: 'sana.batool@gen.pk', role: 'observer', observerId: 'obs2' },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);
  const [totalVotesCast, setTotalVotesCast] = useState(ELECTION_META.totalVotesCast);
  const [seatsDeclared, setSeatsDeclared] = useState(ELECTION_META.seatsDeclared);
  const [nationalTurnout, setNationalTurnout] = useState(ELECTION_META.nationalTurnout);
  const [liveUpdates, setLiveUpdates] = useState<LiveUpdate[]>(LIVE_UPDATES);
  const [user, setUser] = useState<User | null>(null);
  const [likedCandidates, setLikedCandidates] = useState<Set<string>>(new Set());
  const [isLive] = useState(true);
  const [activeElection, setActiveElection] = useState<ElectionConfig>(ELECTIONS[0]);

  // Load real active election from DB so IDs match for API calls
  useEffect(() => {
    fetch('/api/elections/active')
      .then(r => r.json())
      .then(data => {
        if (data.election) {
          const e = data.election;
          setActiveElection({
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
          });
        }
      })
      .catch(() => { /* keep mockData fallback */ });
  }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      const newVotes = Math.floor(Math.random() * 1200) + 300;
      setTotalVotesCast(v => v + newVotes);
      setNationalTurnout(t => Math.min(t + 0.01, 65));

      setCandidates(prev =>
        prev.map(c => ({
          ...c,
          votes: c.votes + Math.floor(Math.random() * 80),
        }))
      );

      if (Math.random() < 0.15) {
        setSeatsDeclared(v => Math.min(v + 1, ELECTION_META.totalSeats));
      }
    }, 3000);

    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const newsFeed = setInterval(() => {
      const messages = [
        'Observer reported results from Karachi East polling station',
        'PTI widens lead in KPK by 12,000 votes',
        'Turnout in Punjab crosses 50%',
        'PML-N secures another seat in Lahore',
        'NA-240 Karachi East: 210/215 stations reporting',
        'All quiet at Skardu polling stations',
      ];
      const types: LiveUpdate['type'][] = ['result', 'update', 'milestone', 'alert'];
      const newUpdate: LiveUpdate = {
        id: `live-${Date.now()}`,
        message: messages[Math.floor(Math.random() * messages.length)],
        timestamp: new Date().toISOString(),
        type: types[Math.floor(Math.random() * types.length)],
      };
      setLiveUpdates(prev => [newUpdate, ...prev.slice(0, 19)]);
    }, 8000);

    return () => clearInterval(newsFeed);
  }, []);

  const login = useCallback((email: string, _password: string, role: string): boolean => {
    const found = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (found) {
      setUser(found);
      return true;
    }
    if (email && role === 'admin') {
      setUser({ id: 'u_admin', name: 'Super Admin', email, role: 'admin' });
      return true;
    }
    return false;
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
