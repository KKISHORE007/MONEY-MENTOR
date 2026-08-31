const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};

// minor safe update 9

// minor safe update 9

// automated formatting update 9

// automated formatting update 34
