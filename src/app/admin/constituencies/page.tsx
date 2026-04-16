'use client';

import React, { useState } from 'react';
import { CONSTITUENCIES, PROVINCES } from '@/lib/mockData';
import type { Constituency } from '@/types';

type FormData = Omit<Constituency, 'id' | 'lat' | 'lng'>;

const DISTRICTS_GB  = ['Gilgit','Hunza','Nagar','Diamer','Astore','Ghanche','Skardu','Ghizer','Shigar','Kharmang'];
const DISTRICTS_AJK = ['Muzaffarabad','Hattian','Neelum','Mirpur','Bhimber','Kotli','Rawalakot (Poonch)','Bagh','Haveli','Sudhnoti'];

const BLANK: FormData = {
  name: '', code: '', provinceId: 'gb', district: '',
  type: 'national', registeredVoters: 0, totalStations: 0, reportedStations: 0,
};

export default function AdminConstituenciesPage() {
  const [list, setList]       = useState<Constituency[]>(CONSTITUENCIES);
  const [search, setSearch]   = useState('');
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Constituency | null>(null);
  const [form, setForm]       = useState<FormData>(BLANK);
  const [errors, setErrors]   = useState<Partial<Record<keyof FormData, string>>>({});
  const [toast, setToast]     = useState('');

  const districts = form.provinceId === 'gb' ? DISTRICTS_GB : DISTRICTS_AJK;

  const openAdd = () => {
    setForm(BLANK); setErrors({}); setEditing(null); setModal('add');
  };
  const openEdit = (c: Constituency) => {
    setForm({ name: c.name, code: c.code, provinceId: c.provinceId, district: c.district,
      type: c.type, registeredVoters: c.registeredVoters, totalStations: c.totalStations,
      reportedStations: c.reportedStations });
    setEditing(c); setErrors({}); setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim())     e.name     = 'Name is required';
    if (!form.code.trim())     e.code     = 'Code is required';
    if (!form.district.trim()) e.district = 'District is required';
    if (form.registeredVoters <= 0) e.registeredVoters = 'Must be > 0';
    if (form.totalStations    <= 0) e.totalStations    = 'Must be > 0';
    if (form.reportedStations  < 0) e.reportedStations = 'Cannot be negative';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (modal === 'add') {
      const newC: Constituency = { ...form, id: `c_${Date.now()}`, lat: 0, lng: 0 };
      setList(prev => [newC, ...prev]);
      showToast('✅ Constituency added successfully');
    } else if (modal === 'edit' && editing) {
      setList(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
      showToast('✅ Constituency updated successfully');
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this constituency? This cannot be undone.')) return;
    setList(prev => prev.filter(c => c.id !== id));
    showToast('🗑 Constituency removed');
  };

  const field = (key: keyof FormData) => ({
    value: String(form[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = ['registeredVoters','totalStations','reportedStations'].includes(key)
        ? Number(e.target.value) : e.target.value;
      setForm(prev => ({ ...prev, [key]: val }));
      setErrors(prev => ({ ...prev, [key]: undefined }));
    },
  });

  const filtered = list.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-6xl">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-white border border-slate-200 shadow-hover rounded-2xl px-4 py-3 text-sm font-semibold text-slate-900 animate-slide-up">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">🗺️ Constituencies</h1>
          <p className="text-slate-500 text-sm mt-0.5">{list.length} constituencies · GB &amp; AJK regions</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          + Add Constituency
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="input-field max-w-sm"
          placeholder="Search by name, code or district…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total',    value: list.length,                                        color: 'bg-brand-50 border-brand-200 text-brand-800' },
          { label: 'GB',       value: list.filter(c => c.provinceId === 'gb').length,      color: 'bg-sky-50 border-sky-200 text-sky-800' },
          { label: 'AJK',      value: list.filter(c => c.provinceId === 'ajk').length,     color: 'bg-violet-50 border-violet-200 text-violet-800' },
          { label: 'Fully Rep.', value: list.filter(c => c.reportedStations === c.totalStations).length, color: 'bg-brand-50 border-brand-200 text-brand-800' },
        ].map(s => (
          <div key={s.label} className={`card border p-3 text-center ${s.color}`}>
            <div className="text-2xl font-black">{s.value}</div>
            <div className="text-[11px] font-bold uppercase tracking-wide opacity-70">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                <th className="text-left px-4 py-3">Code</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Province</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">District</th>
                <th className="text-right px-4 py-3 hidden md:table-cell">Voters</th>
                <th className="text-center px-4 py-3">Progress</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No constituencies found</td></tr>
              ) : filtered.map(c => {
                const prov = PROVINCES.find(p => p.id === c.provinceId);
                const pct  = Math.round((c.reportedStations / c.totalStations) * 100);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{c.name}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`badge ${c.provinceId === 'gb' ? 'badge-sky' : 'badge-slate'}`}>
                        {prov?.code ?? c.provinceId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{c.district}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 hidden md:table-cell">{c.registeredVoters.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-center min-w-[80px]">
                        <div className="progress-bar flex-1 max-w-[60px]">
                          <div className="progress-fill" style={{ width: `${pct}%`, background: pct === 100 ? '#059669' : '#f59e0b' }} />
                        </div>
                        <span className={`text-xs font-bold ${pct === 100 ? 'text-brand-600' : 'text-amber-600'}`}>{pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openEdit(c)}
                          className="text-xs font-semibold text-sky-600 hover:bg-sky-50 px-2.5 py-1.5 rounded-lg transition-colors border border-sky-200">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(c.id)}
                          className="text-xs font-semibold text-red-500 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors border border-red-200">
                          Del
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={closeModal}>
          <div className="bg-white rounded-2xl shadow-hover w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-black text-slate-900 text-lg">
                {modal === 'add' ? '+ Add Constituency' : `✏️ Edit: ${editing?.name}`}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 text-xl font-bold leading-none">×</button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Province + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Province *</label>
                  <select className="input-field" {...field('provinceId')}
                    onChange={e => { setForm(p => ({ ...p, provinceId: e.target.value, district: '' })); }}>
                    {PROVINCES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Type *</label>
                  <select className="input-field" {...field('type')}>
                    <option value="national">National</option>
                    <option value="provincial">Provincial</option>
                  </select>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Constituency Name *</label>
                <input className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                  placeholder="e.g. Hunza-Nagar" {...field('name')} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Code + District */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Code *</label>
                  <input className={`input-field ${errors.code ? 'border-red-400' : ''}`}
                    placeholder="NA-1 or LA-1" {...field('code')} />
                  {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">District *</label>
                  <select className={`input-field ${errors.district ? 'border-red-400' : ''}`}
                    value={form.district}
                    onChange={e => { setForm(p => ({ ...p, district: e.target.value })); setErrors(p => ({ ...p, district: undefined })); }}>
                    <option value="">Select district</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
                </div>
              </div>

              {/* Voters + Stations */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Registered Voters *</label>
                  <input type="number" min={1} className={`input-field ${errors.registeredVoters ? 'border-red-400' : ''}`}
                    placeholder="50000" {...field('registeredVoters')} />
                  {errors.registeredVoters && <p className="text-xs text-red-500 mt-1">{errors.registeredVoters}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Total Stations *</label>
                  <input type="number" min={1} className={`input-field ${errors.totalStations ? 'border-red-400' : ''}`}
                    placeholder="40" {...field('totalStations')} />
                  {errors.totalStations && <p className="text-xs text-red-500 mt-1">{errors.totalStations}</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Reported</label>
                  <input type="number" min={0} className={`input-field ${errors.reportedStations ? 'border-red-400' : ''}`}
                    placeholder="0" {...field('reportedStations')} />
                  {errors.reportedStations && <p className="text-xs text-red-500 mt-1">{errors.reportedStations}</p>}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex gap-3 justify-end">
              <button onClick={closeModal} className="btn-outline">Cancel</button>
              <button onClick={handleSave} className="btn-primary">
                {modal === 'add' ? 'Add Constituency' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
