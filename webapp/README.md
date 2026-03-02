# Home Shopping List

A simple shared shopping list for everyone at home.

## Setup

```bash
cd webapp
npm install
npm start
```

The app runs on port **3000**.

- From the same computer: `http://localhost:3000`
- From other devices on your home network: `http://<your-computer-ip>:3000`

## Features

- Add items with a category (Groceries, Dairy, Meat & Fish, Bakery, Beverages, Snacks, Frozen Foods, Cleaning Supplies, Personal Care, Other)
- Items are grouped by category with color-coded headers
- Tap **"Got it"** to remove an item once it's been bought
- The list auto-refreshes every 10 seconds so everyone stays in sync
- Data is saved to `data/shopping-list.json` and persists across restarts
