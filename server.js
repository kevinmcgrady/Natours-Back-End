const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 3000;

// Database.
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connection started...');
  })
  .catch(error => {
    console.log(`Error: ${error}`);
  });

const server = app.listen(port, () => {
  console.log(`app running on port ${port}`);
});

// GLOBAL: error handeling for unhandled promise rejection.
process.on('unhandledRejection', error => {
  console.log(error.name, error.message);
  server.close(() => {
    // WARNING! shut down application.
    console.log('Shutting down...');
    process.exit(1);
  });
});

// GLOBAL: error handeling for uncaughtException
process.on('uncaughtException', error => {
  console.log(error.name, error.message);
  server.close(() => {
    // WARNING! shut down application.
    console.log('Shutting down...');
    process.exit(1);
  });
});
