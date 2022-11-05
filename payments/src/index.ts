import 'express-async-errors';
import mongoose from 'mongoose';
import nats from './nats';

import { app } from './app';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
  // Make sure env variables exist
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY is not defined');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID is not defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID is not defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL is not defined');
  }

  // Try to connect to DB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('DB connection successfull!');
  } catch (err) {
    console.log('MongoDB connection Error:', err);
  }

  // Try to connect to NATS
  try {
    await nats.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );

    nats.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    process.on('SIGINT', () => nats.client.close());
    process.on('SIGTERM', () => nats.client.close());

    new OrderCreatedListener(nats.client).listen();
    new OrderCancelledListener(nats.client).listen();
  } catch (err) {
    console.log('Nats connection Error:', err);
  }

  // Start Listen
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

// Start the server
start();
