const { getPool } = require('../config/db');

/**
 * High-level statistics for Admin Dashboard
 */
async function getStats(req, res) {
  try {
    const pool = getPool();

    // 1. Total deposits across all non-closed accounts
    const [depositRows] = await pool.query(
      `SELECT COALESCE(SUM(balance), 0) as totalDeposits, COUNT(*) as totalAccounts 
       FROM accounts WHERE status != 'closed'`
    );

    // 2. Total active customers
    const [userRows] = await pool.query(
      `SELECT COUNT(*) as totalCustomers FROM users WHERE role = 'customer' AND status = 'active'`
    );

    // 3. 24h Transaction Volume
    const [volRows] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as dailyVolume, COUNT(*) as dailyTxCount 
       FROM transactions 
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) AND status = 'completed'`
    );

    // 4. Total transactions overall
    const [allTxRows] = await pool.query(
      `SELECT COUNT(*) as totalTransactions FROM transactions`
    );

    return res.json({
      stats: {
        totalDeposits: parseFloat(depositRows[0].totalDeposits).toFixed(2),
        totalAccounts: depositRows[0].totalAccounts,
        totalCustomers: userRows[0].totalCustomers,
        dailyVolume: parseFloat(volRows[0].dailyVolume).toFixed(2),
        dailyTxCount: volRows[0].dailyTxCount,
        totalTransactions: allTxRows[0].totalTransactions
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ error: 'Failed to compute administrative statistics.' });
  }
}

/**
 * List all customers with balances and search filter
 */
async function listCustomers(req, res) {
  try {
    const { search, status } = req.query;
    const pool = getPool();

    let query = `
      SELECT 
        u.id, u.full_name, u.email, u.phone, u.status, u.created_at,
        COUNT(a.id) as account_count,
        COALESCE(SUM(a.balance), 0) as total_balance
      FROM users u
      LEFT JOIN accounts a ON u.id = a.user_id AND a.status != 'closed'
      WHERE u.role = 'customer'
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ` AND u.status = ?`;
      params.push(status);
    }

    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const [rows] = await pool.query(query, params);
    return res.json({ customers: rows });
  } catch (error) {
    console.error('List customers error:', error);
    return res.status(500).json({ error: 'Failed to retrieve customers.' });
  }
}

/**
 * Detailed customer profile with accounts and recent transactions
 */
async function getCustomerDetail(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [userRows] = await pool.query(
      'SELECT id, full_name, email, phone, status, created_at FROM users WHERE id = ?',
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'Customer not found.' });
    }

    const [accounts] = await pool.query(
      'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC',
      [id]
    );

    const [transactions] = await pool.query(
      `SELECT t.*, src.account_number as src_number, dst.account_number as dst_number
       FROM transactions t
       LEFT JOIN accounts src ON t.source_account_id = src.id
       LEFT JOIN accounts dst ON t.destination_account_id = dst.id
       WHERE src.user_id = ? OR dst.user_id = ?
       ORDER BY t.created_at DESC
       LIMIT 20`,
      [id, id]
    );

    return res.json({
      customer: userRows[0],
      accounts,
      recentTransactions: transactions
    });
  } catch (error) {
    console.error('Customer detail error:', error);
    return res.status(500).json({ error: 'Failed to retrieve customer details.' });
  }
}

/**
 * Freeze or unfreeze an account
 */
async function updateAccountStatus(req, res) {
  try {
    const { accountId } = req.params;
    const { status } = req.body;

    if (!['active', 'frozen'].includes(status)) {
      return res.status(400).json({ error: 'Status must be active or frozen.' });
    }

    const pool = getPool();
    const [accRows] = await pool.query(
      'SELECT id, account_number, status FROM accounts WHERE id = ?',
      [accountId]
    );

    if (accRows.length === 0) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    await pool.query('UPDATE accounts SET status = ? WHERE id = ?', [status, accountId]);

    return res.json({
      message: `Account status updated to ${status}.`,
      accountNumber: accRows[0].account_number,
      newStatus: status
    });
  } catch (error) {
    console.error('Update status error:', error);
    return res.status(500).json({ error: 'Failed to update account status.' });
  }
}

/**
 * Global Transaction Ledger for Admin
 */
async function getGlobalLedger(req, res) {
  try {
    const { type, search, limit = 100 } = req.query;
    const pool = getPool();

    let query = `
      SELECT 
        t.*,
        src.account_number as source_account,
        u_src.full_name as source_owner,
        dst.account_number as destination_account,
        u_dst.full_name as destination_owner
      FROM transactions t
      LEFT JOIN accounts src ON t.source_account_id = src.id
      LEFT JOIN users u_src ON src.user_id = u_src.id
      LEFT JOIN accounts dst ON t.destination_account_id = dst.id
      LEFT JOIN users u_dst ON dst.user_id = u_dst.id
      WHERE 1=1
    `;
    const params = [];

    if (type && type !== 'all') {
      query += ` AND t.transaction_type = ?`;
      params.push(type);
    }

    if (search) {
      query += ` AND (t.reference_no LIKE ? OR t.description LIKE ? OR t.counterparty_name LIKE ? OR u_src.full_name LIKE ? OR u_dst.full_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    query += ` ORDER BY t.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);
    return res.json({ transactions: rows });
  } catch (error) {
    console.error('Error fetching global ledger:', error);
    return res.status(500).json({ error: 'Failed to load transaction ledger.' });
  }
}

module.exports = {
  getStats,
  listCustomers,
  getCustomerDetail,
  updateAccountStatus,
  getGlobalLedger
};
