'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PARTIES } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

interface Props { height?: number; }

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; shortName: string; color: string; value: number } }> }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 text-sm shadow-lg">
        <div className="font-bold mb-1" style={{ color: d.color }}>{d.shortName}</div>
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
  const data = PARTIES.filter(p => p.seats > 0).map(p => ({
    ...p,
    value: p.totalVotes,
  }));

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
          nameKey="shortName"
        >
          {data.map(entry => (
            <Cell key={entry.id} fill={entry.color} fillOpacity={0.9} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}
