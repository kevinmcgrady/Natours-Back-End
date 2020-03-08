const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');
const AppError = require('../error/appError');
const { deleteOne } = require('./handlerFactory');

const filterUserData = (req, ...allowedFields) => {
  const newReq = {};

  Object.keys(req).forEach(key => {
    if (allowedFields.includes(key)) {
      newReq[key] = req[key];
    }
  });

  return newReq;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

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

exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This route is not yet defined' });
};

exports.deleteUser = deleteOne(User);
