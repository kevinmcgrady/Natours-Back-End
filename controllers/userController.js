const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');
const AppError = require('../error/appError');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');
const { filterUserData } = require('../utils/filterUserData');

exports.getAllUsers = getAll(User);

exports.getUser = getOne(User);

exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);

exports.getMe = getOne(User);

exports.updateCurrentUser = catchAsync(async (req, res, next) => {
  // create error if user posts password data.
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates, please use /update-password',
        400,
      ),
    );
  }

  const filteredBody = filterUserData(req.body, 'name', 'email');
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // update user document.
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteCurrentUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
