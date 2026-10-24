import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Receipt, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Download, 
  Filter, 
  FileCheck2,
  Calendar,
  Building2
} from 'lucide-react';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';
import { formatINR } from '../../utils/format';
import api from '../../api/client';

export function Transactions() {
  const { accounts, user } = useAuth();
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(searchParams.get('accountId') || '');
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  // Selected receipt modal
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receiptLoading, setReceiptLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [selectedAccountId, selectedType, searchQuery]);

  async function fetchTransactions() {
    try {
      setLoading(true);
      let url = '/transactions/my?limit=100';
      if (selectedAccountId) url += `&accountId=${selectedAccountId}`;
      if (selectedType && selectedType !== 'all') url += `&type=${selectedType}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await api.get(url);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function openReceipt(tx) {
    try {
      setReceiptLoading(true);
      const res = await api.get(`/transactions/receipt/${tx.reference_no}`);
      setSelectedReceipt(res.data.receipt);
    } catch (err) {
      setSelectedReceipt(tx);
    } finally {
      setReceiptLoading(false);
    }
  }

  function handleExportCsv() {
    if (transactions.length === 0) return;
    const headers = ['Reference', 'Date', 'Type', 'Description', 'Amount', 'Status', 'Counterparty'];
    const rows = transactions.map(t => [
      t.reference_no,
      new Date(t.created_at).toISOString(),
      t.transaction_type,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.amount,
      t.status,
      `"${(t.counterparty_name || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_bank_statement_${user?.id}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-bank-900">
            Official Statement & Transaction Ledger
          </h1>
          <p className="text-xs text-bank-500">
            Immutable financial records stored directly in MySQL InnoDB ledger.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={transactions.length === 0}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-bank-700 bg-white border border-bank-300 hover:bg-bank-50 transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-bank-500" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bank-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Account Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-bank-500 mb-1">
              Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.account_name} ({acc.account_number})
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-bank-500 mb-1">
              Transaction Category
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="all">All Transactions</option>
              <option value="transfer">Internal & P2P Transfers</option>
              <option value="deposit">Deposits & Direct Credits</option>
              <option value="withdrawal">Withdrawals & Outflows</option>
            </select>
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-bank-500 mb-1">
              Search by Ref or Memo
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-bank-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Reference #, recipient, memo..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bank-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-bank-500">
            Reconciling ledger records...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-bank-500">
            No transaction records found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bank-table-header">Date & Timestamp</th>
                  <th className="bank-table-header">Reference ID</th>
                  <th className="bank-table-header">Classification</th>
                  <th className="bank-table-header">Counterparty & Account</th>
                  <th className="bank-table-header">Description</th>
                  <th className="bank-table-header text-right">Amount (INR ₹)</th>
                  <th className="bank-table-header text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isCredit = tx.flow === 'credit' || tx.transaction_type === 'deposit';
                  const isDebit = tx.flow === 'debit' || tx.transaction_type === 'withdrawal';

                  return (
                    <tr 
                      key={tx.id} 
                      onClick={() => openReceipt(tx)}
                      className="hover:bg-bank-50/80 cursor-pointer transition-colors"
                    >
                      <td className="bank-table-cell text-xs font-mono text-bank-600 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="bank-table-cell text-xs font-mono font-semibold text-bank-800">
                        {tx.reference_no}
                      </td>
                      <td className="bank-table-cell">
                        <div className="flex items-center space-x-2">
                          {isCredit ? (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          ) : isDebit ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-bank-600 shrink-0" />
                          ) : (
                            <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          )}
                          <span className="text-xs font-medium text-bank-900 capitalize">
                            {tx.transaction_type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="bank-table-cell text-xs font-medium text-bank-700 truncate max-w-[200px]">
                        {tx.counterparty_name || 'Apex Core Banking'}
                      </td>
                      <td className="bank-table-cell text-xs text-bank-600 truncate max-w-xs">
                        {tx.description}
                      </td>
                      <td className="bank-table-cell text-right font-mono font-bold tabular-nums whitespace-nowrap">
                        <span className={isCredit ? 'text-emerald-700' : isDebit ? 'text-bank-900' : 'text-blue-700'}>
                          {isCredit ? '+' : isDebit ? '-' : ''}
                          {formatINR(tx.amount)}
                        </span>
                      </td>
                      <td className="bank-table-cell text-center" onClick={(e) => { e.stopPropagation(); openReceipt(tx); }}>
                        <button className="text-xs font-semibold text-navy-700 hover:text-navy-900 px-2 py-1 rounded bg-bank-50 border border-bank-200 hover:bg-bank-100">
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      <Modal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        title="Official Transaction Voucher"
        maxWidth="max-w-md"
      >
        {selectedReceipt && (
          <div className="space-y-5">
            {/* Bank Header */}
            <div className="text-center pb-4 border-b border-bank-200">
              <div className="inline-flex w-10 h-10 rounded-xl bg-navy-900 items-center justify-center text-white mb-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-base font-bold text-bank-900">Apex National Bank</h4>
              <p className="text-[11px] font-mono text-bank-500 uppercase tracking-wider">
                Audited Ledger Receipt • Ref #{selectedReceipt.reference_no}
              </p>
            </div>

            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-bank-50 text-center space-y-1 border border-bank-200">
              <span className="text-[10px] uppercase font-bold text-bank-400 tracking-wider">
                Transacted Sum
              </span>
              <div className="text-2xl font-bold font-mono text-bank-900 tabular-nums">
                {formatINR(selectedReceipt.amount)}
              </div>
              <div className="pt-1">
                <Badge status={selectedReceipt.status} />
              </div>
            </div>

            {/* Receipt Details List */}
            <div className="space-y-2.5 text-xs text-bank-700">
              <div className="flex justify-between py-1 border-b border-bank-100">
                <span className="text-bank-400">Timestamp:</span>
                <span className="font-mono text-bank-800">
                  {new Date(selectedReceipt.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-bank-100">
                <span className="text-bank-400">Transaction Type:</span>
                <span className="font-medium text-bank-900 capitalize">
                  {selectedReceipt.transaction_type?.replace('_', ' ')}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-bank-100">
                <span className="text-bank-400">Description:</span>
                <span className="font-medium text-bank-900 text-right max-w-[220px]">
                  {selectedReceipt.description}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-bank-100">
                <span className="text-bank-400">Counterparty:</span>
                <span className="font-medium text-bank-900 text-right max-w-[220px]">
                  {selectedReceipt.counterparty_name || 'Apex Interbank Settlement'}
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-bank-100">
                <span className="text-bank-400">Processing Fee:</span>
                <span className="font-mono text-bank-800">$0.00 USD</span>
              </div>

              <div className="flex justify-between py-1 border-b border-bank-100">
                <span className="text-bank-400">Database Engine:</span>
                <span className="font-mono text-bank-800">MySQL InnoDB (ACID)</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-full py-2 text-xs font-semibold text-white bg-navy-900 hover:bg-navy-800 rounded-lg transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Transactions;
