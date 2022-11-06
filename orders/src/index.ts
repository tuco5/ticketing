import 'express-async-errors';
import mongoose from 'mongoose';
import nats from './nats';
import { app } from './app';
import { TicketCreatedListener } from './events/listener/ticket-created-listener';
import { TicketUpdatedListener } from './events/listener/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listener/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listener/payment-created-listener';

const start = async () => {
  console.log('Starting...');

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

    new TicketCreatedListener(nats.client).listen();
    new TicketUpdatedListener(nats.client).listen();
    new ExpirationCompleteListener(nats.client).listen();
    new PaymentCreatedListener(nats.client).listen();

    // elser throw an error to the console.
  } catch (err) {
    console.error('Nats connection Error:', err);
  }

  // Start Listen
  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
};

// Start the server
start();
