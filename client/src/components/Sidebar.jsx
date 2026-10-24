import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  Receipt,
  Users,
  BookOpenCheck,
  Shield,
  Layers
} from 'lucide-react';

export function Sidebar() {
  const { user } = useAuth();
  const isCustomer = user?.role === 'customer';

  const customerNav = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Accounts', path: '/accounts', icon: Wallet },
    { name: 'Transfer & Transact', path: '/transfer', icon: ArrowLeftRight },
    { name: 'Transactions', path: '/transactions', icon: Receipt }
  ];

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Global Ledger', path: '/admin/ledger', icon: BookOpenCheck }
  ];

  const navItems = isCustomer ? customerNav : adminNav;

  return (
    <aside className="w-64 bg-white border-r border-bank-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        {/* Role Portal Header */}
        <div className="px-3 py-2 bg-bank-50 rounded-lg border border-bank-200">
          <span className="text-[10px] uppercase font-bold tracking-wider text-bank-400 block">
            Current Workspace
          </span>
          <div className="flex items-center space-x-2 mt-0.5">
            {isCustomer ? (
              <Wallet className="w-4 h-4 text-emerald-600" />
            ) : (
              <Shield className="w-4 h-4 text-purple-600" />
            )}
            <span className="text-xs font-semibold text-bank-900">
              {isCustomer ? 'Customer Portal' : 'Bank Operations Console'}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-bank-600 hover:text-bank-900 hover:bg-bank-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-bank-200 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-bank-500">
          <span className="flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Database Schema</span>
          </span>
          <span className="font-mono text-bank-700 font-medium">MySQL 8.0</span>
        </div>
        <div className="text-[10px] text-bank-400 leading-relaxed">
          Double-Entry Ledger Architecture
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
