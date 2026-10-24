import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BookOpenCheck, 
  Search, 
  Download, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  ArrowLeftRight,
  ShieldAlert
} from 'lucide-react';
import Badge from '../../components/Badge';
import { formatINR } from '../../utils/format';
import api from '../../api/client';

export function GlobalLedger() {
  const [searchParams] = useSearchParams();

  const [transactions, setTransactions] = useState([]);
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [minAmount, setMinAmount] = useState(searchParams.get('minAmount') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalLedger();
  }, [typeFilter, minAmount, search]);

  async function fetchGlobalLedger() {
    try {
      setLoading(true);
      let url = '/admin/ledger?limit=150&';
      if (typeFilter && typeFilter !== 'all') url += `type=${typeFilter}&`;
      if (minAmount) url += `minAmount=${minAmount}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const res = await api.get(url);
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Failed to load global ledger:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (transactions.length === 0) return;
    const headers = ['Reference', 'Timestamp', 'Type', 'Amount_INR', 'Source Account', 'Destination Account', 'Counterparty', 'Description', 'Status'];
    const rows = transactions.map(t => [
      t.reference_no,
      new Date(t.created_at).toISOString(),
      t.transaction_type,
      t.amount,
      t.source_account || 'N/A',
      t.destination_account || 'N/A',
      `"${(t.counterparty_name || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      t.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_global_ledger_INR_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-bank-900">
            Institutional Global Ledger (INR ₹)
          </h1>
          <p className="text-xs text-bank-500">
            Real-time double-entry transaction journal across all personal and commercial accounts in Indian Rupees.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          disabled={transactions.length === 0}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-lg text-bank-700 bg-white border border-bank-300 hover:bg-bank-50 transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-bank-500" />
          <span>Export Master CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bank-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold uppercase text-bank-500 mb-1">
              Transaction Classification
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-1.5 border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            >
              <option value="all">All Classifications</option>
              <option value="transfer">Interbank & P2P Transfers (IMPS/UPI)</option>
              <option value="deposit">Deposits & NEFT Credits</option>
              <option value="withdrawal">ATM Withdrawals & Outflows</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-bank-500 mb-1">
              Minimum Threshold (₹ INR)
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="e.g. 500000 (₹5 Lakhs threshold)"
              className="w-full text-xs px-3 py-1.5 font-mono border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase text-bank-500 mb-1">
              Global Ledger Search
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-bank-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="UTR / Ref #, party, account..."
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bank-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-bank-500">
            Querying MySQL ledger records...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-bank-500">
            No ledger records match the specified query filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="bank-table-header">Timestamp</th>
                  <th className="bank-table-header">Reference ID</th>
                  <th className="bank-table-header">Type</th>
                  <th className="bank-table-header">Source Account</th>
                  <th className="bank-table-header">Destination Account</th>
                  <th className="bank-table-header">Description</th>
                  <th className="bank-table-header text-right">Amount (INR ₹)</th>
                  <th className="bank-table-header text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const isHighVal = parseFloat(tx.amount) >= 500000;
                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-bank-50/80 transition-colors ${
                        isHighVal ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="bank-table-cell text-xs font-mono text-bank-500 whitespace-nowrap">
                        {new Date(tx.created_at).toLocaleString([], {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="bank-table-cell text-xs font-mono font-semibold text-bank-800">
                        <div className="flex items-center space-x-1.5">
                          <span>{tx.reference_no}</span>
                          {isHighVal && (
                            <span title="High value transaction (>= ₹5 Lakhs RBI Threshold)">
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="bank-table-cell text-xs font-medium capitalize text-bank-900">
                        {tx.transaction_type.replace('_', ' ')}
                      </td>
                      <td className="bank-table-cell text-xs font-mono text-bank-700">
                        {tx.source_account ? (
                          <div>
                            <div>{tx.source_account}</div>
                            <div className="text-[10px] text-bank-400 font-sans">{tx.source_owner}</div>
                          </div>
                        ) : (
                          <span className="text-bank-400 italic">External / NEFT Inflow</span>
                        )}
                      </td>
                      <td className="bank-table-cell text-xs font-mono text-bank-700">
                        {tx.destination_account ? (
                          <div>
                            <div>{tx.destination_account}</div>
                            <div className="text-[10px] text-bank-400 font-sans">{tx.destination_owner}</div>
                          </div>
                        ) : (
                          <span className="text-bank-400 italic">External / Outflow</span>
                        )}
                      </td>
                      <td className="bank-table-cell text-xs text-bank-600 truncate max-w-xs">
                        {tx.description}
                      </td>
                      <td className="bank-table-cell text-right font-mono font-bold tabular-nums text-xs whitespace-nowrap text-bank-900">
                        {formatINR(tx.amount)}
                      </td>
                      <td className="bank-table-cell text-center">
                        <Badge status={tx.status} size="xs" />
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

export default GlobalLedger;
