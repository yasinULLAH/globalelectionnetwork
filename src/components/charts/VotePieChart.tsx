'use client';

import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useApp } from '@/context/AppContext';
import { formatNumber } from '@/lib/utils';

interface Props { height?: number; }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; short_name: string; color: string; value: number } }> }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm shadow-lg">
        <div className="font-bold mb-1" style={{ color: d.color }}>{d.short_name}</div>
        <div className="text-slate-600">{formatNumber(d.value)} votes</div>
      </div>
    );
  }
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderLegend = (props: any) => {
  const { payload } = props as { payload?: Array<{ value: string; color: string; payload: { seats: number } }> };
  return (
    <div className="flex flex-wrap gap-2 justify-center mt-2">
      {payload?.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-slate-700 font-semibold">{entry.value}</span>
          <span className="text-slate-400 ml-0.5">({entry.payload.seats})</span>
        </div>
      ))}
    </div>
  );
};

export default function VotePieChart({ height = 280 }: Props) {
  const { activeElection, candidates } = useApp();
  const [parties, setParties] = useState<any[]>([]);

  useEffect(() => {
    if (activeElection.id) {
      fetch(`/api/parties?electionId=${activeElection.id}`)
        .then(r => r.json())
        .then(d => setParties(d.parties || []))
        .catch(() => {});
    }
  }, [activeElection.id]);

  // Compute votes per party from candidates
  const data = parties.map(p => {
    const votes = candidates.filter(c => c.partyId === p.id).reduce((s, c) => s + (c.votes || 0), 0);
    return { ...p, value: votes, short_name: p.short_name || p.name };
  }).filter(p => p.value > 0);

  if (!data.length) return <div className="flex items-center justify-center h-full text-slate-400 text-sm">No vote data</div>;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
          nameKey="short_name"
        >
          {data.map((entry: any, i: number) => (
            <Cell key={i} fill={entry.color || '#16a34a'} fillOpacity={0.9} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}
