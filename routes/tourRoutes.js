const express = require('express');
const tourControllers = require('../controllers/toursController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();
const { checkAuth, restrictTo } = require('../middleware/authMiddleware');
const { aliasTopTours } = require('../middleware/tourMiddleware');

router.route('/top-5-tours').get(aliasTopTours, tourControllers.getAllTours);

router.route('/tour-stats').get(tourControllers.getTourStats);

router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);

// Nested route to create a review on a tour
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(checkAuth, tourControllers.getAllTours)
  .post(
    checkAuth,
    restrictTo('admin', 'lead-guide'),
    tourControllers.createTour,
  );

router
  .route('/:id')
  .get(checkAuth, tourControllers.getTour)
  .patch(
    checkAuth,
    restrictTo('admin', 'lead-guide'),
    tourControllers.updateTour,
  )
  .delete(
    checkAuth,
    restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour,
  );

module.exports = router;
