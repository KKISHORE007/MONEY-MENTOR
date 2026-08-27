import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Calculator, Info } from 'lucide-react';
import '../styles/FIREPlanner.css';

const FIREPlanner = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [inputs, setInputs] = useState({
    currentAge: 25,
    retirementAge: 50,
    expectedReturn: 12,
    inflation: 6,
    safeWithdrawalRate: 4
  });

  const [monthlySavings, setMonthlySavings] = useState(30000);
  const [annualExpenses, setAnnualExpenses] = useState(240000);
  const [chartData, setChartData] = useState([]);
  const [results, setResults] = useState({
    targetCorpus: 0,
    requiredSIP: 0,
    projectedCorpus: 0
  });

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      calculateFIRE();
    }
  }, [profile, inputs, monthlySavings, annualExpenses]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setProfile(data);
        const inc = Number(data.monthly_income) || 50000;
        const exp = Number(data.monthly_expenses) || 20000;
        setMonthlySavings(inc - exp);
        setAnnualExpenses(exp * 12);
        setInputs(prev => ({ ...prev, currentAge: Number(data.age) || 25 }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateFIRE = () => {
    const yearsToInvest = inputs.retirementAge - inputs.currentAge;
    if (yearsToInvest <= 0) return;

    // Target Corpus using rule of 25x or inflation adjusted
    const inflationAdjustedExpenses = annualExpenses * Math.pow(1 + inputs.inflation / 100, yearsToInvest);
    const targetCorpus = inflationAdjustedExpenses * (100 / inputs.safeWithdrawalRate);

    // SIP Calculation
    const r = (inputs.expectedReturn / 100) / 12;
    const n = yearsToInvest * 12;
    const requiredSIP = targetCorpus * (r / (Math.pow(1 + r, n) - 1));

    // Chart Data Projection
    const data = [];
    let currentBalance = Number(profile?.current_savings) || 0;
    
    for (let i = 0; i <= yearsToInvest; i++) {
      data.push({
        year: inputs.currentAge + i,
        corpus: Math.round(currentBalance),
        target: Math.round(targetCorpus * (i / yearsToInvest))
      });
      // Simple annual growth with monthly contributions
      for (let m = 0; m < 12; m++) {
        currentBalance = (currentBalance + monthlySavings) * (1 + r);
      }
    }

    setChartData(data);
    setResults({
      targetCorpus,
      requiredSIP,
      projectedCorpus: currentBalance
    });
  };

  if (loading) return <div className="loading-state">Designing your retirement map...</div>;

  return (
    <div className="fire-container">
      <div className="fire-header">
        <h1>FIRE Planner</h1>
        <p>Calculate your Financial Independence, Retire Early goals</p>
      </div>

      <div className="fire-grid">
        <div className="inputs-card">
          <h3>Projection Inputs</h3>
          <div className="inputs-group">
            <div className="input-item">
              <label>Current Age</label>
              <input type="number" value={inputs.currentAge} onChange={(e) => setInputs({...inputs, currentAge: Number(e.target.value)})}/>
            </div>
            <div className="input-item">
              <label>Retirement Age</label>
              <input type="number" value={inputs.retirementAge} onChange={(e) => setInputs({...inputs, retirementAge: Number(e.target.value)})}/>
            </div>
            <div className="input-item">
              <label>Expected Return (%)</label>
              <input type="number" value={inputs.expectedReturn} onChange={(e) => setInputs({...inputs, expectedReturn: Number(e.target.value)})}/>
            </div>
            <div className="input-item">
              <label>Monthly Savings ($)</label>
              <input type="number" value={monthlySavings} onChange={(e) => setMonthlySavings(Number(e.target.value))}/>
            </div>
          </div>
        </div>

        <div className="results-card">
          <div className="result-main">
            <span>Target Freedom Corpus</span>
            <h2>${Math.round(results.targetCorpus).toLocaleString()}</h2>
          </div>
          <div className="result-sub">
            <div className="sub-item">
              <span>Required monthly SIP</span>
              <p>${Math.round(results.requiredSIP).toLocaleString()}</p>
            </div>
            <div className="sub-item">
              <span>Status</span>
              <p className={results.projectedCorpus >= results.targetCorpus ? "on-track" : "lagging"}>
                {results.projectedCorpus >= results.targetCorpus ? "On Track" : "Action Needed"}
              </p>
            </div>
          </div>
        </div>

        <div className="chart-full-card">
          <h3>Wealth Projection Path</h3>
          <div style={{ height: 400, width: '100%' }}>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCorpus" x1="0" y1="y" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" tickFormatter={(v) => `$${(v/1000000).toFixed(1)}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff" }}
                  formatter={(value) => [`$${value.toLocaleString()}`, "Corpus"]}
                />
                <Area type="monotone" dataKey="corpus" stroke="#6366f1" fill="url(#colorCorpus)" strokeWidth={3} />
                <Line type="monotone" dataKey="target" stroke="#94a3b8" strokeDasharray="5 5" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FIREPlanner;

// minor safe update 17
