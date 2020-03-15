const express = require('express');
const viewsController = require('../controllers/viewsController');
const router = express.Router();
const { isLoggedIn, checkAuth } = require('../middleware/authMiddleware');

router.get('/', isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', isLoggedIn, viewsController.getTour);

router.get('/login', isLoggedIn, viewsController.login);

router.get('/account', checkAuth, viewsController.getAccount);

module.exports = router;
