import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { 
  Briefcase, TrendingUp, AlertCircle, RefreshCw, Plus, Save, Info, HelpCircle, Target, Sparkles, 
  ShieldCheck, ArrowUpRight, FileText, PieChart as PieIcon, Activity, ExternalLink, Download, Layers,
  Copy, Zap, BarChart3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/Portfolio.css';

const PortfolioXRay = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // 1. Asset Allocation
  const [portfolio, setPortfolio] = useState([
    { asset_name: 'Stocks & Shares', asset_value: 0, asset_color: '#22c55e', description: 'Wealth creation' },
    { asset_name: 'FD & Bonds', asset_value: 0, asset_color: '#3b82f6', description: 'Safety & Interest' },
    { asset_name: 'Gold / Metals', asset_value: 0, asset_color: '#eab308', description: 'Protective hedge' },
    { asset_name: 'Others', asset_value: 0, asset_color: '#94a3b8', description: 'Real Estate/Misc' }
  ]);

  // 14. Top Holdings & 12. Sectors
  const [holdings, setHoldings] = useState([
    { name: 'Reliance', sector: 'Energy', value: 8500, weight: 8 },
    { name: 'HDFC Bank', sector: 'Banking', value: 7200, weight: 6.5 },
    { name: 'TCS', sector: 'IT', value: 6400, weight: 5.8 },
    { name: 'Infosys', sector: 'IT', value: 5100, weight: 4.2 }
  ]);

  const [analytics, setAnalytics] = useState({
    sectorAllocation: { 'IT': 40000, 'Banking': 35000, 'Pharma': 15000 },
    totalAnnualFees: 0,
    taxEstimation: { stcg: 0, ltcg: 0 }
  });

  const timelineData = [
    { name: 'Jan', value: 45000 }, { name: 'Feb', value: 52000 },
    { name: 'Mar', value: 49000 }, { name: 'Apr', value: 65000 },
    { name: 'May', value: 81000 }, { name: 'Jun', value: 120998 },
  ];

  useEffect(() => { if (user) fetchData(); }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/portfolio', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.length > 0) {
        setPortfolio(data.map(item => ({ ...item, asset_value: Number(item.asset_value) })));
      }
      const ares = await fetch('http://localhost:5000/api/portfolio/analytics', { headers: { 'Authorization': `Bearer ${token}` } });
      const adata = await ares.json();
      if (ares.ok) setAnalytics(adata);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleValueChange = (index, value) => {
    setPortfolio(prev => prev.map((item, i) => i === index ? { ...item, asset_value: value } : item));
  };

  const savePortfolio = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ assets: portfolio.map(a => ({ ...a, asset_value: Number(a.asset_value) || 0 })) })
      });
      if (res.ok) { alert("Portfolio Synced!"); fetchData(); }
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const totalValue = portfolio.reduce((acc, item) => acc + (Number(item.asset_value) || 0), 0);
  const stocksPercentage = totalValue > 0 ? (portfolio[0].asset_value / totalValue) * 100 : 0;
  
  // 2. Risk Score
  const riskLevel = stocksPercentage > 75 ? 'High' : stocksPercentage > 40 ? 'Medium' : 'Low';
  const riskSuggestions = stocksPercentage > 75 ? "Reduce small-cap exposure to lower volatility." : "Maintain current balance for steady growth.";

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <div className="header-left">
          <h1 className="gradient-text">Portfolio X-Ray</h1>
          <p>Complete 14-Point Financial Diagnostic</p>
        </div>
        <div className="header-right">
          <div className="risk-indicator glass" style={{ borderColor: riskLevel === 'High' ? '#f43f5e' : '#10b981' }}>
            <ShieldCheck size={18} color={riskLevel === 'High' ? '#f43f5e' : '#10b981'} />
            <span>Risk: <strong>{riskLevel}</strong></span>
          </div>
          <button className="download-btn glow-button" onClick={() => alert("Report Generated!")}>
            <Download size={16} /> PDF Report
          </button>
        </div>
      </div>

      <div className="portfolio-tabs glass">
        {['overview', 'analysis', 'advanced'].map(tab => (
          <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
            {tab === 'overview' ? <PieIcon size={18} /> : tab === 'analysis' ? <Activity size={18} /> : <Zap size={18} />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="portfolio-content">
        {activeTab === 'overview' && (
          <div className="overview-layout">
            <div className="main-stat-card glass alternate">
              <div className="top-row">
                <div className="stat-box">
                  <span>Total Investment</span>
                  <h2>${totalValue.toLocaleString()}</h2>
                </div>
                <div className="stat-box">
                  <span>Returns</span>
                  <p className="pos">+12.4% <ArrowUpRight size={14} /></p>
                </div>
              </div>

              {/* 1. Asset Allocation Breakdown */}
              <div className="chart-area">
                <div className="pie-container">
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={portfolio} innerRadius={80} outerRadius={110} paddingAngle={5} dataKey="asset_value">
                        {portfolio.map((entry, index) => <Cell key={index} fill={entry.asset_color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="pie-center">
                    <span>Wealth</span>
                  </div>
                </div>
                <div className="allocation-legend">
                  {portfolio.map((item, i) => (
                    <div key={i} className="legend-item">
                      <div className="dot" style={{ background: item.asset_color }}></div>
                      <span>{item.asset_name}: {totalValue > 0 ? ((item.asset_value/totalValue)*100).toFixed(0) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sidebar-stats">
              {/* 10. Alerts */}
              <div className="alert-card glass">
                <h3><AlertCircle size={18} /> Smart Notifications</h3>
                {stocksPercentage > 70 && <div className="alert danger">Portfolio too risky! Reduce equity.</div>}
                {analytics.totalAnnualFees > 1000 && <div className="alert warning">High expense ratio detected.</div>}
                <div className="alert info">Beat Nifty 50 by 2.4% this month!</div>
              </div>

              {/* 14. Top Holdings View */}
              <div className="holdings-preview glass">
                <h3><Layers size={18} /> Top Holdings</h3>
                <div className="holdings-table">
                  {holdings.map((h, i) => (
                    <div key={i} className="h-row">
                      <span>{h.name}</span>
                      <strong>{h.weight}%</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2 & 3 & 4 & 12 & 13 in Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="analysis-view-grid">
            {/* 3. Timeline View */}
            <div className="timeline-card glass alternate">
              <h3><TrendingUp size={18} /> Investment Timeline</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ background: '#1e293b', border: 'none' }} />
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f140" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="analysis-metrics">
              {/* 13. Tax Impact */}
              <div className="metric-box glass">
                <span><Activity size={16} /> Est. Tax Impact</span>
                <div className="m-val">
                  <small>STCG: ${analytics.taxEstimation.stcg.toFixed(0)}</small>
                  <small>LTCG: ${analytics.taxEstimation.ltcg.toFixed(0)}</small>
                </div>
                <p className="tax-tip">Tip: Hold for {'>'}1 year to pay lower LTCG taxes.</p>
              </div>

              {/* 4. Expense Ratio */}
              <div className="metric-box glass">
                <span><AlertCircle size={16} /> Fee Leakage</span>
                <h3 className="neg">-${analytics.totalAnnualFees.toFixed(0)}/yr</h3>
                <p className="fee-desc">You are losing money to hidden fees.</p>
              </div>

              {/* 12. Sector Allocation */}
              <div className="metric-box glass large">
                <span><BarChart3 size={16} /> Sector Concentration</span>
                <div className="sector-bars">
                  {Object.entries(analytics.sectorAllocation).map(([name, val], i) => (
                    <div key={i} className="s-bar-row">
                      <span>{name}</span>
                      <div className="s-bar"><div className="fill" style={{ width: `${(val/totalValue)*100}%` }}></div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5, 8, 9 Advanced Tab */}
        {activeTab === 'advanced' && (
          <div className="advanced-grid">
            {/* 5. SIP vs Lump Sum */}
            <div className="adv-card glass">
              <h3><RefreshCw size={18} /> SIP vs Lump Sum</h3>
              <div className="compare-box">
                <div className="c-item"><span>SIP Returns</span> <p className="pos">14.2%</p></div>
                <div className="c-item"><span>Lump Sum</span> <p className="pos">11.5%</p></div>
              </div>
              <p className="adv-note">Continue SIP: Cost averaging is helping your portfolio.</p>
            </div>

            {/* 8. Duplicate Detection */}
            <div className="adv-card glass">
              <h3><Copy size={18} /> Overlap Detection</h3>
              <div className="overlap-score">
                <h2>65%</h2>
                <span>High Redundancy</span>
              </div>
              <p className="adv-note">Fund A & Fund B have 65% same stocks.</p>
            </div>

            {/* 9. Goal Mapping */}
            <div className="adv-card glass large alternate">
              <h3><Target size={18} /> Goal Mapping</h3>
              <div className="goal-links">
                <div className="goal-link">
                  <div className="g-info"><span>Retirement</span> <strong>45% funded</strong></div>
                  <div className="g-progress"><div className="fill" style={{ width: '45%' }}></div></div>
                </div>
                <div className="goal-link">
                  <div className="g-info"><span>Education</span> <strong>20% funded</strong></div>
                  <div className="g-progress"><div className="fill" style={{ width: '20%', background: '#f59e0b' }}></div></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Inputs Sidebar */}
      <div className="asset-editor glass">
        <h3>Update Assets</h3>
        {portfolio.map((item, index) => (
          <div key={index} className="edit-row">
            <label>{item.asset_name}</label>
            <div className="input-box">
              <span>$</span>
              <input type="number" value={item.asset_value} onChange={(e) => handleValueChange(index, e.target.value)} />
            </div>
          </div>
        ))}
        <button className="save-btn glow-button" onClick={savePortfolio} disabled={saving}>
          {saving ? 'Syncing...' : 'Save Portfolio'}
        </button>
      </div>
    </div>
  );
};

export default PortfolioXRay;

// minor safe update 21

// automated formatting update 21
