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

// Facrory function to update a document.
exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;
    const doc = req.body;

    const updatedDoc = await Model.findByIdAndUpdate(id, doc, {
      new: true,
      runValidators: true,
    });

    if (!updatedDoc) {
      return next(new AppError('No document found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: updatedDoc,
      },
    });
  });

// Factory function to create a document.
exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
