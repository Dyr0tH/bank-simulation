import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Public Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard';
import CustomerAccounts from './pages/customer/Accounts';
import CustomerTransfer from './pages/customer/Transfer';
import CustomerTransactions from './pages/customer/Transactions';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerManager from './pages/admin/CustomerManager';
import GlobalLedger from './pages/admin/GlobalLedger';

function ProtectedLayout({ children, requiredRole }) {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-bank-50 text-bank-600 text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Core Banking Session...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'employee') {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === 'customer' && user.role !== 'customer') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bank-50">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function RootRedirect() {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token || !user) return <Navigate to="/login" replace />;
  return user.role === 'customer' 
    ? <Navigate to="/dashboard" replace /> 
    : <Navigate to="/admin" replace />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Customer Portal */}
          <Route path="/dashboard" element={
            <ProtectedLayout requiredRole="customer">
              <CustomerDashboard />
            </ProtectedLayout>
          } />
          <Route path="/accounts" element={
            <ProtectedLayout requiredRole="customer">
              <CustomerAccounts />
            </ProtectedLayout>
          } />
          <Route path="/transfer" element={
            <ProtectedLayout requiredRole="customer">
              <CustomerTransfer />
            </ProtectedLayout>
          } />
          <Route path="/transactions" element={
            <ProtectedLayout requiredRole="customer">
              <CustomerTransactions />
            </ProtectedLayout>
          } />

          {/* Customer Backward Compatibility Redirects */}
          <Route path="/customer/dashboard" element={<Navigate to="/dashboard" replace />} />
          <Route path="/customer/accounts" element={<Navigate to="/accounts" replace />} />
          <Route path="/customer/transfer" element={<Navigate to="/transfer" replace />} />
          <Route path="/customer/transactions" element={<Navigate to="/transactions" replace />} />

          {/* Bank Employee / Admin Portal */}
          <Route path="/admin" element={
            <ProtectedLayout requiredRole="admin">
              <AdminDashboard />
            </ProtectedLayout>
          } />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
          <Route path="/admin/customers" element={
            <ProtectedLayout requiredRole="admin">
              <CustomerManager />
            </ProtectedLayout>
          } />
          <Route path="/admin/ledger" element={
            <ProtectedLayout requiredRole="admin">
              <GlobalLedger />
            </ProtectedLayout>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
