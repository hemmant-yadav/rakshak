import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password);
      
      if (result.success) {
        // Redirect based on role
        const user = JSON.parse(localStorage.getItem('user'));
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'moderator') {
          navigate('/moderator');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-400 via-violet-500 to-amber-400 ring-2 ring-slate-900/70 shadow-lg shadow-sky-500/40 mb-6">
            <span className="text-xl font-black tracking-wider uppercase text-slate-900">
              Rk
            </span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
            Welcome Back
          </h1>
          <p className="text-lg text-slate-300 text-readable-sm">
            Access the Rakshak command center
          </p>
        </div>

        {/* Login Form */}
        <div className="card-enhanced rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-base transition-all"
                  placeholder="Enter your username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 placeholder-slate-400 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-base transition-all"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-500/20 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-lg text-sm font-medium">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center items-center gap-3 py-4 px-6 text-base font-semibold rounded-lg min-h-[56px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin text-lg">⟳</div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>🔐</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8 pt-6 border-t border-slate-600/50">
            <p className="text-sm text-slate-400 text-center mb-4">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-600/30">
                <div className="font-semibold text-slate-200 mb-1">Admin</div>
                <div className="text-slate-400">admin / admin123</div>
              </div>
              <div className="bg-slate-800/30 rounded-lg p-3 border border-slate-600/30">
                <div className="font-semibold text-slate-200 mb-1">Moderator</div>
                <div className="text-slate-400">moderator / mod123</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

