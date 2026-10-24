import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Wallet, 
  FileCheck, 
  Receipt, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { formatINR } from '../../utils/format';
import api from '../../api/client';

export function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected Customer Dossier
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerDossier, setCustomerDossier] = useState(null);
  const [dossierLoading, setDossierLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [search, statusFilter]);

  async function fetchCustomers() {
    try {
      setLoading(true);
      let url = '/admin/customers?';
      if (search) url += `search=${encodeURIComponent(search)}&`;
      if (statusFilter && statusFilter !== 'all') url += `status=${statusFilter}&`;
      const res = await api.get(url);
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openCustomerDossier(customerId) {
    setSelectedCustomerId(customerId);
    setDossierLoading(true);
    setActionSuccess('');
    setActionError('');
    try {
      const res = await api.get(`/admin/customers/${customerId}`);
      setCustomerDossier(res.data);
    } catch (err) {
      console.error('Failed to get dossier:', err);
    } finally {
      setDossierLoading(false);
    }
  }

  async function handleToggleAccountStatus(accountId, newStatus) {
    const reason = prompt(`Please enter administrative reason for marking account ${newStatus.toUpperCase()}:`, 'Administrative risk review');
    if (reason === null) return; // user cancelled

    setActionError('');
    setActionSuccess('');
    try {
      await api.patch(`/admin/accounts/${accountId}/status`, {
        status: newStatus,
        reason
      });
      setActionSuccess(`Account status successfully modified to ${newStatus}. Recorded in audit trail.`);
      // Refresh dossier
      await openCustomerDossier(selectedCustomerId);
      await fetchCustomers();
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update account status.');
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-bank-900">
          Customer Accounts & KYC Directory
        </h1>
        <p className="text-xs text-bank-500">
          Inspect client portfolios, review KYC compliance, and manage account operational statuses.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="bank-card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-bank-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Customer Name, Email, or Phone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="all">All Customer Profiles</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bank-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-bank-500">
            Querying customer database...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-12 text-center text-xs text-bank-500">
            No customers match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bank-table-header">Client Name</th>
                  <th className="bank-table-header">Contact & Email</th>
                  <th className="bank-table-header text-center">KYC Status</th>
                  <th className="bank-table-header text-center">Accounts</th>
                  <th className="bank-table-header text-right">Aggregate Balance</th>
                  <th className="bank-table-header text-center">Profile</th>
                  <th className="bank-table-header text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openCustomerDossier(c.id)}
                    className="hover:bg-bank-50/80 cursor-pointer transition-colors"
                  >
                    <td className="bank-table-cell">
                      <div className="font-semibold text-bank-900 text-xs">
                        {c.full_name}
                      </div>
                      <div className="text-[10px] font-mono text-bank-400">
                        ID: #{c.id} • Registered {new Date(c.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="bank-table-cell text-xs text-bank-700">
                      <div>{c.email}</div>
                      <div className="text-[11px] text-bank-400">{c.phone || 'No phone'}</div>
                    </td>
                    <td className="bank-table-cell text-center">
                      <Badge status={c.kyc_status} />
                    </td>
                    <td className="bank-table-cell text-center font-mono text-xs font-semibold text-bank-700">
                      {c.account_count}
                    </td>
                    <td className="bank-table-cell text-right font-mono font-bold tabular-nums text-bank-900 text-xs">
                      {formatINR(c.total_balance)}
                    </td>
                    <td className="bank-table-cell text-center">
                      <Badge status={c.status} />
                    </td>
                    <td className="bank-table-cell text-center">
                      <button
                        onClick={(e) => { e.stopPropagation(); openCustomerDossier(c.id); }}
                        className="text-xs font-semibold text-navy-700 hover:text-navy-900 px-2.5 py-1 rounded bg-bank-50 border border-bank-200 hover:bg-bank-100"
                      >
                        Inspect Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Dossier Modal */}
      <Modal
        isOpen={!!selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
        title="Institutional Client Dossier & Controls"
        maxWidth="max-w-3xl"
      >
        {dossierLoading || !customerDossier ? (
          <div className="p-8 text-center text-xs text-bank-500">
            Loading client dossier from MySQL...
          </div>
        ) : (
          <div className="space-y-6">
            {actionSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Client Profile Header */}
            <div className="p-4 bg-bank-50 rounded-xl border border-bank-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-bank-500 font-bold">
                  Client ID #{customerDossier.customer.id}
                </span>
                <h3 className="text-base font-bold text-bank-900">
                  {customerDossier.customer.full_name}
                </h3>
                <p className="text-xs text-bank-500 font-mono">
                  {customerDossier.customer.email} • {customerDossier.customer.phone || 'N/A'}
                </p>
                <p className="text-xs text-bank-600 mt-1">
                  Address: {customerDossier.customer.address || 'Address unfiled'}
                </p>
              </div>

              <div className="flex sm:flex-col items-start sm:items-end gap-1.5">
                <Badge status={customerDossier.customer.status} />
                <Badge status={customerDossier.customer.kyc_status} />
              </div>
            </div>

            {/* Linked Accounts with Freeze / Unfreeze controls */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bank-700 flex items-center space-x-1.5">
                <Wallet className="w-4 h-4 text-navy-700" />
                <span>Linked Bank Accounts & Administrative Controls</span>
              </h4>

              <div className="grid grid-cols-1 gap-2.5">
                {customerDossier.accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-3.5 rounded-lg border border-bank-200 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-bank-900">{acc.account_name}</span>
                        <span className="text-[10px] font-mono uppercase text-bank-500">({acc.account_type})</span>
                        <Badge status={acc.status} size="xs" />
                      </div>
                      <div className="text-xs font-mono text-bank-500 mt-0.5">
                        Account #{acc.account_number} • Daily Limit: {formatINR(acc.daily_transfer_limit)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[10px] text-bank-400 block uppercase">Balance</span>
                        <span className="font-mono font-bold text-bank-900 text-sm">
                          {formatINR(acc.balance)}
                        </span>
                      </div>

                      {/* Freeze / Unfreeze Button */}
                      {acc.status === 'active' ? (
                        <button
                          onClick={() => handleToggleAccountStatus(acc.id, 'frozen')}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 flex items-center space-x-1"
                          title="Prevent outgoing debit transfers"
                        >
                          <Lock className="w-3 h-3" />
                          <span>Freeze Account</span>
                        </button>
                      ) : acc.status === 'frozen' ? (
                        <button
                          onClick={() => handleToggleAccountStatus(acc.id, 'active')}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 flex items-center space-x-1"
                          title="Restore regular account operations"
                        >
                          <Unlock className="w-3 h-3" />
                          <span>Unfreeze Account</span>
                        </button>
                      ) : (
                        <span className="text-xs text-bank-400 italic">Account Closed</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions in dossier */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-bank-700 flex items-center space-x-1.5">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Recent Customer Ledger Movements</span>
              </h4>

              {customerDossier.recentTransactions.length === 0 ? (
                <div className="text-xs text-bank-500 p-4 border border-bank-100 rounded-lg text-center">
                  No transaction history recorded yet for this client.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-bank-200 rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-bank-50 border-b border-bank-200">
                      <tr>
                        <th className="p-2 font-semibold text-bank-600">Date</th>
                        <th className="p-2 font-semibold text-bank-600">Reference</th>
                        <th className="p-2 font-semibold text-bank-600">Type</th>
                        <th className="p-2 font-semibold text-bank-600 text-right">Amount</th>
                        <th className="p-2 font-semibold text-bank-600 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-bank-100">
                      {customerDossier.recentTransactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="p-2 font-mono text-bank-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-2 font-mono font-medium text-bank-800">
                            {tx.reference_no}
                          </td>
                          <td className="p-2 capitalize text-bank-700">
                            {tx.transaction_type.replace('_', ' ')}
                          </td>
                          <td className="p-2 font-mono font-bold text-bank-900 text-right">
                            {formatINR(tx.amount)}
                          </td>
                          <td className="p-2 text-center">
                            <Badge status={tx.status} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="px-4 py-2 text-xs font-semibold text-bank-700 hover:bg-bank-100 rounded-lg"
              >
                Close Dossier
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CustomerManager;
