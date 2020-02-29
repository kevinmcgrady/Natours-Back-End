const User = require('../models/User');
const { catchAsync } = require('../middleware/errorMiddleware');

module.exports.signup = catchAsync(async (req, res, next) => {
  const userData = req.body;
  const newUser = await User.create(userData);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});
