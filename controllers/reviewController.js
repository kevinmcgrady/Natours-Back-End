const Review = require('../models/Review');
const { catchAsync } = require('../middleware/errorMiddleware');
const { deleteOne } = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter;
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    data: {
      results: reviews.length,
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const reviewRequestData = {
    review: req.body.review,
    rating: parseInt(req.body.rating),
    tour: req.body.tour,
    user: req.user.id,
  };

  const review = await Review.create(reviewRequestData);

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

exports.deleteReview = deleteOne(Review);
