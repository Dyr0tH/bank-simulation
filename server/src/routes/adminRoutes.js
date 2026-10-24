const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const {
  getStats,
  listCustomers,
  getCustomerDetail,
  updateAccountStatus,
  getGlobalLedger
} = require('../controllers/adminController');

// All admin routes require admin or employee role
router.use(authenticateToken, requireRole('employee', 'admin'));

router.get('/stats', getStats);
router.get('/customers', listCustomers);
router.get('/customers/:id', getCustomerDetail);
router.patch('/accounts/:accountId/status', updateAccountStatus);
router.get('/ledger', getGlobalLedger);

module.exports = router;
