const crypto = require('crypto');
const { getPool } = require('../config/db');

function generateReferenceNo(prefix = 'TXN') {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${dateStr}-${randomStr}`;
}

/**
 * Atomic money transfer between two accounts
 */
async function executeTransfer({
  sourceAccountId,
  destinationAccountId,
  amount,
  description
}) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Transfer amount must be a positive number.');
  }

  if (sourceAccountId === destinationAccountId) {
    throw new Error('Source and destination accounts cannot be the same.');
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Lock and inspect source account
    const [sourceRows] = await connection.query(
      `SELECT a.id, a.user_id, a.account_number, a.balance, a.status, u.full_name as owner_name 
       FROM accounts a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ? FOR UPDATE`,
      [sourceAccountId]
    );

    if (sourceRows.length === 0) {
      throw new Error('Source account not found.');
    }

    const source = sourceRows[0];
    if (source.status !== 'active') {
      throw new Error(`Source account is ${source.status}. Transfer cannot proceed.`);
    }

    const currentBalance = parseFloat(source.balance);
    if (currentBalance < numAmount) {
      throw new Error(`Insufficient funds. Current balance is ₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
    }

    // 2. Lock and inspect destination account
    const [destRows] = await connection.query(
      `SELECT a.id, a.user_id, a.account_number, a.balance, a.status, u.full_name as owner_name 
       FROM accounts a
       JOIN users u ON a.user_id = u.id
       WHERE a.id = ? FOR UPDATE`,
      [destinationAccountId]
    );

    if (destRows.length === 0) {
      throw new Error('Destination account not found.');
    }

    const dest = destRows[0];
    if (dest.status !== 'active') {
      throw new Error(`Destination account is ${dest.status}. Cannot receive transfers.`);
    }

    // 3. Update account balances atomically
    await connection.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [numAmount, sourceAccountId]
    );

    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [numAmount, destinationAccountId]
    );

    // 4. Create transaction ledger record
    const refNo = generateReferenceNo('TXN');
    const isInternal = source.user_id === dest.user_id;
    const counterparty = isInternal
      ? `${dest.account_number}`
      : `${dest.owner_name} (${dest.account_number})`;

    const [txResult] = await connection.query(
      `INSERT INTO transactions 
       (reference_no, source_account_id, destination_account_id, transaction_type, amount, description, status, counterparty_name)
       VALUES (?, ?, ?, 'transfer', ?, ?, 'completed', ?)`,
      [
        refNo,
        sourceAccountId,
        destinationAccountId,
        numAmount,
        description || (isInternal ? 'Internal Transfer' : 'Transfer to ' + dest.owner_name),
        counterparty
      ]
    );

    await connection.commit();

    return {
      success: true,
      transactionId: txResult.insertId,
      referenceNo: refNo,
      amount: numAmount,
      newSourceBalance: currentBalance - numAmount,
      sourceAccount: source.account_number,
      destinationAccount: dest.account_number,
      counterparty,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Deposit funds into an account
 */
async function executeDeposit({
  accountId,
  amount,
  description
}) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Deposit amount must be a positive number.');
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accRows] = await connection.query(
      'SELECT id, user_id, account_number, balance, status FROM accounts WHERE id = ? FOR UPDATE',
      [accountId]
    );

    if (accRows.length === 0) {
      throw new Error('Account not found.');
    }

    const account = accRows[0];
    if (account.status !== 'active') {
      throw new Error(`Account is ${account.status}. Cannot accept deposits.`);
    }

    await connection.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [numAmount, accountId]
    );

    const refNo = generateReferenceNo('DEP');
    const [txResult] = await connection.query(
      `INSERT INTO transactions 
       (reference_no, source_account_id, destination_account_id, transaction_type, amount, description, status, counterparty_name)
       VALUES (?, NULL, ?, 'deposit', ?, ?, 'completed', 'Online Deposit')`,
      [
        refNo,
        accountId,
        numAmount,
        description || 'Account Deposit'
      ]
    );

    await connection.commit();

    return {
      success: true,
      transactionId: txResult.insertId,
      referenceNo: refNo,
      amount: numAmount,
      newBalance: parseFloat(account.balance) + numAmount,
      accountNumber: account.account_number
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Withdraw funds from an account
 */
async function executeWithdrawal({
  accountId,
  amount,
  description
}) {
  const numAmount = parseFloat(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Withdrawal amount must be a positive number.');
  }

  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [accRows] = await connection.query(
      'SELECT id, user_id, account_number, balance, status FROM accounts WHERE id = ? FOR UPDATE',
      [accountId]
    );

    if (accRows.length === 0) {
      throw new Error('Account not found.');
    }

    const account = accRows[0];
    if (account.status !== 'active') {
      throw new Error(`Account is ${account.status}. Withdrawals are disabled.`);
    }

    const currentBalance = parseFloat(account.balance);
    if (currentBalance < numAmount) {
      throw new Error(`Insufficient balance for withdrawal. Current balance is ₹${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
    }

    await connection.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [numAmount, accountId]
    );

    const refNo = generateReferenceNo('WTH');
    const [txResult] = await connection.query(
      `INSERT INTO transactions 
       (reference_no, source_account_id, destination_account_id, transaction_type, amount, description, status, counterparty_name)
       VALUES (?, ?, NULL, 'withdrawal', ?, ?, 'completed', 'ATM / Self-Withdrawal')`,
      [
        refNo,
        accountId,
        numAmount,
        description || 'Account Cash Withdrawal'
      ]
    );

    await connection.commit();

    return {
      success: true,
      transactionId: txResult.insertId,
      referenceNo: refNo,
      amount: numAmount,
      newBalance: currentBalance - numAmount,
      accountNumber: account.account_number
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  executeTransfer,
  executeDeposit,
  executeWithdrawal,
  generateReferenceNo
};
