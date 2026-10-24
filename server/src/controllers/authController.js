const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

function generateRandomAccountNumber() {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  const segment3 = Math.floor(10 + Math.random() * 90);
  return `${segment1}-${segment2}-${segment3}`;
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, role, phone, address, kyc_status, status FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials. User does not exist.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: `Account is ${user.status}. Please contact bank administrator.` });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password_hash, ...safeUser } = user;
    return res.json({
      message: 'Authentication successful',
      token,
      user: safeUser
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
}

async function register(req, res) {
  try {
    const { full_name, email, password, phone, address } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const pool = getPool();

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Insert user
      const [userResult] = await connection.query(
        `INSERT INTO users (full_name, email, password_hash, role, phone, address, kyc_status, status)
         VALUES (?, ?, ?, 'customer', ?, ?, 'verified', 'active')`,
        [full_name.trim(), email.toLowerCase().trim(), password_hash, phone || null, address || null]
      );
      const newUserId = userResult.insertId;

      // 2. Automatically grant a primary checking account with ₹10,000 welcome balance
      const accNumber = generateRandomAccountNumber();
      const [accResult] = await connection.query(
        `INSERT INTO accounts (user_id, account_number, account_type, account_name, balance, currency, status)
         VALUES (?, ?, 'checking', 'Primary Operating Checking', 10000.00, 'INR', 'active')`,
        [newUserId, accNumber]
      );

      // 3. Record welcome deposit transaction
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const refNo = `DEP-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
      await connection.query(
        `INSERT INTO transactions (reference_no, source_account_id, destination_account_id, transaction_type, amount, fee, description, status, counterparty_name)
         VALUES (?, NULL, ?, 'deposit', 10000.00, 0.00, 'New Account Welcome Opening Deposit', 'completed', 'Apex National Bank Onboarding')`,
        [refNo, accResult.insertId]
      );

      // 4. Audit log
      await connection.query(
        `INSERT INTO audit_logs (actor_id, action, target_type, target_id, details)
         VALUES (?, 'USER_REGISTER', 'user', ?, 'New customer registered with default checking account.')`,
        [newUserId, newUserId.toString()]
      );

      await connection.commit();

      const token = jwt.sign(
        { userId: newUserId, email: email.toLowerCase().trim(), role: 'customer' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'Registration successful. Primary checking account provisioned with ₹10,000 credit.',
        token,
        user: {
          id: newUserId,
          full_name: full_name.trim(),
          email: email.toLowerCase().trim(),
          role: 'customer',
          kyc_status: 'verified',
          status: 'active'
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: error.message || 'Error creating user account.' });
  }
}

async function getMe(req, res) {
  try {
    const pool = getPool();
    const [users] = await pool.query(
      'SELECT id, full_name, email, role, phone, address, kyc_status, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const [accounts] = await pool.query(
      'SELECT id, account_number, account_type, account_name, balance, currency, status FROM accounts WHERE user_id = ?',
      [req.user.id]
    );

    return res.json({
      user: users[0],
      accounts
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

async function getDemoCredentials(req, res) {
  return res.json({
    roles: [
      {
        role: 'Customer (Primary)',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@example.com',
        password: 'Customer123!',
        description: '2 Accounts (Checking ₹1,45,000 + Savings ₹8,50,000), active transactions & loan request'
      },
      {
        role: 'Customer (Commercial)',
        name: 'David Kim',
        email: 'david.kim@example.com',
        password: 'Customer123!',
        description: '2 Accounts (Checking ₹2,75,000 + Treasury ₹25,00,000), approved business loan'
      },
      {
        role: 'Bank Employee / Admin',
        name: 'Marcus Vance',
        email: 'admin.marcus@apexbank.com',
        password: 'Admin123!',
        description: 'Full administrative access: audit logs, approvals, customer freeze/unfreeze, global ledger'
      }
    ]
  });
}

module.exports = {
  login,
  register,
  getMe,
  getDemoCredentials
};
