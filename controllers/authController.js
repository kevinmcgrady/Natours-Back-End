const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');
const jwt = require('jsonwebtoken');
const AppError = require('../error/appError');
const { sendEmail } = require('../utils/emailHandeler');
const crypto = require('crypto');

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
  // send email to user.
  const resetURL = `${req.protocol}://${req.get(
    'host',
  )}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to ${resetURL}\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 mins)',
      message,
    });
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

  // log the user in.
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});
