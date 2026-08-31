import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Heart, Users, Target, TrendingUp, Zap } from 'lucide-react';
import '../styles/CouplePlanner.css';

const CouplePlanner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [partnerDetails, setPartnerDetails] = useState({
    monthly_income: 40000,
    monthly_expenses: 15000,
    current_savings: 50000
  });

  useEffect(() => {
    if (user) fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setUserProfile({
          ...data,
          monthly_income: Number(data.monthly_income) || 0,
          monthly_expenses: Number(data.monthly_expenses) || 0,
          current_savings: Number(data.current_savings) || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const jointIncome = (userProfile?.monthly_income || 0) + partnerDetails.monthly_income;
  const jointExpenses = (userProfile?.monthly_expenses || 0) + partnerDetails.monthly_expenses;
  const jointSavings = (userProfile?.current_savings || 0) + partnerDetails.current_savings;

  if (loading) return <div className="loading-state">Calculating your joint future...</div>;

  return (
    <div className="couple-container">
      <div className="couple-header">
        <h1>Couple Financial Planner</h1>
        <p>Plan your joint financial journey together</p>
      </div>

      <div className="couple-grid">
        <div className="couple-main-card glass">
          <div className="couple-comparison">
            <div className="partner-box">
              <Users size={32} color="#6366f1" />
              <h3>You</h3>
              <div className="stat">
                <span>Income</span>
                <p>${(userProfile?.monthly_income || 0).toLocaleString()}</p>
              </div>
            </div>
            <div className="heart-icon">
              <Heart size={40} fill="#f43f5e" color="#f43f5e" />
            </div>
            <div className="partner-box">
              <Users size={32} color="#ec4899" />
              <h3>Partner</h3>
              <div className="stat">
                <span>Income</span>
                <input 
                  type="number" 
                  value={partnerDetails.monthly_income} 
                  onChange={(e) => setPartnerDetails({...partnerDetails, monthly_income: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="joint-summary">
            <div className="joint-item">
              <span>Joint Monthly Income</span>
              <h2>${jointIncome.toLocaleString()}</h2>
            </div>
            <div className="joint-item">
              <span>Joint Monthly Expenses</span>
              <h2>${jointExpenses.toLocaleString()}</h2>
            </div>
            <div className="joint-item">
              <span>Combined Net Worth</span>
              <h2>${jointSavings.toLocaleString()}</h2>
            </div>
          </div>
        </div>

        <div className="goals-card glass">
          <h3>Joint Goals</h3>
          <div className="joint-goals-list">
            <div className="joint-goal-item">
              <div className="goal-icon">🏡</div>
              <div className="goal-info">
                <span>Dream House</span>
                <div className="goal-progress">
                  <div className="progress-fill" style={{ width: '35%' }}></div>
                </div>
                <p>35% of $500k target</p>
              </div>
            </div>
            <div className="joint-goal-item">
              <div className="goal-icon">✈️</div>
              <div className="goal-info">
                <span>World Tour</span>
                <div className="goal-progress">
                  <div className="progress-fill" style={{ width: '60%' }}></div>
                </div>
                <p>60% of $20k target</p>
              </div>
            </div>
          </div>
          <button className="add-goal-btn glass">Add Joint Goal</button>
        </div>
      </div>
    </div>
  );
};

export default CouplePlanner;

// minor safe update 15

// automated formatting update 15
