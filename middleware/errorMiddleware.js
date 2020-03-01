const AppError = require('../error/appError');

const sendErrorForDev = (error, res) => {
  res.status(error.statusCode).json({
    status: error.status,
    error: error,
    message: error.message,
    stack: error.stack,
  });
};

const sendErrorForPro = (error, res) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = error => {
  const value = error.errmsg.match(/(["'])(\\?.)*\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value`;

  return new AppError(message, 400);
};

const handleValidationError = error => {
  const errors = Object.values(error.errors).map(val => val.message);
  const message = `Invalid input data. ${errors.join('. ')}`;

  return new AppError(message, 400);
};

const handleJWTError = error => {
  return new AppError('Invalid token, please login again', 401);
};

const handleJWTExpiredError = error => {
  return new AppError('Token expired, please login again', 401);
};

module.exports.errorHandeler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(error, res);
  } else if (process.env.NODE_ENV === 'production') {
    let err = { ...error, message: error.message };

    if (err.name === 'CastError') err = handleCastErrorDB(err);
    if (err.code === 11000) err = handleDuplicateFields(err);
    if (err.name === 'ValidationError') err = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') err = handleJWTError(err);
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError(err);

    sendErrorForPro(err, res);
  }
};

module.exports.catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(error => next(error));
  };
};
