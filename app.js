const express = require('express');
const morgan = require('morgan');
const hemlet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const { limiter } = require('./utils/limiter');

const { errorHandeler } = require('./middleware/errorMiddleware');
const AppError = require('./error/appError');

// Route imports.
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// App.
const app = express();

// Middleware.
// Set security HTTP headers
app.use(hemlet());

// Allow JSON body data into req.body and limit to 10kb
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection.
app.use(mongoSanitize());

// Data sanitization against XSS.
app.use(xss());

// Provent param polution
// removes duclicate query string params.
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Limit requests for a single IP on all API routes.
app.use('/api', limiter);

// Development logging.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serving static files from public folder.
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// Error route.
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// Global Error Handeling Middleware.
app.use(errorHandeler);

module.exports = app;
