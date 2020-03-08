const Review = require('../models/Review');
const {
  deleteOne,
  updateOne,
  createOne,
  getOne,
  getAll,
} = require('./handlerFactory');

exports.getAllReviews = getAll(Review);

exports.getReview = getOne(Review);

exports.createReview = createOne(Review);

exports.updateReview = updateOne(Review);

exports.deleteReview = deleteOne(Review);
