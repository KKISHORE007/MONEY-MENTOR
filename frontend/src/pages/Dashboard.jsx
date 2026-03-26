import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, TrendingUp, ShieldCheck, Target, Zap, ArrowUpRight, MessageSquare } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { calculateHealthScore } from "../utils/finance";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        // Ensure values are numbers
        setProfile({
          ...data,
          monthly_income: Number(data.monthly_income) || 0,
          monthly_expenses: Number(data.monthly_expenses) || 0,
          current_savings: Number(data.current_savings) || 0,
          existing_loans: Number(data.existing_loans) || 0
        });
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  if (loading) return <div className="loading-state">Syncing your financial data...</div>;

  const income = profile?.monthly_income || 0;
  const expenses = profile?.monthly_expenses || 0;
  const savings = income - expenses;
  const netWorth = (profile?.current_savings || 0) - (profile?.existing_loans || 0);
  
  const health = profile ? calculateHealthScore(profile) : { totalScore: 0 };

  const metrics = [
    { label: "Net Worth", value: `$${netWorth.toLocaleString()}`, icon: TrendingUp, trend: "+5.2%", color: "#6366f1" },
    { label: "Monthly Savings", value: `$${savings.toLocaleString()}`, icon: Zap, trend: "+12%", color: "#10b981" },
    { label: "Health Score", value: `${health.totalScore}/100`, icon: ShieldCheck, sub: health.totalScore > 70 ? "Good Health" : "Needs Work", color: "#f59e0b" },
    { label: "Top Goal", value: "Retirement", icon: Target, sub: "45% reached", color: "#ec4899" },
  ];

  const chartData = [
    { name: "Jan", wealth: 45000 },
    { name: "Feb", wealth: 52000 },
    { name: "Mar", wealth: 48000 },
    { name: "Apr", wealth: 61000 },
    { name: "May", wealth: 55000 },
    { name: "Jun", wealth: netWorth > 0 ? netWorth : 67000 },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome">
          <h1>Welcome back, {user?.full_name || user?.email?.split('@')[0]}!</h1>
          <p>Here's what's happening with your money today.</p>
        </div>
        <button className="pro-btn">
          <Zap size={16} />
          Go Pro
        </button>
      </div>

      <div className="metrics-grid">
        {metrics.map((m, i) => (
          <div key={i} className="metric-card">
            <div className="metric-icon" style={{ backgroundColor: `${m.color}20`, color: m.color }}>
              <m.icon size={24} />
            </div>
            <div className="metric-info">
              <span>{m.label}</span>
              <h3>{m.value}</h3>
              {m.trend ? <p className="trend">{m.trend} this month</p> : <p className="sub">{m.sub}</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-main">
        <div className="chart-card">
          <div className="chart-header">
            <h3>Wealth Growth</h3>
            <div className="chart-tabs">
              <button className="active">6M</button>
              <button>1Y</button>
              <button>All</button>
            </div>
          </div>
          <div style={{ height: 300, width: "100%" }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#6366f1" }}
                />
                <Area type="monotone" dataKey="wealth" stroke="#6366f1" fillOpacity={1} fill="url(#colorWealth)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="actions-card">
          <h3>Quick Actions</h3>
          <div className="action-list">
            <div className="action-item">
              <div className="action-info">
                <MessageSquare size={18} />
                <span>Ask AI Mentor</span>
              </div>
              <ArrowUpRight size={18} />
            </div>
            <div className="action-item">
              <div className="action-info">
                <Target size={18} />
                <span>Set New Goal</span>
              </div>
              <ArrowUpRight size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
