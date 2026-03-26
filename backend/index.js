const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      'INSERT INTO users (email, password, full_name) VALUES (?, ?, ?)',
      [email, hashedPassword, full_name]
    );
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    res.json(profiles[0] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/profile', authenticateToken, async (req, res) => {
  const profile = req.body;
  try {
    const fields = ['age', 'monthly_income', 'monthly_expenses', 'current_savings', 'existing_loans', 'risk_appetite', 'financial_goals'];
    const values = [
      parseInt(profile.age) || 0,
      parseFloat(profile.monthly_income) || 0,
      parseFloat(profile.monthly_expenses) || 0,
      parseFloat(profile.current_savings) || 0,
      parseFloat(profile.existing_loans) || 0,
      profile.risk_appetite || 'Medium',
      profile.financial_goals // This should be a JSON string from the frontend
    ];
    
    const [existing] = await pool.execute('SELECT user_id FROM profiles WHERE user_id = ?', [req.user.id]);
    
    if (existing.length > 0) {
      const setClause = fields.map(f => `${f} = ?`).join(', ');
      await pool.execute(`UPDATE profiles SET ${setClause} WHERE user_id = ?`, [...values, req.user.id]);
    } else {
      const placeholders = fields.map(() => '?').join(', ');
      await pool.execute(`INSERT INTO profiles (user_id, ${fields.join(', ')}) VALUES (?, ${placeholders})`, [req.user.id, ...values]);
    }
    res.json({ message: 'Profile updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Gemini Chat
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1' });
app.post('/api/chat', authenticateToken, async (req, res) => {
  console.log("Received chat request from user:", req.user.email);
  const { message, profile } = req.body;
  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key') {
      throw new Error("Gemini API Key is missing or invalid in .env file.");
    }

    const prompt = `You are "Money Mentor", a premium financial advisor. 
    User Profile: ${JSON.stringify(profile || "No profile data provided yet")}.
    User Query: ${message}`;

    // Final fallback logic
    let result;
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      result = await model.generateContent(prompt);
    } catch (e) {
      console.log("Flash failed, trying Pro...");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
      result = await model.generateContent(prompt);
    }
    
    const response = await result.response;
    res.json({ text: response.text() });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.status(500).json({ error: "AI Mentor is currently unavailable. Please check your API Key and internet connection." });
  }
});

app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const [assets] = await pool.execute('SELECT * FROM portfolio WHERE user_id = ?', [req.user.id]);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', authenticateToken, async (req, res) => {
  const { assets } = req.body; // Array of {asset_name, asset_value, asset_color}
  try {
    // Delete existing and re-insert for simplicity in this MVP
    await pool.execute('DELETE FROM portfolio WHERE user_id = ?', [req.user.id]);
    for (const asset of assets) {
      await pool.execute(
        'INSERT INTO portfolio (user_id, asset_name, asset_value, asset_color) VALUES (?, ?, ?, ?)',
        [req.user.id, asset.asset_name, asset.asset_value, asset.asset_color]
      );
    }
    res.json({ message: 'Portfolio updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Portfolio 2.0 Endpoints
app.get('/api/portfolio/holdings', authenticateToken, async (req, res) => {
  try {
    const [holdings] = await pool.execute('SELECT * FROM portfolio_holdings WHERE user_id = ?', [req.user.id]);
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio/holdings', authenticateToken, async (req, res) => {
  const { holdings } = req.body;
  try {
    await pool.execute('DELETE FROM portfolio_holdings WHERE user_id = ?', [req.user.id]);
    for (const h of holdings) {
      await pool.execute(
        'INSERT INTO portfolio_holdings (user_id, holding_name, category, current_value, buy_price, quantity, expense_ratio, sector) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, h.holding_name, h.category, h.current_value, h.buy_price, h.quantity, h.expense_ratio, h.sector]
      );
    }
    res.json({ message: 'Holdings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/portfolio/analytics', authenticateToken, async (req, res) => {
  try {
    const [holdings] = await pool.execute('SELECT * FROM portfolio_holdings WHERE user_id = ?', [req.user.id]);
    
    // Calculate Sector Allocation
    const sectors = {};
    let totalExpenseRatio = 0;
    let stcg = 0; // Short Term Capital Gain Est.
    let ltcg = 0; // Long Term Capital Gain Est.

    holdings.forEach(h => {
      const val = Number(h.current_value);
      sectors[h.sector] = (sectors[h.sector] || 0) + val;
      totalExpenseRatio += (val * Number(h.expense_ratio || 0)) / 100;
      
      const profit = val - (Number(h.buy_price) * Number(h.quantity));
      if (profit > 0) {
        // Simplified tax logic: 15% for STCG, 10% for LTCG (>1.25L)
        stcg += profit * 0.15;
        ltcg += profit * 0.10;
      }
    });

    res.json({
      sectorAllocation: sectors,
      totalAnnualFees: totalExpenseRatio,
      taxEstimation: { stcg, ltcg }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Portfolio 2.0 Endpoints
app.get('/api/portfolio/holdings', authenticateToken, async (req, res) => {
  try {
    const [holdings] = await pool.execute('SELECT * FROM portfolio_holdings WHERE user_id = ?', [req.user.id]);
    res.json(holdings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio/holdings', authenticateToken, async (req, res) => {
  const { holdings } = req.body;
  try {
    await pool.execute('DELETE FROM portfolio_holdings WHERE user_id = ?', [req.user.id]);
    for (const h of holdings) {
      await pool.execute(
        'INSERT INTO portfolio_holdings (user_id, holding_name, category, current_value, buy_price, quantity, expense_ratio, sector) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.id, h.holding_name, h.category, h.current_value, h.buy_price, h.quantity, h.expense_ratio, h.sector]
      );
    }
    res.json({ message: 'Holdings updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/portfolio/analytics', authenticateToken, async (req, res) => {
  try {
    const [holdings] = await pool.execute('SELECT * FROM portfolio_holdings WHERE user_id = ?', [req.user.id]);
    
    // 1. Sector Allocation Analysis
    const sectors = {};
    let totalExpenseRatioLoss = 0;
    let stcg = 0; // Short Term Capital Gain Est.
    let ltcg = 0; // Long Term Capital Gain Est.

    holdings.forEach(h => {
      const val = Number(h.current_value);
      sectors[h.sector] = (sectors[h.sector] || 0) + val;
      
      // 2. Expense Ratio Impact (Hidden Costs)
      totalExpenseRatioLoss += (val * Number(h.expense_ratio || 0)) / 100;
      
      const profit = val - (Number(h.buy_price) * Number(h.quantity));
      if (profit > 0) {
        // Simplified tax logic: 15% for STCG, 10% for LTCG (>1.25L)
        stcg += profit * 0.15;
        ltcg += profit * 0.10;
      }
    });

    res.json({
      sectorAllocation: sectors,
      totalAnnualFees: totalExpenseRatioLoss,
      taxEstimation: { stcg, ltcg }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
