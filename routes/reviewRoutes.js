const express = require('express');
const reviewController = require('../controllers/reviewController');
const router = express.Router({ mergeParams: true });
const { checkAuth, restrictTo } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(checkAuth, reviewController.getAllReviews)
  .post(checkAuth, restrictTo('user'), reviewController.createReview);

module.exports = router;
