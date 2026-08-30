import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Plus, LogOut } from 'lucide-react';

export default function TopNavigation({ user, onLogout }) {
  const location = useLocation();
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'AST & Test Gen', path: '/test-gen' },
    { name: 'Quality Logs', path: '/logs' }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="font-semibold text-white tracking-wide">DevPulse</span>
          </div>
          <nav className="hidden md:flex gap-1 border-l border-slate-800 pl-8">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.path ? 'bg-blue-500/10 text-blue-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}>
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/setup" className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-md hover:bg-blue-600/20 transition-colors text-xs font-medium">
            <Plus className="w-3.5 h-3.5" /> New Target
          </Link>
          <div className="h-5 w-px bg-slate-800 mx-2"></div>
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-slate-300">{user?.name || 'Admin'}</div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-400 p-1"><LogOut className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </header>
  );
}