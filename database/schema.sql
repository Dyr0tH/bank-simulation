-- ==============================================================================
-- APEX BANK - CORE DATABASE SCHEMA
-- Compatible with MySQL 8.0+ and MySQL Workbench
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS bank_simulation
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE bank_simulation;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS users;

-- Clean up older tables if they exist
DROP TABLE IF EXISTS loans;
DROP TABLE IF EXISTS support_tickets;
DROP TABLE IF EXISTS audit_logs;

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------------------------
-- 1. USERS TABLE
-- Customers and Bank Admins / Employees
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
    phone VARCHAR(30) NULL,
    status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 2. ACCOUNTS TABLE
-- Customer Bank Accounts (Savings or Checking in INR ₹)
-- ------------------------------------------------------------------------------
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_number VARCHAR(20) NOT NULL UNIQUE,
    account_type ENUM('savings', 'checking') NOT NULL DEFAULT 'savings',
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    status ENUM('active', 'frozen') NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_acc_number (account_number),
    INDEX idx_acc_user (user_id),
    INDEX idx_acc_status (status)
) ENGINE=InnoDB;

-- ------------------------------------------------------------------------------
-- 3. TRANSACTIONS TABLE
-- Simple ledger: Transfers, Deposits, Withdrawals
-- ------------------------------------------------------------------------------
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference_no VARCHAR(36) NOT NULL UNIQUE,
    source_account_id INT NULL,
    destination_account_id INT NULL,
    transaction_type ENUM('transfer', 'deposit', 'withdrawal') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    status ENUM('completed', 'failed') NOT NULL DEFAULT 'completed',
    counterparty_name VARCHAR(120) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tx_source FOREIGN KEY (source_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    CONSTRAINT fk_tx_dest FOREIGN KEY (destination_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
    INDEX idx_tx_ref (reference_no),
    INDEX idx_tx_source (source_account_id),
    INDEX idx_tx_dest (destination_account_id),
    INDEX idx_tx_created (created_at)
) ENGINE=InnoDB;
