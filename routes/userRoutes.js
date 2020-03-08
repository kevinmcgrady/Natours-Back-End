const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { checkAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', checkAuth, authController.updatePassword);

router.patch('/update-me', checkAuth, userController.updateCurrentUser);
router.delete('/delete-me', checkAuth, userController.deleteCurrentUser);

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
