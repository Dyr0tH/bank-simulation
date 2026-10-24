import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  UserCheck, 
  ShieldCheck, 
  Database,
  Briefcase
} from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(searchParams.get('session_expired') ? 'Your session expired. Please sign in.' : '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'customer') {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  }

  function handleDemoFill(demoEmail, demoPassword) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    // Instant login
    login(demoEmail, demoPassword)
      .then((user) => {
        if (user.role === 'customer') {
          navigate('/dashboard');
        } else {
          navigate('/admin');
        }
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Failed to authenticate demo user.');
      });
  }

  return (
    <div className="min-h-screen bg-bank-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-navy-900 items-center justify-center text-white shadow-md mb-3">
          <Building2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-bank-900">
          Apex National Bank
        </h2>
        <p className="mt-1 text-sm text-bank-600">
          Institutional Core Banking Platform & Client Services
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        {/* Main Sign-In Card */}
        <div className="bank-card p-8 sm:p-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start space-x-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Account Email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Security Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-navy-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy-900 transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Banking Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* 1-Click Demo Accounts Section */}
          <div className="pt-4 border-t border-bank-200">
            <div className="text-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-bank-500">
                Fast 1-Click Demo Personas
              </span>
              <p className="text-[11px] text-bank-400">
                Click any persona below to log in immediately with realistic data:
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Sarah (Customer) */}
              <button
                type="button"
                onClick={() => handleDemoFill('sarah.jenkins@example.com', 'Customer123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-bank-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-bank-900 group-hover:text-emerald-800">
                      Sarah Jenkins (Primary Customer)
                    </div>
                    <div className="text-[11px] text-bank-500">
                      Checking (₹1,45,000) + High-Yield Savings (₹8,50,000)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                  Log in
                </span>
              </button>

              {/* David (Commercial) */}
              <button
                type="button"
                onClick={() => handleDemoFill('david.kim@example.com', 'Customer123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-bank-200 hover:border-blue-500 hover:bg-blue-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-bank-900 group-hover:text-blue-800">
                      David Kim (Commercial Customer)
                    </div>
                    <div className="text-[11px] text-bank-500">
                      Operating (₹2,75,000) + Treasury Portfolio (₹25,00,000)
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded">
                  Log in
                </span>
              </button>

              {/* Marcus (Admin) */}
              <button
                type="button"
                onClick={() => handleDemoFill('admin.marcus@apexbank.com', 'Admin123!')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-purple-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-800">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-bank-900 group-hover:text-purple-800 flex items-center space-x-1.5">
                      <span>Marcus Vance</span>
                      <span className="text-[9px] font-mono px-1.5 bg-purple-200 text-purple-900 rounded font-bold">
                        ADMIN
                      </span>
                    </div>
                    <div className="text-[11px] text-bank-500">
                      Global Ledger, Loan Approvals & Customer Freeze Controls
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                  Log in
                </span>
              </button>
            </div>
          </div>

          {/* MySQL Workbench Info Banner */}
          <div className="p-3 bg-bank-50 rounded-lg border border-bank-200 flex items-center space-x-2 text-xs text-bank-600">
            <Database className="w-4 h-4 text-bank-500 shrink-0" />
            <span>
              Connected to MySQL database <code className="font-mono font-bold text-bank-800">bank_simulation</code>. Manageable via MySQL Workbench.
            </span>
          </div>

          <div className="text-center text-xs text-bank-600">
            Need a new bank account?{' '}
            <Link to="/register" className="font-semibold text-navy-700 hover:text-navy-900 underline">
              Open an account online
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
