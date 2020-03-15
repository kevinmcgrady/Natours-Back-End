const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');

// Add is logged in to all middleware below.
router.use(isLoggedIn);

router.get('/', viewsController.getOverview);

router.get('/tour/:slug', viewsController.getTour);

router.get('/login', viewsController.login);

module.exports = router;
