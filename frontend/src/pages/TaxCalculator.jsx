import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Calculator, Zap, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import '../styles/TaxCalculator.css';

const TaxCalculator = () => {
  const { user } = useAuth();
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState({
    sec80C: 150000,
    sec80D: 25000,
    hra: 0,
    other: 0
  });
  const [results, setResults] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data) {
        setIncome(data.monthly_income * 12);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculateTax = () => {
    const annualIncome = parseFloat(income) || 0;
    
    // New Regime (FY 2024-25 - typical simplified)
    let newTax = 0;
    const newSlabs = [
      { limit: 300000, rate: 0 },
      { limit: 600000, rate: 0.05 },
      { limit: 900000, rate: 0.10 },
      { limit: 1200000, rate: 0.15 },
      { limit: 1500000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 }
    ];

    let tempIncomeNew = annualIncome - 75000; // Standard deduction in new regime
    let prevLimit = 0;
    for (let slab of newSlabs) {
      if (tempIncomeNew > prevLimit) {
        const taxableInSlab = Math.min(tempIncomeNew - prevLimit, slab.limit - prevLimit);
        newTax += taxableInSlab * slab.rate;
        prevLimit = slab.limit;
      } else break;
    }
    // Rebate under 7L in new regime
    if (annualIncome <= 700000) newTax = 0;

    // Old Regime
    let oldTax = 0;
    const totalDeductions = Math.min(deductions.sec80C, 150000) + Math.min(deductions.sec80D, 25000) + deductions.hra + deductions.other + 50000; // 50k std deduction
    let tempIncomeOld = annualIncome - totalDeductions;
    
    const oldSlabs = [
      { limit: 250000, rate: 0 },
      { limit: 500000, rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 }
    ];

    prevLimit = 0;
    for (let slab of oldSlabs) {
      if (tempIncomeOld > prevLimit) {
        const taxableInSlab = Math.min(tempIncomeOld - prevLimit, slab.limit - prevLimit);
        oldTax += taxableInSlab * slab.rate;
        prevLimit = slab.limit;
      } else break;
    }
    if (tempIncomeOld <= 500000) oldTax = 0;


    setResults({
      newTax: Math.round(newTax * 1.04), // 4% cess
      oldTax: Math.round(oldTax * 1.04),
      savings: Math.abs(Math.round(oldTax * 1.04) - Math.round(newTax * 1.04)),
      better: newTax < oldTax ? 'New Regime' : 'Old Regime'
    });
  };

  return (
    <div className="tax-container">
      <div className="tax-header">
        <h1>Tax Optimizer</h1>
        <p>Compare Old vs New Tax Regimes (FY 2024-25)</p>
      </div>

      <div className="tax-grid">
        <div className="tax-inputs">
          <div className="input-card">
            <h3>Annual Income</h3>
            <div className="input-group">
              <label>Gross Annual Salary</label>
              <input type="number" value={income} onChange={(e) => setIncome(e.target.value)} />
            </div>
          </div>

          <div className="input-card">
            <h3>Deductions (Old Regime)</h3>
            <div className="input-group">
              <label>Section 80C (Max 1.5L)</label>
              <input type="number" value={deductions.sec80C} onChange={(e) => setDeductions({...deductions, sec80C: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>Section 80D (Health Ins.)</label>
              <input type="number" value={deductions.sec80D} onChange={(e) => setDeductions({...deductions, sec80D: parseInt(e.target.value)})} />
            </div>
            <div className="input-group">
              <label>HRA Exemption</label>
              <input type="number" value={deductions.hra} onChange={(e) => setDeductions({...deductions, hra: parseInt(e.target.value)})} />
            </div>
            <button onClick={calculateTax} className="calc-btn">Calculate & Compare</button>
          </div>
        </div>

        {results && (
          <div className="tax-results">
            <div className="comparison-cards">
              <div className={`comp-card ${results.better === 'Old Regime' ? 'best' : ''}`}>
                <h4>Old Regime</h4>
                <h2>${results.oldTax.toLocaleString()}</h2>
                <p>Total Tax Payable</p>
              </div>
              <div className={`comp-card ${results.better === 'New Regime' ? 'best' : ''}`}>
                <h4>New Regime</h4>
                <h2>${results.newTax.toLocaleString()}</h2>
                <p>Total Tax Payable</p>
              </div>
            </div>

            <div className="savings-banner">
              <Zap size={24} />
              <div>
                <h3>You save ${results.savings.toLocaleString()}!</h3>
                <p>By choosing the <strong>{results.better}</strong></p>
              </div>
            </div>

            <div className="suggestions-card">
              <h3>Tax Saving Recommendations</h3>
              <ul>
                <li>
                  <ShieldCheck size={18} />
                  <span>{deductions.sec80C < 150000 ? "Invest more in PPF/ELSS to exhaust 80C limit." : "You have exhausted your 80C limit."}</span>
                </li>
                <li>
                  <ShieldCheck size={18} />
                  <span>Consider NPS (Sec 80CCD) for an additional $50,000 deduction.</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaxCalculator;
