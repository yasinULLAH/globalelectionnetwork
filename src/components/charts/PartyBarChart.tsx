'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PARTIES } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

interface Props { height?: number; }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; shortName: string; color: string; seats: number; totalVotes: number } }> }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="glass-card border border-slate-600/40 p-3 text-sm shadow-xl">
        <div className="font-bold text-slate-900 mb-1">{d.shortName}</div>
        <div className="text-slate-500 text-xs">{d.name}</div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Seats</span>
            <span className="font-bold text-slate-800">{d.seats}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Votes</span>
            <span className="font-bold text-slate-800">{formatNumber(d.totalVotes)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PartyBarChart({ height = 280 }: Props) {
  const data = PARTIES.filter(p => p.seats > 0).sort((a, b) => b.seats - a.seats);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="shortName" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="seats" radius={[6, 6, 0, 0]} maxBarSize={52}>
          {data.map(entry => (
            <Cell key={entry.id} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
