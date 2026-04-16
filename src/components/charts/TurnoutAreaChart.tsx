'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TURNOUT_DATA } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

interface Props { height?: number; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm shadow-lg">
        <div className="font-bold text-slate-700 mb-1">{label}</div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Turnout</span>
            <span className="font-bold text-sky-600">{payload[0]?.value?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Votes</span>
            <span className="font-bold text-brand-600">{formatNumber(payload[1]?.value ?? 0)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function TurnoutAreaChart({ height = 200 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={TURNOUT_DATA} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="turnoutGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="votesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} domain={[0, 70]} />
        <YAxis yAxisId="right" orientation="right" tick={false} axisLine={false} tickLine={false} width={0} />
        <Tooltip content={<CustomTooltip />} />
        <Area yAxisId="left" type="monotone" dataKey="turnout" stroke="#0ea5e9" strokeWidth={2} fill="url(#turnoutGrad)" dot={false} />
        <Area yAxisId="right" type="monotone" dataKey="votes" stroke="#22c55e" strokeWidth={2} fill="url(#votesGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
