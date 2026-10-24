import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeftRight, 
  CreditCard, 
  TrendingUp, 
  PlusCircle, 
  ShieldAlert,
  Download,
  Upload
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import Badge from '../../components/Badge';
import { formatINR } from '../../utils/format';
import { transactionsApi } from '../../api/client';

export function Dashboard() {
  const { user, accounts } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const res = await transactionsApi.getMy({ limit: 8 });
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Error fetching customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }

  const totalBalance = accounts.reduce((acc, curr) => acc + parseFloat(curr.balance || 0), 0);
  const primaryAccount = accounts.find(a => a.account_type === 'checking') || accounts[0];

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-bank-900">
            Welcome back, {user?.full_name}
          </h1>
          <p className="text-xs text-bank-500">
            Customer ID: #{user?.id} • KYC Status: Verified • Currency: INR (₹)
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/transfer"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transfer</span>
          </Link>
          <Link
            to="/transfer?tab=deposit"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deposit</span>
          </Link>
          <Link
            to="/transfer?tab=withdraw"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors shadow-sm"
          >
            <Upload className="w-3.5 h-3.5 text-amber-600" />
            <span>Withdraw</span>
          </Link>
          <Link
            to="/accounts"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-bank-700 bg-white border border-bank-300 hover:bg-bank-50 transition-colors shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-bank-500" />
            <span>Open Account</span>
          </Link>
        </div>
      </div>

      {/* Account Balance Alert if Frozen */}
      {accounts.some(a => a.status === 'frozen') && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center space-x-3 text-xs text-amber-800">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Notice: One or more of your accounts is currently frozen by compliance. Debit transfers may be restricted.
          </span>
        </div>
      )}

      {/* Key Balance & Activity Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Net Balance"
          value={formatINR(totalBalance)}
          subtext={`Across ${accounts.length} active account${accounts.length > 1 ? 's' : ''}`}
          icon={Wallet}
          color="emerald"
        />

        <StatCard
          title="Primary Account"
          value={primaryAccount ? formatINR(primaryAccount.balance) : '₹0.00'}
          subtext={primaryAccount ? `Acc #${primaryAccount.account_number}` : 'No account created'}
          icon={CreditCard}
          color="blue"
        />

        <StatCard
          title="Active Accounts"
          value={`${accounts.length} Accounts`}
          subtext="Checking, Savings & Treasury"
          icon={CreditCard}
          color="purple"
        />

        <StatCard
          title="Recent Activity"
          value={`${transactions.length} Transactions`}
          subtext="Double-entry ledger audited"
          icon={TrendingUp}
          color="slate"
        />
      </div>

      {/* Accounts List Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-bank-700">
            Your Bank Accounts
          </h2>
          <Link to="/accounts" className="text-xs font-medium text-navy-700 hover:underline">
            Manage all accounts & limits →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {accounts.map((acc) => (
            <div key={acc.id} className="bank-card p-5 space-y-3 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-bank-500 uppercase tracking-wider">
                    {acc.account_type}
                  </span>
                  <h3 className="text-sm font-bold text-bank-900 truncate">
                    {acc.account_name}
                  </h3>
                  <p className="text-xs font-mono text-bank-500 mt-0.5">
                    •••• {acc.account_number.slice(-7)}
                  </p>
                </div>
                <Badge status={acc.status} />
              </div>

              <div className="pt-2 border-t border-bank-100 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-bank-400 block uppercase">Available Balance</span>
                  <span className="text-xl font-bold font-mono text-bank-900 tabular-nums">
                    {formatINR(acc.balance)}
                  </span>
                </div>
                <Link
                  to={`/transfer?fromAccount=${acc.id}`}
                  className="text-xs font-semibold text-navy-700 hover:text-navy-900 bg-bank-50 hover:bg-bank-100 px-2.5 py-1.5 rounded border border-bank-200 transition-colors"
                >
                  Transfer
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bank-card overflow-hidden">
        <div className="p-4 border-b border-bank-200 flex items-center justify-between bg-bank-50/50">
          <div>
            <h2 className="text-sm font-bold text-bank-900">Recent Account Activity</h2>
            <p className="text-xs text-bank-500">Real-time ledger updates with instant reconciliation</p>
          </div>
          <Link
            to="/transactions"
            className="text-xs font-semibold text-navy-700 hover:text-navy-900"
          >
            View Full Statement & Ledger →
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-bank-500">
            {loading ? 'Loading recent transactions...' : 'No transactions found yet. Initiate a transfer or deposit to populate the ledger.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bank-table-header">Date / Time</th>
                  <th className="bank-table-header">Reference</th>
                  <th className="bank-table-header">Type & Counterparty</th>
                  <th className="bank-table-header">Description</th>
                  <th className="bank-table-header text-right">Amount (INR ₹)</th>
                  <th className="bank-table-header text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.flow === 'credit' || tx.transaction_type === 'deposit';
                  const isDebit = tx.flow === 'debit' || tx.transaction_type === 'withdrawal';

                  return (
                    <tr key={tx.id} className="hover:bg-bank-50/60 transition-colors">
                      <td className="bank-table-cell text-xs text-bank-500 font-mono">
                        {new Date(tx.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="bank-table-cell text-xs font-mono font-medium text-bank-700">
                        {tx.reference_no}
                      </td>
                      <td className="bank-table-cell">
                        <div className="flex items-center space-x-2">
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          ) : isDebit ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-bank-600" />
                          ) : (
                            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <div>
                            <span className="text-xs font-semibold text-bank-900 capitalize block">
                              {tx.transaction_type.replace('_', ' ')}
                            </span>
                            <span className="text-[11px] text-bank-500 block truncate max-w-[180px]">
                              {tx.counterparty_name || 'Apex Banking System'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="bank-table-cell text-xs text-bank-600 truncate max-w-xs">
                        {tx.description}
                      </td>
                      <td className="bank-table-cell text-right font-mono font-semibold tabular-nums">
                        <span className={isCredit ? 'text-emerald-700' : isDebit ? 'text-bank-900' : 'text-blue-700'}>
                          {isCredit ? '+' : isDebit ? '-' : ''}
                          {formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="bank-table-cell text-center">
                        <Badge status={tx.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
