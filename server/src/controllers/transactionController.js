const { getPool } = require('../config/db');
const {
  executeTransfer,
  executeDeposit,
  executeWithdrawal
} = require('../services/transferService');

async function transfer(req, res) {
  try {
    const { sourceAccountId, destinationAccountId, amount, description } = req.body;

    if (!sourceAccountId || !destinationAccountId || !amount) {
      return res.status(400).json({ error: 'Source account, destination account, and amount are required.' });
    }

    const pool = getPool();
    // Validate that the customer owns the source account
    if (req.user.role === 'customer') {
      const [ownerCheck] = await pool.query(
        'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
        [sourceAccountId, req.user.id]
      );
      if (ownerCheck.length === 0) {
        return res.status(403).json({ error: 'You do not have permission to debit this account.' });
      }
    }

    const result = await executeTransfer({
      sourceAccountId: parseInt(sourceAccountId, 10),
      destinationAccountId: parseInt(destinationAccountId, 10),
      amount,
      description
    });

    return res.json({
      message: 'Transfer processed successfully.',
      data: result
    });
  } catch (error) {
    console.error('Transfer execution error:', error.message);
    return res.status(400).json({ error: error.message || 'Transfer failed.' });
  }
}

async function deposit(req, res) {
  try {
    const { accountId, amount, description } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ error: 'Account ID and amount are required.' });
    }

    const pool = getPool();
    if (req.user.role === 'customer') {
      const [ownerCheck] = await pool.query(
        'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, req.user.id]
      );
      if (ownerCheck.length === 0) {
        return res.status(403).json({ error: 'You do not own this account.' });
      }
    }

    const result = await executeDeposit({
      accountId: parseInt(accountId, 10),
      amount,
      description
    });

    return res.json({
      message: 'Deposit credited successfully.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Deposit failed.' });
  }
}

async function withdraw(req, res) {
  try {
    const { accountId, amount, description } = req.body;

    if (!accountId || !amount) {
      return res.status(400).json({ error: 'Account ID and amount are required.' });
    }

    const pool = getPool();
    if (req.user.role === 'customer') {
      const [ownerCheck] = await pool.query(
        'SELECT id FROM accounts WHERE id = ? AND user_id = ?',
        [accountId, req.user.id]
      );
      if (ownerCheck.length === 0) {
        return res.status(403).json({ error: 'You do not own this account.' });
      }
    }

    const result = await executeWithdrawal({
      accountId: parseInt(accountId, 10),
      amount,
      description
    });

    return res.json({
      message: 'Withdrawal processed successfully.',
      data: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Withdrawal failed.' });
  }
}

async function getMyTransactions(req, res) {
  try {
    const { accountId, type, search, limit = 50 } = req.query;
    const pool = getPool();

    let query = `
      SELECT 
        t.id,
        t.reference_no,
        t.transaction_type,
        t.amount,
        t.description,
        t.status,
        t.counterparty_name,
        t.created_at,
        src.id as source_id,
        src.account_number as source_account_number,
        src.account_type as source_account_type,
        src.user_id as source_user_id,
        dst.id as destination_id,
        dst.account_number as destination_account_number,
        dst.account_type as destination_account_type,
        dst.user_id as destination_user_id
      FROM transactions t
      LEFT JOIN accounts src ON t.source_account_id = src.id
      LEFT JOIN accounts dst ON t.destination_account_id = dst.id
      WHERE (src.user_id = ? OR dst.user_id = ?)
    `;
    const params = [req.user.id, req.user.id];

    if (accountId) {
      query += ` AND (t.source_account_id = ? OR t.destination_account_id = ?)`;
      params.push(accountId, accountId);
    }

    if (type && type !== 'all') {
      query += ` AND t.transaction_type = ?`;
      params.push(type);
    }

    if (search) {
      query += ` AND (t.description LIKE ? OR t.reference_no LIKE ? OR t.counterparty_name LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += ` ORDER BY t.created_at DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [rows] = await pool.query(query, params);

    // Format direction: credit or debit relative to this user
    const formatted = rows.map(tx => {
      const isSender = tx.source_user_id === req.user.id;
      const isReceiver = tx.destination_user_id === req.user.id;
      let flow = 'neutral';
      if (isSender && !isReceiver) flow = 'debit';
      else if (!isSender && isReceiver) flow = 'credit';
      else if (isSender && isReceiver) flow = 'internal';

      return {
        ...tx,
        flow
      };
    });

    return res.json({ transactions: formatted });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ error: 'Failed to retrieve transactions.' });
  }
}

async function getTransactionReceipt(req, res) {
  try {
    const { referenceNo } = req.params;
    const pool = getPool();

    const [rows] = await pool.query(
      `SELECT 
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
       WHERE t.reference_no = ?`,
      [referenceNo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Transaction receipt not found.' });
    }

    return res.json({ receipt: rows[0] });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve transaction receipt.' });
  }
}

module.exports = {
  transfer,
  deposit,
  withdraw,
  getMyTransactions,
  getTransactionReceipt
};
