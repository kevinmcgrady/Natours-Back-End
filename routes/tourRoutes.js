const express = require('express');
const tourControllers = require('../controllers/toursController');
const router = express.Router();
const { checkAuth } = require('../middleware/authMiddleware');
const { aliasTopTours } = require('../middleware/tourMiddleware');

router.route('/top-5-tours').get(aliasTopTours, tourControllers.getAllTours);

router.route('/tour-stats').get(tourControllers.getTourStats);

router.route('/monthly-plan/:year').get(tourControllers.getMonthlyPlan);

router
  .route('/')
  .get(checkAuth, tourControllers.getAllTours)
  .post(tourControllers.createTour);

router
  .route('/:id')
  .get(tourControllers.getTour)
  .patch(tourControllers.updateTour)
  .delete(tourControllers.deleteTour);

module.exports = router;
