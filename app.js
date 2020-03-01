const express = require('express');
const morgan = require('morgan');
const { limiter } = require('./utils/limiter');

const { errorHandeler } = require('./middleware/errorMiddleware');
const AppError = require('./error/appError');

// Route imports.
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');

// App.
const app = express();

// Middleware.
app.use(express.json());

app.use('/api', limiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Error route.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global Error Handeling Middleware.
app.use(errorHandeler);

module.exports = app;
