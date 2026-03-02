const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'shopping-list.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function loadItems() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveItems(items) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

// Get all items
app.get('/api/items', (req, res) => {
  res.json(loadItems());
});

// Add a new item
app.post('/api/items', (req, res) => {
  const { name, category } = req.body;
  if (!name || !category) {
    return res.status(400).json({ error: 'Name and category are required' });
  }
  const items = loadItems();
  const newItem = {
    id: Date.now().toString(),
    name: name.trim(),
    category,
    addedAt: new Date().toISOString()
  };
  items.push(newItem);
  saveItems(items);
  res.status(201).json(newItem);
});

// Delete an item (mark as bought)
app.delete('/api/items/:id', (req, res) => {
  const items = loadItems();
  const filtered = items.filter(item => item.id !== req.params.id);
  if (filtered.length === items.length) {
    return res.status(404).json({ error: 'Item not found' });
  }
  saveItems(filtered);
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Shopping list running at http://localhost:${PORT}`);
  console.log(`On your home network, others can access it at http://<your-ip>:${PORT}`);
});
