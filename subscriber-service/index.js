const { PubSub } = require('@google-cloud/pubsub');
const pubSubClient = new PubSub();

const subscriptionName = 'product-stock-sub';
const timeout = 60; // seconds

const subscription = pubSubClient.subscription(subscriptionName);

const messageHandler = message => {
  console.log(`Received message ${message.id}:`);
  const orderData = JSON.parse(message.data.toString());
  console.log(`Order received:`, orderData);

  // TODO: Add your logic here to update stock, etc.

  message.ack();
};

subscription.on('message', messageHandler);

setTimeout(() => {
  subscription.removeListener('message', messageHandler);
  console.log(`${timeout} seconds elapsed, exiting subscriber.`);
  process.exit(0);
}, timeout * 1000);