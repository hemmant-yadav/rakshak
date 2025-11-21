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
          <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
            <Navbar />
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
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

