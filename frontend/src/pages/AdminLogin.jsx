import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        username,
        password
      });

      // ✅ FIXED PART (IMPORTANT)
      localStorage.setItem('adminToken', res.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: username,
          role: res.data.role
        })
      );

      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative admin-portal" style={{ background: 'linear-gradient(135deg, #FAF8F5 0%, #F5F0E8 50%, #EDE8DD 100%)' }}>
      {/* Subtle decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.1), transparent 60%)' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img src="/b2-admin-logo.svg" alt="B2 Bridal Studio" style={{ width: 72, height: 72, objectFit: 'contain', filter: 'drop-shadow(0 2px 12px rgba(212,175,55,0.2))' }} />
          <h2 className="mt-4 text-2xl font-extrabold tracking-wide uppercase font-cinzel" style={{ color: '#1a1a1a' }}>
            Admin Portal
          </h2>
          <p className="mt-1 text-sm font-cormorant italic" style={{ color: '#666' }}>
            Sign in to manage services and bookings
          </p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-xl" style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
          {error && (
            <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-sm mb-5 text-center font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide mb-2 text-gray-700">Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-cinzel font-semibold uppercase tracking-wide mb-2 text-gray-700">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all text-sm"
                  placeholder="Enter admin password"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-cinzel text-sm font-bold tracking-wider uppercase transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #D4AF37, #C9A227)', color: '#fff', boxShadow: '0 4px 16px rgba(212,175,55,0.3)' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Attribution Footer */}
      <footer className="absolute bottom-4 left-0 right-0 text-center text-[0.65rem] tracking-wide" style={{ color: '#888' }}>
        Powered by{' '}
        <a 
          href="https://cenexasystems.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="font-semibold hover:underline transition-all duration-300" 
          style={{ color: '#D4AF37' }}
        >
          Cenexa Systems
        </a>{' '}
        © 2026
      </footer>
    </div>
  );
};

export default AdminLogin;