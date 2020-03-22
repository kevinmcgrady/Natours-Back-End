const express = require('express');
const bookingController = require('../controllers/bookingController');
const router = express.Router();
const { checkAuth } = require('../middleware/authMiddleware');

router.get(
  '/checkout-session/:tourID',
  checkAuth,
  bookingController.getCheckoutSession,
);

module.exports = router;
