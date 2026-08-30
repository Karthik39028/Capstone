import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import your new separate files
import AuthPage from './pages/AuthPage';
import TopNavigation from './components/TopNavigation';
import DashboardView from './pages/DashboardView';
import ASTTestGeneratorView from './pages/ASTTestGeneratorView';
import QualityLogsView from './pages/QualityLogsView';
import ProjectSetupView from './pages/ProjectSetupView';

const GOOGLE_CLIENT_ID = "966371595177-moqoklvcu7rmjiq51dt4qef74ssp9n55.apps.googleusercontent.com";

export default function App() {
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