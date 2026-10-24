const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  transfer,
  deposit,
  withdraw,
  getMyTransactions,
  getTransactionReceipt
} = require('../controllers/transactionController');

router.use(authenticateToken);

router.post('/transfer', transfer);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.get('/my', getMyTransactions);
router.get('/receipt/:referenceNo', getTransactionReceipt);

module.exports = router;
