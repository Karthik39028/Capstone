import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function AuthPage({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // This simulates a successful login/signup for now. 
    // In production, this will connect to your actual backend database.
    onLoginSuccess({
      name: isLogin ? "Corporate User" : fullName || "New User",
      email: email || "admin@devpulse.com"
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-lg shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-8 pt-8 pb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center text-white mb-2">DevPulse Enterprise</h2>
          <p className="text-sm text-center text-slate-400">
            {isLogin ? 'Sign in to access telemetry' : 'Create an account to continue'}
          </p>
        </div>

        {/* Authentication Form */}
        <div className="px-8 pb-8">
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            
            {/* Full Name Field (Only visible on Sign Up) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="developer@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-md bg-slate-950 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors mt-2"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-900 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Google SSO Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                onLoginSuccess({
                  name: "Google User",
                  email: "google@devpulse.com"
                });
              }}
              onError={() => console.log('Login Failed')}
              theme="filled_black"
              shape="rectangular"
              text={isLogin ? "signin_with" : "signup_with"}
              width="320"
            />
          </div>
        </div>
        
        {/* Footer Toggle */}
        <div className="bg-slate-950 px-8 py-4 border-t border-slate-800 text-center">
          <p className="text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="font-medium text-blue-500 hover:text-blue-400 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
        
      </div>
    </div>
  );
}