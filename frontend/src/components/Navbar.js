import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="backdrop-blur bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Rakshak
            </Link>
            <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link to="/" className="px-3 py-2 rounded-md hover:text-slate-900 dark:hover:text-white">
                Dashboard
              </Link>
              <Link to="/incidents" className="px-3 py-2 rounded-md hover:text-slate-900 dark:hover:text-white">
                Incidents
              </Link>
              <Link to="/report" className="px-3 py-2 rounded-md hover:text-slate-900 dark:hover:text-white">
                Report
              </Link>
              <Link to="/map" className="px-3 py-2 rounded-md hover:text-slate-900 dark:hover:text-white">
                Map
              </Link>
              <Link to="/contacts" className="px-3 py-2 rounded-md hover:text-slate-900 dark:hover:text-white">
                Contacts
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    Admin
                  </Link>
                )}
                {(user.role === 'moderator' || user.role === 'admin') && (
                  <Link
                    to="/moderator"
                    className="px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    Moderator
                  </Link>
                )}
                <span className="text-sm text-slate-600 dark:text-slate-300">Welcome, {user.username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-sm font-medium bg-slate-900 text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

