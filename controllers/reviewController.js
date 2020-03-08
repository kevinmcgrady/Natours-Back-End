const Review = require('../models/Review');
const { catchAsync } = require('../middleware/errorMiddleware');
const { deleteOne, updateOne, createOne } = require('./handlerFactory');

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

exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);
