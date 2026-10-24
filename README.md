# 🏦 Apex Bank — Web Banking Application

A clean, modern, and easy-to-use banking web application with all balances in Indian Rupees (**INR ₹**). Built with simplicity and readability in mind, without any bloated or confusing features.

---

## 🌟 Overview

**Apex Bank** is a streamlined full-stack banking simulator designed for clarity and reliability. It features two user portals:
- **Customer Portal**: Check balances, transfer money, make deposits and withdrawals, and view transaction receipts.
- **Admin / Employee Portal**: Monitor bank statistics, view customers and freeze/unfreeze accounts, and audit the global transaction ledger.

All data is backed by a clean MySQL database with standard ACID transactions to keep balances safe and synchronized.

---

## 🚀 Key Features

### 👤 Customer Features
- **Accounts & Balances**: View current balances in Indian Rupees (₹) for Savings and Checking accounts.
- **Money Transfers**: Instant money transfers to any account with live recipient name lookup.
- **Deposit & Withdraw**: Simple simulation to add funds (cash/wire) or withdraw cash with balance checks.
- **Transaction History**: View real-time transactions and click any item to see and print a transaction receipt voucher.

### 🛡️ Admin / Employee Features
- **Bank Dashboard**: Live summary of total deposits held, active accounts, and total settled transactions.
- **Customer Management**: Search all registered customers, inspect account balances, and freeze/unfreeze accounts with one click.
- **Global Ledger**: A master record of every transaction across the entire bank with quick search and filters.

---

## 🛠️ Technology Stack

- **Database**: MySQL 8.0+ / MySQL Workbench (3 simple, clean tables: `users`, `accounts`, `transactions`)
- **Backend**: Node.js & Express (REST API with JWT authentication and safe MySQL transactions)
- **Frontend**: React (Vite) + Tailwind CSS (clean, responsive, neutral design)

---

## ⚡ Quick Setup Guide (3 Simple Steps)

### Step 1: Set up the Database
Make sure MySQL is running on `localhost:3306`.
- **Option A (MySQL Workbench)**:
  1. Open MySQL Workbench and connect to your local MySQL server.
  2. Open and execute `database/schema.sql`.
  3. Open and execute `database/seed.sql`.
- **Option B (One Command)**:
  ```powershell
  npm run init-db
  ```
*(Make sure your MySQL password in `server/.env` matches your local MySQL root password)*

---

### Step 2: Start the Backend Server
In the project root folder, run:
```powershell
npm run server
```
*(Or navigate to `cd server` and run `npm run dev`)*  
The backend API starts on **http://localhost:5000**.

---

### Step 3: Start the Frontend App
Open a new terminal window in the project root folder and run:
```powershell
npm run client
```
*(Or navigate to `cd client` and run `npm run dev`)*  
Open **http://localhost:5173** in your browser.

---

## 🔑 Demo Login Credentials

You can log in directly using any of these pre-seeded accounts (or use the 1-click persona buttons on the login screen):

| User Type | Name | Email | Password | Details (INR ₹) |
| :--- | :--- | :--- | :--- | :--- |
| **Customer** | Sarah Jenkins | `sarah.jenkins@example.com` | `Customer123!` | Total ₹1,95,000 (Savings: ₹1,50,000 \| Checking: ₹45,000) |
| **Customer** | David Kim | `david.kim@example.com` | `Customer123!` | Total ₹2,75,000 (Savings: ₹2,75,000) |
| **Bank Admin** | Marcus Vance | `admin.marcus@apexbank.com` | `Admin123!` | Full admin access (Customer management, account freeze, global ledger) |

---

## 📁 Project Structure

```text
bank-simulation/
├── database/
│   ├── schema.sql      # Database creation & 3 clean tables (users, accounts, transactions)
│   └── seed.sql        # Demo users, accounts (INR ₹), and sample transactions
├── server/
│   ├── src/            # Express backend (routes, controllers, database pool, auth middleware)
│   ├── .env            # Database and JWT configuration
│   └── package.json
├── client/
│   ├── src/            # React frontend (dashboard, transfer, deposit/withdraw, admin console)
│   ├── index.html
│   └── package.json
├── package.json        # Convenient root scripts to run server, client, and init-db
└── README.md           # Project documentation
```

---

## 💡 Tips & MySQL Workbench Inspection
- Open **MySQL Workbench**, right-click any of the tables (`users`, `accounts`, `transactions`) in the `bank_simulation` schema, and click **Select Rows - Limit 1000**.
- When you perform a transfer, deposit, or withdrawal on the website, refresh your query in MySQL Workbench to see the balances and transactions update immediately!
