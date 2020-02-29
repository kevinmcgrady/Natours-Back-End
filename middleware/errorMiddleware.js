module.exports.errorHandeler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
  });
};

module.exports.catchAsync = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(error => next(error));
  };
};
