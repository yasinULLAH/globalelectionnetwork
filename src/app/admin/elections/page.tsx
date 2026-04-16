'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ELECTIONS } from '@/lib/mockData';
import type { ElectionConfig, ElectionType, ElectionStatus } from '@/types';

const TYPE_COLORS: Record<ElectionType, string> = {
  'General':     'badge-emerald',
  'Provincial':  'badge-sky',
  'By-Election': 'badge-amber',
  'Senate':      'badge-violet',
  'Local Bodies':'badge-slate',
};

const STATUS_COLORS: Record<ElectionStatus, string> = {
  live:      'bg-red-50 text-red-700 border-red-200',
  completed: 'bg-slate-50 text-slate-600 border-slate-200',
  upcoming:  'bg-amber-50 text-amber-700 border-amber-200',
};
const STATUS_DOTS: Record<ElectionStatus, string> = {
  live: 'bg-red-500 live-pulse',
  completed: 'bg-slate-400',
  upcoming: 'bg-amber-400',
};

const ELECTION_TYPES: ElectionType[] = ['General', 'Provincial', 'By-Election', 'Senate', 'Local Bodies'];
const ELECTION_STATUSES: ElectionStatus[] = ['upcoming', 'live', 'completed'];

const BLANK: Omit<ElectionConfig, 'id'> = {
  name: '', country: 'Pakistan', electionType: 'General',
  region: '', province: '', date: '', status: 'upcoming',
  totalSeats: 0, totalRegisteredVoters: 0, description: '', flagEmoji: '🗳️',
};

