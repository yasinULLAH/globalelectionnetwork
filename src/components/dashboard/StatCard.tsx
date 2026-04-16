'use client';

import React from 'react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  sub?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red';
  trend?: number;
}

const colorMap = {
  blue:   { bg: 'from-sky-500/20 to-blue-600/10', border: 'border-sky-500/30', icon: 'bg-sky-500/20 text-sky-400', text: 'text-sky-400' },
  green:  { bg: 'from-green-500/20 to-emerald-600/10', border: 'border-green-500/30', icon: 'bg-green-500/20 text-green-400', text: 'text-green-400' },
  amber:  { bg: 'from-amber-500/20 to-yellow-600/10', border: 'border-amber-500/30', icon: 'bg-amber-500/20 text-amber-400', text: 'text-amber-400' },
  purple: { bg: 'from-purple-500/20 to-violet-600/10', border: 'border-purple-500/30', icon: 'bg-purple-500/20 text-purple-400', text: 'text-purple-400' },
  red:    { bg: 'from-red-500/20 to-rose-600/10', border: 'border-red-500/30', icon: 'bg-red-500/20 text-red-400', text: 'text-red-400' },
};

export default function StatCard({ title, value, suffix = '', prefix = '', decimals = 0, sub, icon, color, trend }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`glass-card bg-gradient-to-br ${c.bg} border ${c.border} p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300`}>
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center`}>
            {icon}
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
              <span>{trend >= 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`text-3xl font-bold text-white mb-1`}>
          <AnimatedCounter value={value} suffix={suffix} prefix={prefix} decimals={decimals} />
        </div>
        <div className="text-sm font-semibold text-slate-400">{title}</div>
        {sub && <div className={`text-xs mt-1 ${c.text}`}>{sub}</div>}
      </div>
    </div>
  );
}
