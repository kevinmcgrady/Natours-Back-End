const express = require('express');
const morgan = require('morgan');
const hemlet = require('helmet');
const path = require('path');
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

// Template Engine
app.set('view engine', 'pug');

// Set where the views are located
app.set('views', path.join(__dirname, 'views'));

// Serving static files from public folder.
app.use(express.static(path.join(__dirname, 'public')));

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

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes.
// View routes.
app.get('/', (req, res, next) => {
  res.status(200).render('base', {
    tour: 'The Forest Hiker',
    user: 'John',
  });
});

app.get('/overview', (req, res, next) => {
  res.status(200).render('overview', {
    title: 'All Tours',
  });
});

app.get('/tour', (req, res, next) => {
  res.status(200).render('tour', {
    title: 'The Forest Hiker',
  });
});

// API routes.
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
