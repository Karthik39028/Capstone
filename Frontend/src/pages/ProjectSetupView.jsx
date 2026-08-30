import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, GitBranch, Server } from 'lucide-react';

export default function ProjectSetupView() {
  const navigate = useNavigate();
  const handleConnect = (e) => {
    e.preventDefault();
    setTimeout(() => navigate('/'), 1000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Register Target System</h1>
        <p className="text-sm text-slate-400 mt-1">Connect your backend engine and source code for monitoring.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm">
        <div className="px-6 py-5 border-b border-slate-800">
          <h2 className="text-base font-medium text-white">System Configuration</h2>
        </div>
        
        <form onSubmit={handleConnect} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Project Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FolderGit2 className="h-4 w-4 text-slate-500" />
              </div>
              <input type="text" required placeholder="e.g., E-Commerce Spring Boot" className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">GitHub Repository URL</label>
            <p className="text-xs text-slate-500 mb-2">Used for static AST parsing and automated JUnit test generation.</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <GitBranch className="h-4 w-4 text-slate-500" />
              </div>
              <input type="url" required placeholder="https://github.com/company/backend-repo" className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Live Backend Address</label>
            <p className="text-xs text-slate-500 mb-2">The root URL of your running backend (e.g., Spring Boot server). We will auto-detect the /actuator metrics.</p>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Server className="h-4 w-4 text-slate-500" />
              </div>
              <input type="url" required placeholder="http://localhost:8080" className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 sm:text-sm" />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors">
              Connect Target System
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}