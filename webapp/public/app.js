const CATEGORY_META = {
  'Groceries':       { icon: '🥬', cls: 'cat-Groceries' },
  'Dairy':           { icon: '🥛', cls: 'cat-Dairy' },
  'Meat & Fish':     { icon: '🥩', cls: 'cat-Meat' },
  'Bakery':          { icon: '🍞', cls: 'cat-Bakery' },
  'Beverages':       { icon: '🥤', cls: 'cat-Beverages' },
  'Snacks':          { icon: '🍿', cls: 'cat-Snacks' },
  'Frozen Foods':    { icon: '🧊', cls: 'cat-Frozen' },
  'Cleaning Supplies': { icon: '🧹', cls: 'cat-Cleaning' },
  'Personal Care':   { icon: '🧴', cls: 'cat-Personal' },
  'Other':           { icon: '📦', cls: 'cat-Other' },
};

// Preferred display order
const CATEGORY_ORDER = Object.keys(CATEGORY_META);

let items = [];

async function fetchItems() {
  const res = await fetch('/api/items');
  items = await res.json();
  render();
}

async function addItem() {
  const nameEl = document.getElementById('item-name');
  const catEl = document.getElementById('item-category');
  const errorEl = document.getElementById('form-error');

  const name = nameEl.value.trim();
  const category = catEl.value;

  errorEl.classList.add('hidden');

  if (!name) {
    showError('Please enter an item name.');
    return;
  }
  if (!category) {
    showError('Please select a category.');
    return;
  }

  const btn = document.getElementById('add-btn');
  btn.disabled = true;

  try {
    const res = await fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category })
    });

    if (!res.ok) throw new Error('Failed to add item');

    nameEl.value = '';
    catEl.value = '';
    nameEl.focus();
    await fetchItems();
  } catch (e) {
    showError('Could not add item. Is the server running?');
  } finally {
    btn.disabled = false;
  }
}

async function removeItem(id) {
  try {
    await fetch(`/api/items/${id}`, { method: 'DELETE' });
    await fetchItems();
  } catch (e) {
    alert('Could not remove item. Please try again.');
  }
}

function showError(msg) {
  const el = document.getElementById('form-error');
  el.textContent = msg;
  el.classList.remove('hidden');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function render() {
  const container = document.getElementById('categories-container');
  const emptyState = document.getElementById('empty-state');
  const countEl = document.getElementById('item-count');

  container.innerHTML = '';

  const total = items.length;
  countEl.textContent = total === 0 ? 'Empty' : `${total} item${total !== 1 ? 's' : ''}`;

  if (total === 0) {
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');

  // Group items by category
  const groups = {};
  for (const item of items) {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  }

  // Render in preferred order, then any unknown categories at the end
  const orderedKeys = [
    ...CATEGORY_ORDER.filter(c => groups[c]),
    ...Object.keys(groups).filter(c => !CATEGORY_ORDER.includes(c))
  ];

  for (const cat of orderedKeys) {
    const catItems = groups[cat];
    const meta = CATEGORY_META[cat] || { icon: '🛒', cls: 'cat-Other' };

    const section = document.createElement('div');
    section.className = `category-group ${meta.cls}`;

    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <span class="cat-icon">${meta.icon}</span>
      <span>${cat}</span>
      <span class="cat-count">${catItems.length}</span>
    `;
    section.appendChild(header);

    const ul = document.createElement('ul');
    ul.className = 'item-list';

    for (const item of catItems) {
      const li = document.createElement('li');
      li.className = 'item-row';
      li.innerHTML = `
        <span class="item-name">${escapeHtml(item.name)}</span>
        <span class="item-added">added ${formatDate(item.addedAt)}</span>
        <button class="bought-btn" onclick="removeItem('${item.id}')">Got it</button>
      `;
      ul.appendChild(li);
    }

    section.appendChild(ul);
    container.appendChild(section);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Allow pressing Enter to add item
document.getElementById('item-name').addEventListener('keydown', e => {
  if (e.key === 'Enter') addItem();
});

// Initial load + poll every 10 seconds for multi-device sync
fetchItems();
setInterval(fetchItems, 10000);
