const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');
const jwt = require('jsonwebtoken');
const AppError = require('../error/appError');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

module.exports.signup = catchAsync(async (req, res, next) => {
  // Create new user.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // Create token.
  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

module.exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exist.
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // check if the user exists && password is correct. Include password because we do not return the password to the client when fetching users.
  const user = await User.findOne({ email }).select('+password');

  // if no user or passwords do not match.
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // send token to client.
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
