import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../utils/api';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const user = {
          id: data.user_id?.toString() || '1',
          username: data.username || username,
          email: `${username}@scanpilot.local`,
          is_admin: data.is_admin || false
        };
        
        login(data.access_token, user);
        console.log('Login successful:', user);
        
        // Navigate to dashboard after successful login
        navigate('/dashboard', { replace: true });
      } else {
        const errorData = await response.json();
        alert(errorData.detail || 'Invalid credentials!');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed! Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl animate-pulse"></div>
      
      <div className="relative z-10 w-full max-w-lg text-center">
        {!showLoginForm ? (
          /* Landing Page */
          <div className="space-y-8 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-2xl">
                  {/* Shield Icon */}
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                  {/* Activity Icon */}
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                Scan<span className="text-blue-400">Pilot</span>
              </h1>
              <p className="text-xl text-blue-200 mb-2">Security Scanning Management Platform</p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              <p className="text-lg text-white/90 max-w-md mx-auto leading-relaxed">
                A comprehensive platform for managing and executing security scanning tools 
                with automated workflows, real-time monitoring and efficient result management.
              </p>
              
              {/* Feature Icons */}
              <div className="flex justify-center space-x-8 mt-8">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur">
                    {/* Target Icon */}
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/70">Target Management</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur">
                    {/* Zap Icon */}
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/70">Real-time Scanning</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur">
                    {/* Activity Icon */}
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-sm text-white/70">Live Monitoring</span>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={() => setShowLoginForm(true)}
              className="group bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-12 rounded-full transition-all duration-300 flex items-center justify-center space-x-3 shadow-2xl mx-auto hover:scale-105 hover:shadow-3xl"
            >
              {/* Play Icon */}
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-lg">Get Started</span>
            </button>

            <p className="text-sm text-white/50 mt-6">
              Click to access the scanning management system
            </p>
          </div>
        ) : (
          /* Login Form */
          <div 
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl relative animate-slide-up"
          >
            {/* Back to Landing */}
            <button
              onClick={() => setShowLoginForm(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors hover:scale-110"
            >
              ×
            </button>

            {/* Login Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-tr from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {/* Shield Icon */}
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Login</h2>
              <p className="text-blue-200">Access ScanPilot</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username
                </label>
                <div className="relative">
                  {/* User Icon */}
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter username"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  {/* Lock Icon */}
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      /* Eye Off Icon */
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m-3-3l6.364 6.364M21 21l-6.364-6.364m0 0L12 12" />
                      </svg>
                    ) : (
                      /* Eye Icon */
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:scale-102"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <span>Login</span>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <p className="text-sm text-gray-300 mb-2">Default credentials:</p>
                <div className="flex justify-center space-x-4">
                  <code className="text-blue-400 bg-blue-900/30 px-2 py-1 rounded">l0gs3c</code>
                  <span className="text-white/50">/</span>
                  <code className="text-purple-400 bg-purple-900/30 px-2 py-1 rounded">l0gs3c</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;