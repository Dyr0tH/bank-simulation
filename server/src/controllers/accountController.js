const { getPool } = require('../config/db');

function generateRandomAccountNumber() {
  const segment1 = Math.floor(1000 + Math.random() * 9000);
  const segment2 = Math.floor(1000 + Math.random() * 9000);
  const segment3 = Math.floor(10 + Math.random() * 90);
  return `${segment1}-${segment2}-${segment3}`;
}

async function getMyAccounts(req, res) {
  try {
    const pool = getPool();
    const [accounts] = await pool.query(
      `SELECT id, account_number, account_type, balance, currency, status, created_at
       FROM accounts 
       WHERE user_id = ?
       ORDER BY created_at ASC`,
      [req.user.id]
    );

    const totalBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.balance), 0);

    return res.json({
      accounts,
      summary: {
        totalBalance: totalBalance.toFixed(2),
        accountCount: accounts.length
      }
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return res.status(500).json({ error: 'Failed to retrieve accounts.' });
  }
}

async function getAccountById(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    let query = `
      SELECT a.*, u.full_name as owner_name, u.email as owner_email
      FROM accounts a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `;
    const params = [id];

    if (req.user.role === 'customer') {
      query += ' AND a.user_id = ?';
      params.push(req.user.id);
    }

    const [rows] = await pool.query(query, params);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Account not found or access denied.' });
    }

    const [transactions] = await pool.query(
      `SELECT t.*, 
        src.account_number as src_account_number,
        dst.account_number as dst_account_number
       FROM transactions t
       LEFT JOIN accounts src ON t.source_account_id = src.id
       LEFT JOIN accounts dst ON t.destination_account_id = dst.id
       WHERE t.source_account_id = ? OR t.destination_account_id = ?
       ORDER BY t.created_at DESC
       LIMIT 15`,
      [id, id]
    );

    return res.json({
      account: rows[0],
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Error getting account detail:', error);
    return res.status(500).json({ error: 'Failed to retrieve account details.' });
  }
}

async function createAccount(req, res) {
  try {
    const { account_type } = req.body;
    const validTypes = ['savings', 'checking'];
    const chosenType = validTypes.includes(account_type) ? account_type : 'savings';

    const accNumber = generateRandomAccountNumber();
    const pool = getPool();

    const [result] = await pool.query(
      `INSERT INTO accounts (user_id, account_number, account_type, balance, currency, status)
       VALUES (?, ?, ?, 0.00, 'INR', 'active')`,
      [req.user.id, accNumber, chosenType]
    );

    return res.status(201).json({
      message: 'New account successfully created.',
      account: {
        id: result.insertId,
        account_number: accNumber,
        account_type: chosenType,
        balance: 0.00,
        currency: 'INR',
        status: 'active'
      }
    });
  } catch (error) {
    console.error('Error opening account:', error);
    return res.status(500).json({ error: 'Failed to create new account.' });
  }
}

/**
 * Validate recipient before initiating a transfer
 */
async function lookupRecipientAccount(req, res) {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query required.' });
    }

    const pool = getPool();
    const [rows] = await pool.query(
      `SELECT a.id, a.account_number, a.account_type, a.status, u.full_name, u.email
       FROM accounts a
       JOIN users u ON a.user_id = u.id
       WHERE (a.account_number = ? OR u.email = ?) AND a.status = 'active'
       LIMIT 1`,
      [query.trim(), query.toLowerCase().trim()]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No active recipient found.' });
    }

    const match = rows[0];
    return res.json({
      found: true,
      account: {
        id: match.id,
        account_number: match.account_number,
        account_type: match.account_type,
        recipient_name: match.full_name,
        recipient_email: match.email
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Recipient lookup failed.' });
  }
}

module.exports = {
  getMyAccounts,
  getAccountById,
  createAccount,
  lookupRecipientAccount
};
