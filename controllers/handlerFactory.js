const { catchAsync } = require('../middleware/errorMiddleware');
const AppError = require('../error/appError');

// Factory function for deleting a  document.
exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = await Model.findByIdAndDelete(id);

    if (!doc) {
      return next(new AppError('No document found with that ID.', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
