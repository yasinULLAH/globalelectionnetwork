'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CATEGORY_COLORS: Record<string, string> = {
  elections: '#16a34a', analysis: '#2563eb', international: '#7c3aed',
  technology: '#0891b2', press: '#dc2626', news: '#16a34a',
  blog: '#2563eb', announcement: '#dc2626',
  'government meeting': '#d97706', meeting: '#d97706',
};

function categoryColor(cat: string) {
  return CATEGORY_COLORS[cat?.toLowerCase()] ?? '#64748b';
}

function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function FeaturedCard({ post }: { post: any }) {
  const color = categoryColor(post.category);
  return (
    <Link href={`/news/${post.slug}`} className="group block h-full">
      <article className="relative rounded-2xl overflow-hidden h-full min-h-[420px] shadow-xl">
        <img
          src={post.featured_image || `https://picsum.photos/seed/${post.slug}/900/600`}
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute top-5 left-5">
          <span className="text-[10px] font-black uppercase tracking-widest text-white px-2.5 py-1 rounded-full"
            style={{ background: color }}>
            {post.category}
          </span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h2 className="text-white font-black text-2xl sm:text-3xl leading-tight mb-3 group-hover:text-green-300 transition-colors line-clamp-3">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-white/75 text-sm leading-relaxed line-clamp-2 mb-4 max-w-xl">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 text-white/55 text-xs">
            {post.author && <span className="text-white/80 font-semibold">{post.author}</span>}
            {post.author && <span>·</span>}
            <span>{timeAgo(post.created_at)}</span>
            <span className="ml-auto text-white/70 font-semibold">Read full story →</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

function SideCard({ post }: { post: any }) {
  const color = categoryColor(post.category);
  return (
    <Link href={`/news/${post.slug}`} className="group flex gap-3.5 p-3 rounded-xl hover:bg-white transition-all duration-200 border border-transparent hover:border-slate-100 hover:shadow-sm">
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-slate-100">
        <img src={post.featured_image || `https://picsum.photos/seed/${post.slug}/200/200`} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded text-white inline-block mb-1"
          style={{ background: color }}>{post.category}</span>
        <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">{post.title}</h3>
        <p className="text-slate-400 text-[11px] mt-1">{timeAgo(post.created_at)}</p>
      </div>
    </Link>
  );
}

function GridCard({ post }: { post: any }) {
  const color = categoryColor(post.category);
  return (
    <Link href={`/news/${post.slug}`} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img src={post.featured_image || `https://picsum.photos/seed/${post.slug}x/600/400`} alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-[10px] font-black uppercase tracking-widest text-white px-2 py-1 rounded-full"
          style={{ background: color }}>{post.category}</span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-slate-900 text-sm leading-snug mb-2 group-hover:text-green-700 transition-colors line-clamp-2 flex-1">
          {post.title}
        </h3>
        {post.excerpt && <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">{post.excerpt}</p>}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
          <span className="text-[11px] text-slate-400">{timeAgo(post.created_at)}</span>
          {post.author && <span className="text-[11px] font-semibold text-slate-600">{post.author}</span>}
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeYear, setActiveYear] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [years, setYears] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/posts/filters')
      .then(r => r.json())
      .then(d => {
        if (d.years) setYears(d.years.map(String));
        if (d.categories) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ status: 'published', limit: '20' });
    if (activeYear !== 'All') params.set('year', activeYear);
    if (activeCategory !== 'All') params.set('category', activeCategory);
    fetch(`/api/posts?${params}`)
      .then(r => r.json())
      .then(d => { setPosts(d.posts || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [activeYear, activeCategory]);

  const featured = posts[0];
  const rest = posts.slice(1);
  const allYears = ['All', ...years];
  const allCategories = ['All', ...categories];

  const isFiltered = activeYear !== 'All' || activeCategory !== 'All';

  return (
    <div className="min-h-screen" style={{ background: '#f4f4ef' }}>
      <Navbar />

      {/* ── Breaking Ticker ── */}
      {posts.length > 0 && (
        <div className="bg-slate-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex items-stretch h-9">
            <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.15em] px-4 flex items-center gap-2 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Breaking
            </div>
            <div className="flex-1 overflow-hidden flex items-center">
              <div className="flex animate-ticker whitespace-nowrap gap-12 text-slate-300 text-xs font-medium">
                {[...posts.slice(0, 6), ...posts.slice(0, 6)].map((p, i) => (
                  <Link key={i} href={`/news/${p.slug}`} className="hover:text-white transition-colors shrink-0 flex items-center gap-2">
                    <span className="text-slate-600">&#9656;</span>{p.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #052e16 0%, #064e3b 50%, #065f46 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #4ade80 0%, transparent 50%), radial-gradient(circle at 80% 20%, #fbbf24 0%, transparent 40%)' }} />
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Live Coverage
                </span>
                <span className="text-white/40 text-xs hidden sm:block">
                  {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h1 className="text-white font-black text-3xl sm:text-5xl leading-tight mb-3 tracking-tight">
                Global Election<br />
                <span className="text-green-400">Network</span>
              </h1>
              <p className="text-white/60 text-sm sm:text-base max-w-lg leading-relaxed">
                Independent election observation, live monitoring, and credible reporting across Pakistan and beyond.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button onClick={() => newsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-white text-sm font-black uppercase tracking-widest rounded-full transition-colors">
                  Latest Stories
                </button>
                <Link href="/dashboard" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-black uppercase tracking-widest rounded-full transition-colors">
                  Live Dashboard
                </Link>
              </div>
            </div>
            <div className="hidden lg:grid grid-cols-2 gap-3 shrink-0">
              {[
                { icon: '&#128202;', label: 'Elections Monitored', value: '47' },
                { icon: '&#128065;', label: 'Active Observers', value: '280+' },
                { icon: '&#127758;', label: 'Countries', value: '12' },
                { icon: '&#128240;', label: 'Reports Published', value: '150+' },
              ].map(s => (
                <div key={s.label} className="bg-white/8 border border-white/15 rounded-2xl px-4 py-3 text-center min-w-[110px]">
                  <div className="text-xl mb-1" dangerouslySetInnerHTML={{ __html: s.icon }} />
                  <div className="text-white font-black text-xl leading-none">{s.value}</div>
                  <div className="text-white/50 text-[10px] font-semibold uppercase tracking-wide mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar (single clean row) ── */}
      <div ref={newsRef} className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none py-1">
            {/* Year pills */}
            <div className="flex items-center gap-1.5 pr-4 mr-4 border-r border-slate-200 shrink-0">
              {allYears.map(y => (
                <button key={y} onClick={() => setActiveYear(y)}
                  className={`shrink-0 px-3.5 py-1.5 text-[11px] font-black rounded-full transition-all ${
                    activeYear === y
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  {y}
                </button>
              ))}
            </div>
            {/* Category pills */}
            <div className="flex items-center gap-1.5">
              {allCategories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`shrink-0 px-3.5 py-1.5 text-[11px] font-black rounded-full transition-all whitespace-nowrap ${
                    activeCategory === cat
                      ? 'bg-green-600 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
            {/* Clear */}
            {isFiltered && (
              <button onClick={() => { setActiveYear('All'); setActiveCategory('All'); }}
                className="ml-auto shrink-0 text-[11px] font-bold text-red-500 hover:text-red-700 px-3 transition-colors">
                Clear &#x2715;
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── News Content ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-4 bg-slate-200 rounded w-full" />
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">&#128240;</div>
            <p className="text-slate-500 text-xl font-black mb-2">No stories found</p>
            <p className="text-slate-400 text-sm">{isFiltered ? 'Try adjusting your filters.' : 'Check back soon for updates.'}</p>
            {isFiltered && (
              <button onClick={() => { setActiveYear('All'); setActiveCategory('All'); }}
                className="mt-5 text-sm font-bold text-green-700 hover:underline">Clear filters</button>
            )}
          </div>
        ) : (
          <>
            {/* Featured hero + side stack */}
            {featured && (
              <div className="grid lg:grid-cols-5 gap-5 mb-8">
                {/* Big feature */}
                <div className="lg:col-span-3">
                  <FeaturedCard post={featured} />
                </div>
                {/* Side stack */}
                <div className="lg:col-span-2 flex flex-col gap-3">
                  {rest.slice(0, 3).map(p => (
                    <Link key={p.id} href={`/news/${p.slug}`} className="group flex gap-3 bg-white rounded-xl p-3 border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200">
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                        <img src={p.featured_image || `https://picsum.photos/seed/${p.slug}/200/200`} alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-white px-1.5 py-0.5 rounded inline-block mb-1.5"
                          style={{ background: categoryColor(p.category) }}>{p.category}</span>
                        <h3 className="text-slate-900 font-bold text-sm leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">{p.title}</h3>
                        <p className="text-slate-400 text-[11px] mt-1.5">{timeAgo(p.created_at)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* All remaining articles grid */}
            {rest.length > 3 && (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 px-2">More Stories</span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.slice(3).map(p => <GridCard key={p.id} post={p} />)}
                </div>
              </>
            )}

            <div className="text-center mt-10">
              <Link href="/news"
                className="inline-flex items-center gap-2 px-7 py-3 bg-slate-900 hover:bg-green-700 text-white text-xs font-black uppercase tracking-widest rounded-full transition-colors shadow-md">
                View All Stories &#x2192;
              </Link>
            </div>
          </>
        )}
      </div>

      {/* ── About GEN Section ── */}
      <section className="bg-white border-t border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-3 py-1 rounded-full">About GEN</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-4 leading-tight">
                Committed to<br />
                <span className="text-green-600">Transparent Elections</span>
              </h2>
              <p className="text-slate-500 leading-relaxed mb-5">
                The Global Election Network is an independent, non-partisan organisation dedicated to credible election observation, real-time monitoring, and transparent reporting. We operate across Pakistan and internationally to uphold democratic standards.
              </p>
              <p className="text-slate-500 leading-relaxed mb-8">
                Our trained observers, digital monitoring tools, and rigorous reporting standards ensure every vote is counted — and every irregularity is documented.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/about" className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-black uppercase tracking-widest rounded-full transition-colors">
                  Learn More
                </Link>
                <Link href="/results" className="px-5 py-2.5 border-2 border-slate-200 hover:border-green-600 text-slate-700 hover:text-green-700 text-sm font-black uppercase tracking-widest rounded-full transition-colors">
                  Live Results
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Elections Monitored', value: '47+', icon: '&#127937;', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
                { label: 'Field Observers', value: '280+', icon: '&#128065;', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                { label: 'Constituencies Covered', value: '342', icon: '&#127758;', color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
                { label: 'Reports Published', value: '150+', icon: '&#128214;', color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
              ].map(s => (
                <div key={s.label} className={`${s.color} border rounded-2xl p-5 text-center`}>
                  <div className="text-3xl mb-2" dangerouslySetInnerHTML={{ __html: s.icon }} />
                  <div className={`${s.text} font-black text-2xl leading-none`}>{s.value}</div>
                  <div className="text-slate-500 text-xs font-semibold mt-1.5 leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leadership strip */}
          <div className="mt-14 pt-10 border-t border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 text-center">Leadership</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { initials: 'NA', name: 'Naveed Ahmed', role: 'Executive Director', color: 'from-blue-600 to-blue-800' },
                { initials: 'AW', name: 'Abdul Wakeel', role: 'Director Digital', color: 'from-green-600 to-emerald-700' },
                { initials: 'AQ', name: 'Aliya Qaiser', role: 'Director Communications', color: 'from-purple-600 to-purple-800' },
                { initials: 'NB', name: 'Naeem Bajwa', role: 'Director Research', color: 'from-amber-500 to-amber-700' },
              ].map(m => (
                <div key={m.name} className="text-center">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-black text-base mx-auto mb-2.5 shadow-sm`}>
                    {m.initials}
                  </div>
                  <p className="font-black text-slate-900 text-sm">{m.name}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{m.role}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/about" className="text-sm font-semibold text-green-600 hover:text-green-700 hover:underline transition-colors">
                Meet the full team &#x2192;
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
