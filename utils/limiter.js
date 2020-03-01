const rateLimit = require('express-rate-limit');

module.exports.limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 1h',
});
