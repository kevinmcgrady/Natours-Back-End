const fs = require('fs');
const Tour = require('../models/Tour');
const User = require('../models/User');
const Review = require('../models/Review');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

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

const tours = JSON.parse(
  fs.readFileSync('./dev-data/data/users.json', 'utf-8'),
);

const importData = async () => {
  try {
    await User.create(tours, { validateBeforeSave: false });
    console.log('Data loaded...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('Data deleted...');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}

// TO START
// node utils/importDevData.js --delete
// node utils/importDevData.js --import
