'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, Image as ImageIcon, Video, ArrowRight } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  video_url: string | null;
  author: string | null;
  category: string;
  status: string;
  published_at: string;
  created_at: string;
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  const fetchPosts = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? '/api/posts?status=published&limit=20' 
        : `/api/posts?status=published&category=${selectedCategory}&limit=20`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', 'news', 'blog', 'announcement', 'press'];

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #052e16 0%, #064e3b 45%, #0a6640 70%, #1a7a4a 100%)' }}>
        <div className="absolute inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="hero-title text-white mb-4">News & Updates</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Stay informed with the latest news, announcements, and updates from our election observation network.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Posts Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 animate-pulse">
                <div className="h-48 bg-slate-200 rounded-lg mb-4" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                <div className="h-20 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-slate-400 text-lg">No posts found</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`} className="group">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-all h-full flex flex-col">
                  {post.featured_image ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-white/90 backdrop-blur-sm text-slate-700">
                          {post.category}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <span className="text-slate-400">No image</span>
                    </div>
                  )}
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.published_at).toLocaleDateString()}</span>
                      {post.author && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 text-sm mb-4 line-clamp-3 flex-1">
                      {post.excerpt || post.content.substring(0, 150).replace(/<[^>]*>/g, '') + '...'}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        {post.featured_image && <ImageIcon className="w-3 h-3" />}
                        {post.video_url && <Video className="w-3 h-3" />}
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:gap-2 transition-all">
                        Read more
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
