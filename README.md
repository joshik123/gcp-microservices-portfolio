📦 Order & Inventory Microservices

This is a simple project with two services:

- 🛒 **Order Service** – lets you place new orders
- 📦 **Inventory Service** – keeps track of item stock

These services talk to each other using **Google Cloud Pub/Sub** (a message system).

---

## ✅ What You Can Do

- Create orders (like "1 Laptop")
- Automatically reduce stock from inventory
- See current inventory (e.g., "10 Books", "20 Pens")

---

## 🚀 How to Run the Project

### Option 1: Run with Docker (EASY)

1. Make sure you have **Docker** installed.
2. Add your **GCP key file** in the main folder (see below).
3. In your terminal, run:


docker-compose up --build
The services will start on:

Order: http://localhost:3002

Inventory: http://localhost:3003

Option 2: Run Without Docker (Manual)
Open 2 terminals (one for each service).

First terminal:

cd order-service
npm install
node index.js
Second terminal:


cd inventory-service
npm install
node index.js
Before running, make sure your system knows where the GCP key file is:

On Windows PowerShell:
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\Path\To\your-key.json"
🔑 How to Get the GCP Key File
Go to Google Cloud Console

Create a Service Account with Pub/Sub permissions

Download the JSON key file

Rename it to:

gcp-key.json
Place it in the main project folder (where docker-compose.yml is)

📬 Endpoints
Order Service
GET /orders → Show all orders

POST /orders → Create an order

Example POST:
{
  "id": "order-123",
  "product": "Book",
  "quantity": 1
}
Inventory Service
GET /inventory → See inventory stock

🛠 Technologies Used
Node.js

Express

Google Cloud Pub/Sub

Docker

👋 Credits
Built by [Joshua Ikem]

