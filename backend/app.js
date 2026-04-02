require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const { verifyToken, isAdmin } = require('./middleware/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (user.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const validPass = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPass) return res.status(401).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: user.rows[0].id, role: user.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, role: user.rows[0].role, username: user.rows[0].username });
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/create-staff', verifyToken, isAdmin, async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING id, username, role',
      [username, hashedPassword, 'staff']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Username already exists" });
  }
});

app.post('/api/members', verifyToken, async (req, res) => {
  const { full_name, email, phone, membership_tier, duration_months } = req.body;
  
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + parseInt(duration_months));

  try {
    const result = await pool.query(
      `INSERT INTO members (full_name, email, phone, membership_tier, end_date, registered_by, status) 
       VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING *`,
      [full_name, email, phone, membership_tier, endDate, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Member already exists or Data error" });
  }
});

app.post('/api/payments', verifyToken, async (req, res) => {
  const { member_id, amount, transaction_ref } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO payments (member_id, amount, transaction_ref, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [member_id, amount, transaction_ref, 'Pending']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Transaction ID already used" });
  }
});

app.get('/api/admin/verify-queue', verifyToken, isAdmin, async (req, res) => {
  try {
    const query = `
      SELECT p.id as payment_id, m.full_name, p.amount, p.transaction_ref, m.membership_tier
      FROM payments p
      JOIN members m ON p.member_id = m.id
      WHERE p.status = 'Pending'
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/confirm-payment/:payment_id', verifyToken, isAdmin, async (req, res) => {
  const { payment_id } = req.params;
  try {
    await pool.query('BEGIN');

    const paymentResult = await pool.query(
      'UPDATE payments SET status = $1, verified_by = $2 WHERE id = $3 RETURNING member_id',
      ['Verified', req.user.id, payment_id]
    );

    const memberId = paymentResult.rows[0].member_id;

    await pool.query(
      "UPDATE members SET status = 'Active' WHERE id = $1",
      [memberId]
    );

    await pool.query('COMMIT');
    res.json({ message: "Member Activated successfully" });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get('/api/members', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *, 
      CASE 
        WHEN (end_date - CURRENT_DATE) <= 4 AND (end_date - CURRENT_DATE) >= 0 THEN true 
        ELSE false 
      END as is_expiring,
      (end_date - CURRENT_DATE) as days_left,
      -- This calculates the total months they have been a member
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, created_at)) + 
      (EXTRACT(YEAR FROM AGE(CURRENT_DATE, created_at)) * 12) as total_months_active
      FROM members 
      ORDER BY end_date ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/", (req, res) => {
    res.send("Gym Management API is running...");
});

app.listen(3000, () => console.log(' Gym Server running on 3000'));