import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, User, LogOut, TrendingUp, Calculator, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <TrendingUp color="#6366f1" size={32} />
          <span>MoneyMentor</span>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <User size={20} />
            <span>Profile</span>
          </Link>
          <Link to="/health" className="nav-item">
            <ShieldCheck size={20} />
            <span>Health Score</span>
          </Link>
          <Link to="/fire" className="nav-item">
            <TrendingUp size={20} />
            <span>FIRE Planner</span>
          </Link>
          <Link to="/tax" className="nav-item">
            <Calculator size={20} />
            <span>Tax Tools</span>
          </Link>
          <Link to="/chat" className="nav-item">
            <MessageSquare size={20} />
            <span>AI Mentor</span>
          </Link>
          <Link to="/portfolio" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Portfolio X-Ray</span>
          </Link>
          <Link to="/events" className="nav-item">
            <TrendingUp size={20} />
            <span>Life Events</span>
          </Link>
          <Link to="/couple" className="nav-item">
            <Heart size={20} />
            <span>Couple Plan</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.email?.[0].toUpperCase()}</div>
            <div className="user-details">
              <span className="user-email">{user?.email?.split('@')[0]}</span>
            </div>
          </div>
          <button onClick={handleSignOut} className="signout-btn">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
