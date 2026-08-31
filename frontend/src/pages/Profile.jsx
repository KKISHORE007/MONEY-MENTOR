import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, User, DollarSign, TrendingUp, Target } from 'lucide-react';
import '../styles/Profile.css';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    monthly_income: '',
    monthly_expenses: '',
    current_savings: '',
    existing_loans: '',
    risk_appetite: 'Medium',
    financial_goals: []
  });

  useEffect(() => {
    if (user) getProfile();
  }, [user]);

  async function getProfile() {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setProfile({
          full_name: data.full_name || '',
          age: data.age || '',
          monthly_income: data.monthly_income || '',
          monthly_expenses: data.monthly_expenses || '',
          current_savings: data.current_savings || '',
          existing_loans: data.existing_loans || '',
          risk_appetite: data.risk_appetite || 'Medium',
          financial_goals: Array.isArray(data.financial_goals) ? data.financial_goals : (data.financial_goals ? JSON.parse(data.financial_goals) : [])
        });
      }
    } catch (error) {
      console.error('Error loading user data!', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...profile,
          financial_goals: JSON.stringify(profile.financial_goals)
        })
      });
      if (!res.ok) throw new Error('Update failed');
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Error updating the data!', error.message);
    } finally {
      setSaving(false);
    }
  }

  const handleGoalToggle = (goal) => {
    setProfile(prev => {
      const goals = prev.financial_goals.includes(goal)
        ? prev.financial_goals.filter(g => g !== goal)
        : [...prev.financial_goals, goal];
      return { ...prev, financial_goals: goals };
    });
  };

  if (loading) return <div className="loading-state">Loading your profile...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <User size={32} color="#6366f1" />
          <h1>Financial Profile</h1>
          <p>Tell us about your finances to get personalized advice</p>
        </div>

        <form onSubmit={updateProfile} className="profile-form">
          <div className="form-grid">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={profile.full_name} 
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder="John Doe"
              />
            </div>
            <div className="input-group">
              <label>Age</label>
              <input 
                type="number" 
                value={profile.age} 
                onChange={(e) => setProfile({...profile, age: e.target.value})}
                placeholder="25"
              />
            </div>
          </div>

          <div className="section-title">
            <DollarSign size={18} />
            <span>Monthly Finances</span>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Monthly Income</label>
              <input 
                type="number" 
                value={profile.monthly_income} 
                onChange={(e) => setProfile({...profile, monthly_income: e.target.value})}
                placeholder="50000"
              />
            </div>
            <div className="input-group">
              <label>Monthly Expenses</label>
              <input 
                type="number" 
                value={profile.monthly_expenses} 
                onChange={(e) => setProfile({...profile, monthly_expenses: e.target.value})}
                placeholder="20000"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="input-group">
              <label>Current Savings</label>
              <input 
                type="number" 
                value={profile.current_savings} 
                onChange={(e) => setProfile({...profile, current_savings: e.target.value})}
                placeholder="100000"
              />
            </div>
            <div className="input-group">
              <label>Existing Loans/Debts</label>
              <input 
                type="number" 
                value={profile.existing_loans} 
                onChange={(e) => setProfile({...profile, existing_loans: e.target.value})}
                placeholder="0"
              />
            </div>
          </div>

          <div className="section-title">
            <TrendingUp size={18} />
            <span>Risk Appetite & Goals</span>
          </div>

          <div className="input-group">
            <label>Risk Appetite</label>
            <div className="risk-selector">
              {['Low', 'Medium', 'High'].map(risk => (
                <button
                  key={risk}
                  type="button"
                  className={`risk-btn ${profile.risk_appetite === risk ? 'active' : ''}`}
                  onClick={() => setProfile({...profile, risk_appetite: risk})}
                >
                  {risk}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label>Financial Goals</label>
            <div className="goals-selector">
              {['House', 'Car', 'Retirement', 'Education', 'Travel', 'Emergency Fund'].map(goal => (
                <button
                  key={goal}
                  type="button"
                  className={`goal-btn ${profile.financial_goals.includes(goal) ? 'active' : ''}`}
                  onClick={() => handleGoalToggle(goal)}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="save-button" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;

// minor safe update 22

// automated formatting update 22
