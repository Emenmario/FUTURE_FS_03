import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#1c1c1c] text-white selection:bg-white selection:text-black">
        
        {localStorage.getItem('token') && (
          <nav className="p-4 flex justify-end">
            <button 
              onClick={logout}
              className="text-xs border border-white px-3 py-1 hover:bg-white hover:text-black transition-all font-bold"
            >
              LOGOUT
            </button>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<Login />} />
          
          <Route 
            path="/staff" 
            element={
              <ProtectedRoute allowedRole="staff">
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;