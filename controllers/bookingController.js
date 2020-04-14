const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('../models/Tour');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { catchAsync } = require('../middleware/errorMiddleware');
const AppError = require('../error/appError');

const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

module.exports.createBooking = createOne(Booking);

module.exports.getBooking = getOne(Booking);

module.exports.getAllBooking = getAll(Booking);

module.exports.updateBooking = updateOne(Booking);

module.exports.deleteBooking = deleteOne(Booking);

module.exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const tour = req.body.tour;
  const user = req.user.id;
  const price = req.body.price / 100;

  await Booking.create({ tour, user, price });

  res.status(200).json({
    status: 'success',
    message: 'Booking completed',
  });
});

module.exports.createPayment = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('A tour was not found', 404));
  }

  const price = tour.price * 100;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: price,
    currency: 'usd',
    description: tour.name,
    metadata: { integration_check: 'accept_a_payment' },
  });

  res.status(200).json({ status: 'success', intent: paymentIntent });
});
