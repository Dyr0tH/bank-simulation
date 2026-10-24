import React from 'react';

export function Badge({ status, type, children, size = 'sm' }) {
  const value = (status || type || children || '').toString().toLowerCase();

  const colorStyles = {
    // Account / User status
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    verified: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    frozen: 'bg-amber-50 text-amber-700 border-amber-200',
    suspended: 'bg-red-50 text-red-700 border-red-200',
    closed: 'bg-bank-100 text-bank-600 border-bank-200',

    // Transaction status
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    flagged: 'bg-red-50 text-red-700 border-red-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    reversed: 'bg-purple-50 text-purple-700 border-purple-200',

    // Flow
    credit: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    debit: 'bg-bank-100 text-bank-800 border-bank-300',
    internal: 'bg-blue-50 text-blue-700 border-blue-200',

    // Roles
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
    employee: 'bg-blue-50 text-blue-700 border-blue-200',
    customer: 'bg-bank-100 text-bank-700 border-bank-300',

    // Loans
    disbursed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    approved: 'bg-blue-50 text-blue-700 border-blue-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',

    // Support Priority
    urgent: 'bg-red-100 text-red-800 border-red-300 font-bold',
    high: 'bg-amber-100 text-amber-850 border-amber-300',
    medium: 'bg-blue-50 text-blue-700 border-blue-200',
    low: 'bg-bank-100 text-bank-600 border-bank-200',

    // Support status
    open: 'bg-amber-50 text-amber-700 border-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
    resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  };

  const style = colorStyles[value] || 'bg-bank-100 text-bank-700 border-bank-200';
  const sizeStyle = size === 'xs' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  const label = children || value.replace(/_/g, ' ');

  return (
    <span className={`inline-flex items-center font-medium capitalize border rounded-full ${sizeStyle} ${style}`}>
      {label}
    </span>
  );
}

export default Badge;
