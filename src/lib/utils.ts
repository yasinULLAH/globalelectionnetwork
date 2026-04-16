import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { PARTIES } from './mockData';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function formatNumberFull(n: number): string {
  return n.toLocaleString('en-PK');
}

export function formatPercent(n: number, decimals = 1): string {
  return n.toFixed(decimals) + '%';
}

export function getPartyById(id: string) {
  return PARTIES.find(p => p.id === id);
}

export function getPartyColor(id: string): string {
  return getPartyById(id)?.color ?? '#6b7280';
}

export function getPartyName(id: string): string {
  return getPartyById(id)?.shortName ?? 'Unknown';
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function statusColor(status: string): string {
  switch (status) {
    case 'active': return 'text-green-400 bg-green-400/10 border-green-400/30';
    case 'inactive': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'pending': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
  }
}

export function updateTypeColor(type: string): string {
  switch (type) {
    case 'result': return 'bg-blue-500/20 text-blue-300 border-l-blue-500';
    case 'milestone': return 'bg-green-500/20 text-green-300 border-l-green-500';
    case 'alert': return 'bg-red-500/20 text-red-300 border-l-red-500';
    case 'update': return 'bg-slate-500/20 text-slate-300 border-l-slate-400';
    default: return 'bg-slate-500/20 text-slate-300 border-l-slate-400';
  }
}

export function updateTypeIcon(type: string): string {
  switch (type) {
    case 'result': return '📊';
    case 'milestone': return '🎯';
    case 'alert': return '⚠️';
    case 'update': return '🔄';
    default: return '📌';
  }
}

export function leadPercent(leadVotes: number, totalVotes: number): number {
  if (!totalVotes) return 0;
  return Math.round((leadVotes / totalVotes) * 100);
}
