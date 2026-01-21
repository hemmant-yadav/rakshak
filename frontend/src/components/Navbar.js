import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkBase =
    'relative px-4 py-2.5 text-sm font-medium text-slate-200/90 hover:text-white transition-colors rounded-lg hover:bg-slate-800/50';

  const mobileNavLinkBase =
    'block px-4 py-3 text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors';

  return (
    <header className="sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-900/80 backdrop-blur-xl noise-surface">
          <div className="flex items-center justify-between h-16 lg:h-18 px-5 lg:px-6">
            <div className="flex items-center gap-4 lg:gap-8">
              <Link
                to="/"
                className="inline-flex items-center gap-3 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="inline-flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-400 via-violet-500 to-amber-400 ring-2 ring-slate-900/70 shadow-lg shadow-sky-500/40 group-hover:ring-glow transition-all">
                  <span className="text-sm font-black tracking-wider uppercase text-slate-900">
                    Rk
                  </span>
                </span>
                <div className="flex flex-col -space-y-1">
                  <span className="text-base lg:text-lg font-bold tracking-tight text-white">
                    Rakshak
                  </span>
                  <span className="hidden sm:block text-sm uppercase tracking-wider text-slate-400 font-medium">
                    Neighbourhood Safety
                  </span>
                </div>
              </Link>

              <div className="hidden lg:flex items-center gap-2 text-sm font-medium">
                <Link to="/" className={navLinkBase}>
                  Dashboard
                </Link>
                <Link to="/incidents" className={navLinkBase}>
                  Incidents
                </Link>
                <Link to="/report" className={navLinkBase}>
                  Report
                </Link>
                <Link to="/map" className={navLinkBase}>
                  Map
                </Link>
                <Link to="/contacts" className={navLinkBase}>
                  Contacts
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-3 lg:gap-4">
              {user ? (
                <>
                  <div className="hidden md:flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-600/50">
                      <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                        {user.role?.toUpperCase() || 'USER'}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-200 max-w-[140px] truncate">
                      {user.username}
                    </span>

                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="hidden xl:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/60 hover:bg-slate-700/80 text-slate-200 border border-slate-600/50 transition-colors"
                      >
                        Admin Panel
                      </Link>
                    )}
                    {(user.role === 'moderator' || user.role === 'admin') && (
                      <Link
                        to="/moderator"
                        className="hidden xl:inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-slate-800/50 hover:bg-slate-700/70 text-slate-200 border border-slate-600/40 transition-colors"
                      >
                        Moderator
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white min-h-[40px]"
                    >
                      <span>Logout</span>
                    </button>
                  </div>

                  {/* Mobile user info */}
                  <div className="md:hidden flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-200 truncate max-w-[100px]">
                      {user.username}
                    </span>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="btn-primary inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white min-h-[40px]"
                >
                  <span>Login</span>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-600/80 bg-slate-800/60 text-slate-200 hover:text-white hover:bg-slate-700/80 transition-all"
                aria-label="Toggle menu"
              >
                <span className="text-xl font-bold">{mobileMenuOpen ? '✕' : '☰'}</span>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-700/80 px-5 py-4 space-y-2 animate-fade-in">
              <Link
                to="/"
                className={mobileNavLinkBase}
                onClick={() => setMobileMenuOpen(false)}
              >
                🏠 Dashboard
              </Link>
              <Link
                to="/incidents"
                className={mobileNavLinkBase}
                onClick={() => setMobileMenuOpen(false)}
              >
                📋 All Incidents
              </Link>
              <Link
                to="/report"
                className={mobileNavLinkBase}
                onClick={() => setMobileMenuOpen(false)}
              >
                ➕ Report Incident
              </Link>
              <Link
                to="/map"
                className={mobileNavLinkBase}
                onClick={() => setMobileMenuOpen(false)}
              >
                🗺️ Live Map
              </Link>
              <Link
                to="/contacts"
                className={mobileNavLinkBase}
                onClick={() => setMobileMenuOpen(false)}
              >
                📞 Emergency Contacts
              </Link>
              {user && (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      className={mobileNavLinkBase}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  {(user.role === 'moderator' || user.role === 'admin') && (
                    <Link
                      to="/moderator"
                      className={mobileNavLinkBase}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      👮 Moderator Panel
                    </Link>
                  )}
                  <div className="pt-2 border-t border-slate-700/50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-base font-semibold text-rose-400 hover:text-rose-300 hover:bg-slate-800/50 rounded-lg transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </>
              )}
              {!user && (
                <div className="pt-2 border-t border-slate-700/50">
                  <Link
                    to="/login"
                    className="btn-primary block text-center py-3 rounded-lg font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    🔐 Login
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;

