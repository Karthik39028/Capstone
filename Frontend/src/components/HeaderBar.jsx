import React from 'react';
import { Activity, Bell, Search, LogOut } from 'lucide-react';

export default function HeaderBar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Logo & Project Status */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-500" />
            <span className="font-bold text-lg text-white tracking-tight">DevPulse</span>
          </div>
          
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm">
            <span className="text-slate-400">Target App:</span>
            <span className="font-medium text-slate-200">E-Commerce Backend</span>
            <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-400 font-mono tracking-wider">LIVE</span>
            </div>
          </div>
        </div>

        {/* Right: Search, Notifications, Profile */}
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950"></span>
          </button>

          <div className="h-6 w-px bg-slate-800 mx-2"></div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-cyan-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'SK'}
            </div>
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}