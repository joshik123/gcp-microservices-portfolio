const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();
app.use(express.json());

const pubsub = new PubSub();
const subscriptionName = 'product-stock-sub';

let products = [
  { id: 1, name: 'Product A', stock: 100 },
  { id: 2, name: 'Product B', stock: 50 },
];

// Endpoint to view products and stock
app.get('/products', (req, res) => {
  res.json(products);
});

// Function to handle incoming Pub/Sub messages
function messageHandler(message) {
  console.log(`Received message: ${message.id}`);

  try {
    const order = JSON.parse(message.data.toString());
    console.log('Order data:', order);

    // Example: decrease stock based on order items
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          console.log(`Reduced stock of product ${product.name} by ${item.quantity}. New stock: ${product.stock}`);
        }
      });
    }

    // Acknowledge the message after successful processing
    message.ack();
  } catch (err) {
    console.error('Error processing message:', err);
    // Optionally: do not ack to retry later
  }
}

// Listen for messages on the subscription
const subscription = pubsub.subscription(subscriptionName);
subscription.on('message', messageHandler);

app.listen(3001, () => console.log('Product Service running on port 3001'));