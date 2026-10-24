import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  MapPin, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-bank-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-navy-900 items-center justify-center text-white shadow-md mb-3">
          <Building2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-bank-900">
          Open a New Account
        </h2>
        <p className="mt-1 text-sm text-bank-600">
          Instant onboarding with primary checking and $1,000 opening credit
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
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
                Full Legal Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Jonathan Taylor"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={6}
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Phone (Optional)
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-bank-700 uppercase tracking-wider mb-1">
                  Residential Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-bank-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="City, State, Zip"
                    className="block w-full pl-9 pr-3 py-2 text-sm border border-bank-300 rounded-lg focus:ring-2 focus:ring-navy-500 bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Includes instant ₹10,000 welcome opening deposit to test transfers.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-navy-900 hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Open Account & Access Console'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-bank-600 pt-2 border-t border-bank-100">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-navy-700 hover:text-navy-900 underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
