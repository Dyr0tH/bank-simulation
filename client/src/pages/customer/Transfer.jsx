import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Receipt,
  FileCheck2
} from 'lucide-react';
import { formatINR } from '../../utils/format';
import api from '../../api/client';

export function Transfer() {
  const { accounts, refreshProfile, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState('internal'); // 'internal', 'peer', 'deposit', 'withdraw'

  // Internal Transfer State
  const [sourceAccountId, setSourceAccountId] = useState('');
  const [targetAccountId, setTargetAccountId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Peer Transfer State
  const [recipientQuery, setRecipientQuery] = useState('');
  const [recipientData, setRecipientData] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Deposit & Withdrawal State
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositSource, setDepositSource] = useState('Direct Deposit - Corporate Salary (NEFT)');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawDest, setWithdrawDest] = useState('Apex Cash ATM #101 (BKC Mumbai)');

  // Shared UX State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Initialize selected accounts & tab
  useEffect(() => {
    const paramTab = searchParams.get('tab');
    if (paramTab && ['internal', 'peer', 'deposit', 'withdraw'].includes(paramTab)) {
      setActiveTab(paramTab);
    }

    if (accounts.length > 0) {
      const paramFrom = searchParams.get('fromAccount');
      const defaultSource = paramFrom ? accounts.find(a => a.id.toString() === paramFrom) : accounts[0];
      setSourceAccountId(defaultSource ? defaultSource.id : accounts[0].id);
      setSelectedAccountId(defaultSource ? defaultSource.id : accounts[0].id);

      if (accounts.length > 1) {
        const defaultDest = accounts.find(a => a.id !== (defaultSource ? defaultSource.id : accounts[0].id));
        setTargetAccountId(defaultDest ? defaultDest.id : accounts[1].id);
      }
    }
  }, [accounts, searchParams]);

  const activeSourceAcc = accounts.find(a => a.id.toString() === sourceAccountId.toString());
  const activeSelectedAcc = accounts.find(a => a.id.toString() === selectedAccountId.toString());

  // Search recipient by email or account number
  async function handleLookupRecipient() {
    if (!recipientQuery.trim()) return;
    setLookupError('');
    setRecipientData(null);
    setLookingUp(true);

    try {
      const res = await api.get(`/accounts/lookup?query=${encodeURIComponent(recipientQuery.trim())}`);
      setRecipientData(res.data.account);
    } catch (err) {
      setLookupError(err.response?.data?.error || 'No active recipient found matching that account or email.');
    } finally {
      setLookingUp(false);
    }
  }

  // Submit Internal Transfer
  async function handleInternalTransfer(e) {
    e.preventDefault();
    setError('');
    setSuccessReceipt(null);
    setLoading(true);

    try {
      const res = await api.post('/transactions/transfer', {
        sourceAccountId,
        destinationAccountId: targetAccountId,
        amount,
        description: description.trim() || 'Internal Account Transfer'
      });
      await refreshProfile();
      setSuccessReceipt(res.data.data);
      setAmount('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.error || 'Transfer failed.');
    } finally {
      setLoading(false);
    }
  }

  // Submit Peer Transfer
  async function handlePeerTransfer(e) {
    e.preventDefault();
    if (!recipientData) {
      setError('Please search and verify the recipient account first.');
      return;
    }
    setError('');
    setSuccessReceipt(null);
    setLoading(true);

    try {
      const res = await api.post('/transactions/transfer', {
        sourceAccountId,
        destinationAccountId: recipientData.id,
        amount,
        description: description.trim() || `Payment to ${recipientData.recipient_name} (IMPS/UPI)`
      });
      await refreshProfile();
      setSuccessReceipt(res.data.data);
      setAmount('');
      setDescription('');
      setRecipientData(null);
      setRecipientQuery('');
    } catch (err) {
      setError(err.response?.data?.error || 'Peer transfer failed.');
    } finally {
      setLoading(false);
    }
  }

  // Submit Simulated Deposit
  async function handleDeposit(e) {
    e.preventDefault();
    setError('');
    setSuccessReceipt(null);
    setLoading(true);

    try {
      const res = await api.post('/transactions/deposit', {
        accountId: selectedAccountId,
        amount: depositAmount,
        sourceOrigin: depositSource,
        description: `Electronic Deposit via ${depositSource}`
      });
      await refreshProfile();
      setSuccessReceipt(res.data.data);
      setDepositAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'Deposit failed.');
    } finally {
      setLoading(false);
    }
  }

  // Submit Simulated Withdrawal
  async function handleWithdraw(e) {
    e.preventDefault();
    setError('');
    setSuccessReceipt(null);
    setLoading(true);

    try {
      const res = await api.post('/transactions/withdraw', {
        accountId: selectedAccountId,
        amount: withdrawAmount,
        destinationName: withdrawDest,
        description: `Withdrawal from ${withdrawDest}`
      });
      await refreshProfile();
      setSuccessReceipt(res.data.data);
      setWithdrawAmount('');
    } catch (err) {
      setError(err.response?.data?.error || 'Withdrawal failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-bank-900">
          Money Movement & Transfers (INR ₹)
        </h1>
        <p className="text-xs text-bank-500">
          Instant UPI, IMPS, and RTGS atomic execution with row-level database locking and zero reconciliation delay.
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="border-b border-bank-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => { setActiveTab('internal'); setError(''); setSuccessReceipt(null); }}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'internal'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-bank-500 hover:text-bank-700'
            }`}
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Internal Transfer</span>
          </button>

          <button
            onClick={() => { setActiveTab('peer'); setError(''); setSuccessReceipt(null); }}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'peer'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-bank-500 hover:text-bank-700'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Send to Customer (IMPS/UPI)</span>
          </button>

          <button
            onClick={() => { setActiveTab('deposit'); setError(''); setSuccessReceipt(null); }}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'deposit'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-bank-500 hover:text-bank-700'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
            <span>Simulate Deposit</span>
          </button>

          <button
            onClick={() => { setActiveTab('withdraw'); setError(''); setSuccessReceipt(null); }}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'withdraw'
                ? 'border-navy-900 text-navy-900'
                : 'border-transparent text-bank-500 hover:text-bank-700'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-bank-600" />
            <span>Simulate Withdrawal</span>
          </button>
        </nav>
      </div>

      {/* Success Receipt Alert */}
      {successReceipt && (
        <div className="bank-card p-6 bg-emerald-50/40 border-emerald-300 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">Transaction Settled & Reconciled</h3>
                <p className="text-xs text-emerald-700 font-mono">
                  UTR / Reference: {successReceipt.referenceNo}
                </p>
              </div>
            </div>
            <Link
              to={`/transactions?search=${successReceipt.referenceNo}`}
              className="text-xs font-semibold text-emerald-800 hover:underline flex items-center space-x-1"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>View in Passbook / Ledger →</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-emerald-200 text-xs">
            <div>
              <span className="text-emerald-800/70 block text-[11px]">Transferred Sum</span>
              <span className="font-mono font-bold text-emerald-950 text-sm">
                {formatINR(successReceipt.amount)}
              </span>
            </div>
            <div>
              <span className="text-emerald-800/70 block text-[11px]">Source Account</span>
              <span className="font-mono font-medium text-emerald-950">
                {successReceipt.sourceAccount || successReceipt.accountNumber}
              </span>
            </div>
            <div>
              <span className="text-emerald-800/70 block text-[11px]">Beneficiary / Destination</span>
              <span className="font-medium text-emerald-950 truncate block">
                {successReceipt.destinationAccount || successReceipt.counterparty || 'Completed'}
              </span>
            </div>
            <div>
              <span className="text-emerald-800/70 block text-[11px]">Updated Balance</span>
              <span className="font-mono font-bold text-emerald-950">
                {formatINR(successReceipt.newSourceBalance ?? successReceipt.newBalance)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Transaction Rejected:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* TAB 1: INTERNAL TRANSFER */}
      {activeTab === 'internal' && (
        <div className="bank-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleInternalTransfer} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  From Account
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.account_number}) - {formatINR(acc.balance)}
                    </option>
                  ))}
                </select>
                {activeSourceAcc && (
                  <p className="text-[11px] text-bank-500 mt-1">
                    Available: <span className="font-mono font-semibold">{formatINR(activeSourceAcc.balance)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  To Account
                </label>
                <select
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {accounts.filter(a => a.id.toString() !== sourceAccountId.toString()).map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.account_number}) - {formatINR(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Transfer Amount (₹ INR)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-bank-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 25000"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Payment Remarks / Memo
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Allocation to Wealth Builder Savings"
                  className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                />
              </div>
            </div>

            <div className="p-3.5 bg-bank-50 rounded-lg border border-bank-200 flex items-center justify-between text-xs text-bank-600">
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Internal transfers are instantaneous and 100% free of charge.</span>
              </span>
              <span className="font-mono font-semibold text-emerald-700">₹0.00 Fee</span>
            </div>

            <button
              type="submit"
              disabled={loading || !amount || accounts.length < 2}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing Transfer...' : 'Execute Internal Transfer'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: PEER / EXTERNAL CUSTOMER TRANSFER */}
      {activeTab === 'peer' && (
        <div className="bank-card p-6 sm:p-8 space-y-6">
          {/* Step 1: Recipient Lookup */}
          <div className="space-y-3 pb-5 border-b border-bank-200">
            <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider">
              1. Search Beneficiary Account or UPI ID / Email
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-bank-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={recipientQuery}
                  onChange={(e) => setRecipientQuery(e.target.value)}
                  placeholder="Enter Beneficiary Account (1002-3391-05) or Email (david.kim@example.com)"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white font-mono"
                />
              </div>
              <button
                type="button"
                onClick={handleLookupRecipient}
                disabled={lookingUp || !recipientQuery.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {lookingUp ? 'Verifying...' : 'Verify Beneficiary'}
              </button>
            </div>

            {lookupError && (
              <p className="text-xs text-red-600 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{lookupError}</span>
              </p>
            )}

            {recipientData && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Verified Beneficiary
                  </span>
                  <div className="font-bold text-emerald-950 text-sm">
                    {recipientData.recipient_name}
                  </div>
                  <div className="text-emerald-800 font-mono text-[11px]">
                    Account #{recipientData.account_number} • IFSC: APEX0001001 • {recipientData.recipient_email}
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Transfer Details */}
          <form onSubmit={handlePeerTransfer} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Debit Account
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.account_number}) - {formatINR(acc.balance)}
                    </option>
                  ))}
                </select>
                {activeSourceAcc && (
                  <p className="text-[11px] text-bank-500 mt-1">
                    Available: <span className="font-mono font-semibold">{formatINR(activeSourceAcc.balance)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Transfer Sum (₹ INR)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-bank-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Payment Purpose / Remarks
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Settlement for professional consulting invoice #INV-92"
                className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !recipientData || !amount}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing IMPS Transfer...' : 'Send Funds Instantly via IMPS / UPI'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: SIMULATE DEPOSIT */}
      {activeTab === 'deposit' && (
        <div className="bank-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleDeposit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Credit Destination Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.account_number})
                    </option>
                  ))}
                </select>
                {activeSelectedAcc && (
                  <p className="text-[11px] text-bank-500 mt-1">
                    Current Balance: <span className="font-mono font-semibold">{formatINR(activeSelectedAcc.balance)}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Deposit Amount (₹ INR)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-bank-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Deposit Mechanism
              </label>
              <select
                value={depositSource}
                onChange={(e) => setDepositSource(e.target.value)}
                className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              >
                <option value="Direct Deposit - Corporate Salary (NEFT)">Direct Deposit - Corporate Salary (NEFT)</option>
                <option value="Incoming RTGS Interbank Transfer">Incoming RTGS Interbank Transfer</option>
                <option value="UPI Inward Payment">UPI Inward Payment</option>
                <option value="Cheque Deposit (CTS-2010 Clearing)">Cheque Deposit (CTS-2010 Clearing)</option>
                <option value="Fixed Deposit Interest Quarterly Credit">Fixed Deposit Interest Quarterly Credit</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !depositAmount}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Crediting Account...' : 'Simulate Deposit of Funds (INR ₹)'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: SIMULATE WITHDRAWAL */}
      {activeTab === 'withdraw' && (
        <div className="bank-card p-6 sm:p-8 space-y-6">
          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Debit Account
                </label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_name} ({acc.account_number}) - {formatINR(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Withdrawal Amount (₹ INR)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-bank-400 font-mono text-sm">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g. 5000"
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm font-mono border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Withdrawal Destination
              </label>
              <input
                type="text"
                value={withdrawDest}
                onChange={(e) => setWithdrawDest(e.target.value)}
                placeholder="e.g. Apex Cash ATM #101 (BKC Mumbai) or External Brokerage Account"
                className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !withdrawAmount}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Processing Withdrawal...' : 'Execute Cash / Interbank Withdrawal (INR ₹)'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Transfer;
