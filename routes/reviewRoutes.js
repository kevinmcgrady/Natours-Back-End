const express = require('express');
const reviewController = require('../controllers/reviewController');
const router = express.Router({ mergeParams: true });
const { checkAuth, restrictTo } = require('../middleware/authMiddleware');
const { setTourAndUserIds } = require('../middleware/reviewMiddleware');

router
  .route('/')
  .get(checkAuth, reviewController.getAllReviews)
  .post(
    checkAuth,
    restrictTo('user'),
    setTourAndUserIds,
    reviewController.createReview,
  );

router
  .route('/:id')
  .get(checkAuth, reviewController.getReview)
  .delete(checkAuth, restrictTo('user', 'admin'), reviewController.deleteReview)
  .patch(checkAuth, restrictTo('user', 'admin'), reviewController.updateReview);

module.exports = router;
