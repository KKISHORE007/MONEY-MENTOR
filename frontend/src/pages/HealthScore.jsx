import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, AlertTriangle, TrendingUp, ArrowRight, Info } from 'lucide-react';
import { calculateHealthScore } from '../utils/finance';
import '../styles/HealthScore.css';

const HealthScore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [scoreData, setScoreData] = useState(null);

  useEffect(() => {
    if (user) fetchProfileAndCalculate();
  }, [user]);

  const fetchProfileAndCalculate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data) {
        const result = calculateHealthScore(data);
        const breakdown = [
          { 
            label: 'Savings Rate', 
            score: Math.round(result.savingsRate), 
            target: '20%+', 
            status: result.savingsRate >= 20 ? 'good' : result.savingsRate >= 10 ? 'warning' : 'danger' 
          },
          { 
            label: 'Emergency Fund', 
            score: Math.round(result.emergencyFundRatio), 
            target: '6 Months', 
            status: result.emergencyFundRatio >= 100 ? 'good' : 'warning' 
          },
          { 
            label: 'Debt Health', 
            score: Math.round(result.dti), 
            target: '< 30%', 
            status: result.dti < 30 ? 'good' : 'danger' 
          },
        ];
        setScoreData({ totalScore: result.totalScore, breakdown });
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-state">Recalibrating your financial health...</div>;

  return (
    <div className="health-container">
      <div className="health-header">
        <h1>Money Health Score</h1>
        <p>A rigorous analysis of your financial performance</p>
      </div>

      <div className="health-grid">
        <div className="score-main-card glass">
          <div className="score-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="circle" strokeDasharray={`${scoreData?.totalScore || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <text x="18" y="20.35" className="percentage">{scoreData?.totalScore || 0}</text>
            </svg>
          </div>
          <div className="score-label">
            <h3 className="gradient-text">{scoreData?.totalScore >= 80 ? 'Financial Elite!' : scoreData?.totalScore >= 50 ? 'Steady Progress' : 'Action Required'}</h3>
            <p>Your data-driven score is based on savings, debt, and risk.</p>
          </div>
        </div>

        <div className="breakdown-card glass">
          <h3>Performance Metrics</h3>
          <div className="breakdown-list">
            {scoreData?.breakdown.map((item, i) => (
              <div key={i} className="breakdown-item">
                <div className="item-info">
                  <span>{item.label}</span>
                  <strong>{item.score}%</strong>
                </div>
                <div className="progress-bar">
                  <div className={`progress-fill ${item.status}`} style={{ width: `${Math.min(item.score, 100)}%` }}></div>
                </div>
                <div className="item-footer">
                  <span className="target">Target: {item.target}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="insights-card glass">
          <h3>Expert Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <TrendingUp size={18} color="#10b981" />
              <p>Maintaining a {scoreData?.breakdown[0].score}% savings rate puts you in the top 15% of users.</p>
            </div>
            <div className="insight-item">
              <Info size={18} color="#f59e0b" />
              <p>Try to keep your total debt below 30% of your annual income for a perfect score.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthScore;

// minor safe update 18

// automated formatting update 18

// automated formatting update 43
