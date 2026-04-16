'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/lib/utils';
import { Plus, Edit3, Trash2, Check, AlertCircle, X } from 'lucide-react';

interface Party {
  id: string; name: string; short_name: string; color: string; bg_color: string;
  founded_year: number | null; ideology: string; seats: number; total_votes: number;
}

const EMPTY_FORM = { name: '', shortName: '', color: '#16a34a', bgColor: '', foundedYear: '', ideology: '' };

export default function AdminPartiesPage() {
  const { activeElection } = useApp();
  const electionId = activeElection?.id ?? 'el-gb-2024';

  const [parties, setParties]   = useState<Party[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId]     = useState<string | null>(null);
  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{msg:string;ok:boolean}|null>(null);

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parties?electionId=${electionId}`);
      const data = await res.json();
      setParties(data.parties ?? []);
    } finally { setLoading(false); }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  const handleClose = () => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); };

  const handleEdit = (p: Party) => {
    setEditId(p.id);
    setForm({ name: p.name, shortName: p.short_name, color: p.color,
      bgColor: p.bg_color ?? '', foundedYear: String(p.founded_year ?? ''), ideology: p.ideology ?? '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.shortName) return showToast('Name and short name required', false);
    setSaving(true);
    try {
      const body = { ...form, foundedYear: form.foundedYear ? parseInt(form.foundedYear) : null, electionId };
      const res = await fetch(editId ? `/api/parties/${editId}` : '/api/parties', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(editId ? 'Party updated!' : 'Party added!');
      handleClose();
      load();
    } catch (e: unknown) { showToast((e as Error).message, false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: Party) => {
    if (!window.confirm(`Delete ${p.short_name}? This will also remove associated candidates.`)) return;
    await fetch(`/api/parties/${p.id}`, { method: 'DELETE' });
    showToast('Party removed');
    load();
  };

  const f = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.ok ? <Check size={15}/> : <AlertCircle size={15}/>} {toast.msg}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title">🏛️ Parties</h1>
            <p className="text-slate-500 text-sm mt-0.5">{parties.length} registered political parties</p>
          </div>
          <button onClick={() => { setEditId(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={15}/> Add Party
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map(p => (
              <div key={p.id} className="card card-hover p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0"
                      style={{ background: p.color }}>
                      {p.short_name.slice(0,3)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-slate-900">{p.short_name}</div>
                      <div className="text-slate-400 text-xs truncate">{p.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button onClick={() => handleEdit(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all">
                      <Edit3 size={13}/>
                    </button>
                    <button onClick={() => handleDelete(p)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="rounded-xl p-3 text-center" style={{ background: p.color + '15' }}>
                    <div className="text-2xl font-black" style={{ color: p.color }}>{p.seats}</div>
                    <div className="text-xs font-semibold text-slate-500">Seats</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg font-black text-slate-900">{formatNumber(p.total_votes)}</div>
                    <div className="text-xs font-semibold text-slate-500">Votes</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400">{p.ideology || '—'} · Est. {p.founded_year || '—'}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-900 text-lg">{editId ? 'Edit Party' : 'Add Party'}</h2>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
              </div>
              <div className="px-5 py-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Party Name *</label>
                  <input value={form.name} onChange={f('name')} placeholder="e.g. Pakistan Tehreek-e-Insaf" className="input-field"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Short Name / Abbreviation *</label>
                    <input value={form.shortName} onChange={f('shortName')} placeholder="PTI" className="input-field"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Founded Year</label>
                    <input type="number" value={form.foundedYear} onChange={f('foundedYear')} placeholder="1996" className="input-field"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Ideology</label>
                  <input value={form.ideology} onChange={f('ideology')} placeholder="e.g. Centrist / Populist" className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Party Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={form.color} onChange={f('color')}
                      className="w-10 h-10 rounded-lg border border-slate-200 cursor-pointer"/>
                    <input value={form.color} onChange={f('color')} placeholder="#16a34a"
                      className="input-field font-mono text-xs"/>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-2xl">
                <button onClick={handleClose} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.shortName}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                  {saving ? 'Saving…' : <><Check size={14}/> {editId ? 'Save Changes' : 'Add Party'}</>}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
