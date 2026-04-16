'use client';
import { useState, useEffect, useCallback } from 'react';
import { FileText, Plus, Eye, EyeOff, Trash2, Edit3, Globe, ExternalLink, X, Check, AlertCircle, Navigation } from 'lucide-react';

interface Page {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_description: string;
  is_published: boolean;
  show_in_nav: boolean;
  created_at: string;
  updated_at: string;
}

const EMPTY: Omit<Page, 'id' | 'created_at' | 'updated_at'> = {
  title: '', slug: '', content: '', meta_description: '', is_published: false, show_in_nav: false,
};

const HTML_TEMPLATE = `<section style="max-width:800px;margin:0 auto;padding:2rem 1rem;font-family:system-ui,sans-serif">
  <h1 style="font-size:2rem;font-weight:900;color:#0f172a;margin-bottom:1rem">Page Title</h1>
  <p style="color:#475569;line-height:1.7;margin-bottom:1rem">
    Write your content here. You can use any HTML tags and inline styles.
  </p>
  <h2 style="font-size:1.3rem;font-weight:700;color:#1e293b;margin:1.5rem 0 0.75rem">Section Heading</h2>
  <ul style="color:#475569;line-height:2;padding-left:1.5rem">
    <li>First item</li>
    <li>Second item</li>
  </ul>
</section>`;

export default function AdminPagesPage() {
  const [pages, setPages]       = useState<Page[]>([]);
  const [editing, setEditing]   = useState<(Omit<Page, 'id' | 'created_at' | 'updated_at'> & { id?: string }) | null>(null);
  const [preview, setPreview]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [toast, setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    const res = await fetch('/api/pages');
    const data = await res.json();
    setPages(data.pages ?? []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch(
        isNew ? '/api/pages' : `/api/pages/${editing.slug}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: editing.title,
            slug: editing.slug,
            content: editing.content,
            metaDescription: editing.meta_description,
            isPublished: editing.is_published,
            showInNav: editing.show_in_nav,
          }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).error);
      showToast(isNew ? 'Page created!' : 'Page saved!');
      setEditing(null);
      load();
    } catch (e: unknown) {
      showToast((e as Error).message, false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm('Delete this page?')) return;
    setDeleting(slug);
    await fetch(`/api/pages/${slug}`, { method: 'DELETE' });
    showToast('Deleted');
    setDeleting(null);
    load();
  };

  const togglePublish = async (page: Page) => {
    await fetch(`/api/pages/${page.slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...page, meta_description: page.meta_description, isPublished: !page.is_published, showInNav: page.show_in_nav, metaDescription: page.meta_description }),
    });
    load();
  };

  return (
    <main className="p-4 sm:p-6 max-w-6xl">
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
              <FileText size={24} className="text-indigo-600" /> Pages
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">Create and manage public-facing content pages</p>
          </div>
          <button onClick={() => { setEditing({ ...EMPTY }); setPreview(false); }}
            className="btn-primary flex items-center gap-2">
            <Plus size={15} /> New Page
          </button>
        </div>

        {/* Editor Modal */}
        {editing && (
          <div className="fixed inset-0 z-40 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl my-4">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="font-black text-slate-800 text-lg">
                  {editing.id ? 'Edit Page' : 'New Page'}
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPreview(p => !p)}
                    className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${preview ? 'bg-indigo-600 text-white border-indigo-600' : 'border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                    {preview ? <><EyeOff size={13} /> Editor</> : <><Eye size={13} /> Preview</>}
                  </button>
                  <button onClick={() => setEditing(null)} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Title + Slug row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Page Title *</label>
                    <input value={editing.title} onChange={e => setEditing(prev => prev ? {
                      ...prev, title: e.target.value,
                      slug: prev.id ? prev.slug : autoSlug(e.target.value),
                    } : prev)}
                      placeholder="e.g. About Us"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">URL Slug *</label>
                    <div className="flex items-center gap-1 border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-indigo-400">
                      <span className="text-xs text-slate-400 font-mono">/p/</span>
                      <input value={editing.slug} onChange={e => setEditing(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                        placeholder="about-us"
                        className="flex-1 bg-transparent text-sm text-slate-900 focus:outline-none font-mono" />
                    </div>
                  </div>
                </div>

                {/* Meta description */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Meta Description (SEO)</label>
                  <input value={editing.meta_description} onChange={e => setEditing(prev => prev ? { ...prev, meta_description: e.target.value } : prev)}
                    placeholder="Brief description for search engines (150–160 characters)"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>

                {/* HTML Editor / Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600">HTML Content *</label>
                    {!editing.content && (
                      <button onClick={() => setEditing(prev => prev ? { ...prev, content: HTML_TEMPLATE } : prev)}
                        className="text-xs text-indigo-600 font-semibold hover:underline">
                        Insert template
                      </button>
                    )}
                  </div>

                  {preview ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white min-h-[400px]">
                      <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex items-center gap-2 text-xs text-slate-400 font-semibold">
                        <Globe size={12} /> Live Preview
                      </div>
                      <div className="p-4" dangerouslySetInnerHTML={{ __html: editing.content }} />
                    </div>
                  ) : (
                    <textarea value={editing.content}
                      onChange={e => setEditing(prev => prev ? { ...prev, content: e.target.value } : prev)}
                      rows={18}
                      placeholder={HTML_TEMPLATE}
                      className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y bg-slate-950 text-green-300" />
                  )}
                </div>

                {/* Options row */}
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setEditing(prev => prev ? { ...prev, is_published: !prev.is_published } : prev)}
                      className={`w-10 h-5 rounded-full transition-all relative ${editing.is_published ? 'bg-green-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editing.is_published ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setEditing(prev => prev ? { ...prev, show_in_nav: !prev.show_in_nav } : prev)}
                      className={`w-10 h-5 rounded-full transition-all relative ${editing.show_in_nav ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${editing.show_in_nav ? 'left-5' : 'left-0.5'}`} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">Show in Navigation</span>
                  </label>
                  {editing.slug && editing.is_published && (
                    <a href={`/p/${editing.slug}`} target="_blank" rel="noreferrer"
                      className="ml-auto flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:underline">
                      <ExternalLink size={12} /> View live
                    </a>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
                <button onClick={() => setEditing(null)} className="btn-ghost text-sm">Cancel</button>
                <button onClick={handleSave} disabled={saving || !editing.title || !editing.content}
                  className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  {saving ? 'Saving…' : <><Check size={14} /> Save Page</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pages Table */}
        <div className="card overflow-hidden">
          {pages.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">No pages yet</p>
              <p className="text-sm mt-1">Click &ldquo;New Page&rdquo; to create your first page</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Title</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">URL</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Nav</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Updated</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pages.map(page => (
                  <tr key={page.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{page.title}</td>
                    <td className="px-4 py-3.5">
                      <a href={`/p/${page.slug}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-indigo-600 hover:underline font-mono text-xs">
                        /p/{page.slug} <ExternalLink size={11} />
                      </a>
                    </td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => togglePublish(page)}
                        className={`badge ${page.is_published ? 'badge-forest' : 'bg-slate-100 text-slate-500'}`}>
                        {page.is_published ? '● Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3.5">
                      {page.show_in_nav
                        ? <span className="flex items-center gap-1 text-xs text-indigo-600 font-semibold"><Navigation size={11} /> Visible</span>
                        : <span className="text-xs text-slate-400">Hidden</span>}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-xs">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => { setEditing(page); setPreview(false); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(page.slug)} disabled={deleting === page.slug}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
    </main>
  );
}
