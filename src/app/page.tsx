'use client';

import React, { useState, useEffect } from 'react';
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
  const secondary = posts.slice(1, 4);
  const grid = posts.slice(4);
  const allYears = ['All', ...years];
  const allCategories = ['All', ...categories];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Navbar />

      {posts.length > 0 && (
        <div className="bg-slate-900 border-b border-slate-700 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 flex items-stretch">
            <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 flex items-center shrink-0 gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse inline-block" />
              Breaking
            </div>
            <div className="overflow-hidden flex-1">
              <div className="flex animate-ticker whitespace-nowrap py-2 gap-10 text-slate-300 text-xs font-medium">
                {[...posts.slice(0, 6), ...posts.slice(0, 6)].map((p, i) => (
                  <Link key={i} href={`/news/${p.slug}`} className="hover:text-white transition-colors shrink-0 flex items-center gap-2">
                    <span className="text-slate-500">·</span>{p.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Independent Election Observation &amp; Reporting</p>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            <Link href="/dashboard" className="hover:text-green-700 transition-colors">Dashboard</Link>
            <span className="text-slate-200">|</span>
            <Link href="/results" className="hover:text-green-700 transition-colors">Live Results</Link>
            <span className="text-slate-200">|</span>
            <Link href="/about" className="hover:text-green-700 transition-colors">About</Link>
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center border-b border-slate-100 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2.5 shrink-0 border-r border-slate-100">Year</span>
            {allYears.map(y => (
              <button key={y} onClick={() => setActiveYear(y)}
                className={`shrink-0 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                  activeYear === y ? 'border-amber-500 text-amber-700' : 'border-transparent text-slate-400 hover:text-slate-800'
                }`}>
                {y}
              </button>
            ))}
          </div>
          <div className="flex items-center overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-2.5 shrink-0 border-r border-slate-100">Topic</span>
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 -mb-px ${
                  activeCategory === cat ? 'border-green-600 text-green-700' : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {(activeYear !== 'All' || activeCategory !== 'All') && (
        <div className="max-w-7xl mx-auto px-4 pt-5 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-slate-500 font-semibold">Filtered by:</span>
          {activeYear !== 'All' && (
            <span className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
              {activeYear}
              <button onClick={() => setActiveYear('All')} className="hover:text-red-500 transition-colors ml-0.5">&#x2715;</button>
            </span>
          )}
          {activeCategory !== 'All' && (
            <span className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
              {activeCategory}
              <button onClick={() => setActiveCategory('All')} className="hover:text-red-500 transition-colors ml-0.5">&#x2715;</button>
            </span>
          )}
          <button onClick={() => { setActiveYear('All'); setActiveCategory('All'); }}
            className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors underline">
            Clear all
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-200 rounded w-1/4" />
                  <div className="h-5 bg-slate-200 rounded w-full" />
                  <div className="h-5 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">&#128240;</div>
            <p className="text-slate-400 text-lg font-semibold">No stories found</p>
            <p className="text-slate-400 text-sm mt-1">
              {activeYear !== 'All' || activeCategory !== 'All' ? 'Try adjusting your filters.' : 'Check back soon for the latest updates.'}
            </p>
            {(activeYear !== 'All' || activeCategory !== 'All') && (
              <button onClick={() => { setActiveYear('All'); setActiveCategory('All'); }}
                className="mt-4 text-sm font-bold text-green-700 hover:underline">
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {featured && (
              <div className="grid lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2">
                  <FeaturedCard post={featured} />
                </div>
                <div className="flex flex-col gap-1 bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2 pt-1 pb-2 border-b border-slate-100">Top Stories</p>
                  {secondary.map(p => <SideCard key={p.id} post={p} />)}
                  {secondary.length === 0 && (
                    <p className="text-xs text-slate-400 p-4 text-center">More stories coming soon</p>
                  )}
                </div>
              </div>
            )}
            {grid.length > 0 && (
              <>
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-1 h-px bg-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">More Stories</span>
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {grid.map(p => <GridCard key={p.id} post={p} />)}
                </div>
              </>
            )}
            <div className="text-center mt-12">
              <Link href="/news" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-sm font-black uppercase tracking-widest rounded-full hover:bg-green-700 transition-colors">
                View All Stories &#x2192;
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
