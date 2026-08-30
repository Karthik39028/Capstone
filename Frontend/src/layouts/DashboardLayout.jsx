import React from 'react';
import HeaderBar from '../components/HeaderBar';

export default function DashboardLayout({ children, user, onLogout }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
      
      {/* Background Glow Effects */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-900/10 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-cyan-900/10 rounded-full blur-[100px]" />
      </div>

      {/* The Top Navigation Bar */}
      <HeaderBar user={user} onLogout={onLogout} />

      {/* The Main Dashboard Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      
    </div>
  );
}