import 'express-async-errors';
import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }

  // Try to connect to DB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connection successfull!');
  } catch (err) {
    console.log(err);
  }
  // Start Listen
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

// Start the server
start();
