import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ReportIncident from './pages/ReportIncident';
import MapView from './pages/MapView';
import AdminDashboard from './pages/AdminDashboard';
import ModeratorPanel from './pages/ModeratorPanel';
import Login from './pages/Login';
import EmergencyContacts from './pages/EmergencyContacts';
import AllIncidents from './pages/AllIncidents';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="page-shell text-slate-50">
            <Navbar />
            <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
              <div className="bg-glass noise-surface rounded-2xl sm:rounded-3xl stroke-border-gradient fade-in-up">
                <div className="px-4 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 md:py-8 lg:py-10">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/incidents" element={<AllIncidents />} />
                    <Route path="/report" element={<ReportIncident />} />
                    <Route path="/map" element={<MapView />} />
                    <Route path="/contacts" element={<EmergencyContacts />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute requiredRole="admin">
                          <AdminDashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/moderator"
                      element={
                        <PrivateRoute requiredRole="moderator">
                          <ModeratorPanel />
                        </PrivateRoute>
                      }
                    />
                  </Routes>
                </div>
              </div>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

