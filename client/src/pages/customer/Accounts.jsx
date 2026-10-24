import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  PlusCircle, 
  ShieldCheck, 
  ArrowLeftRight, 
  ArrowDownLeft, 
  ArrowUpRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { formatINR } from '../../utils/format';
import api from '../../api/client';

export function Accounts() {
  const { accounts, refreshProfile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountType, setAccountType] = useState('savings');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleOpenAccount(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/accounts/open', {
        account_type: accountType,
        account_name: accountName.trim() || undefined
      });
      await refreshProfile();
      setSuccess('Your new financial account has been successfully established.');
      setIsModalOpen(false);
      setAccountName('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to open account.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-bank-900">
            Account Portfolio & Management
          </h1>
          <p className="text-xs text-bank-500">
            Overview of your checking, high-yield savings (7.25% p.a.), and investment accounts in Indian Rupees (₹).
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Open Additional Account</span>
        </button>
      </div>

      {success && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map((acc) => (
          <div key={acc.id} className="bank-card flex flex-col justify-between overflow-hidden">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-bank-500">
                    {acc.account_type} account
                  </span>
                  <h3 className="text-base font-bold text-bank-900 mt-0.5">
                    {acc.account_name}
                  </h3>
                </div>
                <Badge status={acc.status} />
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-bank-500 block uppercase">Available Balance</span>
                <div className="text-2xl font-bold font-mono text-bank-900 tabular-nums">
                  {formatINR(acc.balance)}
                </div>
              </div>

              <div className="pt-3 border-t border-bank-100 space-y-2 text-xs text-bank-600">
                <div className="flex justify-between">
                  <span className="text-bank-500">Account Number:</span>
                  <span className="font-mono font-medium text-bank-800">{acc.account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bank-500">IFSC Code:</span>
                  <span className="font-mono text-bank-700">APEX0001001 (Mumbai BKC)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bank-500">MICR Code:</span>
                  <span className="font-mono text-bank-700">400240012</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bank-500">Daily IMPS/RTGS Limit:</span>
                  <span className="font-mono text-bank-700">
                    {formatINR(acc.daily_transfer_limit || 500000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Quick Action Bar */}
            <div className="bg-bank-50 px-5 py-3 border-t border-bank-200 flex items-center justify-between text-xs">
              <Link
                to={`/transfer?fromAccount=${acc.id}`}
                className="font-semibold text-navy-700 hover:text-navy-900 flex items-center space-x-1"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Transfer Funds</span>
              </Link>
              <Link
                to={`/transactions?accountId=${acc.id}`}
                className="font-medium text-bank-600 hover:text-bank-900"
              >
                Ledger History →
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Information Callout */}
      <div className="p-4 rounded-xl bg-bank-100/60 border border-bank-200 flex items-start space-x-3 text-xs text-bank-600">
        <Info className="w-4 h-4 text-bank-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-bank-800">DICGC Deposit Insurance & Relational Integrity</p>
          <p>
            All deposits are denominated in Indian Rupees (INR ₹) with ACID transactional protection. Accounts, balances, and reference logs correspond directly to tables in your MySQL Workbench schema (<code className="font-mono font-semibold">accounts</code>, <code className="font-mono font-semibold">transactions</code>).
          </p>
        </div>
      </div>

      {/* Open Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Establish New Bank Account"
      >
        <form onSubmit={handleOpenAccount} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1.5">
              Select Account Tier
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${accountType === 'checking' ? 'border-navy-500 bg-navy-50/30 ring-1 ring-navy-500' : 'border-bank-200 hover:bg-bank-50'}`}>
                <input
                  type="radio"
                  name="tier"
                  value="checking"
                  checked={accountType === 'checking'}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="mt-0.5 text-navy-900"
                />
                <div className="ml-3">
                  <div className="text-xs font-bold text-bank-900">Everyday Operating Checking / Current</div>
                  <div className="text-[11px] text-bank-500">Zero charges, unlimited IMPS/UPI daily transactions, RuPay/Visa Platinum debit card.</div>
                </div>
              </label>

              <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${accountType === 'savings' ? 'border-navy-500 bg-navy-50/30 ring-1 ring-navy-500' : 'border-bank-200 hover:bg-bank-50'}`}>
                <input
                  type="radio"
                  name="tier"
                  value="savings"
                  checked={accountType === 'savings'}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="mt-0.5 text-navy-900"
                />
                <div className="ml-3">
                  <div className="text-xs font-bold text-bank-900">High-Yield Wealth Builder Savings</div>
                  <div className="text-[11px] text-bank-500">7.25% p.a. interest calculated daily, automated quarterly interest credits.</div>
                </div>
              </label>

              <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${accountType === 'investment' ? 'border-navy-500 bg-navy-50/30 ring-1 ring-navy-500' : 'border-bank-200 hover:bg-bank-50'}`}>
                <input
                  type="radio"
                  name="tier"
                  value="investment"
                  checked={accountType === 'investment'}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="mt-0.5 text-navy-900"
                />
                <div className="ml-3">
                  <div className="text-xs font-bold text-bank-900">Treasury & Fixed Deposit (FD) Portfolio</div>
                  <div className="text-[11px] text-bank-500">Commercial grade fixed-deposit yields, RBI bonds, and institutional treasury liquidity.</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
              Account Custom Nickname (Optional)
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Tax Reserve or Vacation Fund"
              className="w-full text-sm px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            />
          </div>

          <div className="pt-3 border-t border-bank-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-2 text-xs font-medium text-bank-700 hover:bg-bank-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Establish Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Accounts;
