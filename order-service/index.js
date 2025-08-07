const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();
app.use(express.json());

const pubsub = new PubSub();
const topicName = 'order-created';

let orders = [];

// Serve a simple HTML UI to view and place orders
app.get('/', (req, res) => {
  let html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>🛒 Order Service</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
        <style>
          body {
            font-family: 'Inter', sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 40px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #2c3e50;
          }
          form {
            max-width: 400px;
            margin: 20px auto 40px;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
          }
          input, select {
            width: 100%;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
            border: 1px solid #ccc;
            font-size: 16px;
          }
          button {
            width: 100%;
            padding: 12px;
            background-color: #3498db;
            border: none;
            color: white;
            font-weight: 600;
            font-size: 16px;
            border-radius: 4px;
            cursor: pointer;
          }
          button:hover {
            background-color: #2980b9;
          }
          table {
            margin: 0 auto;
            width: 80%;
            border-collapse: collapse;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th, td {
            padding: 12px 20px;
            border-bottom: 1px solid #eee;
            text-align: left;
          }
          th {
            background-color: #3498db;
            color: white;
          }
          tr:hover {
            background-color: #f1f1f1;
          }
          footer {
            text-align: center;
            margin-top: 40px;
            color: #777;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <h1>🛒 Order Service</h1>

        <form id="orderForm">
          <label for="product">Product</label>
          <select id="product" name="product" required>
            <option value="" disabled selected>Select a product</option>
            <option value="Book">Book</option>
            <option value="Pen">Pen</option>
          </select>

          <label for="quantity">Quantity</label>
          <input type="number" id="quantity" name="quantity" min="1" required />

          <button type="submit">Place Order</button>
        </form>

        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody id="ordersTableBody">
  `;

  orders.forEach(order => {
    html += `
      <tr>
        <td>${order.product}</td>
        <td>${order.quantity}</td>
      </tr>
    `;
  });

  html += `
          </tbody>
        </table>

        <footer>Order Microservice · Built with Node.js & Google Cloud Pub/Sub</footer>

        <script>
          const form = document.getElementById('orderForm');
          const tableBody = document.getElementById('ordersTableBody');

          form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const product = form.product.value;
            const quantity = form.quantity.value;

            const response = await fetch('/orders', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ product, quantity: Number(quantity) })
            });

            if (response.ok) {
              const result = await response.json();

              // Add new order to the table
              const newRow = document.createElement('tr');
              newRow.innerHTML = \`
                <td>\${result.order.product}</td>
                <td>\${result.order.quantity}</td>
              \`;
              tableBody.appendChild(newRow);

              // Reset form
              form.reset();
              alert('Order placed successfully!');
            } else {
              alert('Failed to place order.');
            }
          });
        </script>
      </body>
    </html>
  `;

  res.send(html);
});

app.get('/orders', (req, res) => {
  res.json(orders);
});

app.post('/orders', async (req, res) => {
  const order = req.body;
  orders.push(order);

  try {
    const dataBuffer = Buffer.from(JSON.stringify(order));
    await pubsub.topic(topicName).publish(dataBuffer);

    res.status(201).json({ message: 'Order placed and event published!', order });
  } catch (error) {
    console.error('Error publishing order-created event:', error);
    res.status(500).json({ message: 'Order placed but failed to publish event', error: error.message });
  }
});

app.listen(3002, () => {
  console.log('✅ Order Service running on http://localhost:3002');
});