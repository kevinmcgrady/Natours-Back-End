const { catchAsync } = require('./errorMiddleware');
const AppError = require('../error/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/User');

module.exports.checkAuth = catchAsync(async (req, res, next) => {
  // get token and check if it exists.
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError('You are not logged in. Please login to get access', 401),
    );
  }

  // validate token.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if user exists.
  const freshUser = await User.findById(decoded.id);

  // If the user was deleted after the token was generated.
  if (!freshUser) {
    return next(
      new AppError('The user belonging to this token no longer exists', 401),
    );
  }

  // check if user changed password after token was issued.
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please login again', 401),
    );
  }

  // add user to req object
  req.user = freshUser;
  res.locals.user = freshUser;
  // all good, on to the protected route
  next();
});

module.exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to preform this action', 403),
      );
    }
    next();
  };
};

module.exports.setLoggedInUserId = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Check if the user is logged in.
module.exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // validate token.
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // check if user exists.
      const freshUser = await User.findById(decoded.id);

      // If the user was deleted after the token was generated.
      if (!freshUser) {
        return next();
      }

      // check if user changed password after token was issued.
      if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      res.locals.user = freshUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};
