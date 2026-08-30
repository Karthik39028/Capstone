import React from 'react';
import { Search, Database, CheckCircle2, AlertTriangle, XCircle, GitBranch } from 'lucide-react';

export default function QualityLogsView() {
  const mockLogs = [
    { id: 1, timestamp: '2026-08-11 10:30:00', type: 'AST Analysis', status: 'warning', message: 'High cyclomatic complexity found in OrderService.java', commit: 'a1b2c3d' },
    { id: 2, timestamp: '2026-08-11 10:28:15', type: 'JUnit Gen', status: 'success', message: 'Generated 42 test cases for PaymentController.java', commit: 'a1b2c3d' },
    { id: 3, timestamp: '2026-08-11 09:15:22', type: 'System Build', status: 'failed', message: 'Pipeline failed: NullPointerException in AuthFilter', commit: 'f9e8d7c' },
    { id: 4, timestamp: '2026-08-10 16:45:00', type: 'AST Analysis', status: 'success', message: 'Static analysis complete. 0 critical vulnerabilities.', commit: 'b4a5d6e' },
    { id: 5, timestamp: '2026-08-10 16:40:10', type: 'Security Scan', status: 'warning', message: 'Deprecated Spring Security dependency detected.', commit: 'b4a5d6e' },
  ];

  const renderStatus = (status) => {
    switch(status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Passed
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Anomaly
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Quality Assurance Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Historical AST parsing anomalies and automated test results.</p>
        </div>
        <div className="relative w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </div>
          <input type="text" placeholder="Search logs, commits..." className="block w-full pl-9 pr-3 py-1.5 border border-slate-700 rounded-md bg-slate-900 text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500 sm:text-sm" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2 bg-slate-950/30">
          <Database className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-medium text-slate-300">System Incident Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950/50 border-b border-slate-800 text-xs uppercase text-slate-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Process Type</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Event Description</th>
                <th className="px-6 py-3 text-right">Commit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-300 whitespace-nowrap">{log.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{renderStatus(log.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{log.message}</td>
                  <td className="px-6 py-4 text-sm text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-slate-400 hover:text-blue-400 cursor-pointer transition-colors font-mono text-xs bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      <GitBranch className="w-3 h-3" /> {log.commit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}