import nats from './nats';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const start = async () => {
  // Make sure env variables exist
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID is not defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID is not defined');
  }
  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL is not defined');
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
  } catch (err) {
    console.log('Nats connection Error:', err);
  }
};

// Start the server
start();
