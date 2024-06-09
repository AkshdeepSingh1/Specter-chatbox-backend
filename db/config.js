const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`db connection successfully on ${process.env.MONGO_URL}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
  }
};

connectDB();