'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/lib/utils';

interface Props { height?: number; }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; short_name: string; color: string; seats: number; total_votes: number } }> }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm shadow-xl">
        <div className="font-bold text-slate-900 mb-1">{d.short_name}</div>
        <div className="text-slate-500 text-xs">{d.name}</div>
        <div className="mt-2 space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Seats</span>
            <span className="font-bold text-slate-800">{d.seats}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Votes</span>
            <span className="font-bold text-slate-800">{formatNumber(d.total_votes || 0)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function PartyBarChart({ height = 280 }: Props) {
  const { activeElection } = useApp();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    if (activeElection.id) {
      fetch(`/api/parties?electionId=${activeElection.id}`)
        .then(r => r.json())
        .then(d => {
          const parties = (d.parties || []).sort((a: any, b: any) => b.seats - a.seats);
          setData(parties);
        })
        .catch(() => {});
    }
  }, [activeElection.id]);

  if (!data.length) return <div className="flex items-center justify-center h-full text-slate-400 text-sm">No data</div>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis dataKey="short_name" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} interval={0} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
        <Bar dataKey="seats" radius={[6, 6, 0, 0]} maxBarSize={52}>
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || '#16a34a'} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
