import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Wallet, 
  TrendingUp, 
  ArrowRight,
  BookOpenCheck,
  CreditCard,
  Layers,
  ShieldCheck,
  Activity
} from 'lucide-react';
import StatCard from '../../components/StatCard';
import { formatINR } from '../../utils/format';
import { adminApi } from '../../api/client';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      const res = await adminApi.stats();
      setStats(res.data.stats);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-bank-900">
            Institutional Operations & Command Center
          </h1>
          <p className="text-xs text-bank-500">
            Real-time oversight of Apex National Bank core ledger, customer accounts, and monetary operations in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/customers"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm"
          >
            Manage Customers
          </Link>
          <Link
            to="/admin/ledger"
            className="px-3.5 py-2 text-xs font-semibold rounded-lg text-bank-700 bg-white border border-bank-300 hover:bg-bank-50 transition-colors shadow-sm"
          >
            Global Ledger
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid - 5 stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Deposits"
          value={stats ? formatINR(stats.totalDeposits) : '₹0.00'}
          subtext="Across all active accounts"
          icon={Wallet}
          color="emerald"
        />

        <StatCard
          title="Total Customers"
          value={`${stats?.totalCustomers || 0}`}
          subtext="Verified account holders"
          icon={Users}
          color="blue"
        />

        <StatCard
          title="Total Accounts"
          value={`${stats?.totalAccounts || 0}`}
          subtext="Checking, Savings & Treasury"
          icon={CreditCard}
          color="purple"
        />

        <StatCard
          title="24h Volume"
          value={stats ? formatINR(stats.dailyVolume) : '₹0.00'}
          subtext={`${stats?.dailyTxCount || 0} txns in past 24h`}
          icon={TrendingUp}
          color="slate"
        />

        <StatCard
          title="Total Transactions"
          value={`${stats?.totalTransactions || 0}`}
          subtext="Audited in core ledger"
          icon={Activity}
          color="blue"
        />
      </div>

      {/* Primary Management Hubs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          to="/admin/customers"
          className="bank-card p-6 hover:border-navy-500 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-navy-50 flex items-center justify-center text-navy-800">
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-bold text-bank-900">Customer Management Directory</h3>
              <p className="text-xs text-bank-500 mt-1 leading-relaxed">
                Review verified customer profiles, view associated accounts, manage daily limits, and modify account statuses (Active / Frozen / Closed).
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-bank-100 flex items-center justify-between text-xs font-semibold text-navy-700">
            <span>Explore {stats?.totalCustomers || 0} Customer Profiles</span>
            <ArrowRight className="w-4 h-4 text-bank-400 group-hover:translate-x-1 group-hover:text-navy-900 transition-all" />
          </div>
        </Link>

        <Link
          to="/admin/ledger"
          className="bank-card p-6 hover:border-navy-500 hover:shadow-md transition-all group flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800">
              <BookOpenCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <h3 className="text-base font-bold text-bank-900">Global Double-Entry Ledger</h3>
              <p className="text-xs text-bank-500 mt-1 leading-relaxed">
                Immutable, real-time ledger accounting for all bank-wide deposits, withdrawals, internal transfers, and customer-to-customer settlements.
              </p>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-bank-100 flex items-center justify-between text-xs font-semibold text-navy-700">
            <span>Audit All {stats?.totalTransactions || 0} Transactions</span>
            <ArrowRight className="w-4 h-4 text-bank-400 group-hover:translate-x-1 group-hover:text-navy-900 transition-all" />
          </div>
        </Link>
      </div>

      {/* Platform & System Architecture Info Card */}
      <div className="bank-card p-5 bg-gradient-to-r from-bank-50 to-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-navy-900 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-bank-900">Core Banking Ledger Architecture</h4>
              <p className="text-xs text-bank-500">
                MySQL ACID transaction isolation guarantees zero uncommitted balance drift across accounts.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono text-bank-600">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Double-Entry Balance = ₹0.00 Drift</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
