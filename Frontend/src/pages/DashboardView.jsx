import React, { useState, useEffect } from 'react';
import { HeartPulse, CheckCircle2, ShieldCheck, Clock, ServerCrash, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import MetricCard from '../components/MetricCard';

export default function DashboardView() {
  const [metrics, setMetrics] = useState({ health: 0, passRate: 0, coverage: 0, mttr: 0 });
  const [backendStatus, setBackendStatus] = useState("Connecting...");

  // Mock historical data (Later, Spring Boot will send this array!)
  const performanceHistory = [
    { build: 'v1.0.1', health: 75, coverage: 45 },
    { build: 'v1.0.2', health: 82, coverage: 52 },
    { build: 'v1.0.3', health: 78, coverage: 55 },
    { build: 'v1.0.4', health: 89, coverage: 65 },
    { build: 'v1.0.5', health: 92, coverage: 70 },
    { build: 'v1.0.6', health: 95, coverage: 74 },
    { build: 'v1.0.7', health: 98, coverage: 76 },
  ];

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/system/status');
        if (response.ok) {
          const data = await response.json();
          setBackendStatus(data.status);
          setMetrics(prev => ({ ...prev, health: data.healthScore }));
        } else {
          setBackendStatus("API Error");
        }
      } catch (error) {
        setBackendStatus("Disconnected");
      }
    };
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">System Telemetry</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time CI/CD metrics and pipeline health.</p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-md ${
          backendStatus === 'Online' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {backendStatus === 'Online' ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> : <ServerCrash className="w-3 h-3" />}
          <span className="text-xs font-medium uppercase tracking-wide">Backend: {backendStatus}</span>
        </div>
      </div>

      {/* Top 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="System Health" value={`${metrics.health}/100`} trend="up" trendValue="Live" icon={HeartPulse} />
        <MetricCard title="Build Pass Rate" value="98.5%" trend="up" trendValue="Live" icon={CheckCircle2} />
        <MetricCard title="AST Coverage" value="76.2%" trend="up" trendValue="Live" icon={ShieldCheck} />
        <MetricCard title="MTTR (AI)" value="1.2m" trend="up" trendValue="Live" icon={Clock} />
      </div>

      {/* NEW: Recharts Graph Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-medium text-white">Quality Trends over Last 7 Builds</h2>
        </div>
        
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="build" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              
              {/* Custom Dark Mode Tooltip */}
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              
              {/* The Data Lines */}
              <Line type="monotone" name="System Health Score" dataKey="health" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line type="monotone" name="Test Coverage %" dataKey="coverage" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}