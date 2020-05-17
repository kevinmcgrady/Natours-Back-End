const { catchAsync } = require('../middleware/errorMiddleware');
const AppError = require('../error/appError');
const APIFeatures = require('../utils/APIFeatures');

// Factory function for deleting a  document.
exports.deleteOne = (Model) =>
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
exports.updateOne = (Model) =>
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
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

// Factory Function to get a document.
exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const id = req.params.id;

    let query = Model.findById(id);

    if (populateOptions) query = query.populate(populateOptions);

    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID.', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour.
    let filter;
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const allItems = await Model.find();

    const totalItems = allItems.length;

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .pagination()
      .search();

    const doc = await features.query;

    let totalPages;

    if (req.query.search) {
      totalPages = Math.round(doc.length / 6);
    } else {
      totalPages = Math.round(totalItems / 6);
    }

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        data: doc,
        totalPages,
      },
    });
  });
