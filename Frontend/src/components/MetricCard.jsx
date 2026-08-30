import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function MetricCard({ title, value, trend, trendValue, icon: Icon }) {
  const isPositive = trend === 'up';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-800 rounded text-blue-400">
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
          isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trendValue}
        </div>
      </div>
      <div>
        <h3 className="text-slate-400 text-sm font-medium mb-1">{title}</h3>
        <div className="text-2xl font-semibold text-white">{value}</div>
      </div>
    </div>
  );
}