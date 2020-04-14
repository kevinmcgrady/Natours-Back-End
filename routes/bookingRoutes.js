const express = require('express');
const bookingController = require('../controllers/bookingController');
const router = express.Router();
const { checkAuth, restrictTo } = require('../middleware/authMiddleware');

router.get(
  '/create-payment/:tourId',
  checkAuth,
  bookingController.createPayment,
);

router.post(
  '/create-booking-checkout',
  checkAuth,
  bookingController.createBookingCheckout,
);

// Restrict all routess below for only admin and lead-guides.
router.use(checkAuth, restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBooking)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
