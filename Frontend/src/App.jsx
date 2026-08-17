import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { 
  Activity, Bell, LogOut, ArrowUpRight, ArrowDownRight, 
  HeartPulse, CheckCircle2, ShieldCheck, Clock, Database, 
  Code, Terminal, Plus, GitBranch, Server, FolderGit2, 
  Key, AlertTriangle, XCircle, Search 
} from 'lucide-react';
import AuthPage from './pages/AuthPage';

const GOOGLE_CLIENT_ID = "966371595177-moqoklvcu7rmjiq51dt4qef74ssp9n55.apps.googleusercontent.com";

// ---------------------------------------------------------
// 1. Reusable Components
// ---------------------------------------------------------
function MetricCard({ title, value, trend, trendValue, icon: Icon }) {
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

// ---------------------------------------------------------
// 2. Page Views
// ---------------------------------------------------------

function DashboardView() {
  const [metrics, setMetrics] = useState({
    health: 94,
    passRate: 98.5,
    coverage: 76.2,
    mttr: 1.2
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => {
        const healthChange = Math.floor(Math.random() * 3) - 1; 
        const passRateChange = (Math.random() * 0.4 - 0.2); 
        const coverageChange = (Math.random() * 0.2 - 0.1); 
        const mttrChange = (Math.random() * 0.2 - 0.1); 

        return {
          health: Math.min(100, Math.max(80, prev.health + healthChange)),
          passRate: Math.min(100, Math.max(90, prev.passRate + passRateChange)),
          coverage: Math.min(100, Math.max(60, prev.coverage + coverageChange)),
          mttr: Math.max(0.5, prev.mttr + mttrChange)
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">System Telemetry</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time CI/CD metrics and pipeline health.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-xs font-medium text-emerald-400 uppercase tracking-wide">Live Stream Active</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="System Health" value={`${metrics.health}/100`} trend={metrics.health >= 90 ? "up" : "down"} trendValue="Live" icon={HeartPulse} />
        <MetricCard title="Build Pass Rate" value={`${metrics.passRate.toFixed(1)}%`} trend={metrics.passRate >= 95 ? "up" : "down"} trendValue="Live" icon={CheckCircle2} />
        <MetricCard title="AST Coverage" value={`${metrics.coverage.toFixed(1)}%`} trend="up" trendValue="Live" icon={ShieldCheck} />
        <MetricCard title="MTTR (AI)" value={`${metrics.mttr.toFixed(1)}m`} trend="up" trendValue="Live" icon={Clock} />
      </div>
    </div>
  );
}
function ASTTestGeneratorView() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    // Simulate the time it takes for the backend to parse AST and call the AI
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowResults(true);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">AST Parser & AI Test Gen</h1>
          <p className="text-sm text-slate-400 mt-1">Analyze source code structure and automatically generate unit tests.</p>
        </div>
        {!isAnalyzing && !showResults && (
          <button 
            onClick={handleRunAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors shadow-lg shadow-blue-900/20"
          >
            <Activity className="w-4 h-4" />
            Run Full Analysis
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Target File/Repo Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
            <h2 className="text-sm font-medium text-white flex items-center gap-2 mb-4">
              <FolderGit2 className="w-4 h-4 text-blue-400" /> Active Target
            </h2>
            <div className="bg-slate-950 border border-slate-800 rounded p-3 mb-4">
              <div className="text-xs text-slate-500 mb-1">Repository</div>
              <div className="text-sm text-slate-300 font-mono truncate">github.com/company/ecommerce-java</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded p-3">
              <div className="text-xs text-slate-500 mb-1">Target Class</div>
              <div className="text-sm text-slate-300 font-mono text-blue-400">PaymentController.java</div>
            </div>
          </div>

          {isAnalyzing && (
            <div className="bg-slate-900 border border-blue-500/30 rounded-lg p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1 bg-blue-500 w-full animate-pulse"></div>
              <h2 className="text-sm font-medium text-white mb-3">AI Engine Running...</h2>
              <ul className="space-y-3 text-xs text-slate-400">
                <li className="flex items-center gap-2 text-blue-400"><Code className="w-3.5 h-3.5" /> Parsing Abstract Syntax Tree...</li>
                <li className="flex items-center gap-2"><Activity className="w-3.5 h-3.5" /> Calculating Cyclomatic Complexity...</li>
                <li className="flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Generating JUnit Edge Cases...</li>
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: AI Output */}
        <div className="lg:col-span-2">
          {showResults ? (
            <div className="bg-slate-900 border border-emerald-500/30 rounded-lg overflow-hidden h-full">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <h2 className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Tests Generated Successfully
                </h2>
                <span className="text-xs font-mono text-slate-500">PaymentControllerTest.java</span>
              </div>
              <div className="p-5">
                <div className="mb-4 flex gap-4">
                  <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded flex-1">
                    <div className="text-xs text-slate-500">AST Complexity Score</div>
                    <div className="text-lg font-semibold text-white">12 (Moderate)</div>
                  </div>
                  <div className="px-3 py-2 bg-slate-950 border border-slate-800 rounded flex-1">
                    <div className="text-xs text-slate-500">Test Cases Created</div>
                    <div className="text-lg font-semibold text-white">4 Paths Covered</div>
                  </div>
                </div>
                
                {/* Mock Code Block */}
                <div className="relative rounded-md bg-[#1e1e1e] border border-slate-800 p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-slate-300 leading-relaxed">
<span className="text-blue-400">@Test</span><br/>
<span className="text-blue-400">public void</span> <span className="text-yellow-200">testProcessPayment_Success</span>() {"{"}<br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Arrange (AI Generated via AST)</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;PaymentRequest req = <span className="text-blue-400">new</span> PaymentRequest(<span className="text-emerald-400">"1234"</span>, <span className="text-orange-300">150.00</span>);<br/>
&nbsp;&nbsp;&nbsp;&nbsp;when(mockStripeClient.charge(any())).thenReturn(PaymentStatus.SUCCESS);<br/><br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Act</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;ResponseEntity&lt;?&gt; response = paymentController.process(req);<br/><br/>
&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500">// Assert</span><br/>
&nbsp;&nbsp;&nbsp;&nbsp;assertEquals(HttpStatus.OK, response.getStatusCode());<br/>
{"}"}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Code className="w-12 h-12 mb-4 text-slate-700" />
              <h3 className="text-sm font-medium text-slate-400 mb-1">Awaiting Execution</h3>
              <p className="text-xs">Click "Run Full Analysis" to parse the repository and generate tests.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function QualityLogsView() {
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

function ProjectSetupView() {
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

// ---------------------------------------------------------
// 3. Navigation Header Component
// ---------------------------------------------------------
function TopNavigation({ user, onLogout }) {
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

// ---------------------------------------------------------
// 4. Main Application Wrapper
// ---------------------------------------------------------
export default function App() {
  // Set to true to bypass login during development
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [user, setUser] = useState({ name: "Dev Admin" });

  if (!isAuthenticated) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthPage onLoginSuccess={(userData) => {
          setUser(userData);
          setIsAuthenticated(true);
        }} />
      </GoogleOAuthProvider>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col">
        <TopNavigation user={user} onLogout={() => {
          setIsAuthenticated(false);
          setUser(null);
        }} />
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/test-gen" element={<ASTTestGeneratorView />} />
            <Route path="/logs" element={<QualityLogsView />} />
            <Route path="/setup" element={<ProjectSetupView />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}