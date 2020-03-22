const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');
const jwt = require('jsonwebtoken');
const AppError = require('../error/appError');
const Email = require('../utils/emailHandeler');
const crypto = require('crypto');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  // Create token.
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // hide the password when user is returned to the client.
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

module.exports.signup = catchAsync(async (req, res, next) => {
  const url = `${req.protocol}://${req.get('host')}/account`;

  // Create new user.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });

  // send welcome email.
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
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
  createSendToken(user, 200, res);
});

module.exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

module.exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user from email.
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // generate token.
  const resetToken = user.createPasswordResetToken();

  // save the user -- with the token and expire data.
  await user.save({ validateBeforeSave: false });

  try {
    // send email to user.
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
  } catch (error) {
    // if error, remove the reset token and expire date.
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpires = undefined;
    // save the user.
    await user.save({ validateBeforeSave: false });
    // return new error to client.
    return next(new AppError('There was an error sending the email', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email',
  });
});

module.exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpires: { $gt: Date.now() },
  });

  // set new password if token is not expired and user exists.
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // update the users password and remove reset password token and expire date.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpires = undefined;

  // save the user.
  await user.save();

  createSendToken(user, 200, res);
});

module.exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user
  const user = await User.findById(req.user.id).select('+password');

  // check if password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password does not match', 401));
  }

  // if password is correct, update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;

  await user.save();
  // log the user in
  createSendToken(user, 200, res);
});
