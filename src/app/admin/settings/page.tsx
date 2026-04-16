'use client';
import { useState, useEffect, useCallback } from 'react';
import { Settings, Globe, Mail, Phone, MapPin, Facebook, Twitter, Youtube, Check, AlertCircle, Save } from 'lucide-react';

type Settings = Record<string, string>;

const SECTIONS = [
  {
    title: 'Site Identity',
    icon: Globe,
    fields: [
      { key: 'site_name',    label: 'Site Name',   type: 'text',     placeholder: 'Global Election Network' },
      { key: 'site_tagline', label: 'Tagline',      type: 'text',     placeholder: 'Transparent Elections…' },
    ],
  },
  {
    title: 'Footer — About Text',
    icon: Settings,
    fields: [
      { key: 'footer_about', label: 'About Paragraph', type: 'textarea', placeholder: 'A brief description shown in the footer…' },
    ],
  },
  {
    title: 'Contact Information',
    icon: Mail,
    fields: [
      { key: 'footer_email',   label: 'Email',   type: 'email', placeholder: 'info@gen.pk',           icon: Mail },
      { key: 'footer_phone',   label: 'Phone',   type: 'text',  placeholder: '+92-51-1234567',        icon: Phone },
      { key: 'footer_address', label: 'Address', type: 'text',  placeholder: 'F-8/1, Islamabad, PK', icon: MapPin },
    ],
  },
  {
    title: 'Social Media Links',
    icon: Globe,
    fields: [
      { key: 'footer_facebook', label: 'Facebook URL', type: 'url', placeholder: 'https://facebook.com/…', icon: Facebook },
      { key: 'footer_twitter',  label: 'Twitter/X URL',type: 'url', placeholder: 'https://twitter.com/…',  icon: Twitter },
      { key: 'footer_youtube',  label: 'YouTube URL',  type: 'url', placeholder: 'https://youtube.com/…',  icon: Youtube },
    ],
  },
  {
    title: 'Footer Column Titles',
    icon: Settings,
    fields: [
      { key: 'footer_links_col1_title', label: 'Column 1 Heading', type: 'text', placeholder: 'Quick Links' },
      { key: 'footer_links_col2_title', label: 'Column 2 Heading', type: 'text', placeholder: 'Resources' },
    ],
  },
  {
    title: 'Copyright & Legal',
    icon: Settings,
    fields: [
      { key: 'footer_copyright', label: 'Copyright Text', type: 'text', placeholder: '© 2024 Global Election Network. All rights reserved.' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({});
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [dirty, setDirty]       = useState(false);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setSettings(data.settings ?? {});
    setDirty(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      showToast('Settings saved!');
      setDirty(false);
    } catch (e: unknown) {
      showToast((e as Error).message, false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4 sm:p-6 max-w-4xl">
        {/* Toast */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
            {toast.ok ? <Check size={15} /> : <AlertCircle size={15} />}
            {toast.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Settings size={24} className="text-indigo-600" /> Site Settings
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Configure your site identity, footer content, and contact details</p>
          </div>
          {dirty && (
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 text-sm">
              {saving ? 'Saving…' : <><Save size={14} /> Save Changes</>}
            </button>
          )}
        </div>

        <div className="space-y-5">
          {SECTIONS.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.title} className="card p-6">
                <h2 className="flex items-center gap-2 font-black text-slate-700 text-sm uppercase tracking-wider mb-4">
                  <Icon size={15} className="text-indigo-500" />
                  {section.title}
                </h2>
                <div className="space-y-3">
                  {section.fields.map(field => (
                    <div key={field.key}>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea value={settings[field.key] ?? ''}
                          onChange={e => set(field.key, e.target.value)}
                          rows={4}
                          placeholder={field.placeholder}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y" />
                      ) : (
                        <input type={field.type}
                          value={settings[field.key] ?? ''}
                          onChange={e => set(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sticky save */}
        {dirty && (
          <div className="sticky bottom-4 mt-6 flex justify-end">
            <button onClick={handleSave} disabled={saving}
              className="btn-primary flex items-center gap-2 shadow-xl text-sm">
              {saving ? 'Saving…' : <><Save size={14} /> Save All Changes</>}
            </button>
          </div>
        )}
    </main>
  );
}
