const Review = require('../models/Review');
const { catchAsync } = require('../middleware/errorMiddleware');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find();

  res.status(200).json({
    status: 'success',
    data: {
      results: reviews.length,
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
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
