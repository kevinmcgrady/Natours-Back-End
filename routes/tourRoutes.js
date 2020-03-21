const express = require('express');
const tourControllers = require('../controllers/toursController');
const reviewRouter = require('../routes/reviewRoutes');
const router = express.Router();
const { checkAuth, restrictTo } = require('../middleware/authMiddleware');
const { aliasTopTours } = require('../middleware/tourMiddleware');
const {
  uploadTourImages,
  resizeTourImages,
} = require('../middleware/fileUpload');

// tours within a giver distance
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourControllers.getToursWithin);

// route to calculate distance
router.route('/distances/:latlng/unit/:unit').get(tourControllers.getDistances);

// top 5 tours.
router.route('/top-5-tours').get(aliasTopTours, tourControllers.getAllTours);

// tour stats
router.route('/tour-stats').get(tourControllers.getTourStats);

// tour monthly plan
router
  .route('/monthly-plan/:year')
  .get(
    checkAuth,
    restrictTo('admin', 'lead-guide', 'guide'),
    tourControllers.getMonthlyPlan,
  );

// Nested route to create a review on a tour
router.use('/:tourId/reviews', reviewRouter);

router
  .route('/')
  .get(tourControllers.getAllTours)
  .post(
    checkAuth,
    restrictTo('admin', 'lead-guide'),
    tourControllers.createTour,
  );

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(
    checkAuth,
    restrictTo('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    tourControllers.updateTour,
  )
  .delete(
    checkAuth,
    restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour,
  );

module.exports = router;
