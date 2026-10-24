const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getMyAccounts,
  getAccountById,
  createAccount,
  lookupRecipientAccount
} = require('../controllers/accountController');

router.use(authenticateToken);

router.get('/my', getMyAccounts);
router.get('/lookup', lookupRecipientAccount);
router.get('/:id', getAccountById);
router.post('/open', createAccount);

module.exports = router;
