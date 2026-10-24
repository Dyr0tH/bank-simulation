-- ==============================================================================
-- APEX BANK - SAMPLE DATA (INR ₹)
-- Compatible with MySQL Workbench
-- ==============================================================================

USE bank_simulation;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE transactions;
TRUNCATE TABLE accounts;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. USERS
-- Password for all demo accounts:
-- Admin: Admin123!
-- Customers: Customer123!
-- ------------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, role, phone, status)
VALUES
(1, 'Marcus Vance', 'admin.marcus@apexbank.com', '$2a$10$hVVkNyYjzGVrUWzPSSQykue.lNy/RMrWTsZbcvnrg74RMpQ6e0gxi', 'admin', '+91 98200 11234', 'active'),
(2, 'Sarah Jenkins', 'sarah.jenkins@example.com', '$2a$10$CxQY9CDM9a68CYxtuD3Y1.OrRaYDY8G3rA0gtV/9z4IDluj2cP5d2', 'customer', '+91 98110 33452', 'active'),
(3, 'David Kim', 'david.kim@example.com', '$2a$10$CxQY9CDM9a68CYxtuD3Y1.OrRaYDY8G3rA0gtV/9z4IDluj2cP5d2', 'customer', '+91 98765 43210', 'active');

-- ------------------------------------------------------------------------------
-- 2. ACCOUNTS (INR ₹)
-- ------------------------------------------------------------------------------
INSERT INTO accounts (id, user_id, account_number, account_type, balance, currency, status)
VALUES
-- Sarah Jenkins accounts (₹1,50,000 savings + ₹45,000 checking)
(1, 2, '1001-8842-19', 'savings', 150000.00, 'INR', 'active'),
(2, 2, '1001-8842-20', 'checking', 45000.00, 'INR', 'active'),

-- David Kim account (₹2,75,000 savings)
(3, 3, '1002-3391-05', 'savings', 275000.00, 'INR', 'active');

-- ------------------------------------------------------------------------------
-- 3. TRANSACTIONS (INR ₹)
-- ------------------------------------------------------------------------------
INSERT INTO transactions (id, reference_no, source_account_id, destination_account_id, transaction_type, amount, description, status, counterparty_name, created_at)
VALUES
(1, 'TXN-20261001-001', NULL, 1, 'deposit', 185000.00, 'Monthly Salary Credit', 'completed', 'Employer Payroll', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(2, 'TXN-20261003-002', 1, 2, 'transfer', 25000.00, 'Internal Transfer to Checking', 'completed', 'Sarah Jenkins Checking', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 'TXN-20261005-003', 2, NULL, 'withdrawal', 5000.00, 'ATM Cash Withdrawal', 'completed', 'Local ATM', DATE_SUB(NOW(), INTERVAL 7 DAY)),
(4, 'TXN-20261008-004', 1, 3, 'transfer', 10000.00, 'Payment for invoice', 'completed', 'David Kim (1002-3391-05)', DATE_SUB(NOW(), INTERVAL 4 DAY)),
(5, 'TXN-20261012-005', NULL, 3, 'deposit', 100000.00, 'Client Advance Payment', 'completed', 'External Wire', DATE_SUB(NOW(), INTERVAL 2 DAY));
