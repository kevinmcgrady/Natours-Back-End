const express = require('express');
const morgan = require('morgan');
const hemlet = require('helmet');
const path = require('path');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const { limiter } = require('./utils/limiter');
const compression = require('compression');
const favicon = require('serve-favicon');

const { errorHandeler } = require('./middleware/errorMiddleware');
const AppError = require('./error/appError');

// Route imports.
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

// App.
const app = express();

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));

// Allow the app to trust proxys.
app.enable('trust proxy');

// Middleware.
// Allow CORS.
app.use(cors());
app.options('*', cors());

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
app.use(cookieParser());

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

app.use(compression());

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
app.get('/', (req, res, next) => {
  res.render('index');
});

// API routes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Error route.
app.all('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
  } else {
    res.render('error');
  }
});

// Global Error Handeling Middleware.
app.use(errorHandeler);

module.exports = app;
