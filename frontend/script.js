const form = document.getElementById('orderForm');
const stockEl = document.getElementById('stock');

// Submit new order
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const product = document.getElementById('product').value;
  const quantity = parseInt(document.getElementById('quantity').value);

  const response = await fetch('http://localhost:3002/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: Date.now(),
      product,
      quantity
    })
  });

  const result = await response.json();
  alert(result.message);

  loadStock(); // Refresh stock
});

// Load stock data
async function loadStock() {
  try {
    const res = await fetch('http://localhost:3003/stock');
    const data = await res.json();
    stockEl.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    stockEl.textContent = "Error loading stock";
  }
}

loadStock(); // Initial load