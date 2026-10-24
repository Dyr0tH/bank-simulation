import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  LogOut, 
  Database, 
  UserCircle2, 
  ChevronDown, 
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import api from '../api/client';

export function Navbar() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [dbStatus, setDbStatus] = useState(null);
  const [showSwitchMenu, setShowSwitchMenu] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  async function checkHealth() {
    try {
      const res = await api.get('/health');
      setDbStatus(res.data.database);
    } catch (err) {
      setDbStatus({ connected: false });
    }
  }

  async function handleFastSwitch(email, password) {
    try {
      setSwitching(true);
      setShowSwitchMenu(false);
      const newUser = await login(email, password);
      if (newUser.role === 'customer') {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    } finally {
      setSwitching(false);
    }
  }

  return (
    <header className="bg-white border-b border-bank-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Platform Info */}
          <div className="flex items-center space-x-6">
            <Link 
              to={user?.role === 'customer' ? '/dashboard' : '/admin'} 
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-navy-900 flex items-center justify-center text-white shadow-sm group-hover:bg-navy-800 transition-colors">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="font-bold text-base tracking-tight text-bank-900 block leading-tight">
                  APEX NATIONAL BANK
                </span>
                <span className="text-[11px] font-mono uppercase text-bank-500 tracking-wider block">
                  Core Banking Platform
                </span>
              </div>
            </Link>

            {/* MySQL Status Pill */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-bank-50 border border-bank-200 rounded-full text-xs">
              <Database className="w-3.5 h-3.5 text-bank-500" />
              <span className="text-bank-600 font-medium">MySQL Workbench:</span>
              <span className="flex items-center space-x-1 font-mono text-[11px]">
                <span className={`w-2 h-2 rounded-full ${dbStatus?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className={dbStatus?.connected ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                  {dbStatus?.connected ? 'bank_simulation' : 'Connecting...'}
                </span>
              </span>
            </div>
          </div>

          {/* Right actions: Fast Demo Switcher, User Badge, Logout */}
          <div className="flex items-center space-x-3">
            {/* Quick Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSwitchMenu(!showSwitchMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-bank-700 bg-bank-100 hover:bg-bank-200 rounded-lg border border-bank-200 transition-colors"
                title="Switch test persona instantly"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-bank-500" />
                <span className="hidden sm:inline">Switch Demo Persona</span>
                <ChevronDown className="w-3 h-3 text-bank-500" />
              </button>

              {showSwitchMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-lg bg-white border border-bank-200 shadow-xl py-2 z-50">
                  <div className="px-3 py-1.5 border-b border-bank-100 text-[11px] font-semibold uppercase tracking-wider text-bank-400">
                    Instant Demo Login (1-Click)
                  </div>
                  
                  <button
                    onClick={() => handleFastSwitch('sarah.jenkins@example.com', 'Customer123!')}
                    className="w-full text-left px-3 py-2 hover:bg-bank-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-bank-900">Sarah Jenkins</div>
                      <div className="text-[11px] text-bank-500">Customer (Checking & Savings)</div>
                    </div>
                    {user?.email === 'sarah.jenkins@example.com' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleFastSwitch('david.kim@example.com', 'Customer123!')}
                    className="w-full text-left px-3 py-2 hover:bg-bank-50 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-bank-900">David Kim</div>
                      <div className="text-[11px] text-bank-500">Customer (Commercial / Treasury)</div>
                    </div>
                    {user?.email === 'david.kim@example.com' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleFastSwitch('admin.marcus@apexbank.com', 'Admin123!')}
                    className="w-full text-left px-3 py-2 hover:bg-bank-50 transition-colors flex items-center justify-between border-t border-bank-100 mt-1"
                  >
                    <div>
                      <div className="text-xs font-semibold text-bank-900 flex items-center space-x-1">
                        <span>Marcus Vance</span>
                        <span className="px-1.5 py-0.2 text-[9px] bg-purple-100 text-purple-700 rounded font-mono font-bold">ADMIN</span>
                      </div>
                      <div className="text-[11px] text-bank-500">Bank Operations & Underwriting</div>
                    </div>
                    {user?.email === 'admin.marcus@apexbank.com' && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Current user pill */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-bank-200">
              <div className="w-8 h-8 rounded-full bg-bank-200 flex items-center justify-center text-bank-700 font-semibold text-xs border border-bank-300">
                {user?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-semibold text-bank-900 block leading-tight">
                  {user?.full_name}
                </span>
                <span className="text-[10px] font-mono capitalize text-bank-500 flex items-center space-x-1">
                  <span>{user?.role}</span>
                  {user?.role === 'admin' && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                </span>
              </div>
            </div>

            {/* Sign Out */}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-2 text-bank-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
