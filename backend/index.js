const express = require('express');
const pool = require('./config/db');
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

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  const { email, password, full_name } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.execute(
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

// --- Profile Routes ---
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [profiles] = await pool.execute('SELECT * FROM profiles WHERE user_id = ?', [req.user.id]);
    const profile = profiles[0] || {};
    // Parse financial_goals if it's a string
    if (profile.financial_goals && typeof profile.financial_goals === 'string') {
      try {
        profile.financial_goals = JSON.parse(profile.financial_goals);
      } catch (e) {
        console.error("Error parsing goals:", e);
      }
    }
    res.json(profile);
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
      JSON.stringify(profile.financial_goals || [])
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

// --- Portfolio Routes ---
app.get('/api/portfolio', authenticateToken, async (req, res) => {
  try {
    const [assets] = await pool.execute('SELECT * FROM portfolio WHERE user_id = ?', [req.user.id]);
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/portfolio', authenticateToken, async (req, res) => {
  const { assets } = req.body;
  try {
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

// --- Portfolio Holdings (Detailed) ---
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
    
    const sectors = {};
    let totalExpenseRatioLoss = 0;
    let stcg = 0;
    let ltcg = 0;

    holdings.forEach(h => {
      const val = Number(h.current_value);
      sectors[h.sector] = (sectors[h.sector] || 0) + val;
      totalExpenseRatioLoss += (val * Number(h.expense_ratio || 0)) / 100;
      
      const profit = val - (Number(h.buy_price) * Number(h.quantity));
      if (profit > 0) {
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

// --- AI Chat ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message, profile } = req.body;
  const q = message.toLowerCase();

  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Missing API Key");
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a professional financial advisor named MoneyMentor. 
    User Profile: ${JSON.stringify(profile)}. 
    User Question: "${message}"
    Give a helpful, encouraging, and specific response based on the user's data.`;
    
    const result = await model.generateContent(prompt);
    return res.json({ text: result.response.text() });
  } catch (error) {
    console.error("Gemini Error, using Smart Logic:", error.message);
    
    // --- SOPHISTICATED FALLBACK ENGINE ---
    let response = "";
    const inc = parseFloat(profile?.monthly_income) || 0;
    const exp = parseFloat(profile?.monthly_expenses) || 0;
    const save = inc - exp;
    const rate = inc > 0 ? (save / inc) * 100 : 0;

    // Greeting / General
    if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
      const greets = [
        `Hello! Looking at your profile, you're earning ₹${inc.toLocaleString()} and spending ₹${exp.toLocaleString()}. What's on your mind?`,
        `Hi there! I'm ready to help you optimize your ₹${save.toLocaleString()} monthly savings. Any specific goals today?`,
        `Greetings! I see you've got a ${rate > 20 ? 'healthy' : 'tight'} savings rate of ${rate.toFixed(0)}%. How can we improve it?`
      ];
      response = greets[Math.floor(Math.random() * greets.length)];
    } 
    // Housing / Rent
    else if (q.includes("rent") || q.includes("home") || q.includes("house") || q.includes("apartment")) {
      response = `For an income of ₹${inc.toLocaleString()}, your housing costs shouldn't exceed ₹${(inc * 0.3).toLocaleString()} (30%). Are you looking to buy or rent?`;
    }
    // Car / Vehicle
    else if (q.includes("car") || q.includes("bike") || q.includes("vehicle") || q.includes("buy")) {
      if (rate < 15) {
        response = `A new purchase might be tough right now with a ${rate.toFixed(0)}% savings rate. Let's try to lower your monthly expenses of ₹${exp.toLocaleString()} first.`;
      } else {
        response = `Buying a vehicle is possible with your ₹${save.toLocaleString()} surplus, but consider the "20/4/10" rule: 20% down, 4-year loan, and 10% of monthly income on transit costs.`;
      }
    }
    // Salary / Income
    else if (q.includes("salary") || q.includes("income") || q.includes("earn")) {
      response = `Your current income is ₹${inc.toLocaleString()}. To grow this, focused upskilling usually yields the highest ROI. On the saving side, are we maximizing your tax deductions?`;
    }
    // Expense / Spend
    else if (q.includes("expense") || q.includes("spend") || q.includes("paying") || q.includes("cost") || q.includes("expence")) {
      if (exp > inc * 0.7) {
        response = `Warning: Your expenses (₹${exp.toLocaleString()}) are over 70% of your income. We should identify "leaks" in your budget immediately.`;
      } else {
        response = `Your spending is currently ₹${exp.toLocaleString()}. That's ${ (100-rate).toFixed(0) }% of your income. Applying the 50/30/20 rule can help you find more for your future!`;
      }
    }
    // Investment / Savings
    else if (q.includes("save") || q.includes("saving") || q.includes("invest") || q.includes("stocks") || q.includes("mutual")) {
      response = `With a ₹${save.toLocaleString()} monthly surplus, you should first secure a 6-month emergency fund (₹${(exp * 6).toLocaleString()}) before going heavy into stocks.`;
    }
    // Default
    else {
      response = `That's a great question. Given your ₹${inc.toLocaleString()} income, I'd suggest we look at how that fits into your long-term goals. Could you tell me more about what you're planning?`;
    }

    // Add a polite sign-off or hint without the repetitive prefix
    if (!profile || inc === 0) {
      response = "I noticed your profile is empty. To give you real numbers and advice, please fill out your Income and Expenses in the Profile section!";
    }

    return res.json({ text: response });
  }
});

// --- Server Start ---
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('✅ MySQL Database connected successfully!');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('Ensure MySQL is running and database "Money_mentor" exists.');
  }
});

// minor safe update 2
