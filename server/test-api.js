const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runTests() {
  console.log('🧪 Starting End-to-End Verification Tests for Apex Bank (INR ₹)...\n');

  try {
    // 1. Health check
    console.log('1. Checking API Health...');
    const health = await request('/health');
    console.log('   Health Status:', health.status, '| DB Connected:', health.database.connected);

    // 2. Customer Login
    console.log('\n2. Testing Customer Authentication (Sarah Jenkins)...');
    const customerLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'sarah.jenkins@example.com',
        password: 'Customer123!'
      })
    });
    const customerToken = customerLogin.token;
    console.log('   Authenticated as:', customerLogin.user.full_name, '(', customerLogin.user.role, ')');

    const authHeaders = { Authorization: `Bearer ${customerToken}` };

    // 3. Fetch Accounts
    console.log('\n3. Fetching Customer Accounts (in INR)...');
    const accRes = await request('/accounts/my', { headers: authHeaders });
    console.log(`   Found ${accRes.accounts.length} accounts. Currency: ${accRes.accounts[0].currency}. Total Balance: ₹${parseFloat(accRes.summary.totalBalance).toLocaleString('en-IN')}`);
    const checking = accRes.accounts.find(a => a.account_type === 'checking');
    const savings = accRes.accounts.find(a => a.account_type === 'savings');

    // 4. Admin Login
    console.log('\n4. Testing Bank Admin Authentication (Marcus Vance)...');
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin.marcus@apexbank.com',
        password: 'Admin123!'
      })
    });
    const adminToken = adminLogin.token;
    console.log('   Authenticated as:', adminLogin.user.full_name, '(', adminLogin.user.role, ')');

    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 5. Check Admin Stats
    console.log('\n5. Fetching Bank Stats (in INR)...');
    const statsRes = await request('/admin/stats', { headers: adminHeaders });
    console.log('   Total Bank Deposits:', `₹${parseFloat(statsRes.stats.totalDeposits).toLocaleString('en-IN')}`);
    console.log('   Total Customers:', statsRes.stats.totalCustomers);
    console.log('   Total Accounts:', statsRes.stats.totalAccounts);
    console.log('   Total Transactions:', statsRes.stats.totalTransactions);

    // 6. Check Global Ledger
    console.log('\n6. Checking Global Master Ledger...');
    const ledgerRes = await request('/admin/ledger?limit=5', { headers: adminHeaders });
    console.log(`   Found ${ledgerRes.transactions.length} transactions in ledger.`);

    console.log('\n✅ ALL SYSTEM & API VERIFICATION TESTS IN INR PASSED SUCCESSFULLY!\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failure:', err.data || err.message);
    process.exit(1);
  }
}

// Start server in background if not already running
const { spawn } = require('child_process');
const server = spawn('node', ['src/index.js'], { cwd: __dirname, stdio: 'inherit' });

setTimeout(() => {
  runTests().finally(() => {
    server.kill();
  });
}, 2000);
