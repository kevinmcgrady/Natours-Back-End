const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { uploadUserPhoto } = require('../middleware/fileUpload');
const {
  checkAuth,
  setLoggedInUserId,
  restrictTo,
} = require('../middleware/authMiddleware');

const router = express.Router();

// Auth routes.
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// User routes, password related.
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);
router.patch('/update-password', checkAuth, authController.updatePassword);

// User routes.
router.get('/me', checkAuth, setLoggedInUserId, userController.getMe);
router.patch(
  '/update-me',
  checkAuth,
  uploadUserPhoto,
  userController.updateCurrentUser,
);
router.delete('/delete-me', checkAuth, userController.deleteCurrentUser);

// Admin routes.
router
  .route('/')
  .get(checkAuth, restrictTo('admin'), userController.getAllUsers);

router
  .route('/:id')
  .get(checkAuth, restrictTo('admin'), userController.getUser)
  .patch(checkAuth, restrictTo('admin'), userController.updateUser)
  .delete(checkAuth, restrictTo('admin'), userController.deleteUser);

module.exports = router;