export default function AdminElectionsPage() {
  const { activeElection, setActiveElection } = useApp();
  const [elections, setElections] = useState<ElectionConfig[]>(ELECTIONS);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<ElectionConfig, 'id'>>(BLANK);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const openAdd = () => { setForm(BLANK); setEditId(null); setShowForm(true); };
  const openEdit = (e: ElectionConfig) => {
    const { id, ...rest } = e;
    setForm(rest); setEditId(id); setShowForm(true);
  };
  const close = () => { setShowForm(false); setEditId(null); };

  const handleSave = () => {
    if (!form.name.trim() || !form.date) { showToast('Name and date are required.'); return; }
    if (editId) {
      const updated = { ...form, id: editId };
      setElections(es => es.map(e => e.id === editId ? updated : e));
      if (activeElection.id === editId) setActiveElection(updated);
      showToast('Election updated.');
    } else {
      const newEl: ElectionConfig = { ...form, id: `custom-${Date.now()}` };
      setElections(es => [...es, newEl]);
      showToast('Election added.');
    }
    close();
  };

  const handleDelete = (id: string) => {
    if (activeElection.id === id) { showToast('Cannot delete the active election.'); return; }
    setElections(es => es.filter(e => e.id !== id));
    showToast('Election removed.');
  };

  const handleActivate = (e: ElectionConfig) => {
    setActiveElection(e);
    showToast(`"${e.name}" is now the active election.`);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-2xl shadow-lg animate-slide-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="page-title">🗳️ Election Control</h1>
          <p className="text-slate-400 text-sm mt-1">Manage elections and set the active one displayed on the website.</p>
        </div>
        <button onClick={openAdd} className="btn-primary shrink-0">+ Add Election</button>
      </div>

      {/* Active election banner */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-4"
        style={{ borderLeft: '4px solid #16a34a' }}>
        <div className="text-3xl">{activeElection.flagEmoji}</div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black text-brand-600 uppercase tracking-widest mb-0.5">Currently Active on Website</p>
          <p className="font-extrabold text-slate-900 text-base leading-tight">{activeElection.name}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`badge ${TYPE_COLORS[activeElection.electionType]}`}>{activeElection.electionType}</span>
            <span className="text-xs text-slate-400">{activeElection.country} · {activeElection.province}</span>
            <span className="text-xs text-slate-400">{activeElection.date}</span>
            <span className={`badge border ${STATUS_COLORS[activeElection.status]}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${STATUS_DOTS[activeElection.status]}`} />
              {activeElection.status}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-slate-900 num">{activeElection.totalSeats.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Total Seats</p>
        </div>
      </div>

      {/* Elections list */}
      <div className="space-y-3">
        {elections.map(e => {
          const isActive = e.id === activeElection.id;
          return (
            <div key={e.id}
              className={`card p-4 flex flex-wrap items-center gap-4 transition-all ${isActive ? 'ring-2 ring-brand-500 ring-offset-1' : ''}`}>
              <div className="text-2xl shrink-0">{e.flagEmoji}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-extrabold text-slate-900 text-sm">{e.name}</p>
                  {isActive && <span className="badge badge-forest">● Active</span>}
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                  <span className={`badge ${TYPE_COLORS[e.electionType]}`}>{e.electionType}</span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    🌍 {e.country}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    📍 {e.province !== e.region ? `${e.province} · ${e.region}` : e.region}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    📅 {e.date}
                  </span>
                  <span className={`badge border text-xs ${STATUS_COLORS[e.status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${STATUS_DOTS[e.status]}`} />
                    {e.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">{e.description}</p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                <p className="text-lg font-black text-slate-900 num">{e.totalSeats.toLocaleString()} <span className="text-xs font-normal text-slate-400">seats</span></p>
                <p className="text-xs text-slate-400">{(e.totalRegisteredVoters / 1_000_000).toFixed(1)}M voters</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!isActive && (
                  <button onClick={() => handleActivate(e)}
                    className="text-xs font-bold text-brand-600 hover:text-white hover:bg-brand-600 border border-brand-300 px-3 py-1.5 rounded-lg transition-all">
                    Set Active
                  </button>
                )}
                <button onClick={() => openEdit(e)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition-all">
                  Edit
                </button>
                {!isActive && (
                  <button onClick={() => handleDelete(e.id)}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all">
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={e => { if (e.target === e.currentTarget) close(); }}>
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-hover animate-slide-up max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl">
              <h2 className="font-black text-slate-900 text-lg">{editId ? 'Edit Election' : 'Add New Election'}</h2>
              <button onClick={close} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 w-8 h-8 rounded-xl flex items-center justify-center text-lg transition-all">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Name + Emoji */}
              <div className="flex gap-3">
                <div className="w-24">
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Flag / Icon</label>
                  <input value={form.flagEmoji} onChange={e => setForm(f => ({ ...f, flagEmoji: e.target.value }))}
                    className="input-field text-center text-xl" maxLength={4} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Election Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="input-field" placeholder="e.g. GB General Elections 2024" />
                </div>
              </div>

              {/* Country + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Country</label>
                  <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    className="input-field" placeholder="Pakistan" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Election Type</label>
                  <select value={form.electionType} onChange={e => setForm(f => ({ ...f, electionType: e.target.value as ElectionType }))}
                    className="input-field">
                    {ELECTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Province + Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Province / Territory</label>
                  <input value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                    className="input-field" placeholder="e.g. Gilgit-Baltistan" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Region</label>
                  <input value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))}
                    className="input-field" placeholder="e.g. Northern Areas" />
                </div>
              </div>

              {/* Date + Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Election Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as ElectionStatus }))}
                    className="input-field">
                    {ELECTION_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Seats + Voters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Total Seats</label>
                  <input type="number" min="1" value={form.totalSeats || ''} onChange={e => setForm(f => ({ ...f, totalSeats: Number(e.target.value) }))}
                    className="input-field" placeholder="e.g. 53" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">Registered Voters</label>
                  <input type="number" min="0" value={form.totalRegisteredVoters || ''} onChange={e => setForm(f => ({ ...f, totalRegisteredVoters: Number(e.target.value) }))}
                    className="input-field" placeholder="e.g. 2863000" />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="input-field resize-none" rows={2} placeholder="Brief description of this election…" />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button onClick={close} className="btn-outline flex-1">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1">
                {editId ? 'Save Changes' : 'Add Election'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
