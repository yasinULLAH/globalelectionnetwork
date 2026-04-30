'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/lib/utils';
import { Plus, Edit3, Trash2, Check, AlertCircle, X } from 'lucide-react';

interface Candidate {
  id: string; name: string; party_id: string; constituency_id: string;
  election_id: string; votes: number; likes: number; bio: string;
  age: number; education: string; initials: string; profession: string;
  photo_url: string | null; party_name: string; party_short: string;
  party_color: string; constituency_name: string; constituency_code: string;
}
interface Party { id: string; name: string; short_name: string; color: string; }
interface Constituency { id: string; name: string; code: string; }

const EMPTY_FORM = { name: '', partyId: '', constituencyId: '', profession: '', age: '', bio: '', education: '', photoUrl: '' };

export default function AdminCandidatesPage() {
  const { activeElection } = useApp();
  const electionId = activeElection?.id ?? 'el-gb-2024';

  const [candidates, setCandidates]   = useState<Candidate[]>([]);
  const [parties, setParties]         = useState<Party[]>([]);
  const [constituencies, setConsts]   = useState<Constituency[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showForm, setShowForm]       = useState(false);
  const [editId, setEditId]           = useState<string | null>(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [saving, setSaving]           = useState(false);
  const [toast, setToast]             = useState<{msg:string;ok:boolean}|null>(null);
  const fileInputRef                  = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),3000); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes, conRes] = await Promise.all([
        fetch(`/api/candidates?electionId=${electionId}`),
        fetch(`/api/parties?electionId=${electionId}`),
        fetch(`/api/constituencies?electionId=${electionId}`),
      ]);
      const [cd, pd, cond] = await Promise.all([cRes.json(), pRes.json(), conRes.json()]);
      setCandidates(cd.candidates ?? []);
      setParties(pd.parties ?? []);
      setConsts(cond.constituencies ?? []);
    } finally { setLoading(false); }
  }, [electionId]);

  useEffect(() => { load(); }, [load]);

  const filtered = candidates.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleClose = () => { setShowForm(false); setEditId(null); setForm(EMPTY_FORM); };

  const handleEdit = (c: Candidate) => {
    setEditId(c.id);
    setForm({ name: c.name, partyId: c.party_id, constituencyId: c.constituency_id,
      profession: c.profession ?? '', age: String(c.age ?? ''), bio: c.bio ?? '',
      education: c.education ?? '', photoUrl: c.photo_url ?? '' });
    setShowForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { showToast('Image must be under 2 MB', false); return; }
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photoUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name || !form.partyId || !form.constituencyId)
      return showToast('Name, party and constituency are required', false);
    setSaving(true);
    try {
      const body = { ...form, electionId, age: form.age ? parseInt(form.age) : null,
        initials: form.name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() };
      const res = await fetch(editId ? `/api/candidates/${editId}` : '/api/candidates', {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(editId ? 'Candidate updated!' : 'Candidate added!');
      handleClose();
      load();
    } catch (e: unknown) { showToast((e as Error).message, false); }
    finally { setSaving(false); }
  };

  const handleDelete = async (c: Candidate) => {
    if (!window.confirm(`Delete ${c.name}?`)) return;
    await fetch(`/api/candidates/${c.id}`, { method: 'DELETE' });
    showToast('Candidate removed');
    load();
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
            <h1 className="page-title">👤 Candidates</h1>
            <p className="text-slate-500 text-sm mt-0.5">{candidates.length} total registered</p>
          </div>
          <button onClick={() => { setEditId(null); setShowForm(true); }} className="btn-primary flex items-center gap-2">
            <Plus size={15}/> Add Candidate
          </button>
        </div>

        <div className="mb-4">
          <input type="text" placeholder="Search candidates…" value={search}
            onChange={e => setSearch(e.target.value)} className="input-field max-w-sm" />
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Candidate</th>
                  <th className="text-left px-4 py-3">Party</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Constituency</th>
                  <th className="text-right px-4 py-3">Votes</th>
                  <th className="px-4 py-3"/>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400">Loading…</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {c.photo_url ? (
                          <img src={c.photo_url} alt={c.name} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-200"/>
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: c.party_color || '#64748b' }}>
                            {c.initials}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.profession} · {c.age}y</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge" style={{ background: c.party_color+'18', color: c.party_color, border: `1px solid ${c.party_color}40` }}>
                        {c.party_short}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 hidden md:table-cell">
                      {c.constituency_code} – {c.constituency_name}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{formatNumber(c.votes)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => handleEdit(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all">
                          <Edit3 size={14}/>
                        </button>
                        <button onClick={() => handleDelete(c)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all">
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

        {/* Add/Edit Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-900 text-lg">{editId ? 'Edit Candidate' : 'Add Candidate'}</h2>
                <button onClick={handleClose} className="text-slate-400 hover:text-slate-700"><X size={20}/></button>
              </div>
              <div className="px-5 py-4 space-y-4 max-h-[75vh] overflow-y-auto">

                {/* Photo upload */}
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">Candidate Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden bg-slate-50 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}>
                      {form.photoUrl
                        ? <img src={form.photoUrl} alt="preview" className="w-full h-full object-cover"/>
                        : <span className="text-3xl">📷</span>}
                    </div>
                    <div className="flex-1 space-y-2">
                      <button type="button" onClick={() => fileInputRef.current?.click()}
                        className="w-full text-xs font-semibold border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-50 transition-colors">
                        📁 Upload from device (max 2 MB)
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
                      <input type="url"
                        value={form.photoUrl.startsWith('data:') ? '' : form.photoUrl}
                        onChange={e => setForm(f => ({...f, photoUrl: e.target.value}))}
                        placeholder="…or paste image URL"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-400"/>
                      {form.photoUrl && (
                        <button type="button" onClick={() => setForm(f => ({...f, photoUrl: ''}))}
                          className="text-xs text-red-500 hover:underline">Remove photo</button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Full Name *</label>
                  <input value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))}
                    placeholder="Candidate name" className="input-field"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Party *</label>
                    <select value={form.partyId} onChange={e => setForm(f=>({...f,partyId:e.target.value}))} className="input-field">
                      <option value="">Select party</option>
                      {parties.map(p => <option key={p.id} value={p.id}>{p.short_name} — {p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Constituency *</label>
                    <select value={form.constituencyId} onChange={e => setForm(f=>({...f,constituencyId:e.target.value}))} className="input-field">
                      <option value="">Select</option>
                      {constituencies.map(c => <option key={c.id} value={c.id}>{c.code} – {c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Profession</label>
                    <input value={form.profession} onChange={e => setForm(f=>({...f,profession:e.target.value}))}
                      placeholder="e.g. Lawyer" className="input-field"/>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Age</label>
                    <input type="number" value={form.age} onChange={e => setForm(f=>({...f,age:e.target.value}))}
                      placeholder="Age" className="input-field"/>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Education</label>
                  <input value={form.education} onChange={e => setForm(f=>({...f,education:e.target.value}))}
                    placeholder="e.g. LLB, MBA" className="input-field"/>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Bio</label>
                  <textarea value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))}
                    placeholder="Short biography…" rows={3} className="input-field resize-none"/>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Social Handles</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Facebook URL</label>
                      <input value={form.facebookUrl} onChange={e => setForm(f=>({...f,facebookUrl:e.target.value}))}
                        placeholder="https://facebook.com/..." className="input-field text-xs"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Twitter URL</label>
                      <input value={form.twitterUrl} onChange={e => setForm(f=>({...f,twitterUrl:e.target.value}))}
                        placeholder="https://twitter.com/..." className="input-field text-xs"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Instagram URL</label>
                      <input value={form.instagramUrl} onChange={e => setForm(f=>({...f,instagramUrl:e.target.value}))}
                        placeholder="https://instagram.com/..." className="input-field text-xs"/>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">YouTube URL</label>
                      <input value={form.youtubeUrl} onChange={e => setForm(f=>({...f,youtubeUrl:e.target.value}))}
                        placeholder="https://youtube.com/..." className="input-field text-xs"/>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 flex gap-3 justify-end bg-slate-50 rounded-b-2xl">
                <button onClick={handleClose} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                  {saving ? 'Saving…' : <><Check size={14}/> {editId ? 'Save Changes' : 'Add Candidate'}</>}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
