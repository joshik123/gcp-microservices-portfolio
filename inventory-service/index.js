const { PubSub } = require('@google-cloud/pubsub');
const express = require('express');

const app = express();
app.use(express.json());

// Initialize Pub/Sub client
const pubSubClient = new PubSub();

// In-memory product stock
let productStock = {
  "Book": 10,
  "Pen": 20,
  // Add more products here
};

// Pub/Sub subscription name
const subscriptionName = 'product-stock-sub';

// Handle incoming Pub/Sub messages
function messageHandler(message) {
  console.log(`Received message: ${message.id}`);
  const order = JSON.parse(message.data.toString());

  console.log('Order received:', order);

  if (productStock[order.product] !== undefined) {
    productStock[order.product] -= order.quantity;
    console.log(`Updated stock for ${order.product}: ${productStock[order.product]}`);
  } else {
    console.log(`Product ${order.product} not found in stock`);
  }

  message.ack();
}

// Subscribe to Pub/Sub
const subscription = pubSubClient.subscription(subscriptionName);
subscription.on('message', messageHandler);

// HTML UI route (GET /)
app.get('/', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>📦 Inventory Stock</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 40px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #2c3e50;
          }
          table {
            margin: 40px auto;
            border-collapse: collapse;
            width: 60%;
            background-color: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th, td {
            padding: 16px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          th {
            background-color: #3498db;
            color: white;
            font-weight: 600;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
          footer {
            text-align: center;
            margin-top: 60px;
            color: #777;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>📦 Inventory Stock</h1>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
  `;

  for (let product in productStock) {
    html += `
      <tr>
        <td>${product}</td>
        <td>${productStock[product]}</td>
      </tr>
    `;
  }

  html += `
          </tbody>
        </table>
        <footer>
          Inventory Microservice · Built with Node.js & Google Cloud Pub/Sub
        </footer>
      </body>
    </html>
  `;
  res.send(html);
});

// API route for JSON stock data
app.get('/stock', (req, res) => {
  res.json(productStock);
});

// Start the server
app.listen(3003, () => console.log('✅ Inventory Service running on http://localhost:3003'));