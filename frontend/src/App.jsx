import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import HealthScore from './pages/HealthScore';
import FIREPlanner from './pages/FIREPlanner';
import Chat from './pages/Chat';
import TaxCalculator from './pages/TaxCalculator';
import PortfolioXRay from './pages/Portfolio';
import LifeEvents from './pages/LifeEvents';
import CouplePlanner from './pages/CouplePlanner';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};
// ... rest of Dashboard and App routes
// ... rest of Dashboard and App routes


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          <Route path="/health" element={
            <PrivateRoute>
              <HealthScore />
            </PrivateRoute>
          } />
          <Route path="/fire" element={
            <PrivateRoute>
              <FIREPlanner />
            </PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          } />
          <Route path="/tax" element={
            <PrivateRoute>
              <TaxCalculator />
            </PrivateRoute>
          } />
          <Route path="/portfolio" element={
            <PrivateRoute>
              <PortfolioXRay />
            </PrivateRoute>
          } />
          <Route path="/events" element={
            <PrivateRoute>
              <LifeEvents />
            </PrivateRoute>
          } />
          <Route path="/couple" element={
            <PrivateRoute>
              <CouplePlanner />
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

// minor safe update 10
