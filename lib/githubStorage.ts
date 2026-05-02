// GitHub storage for orders - FREE persistent storage!
// Orders are saved to public/data/orders.json in the GitHub repo

const GITHUB_TOKEN = process.env.GITHUB_TOKEN2;
const REPO_OWNER = process.env.VERCEL_GIT_REPO_OWNER || 'tor2024'; 
const REPO_NAME = process.env.VERCEL_GIT_REPO_SLUG || 'pizza-roma-siegen';
const FILE_PATH = 'public/data/orders.json';
const BRANCH = 'main';

import { Order, OrderItem, MenuItem, Topping } from '@/types';

// Get orders from GitHub
export async function getOrdersFromGitHub(): Promise<Order[]> {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GITHUB_TOKEN, using in-memory fallback');
      return [];
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.status === 404) {
      // File doesn't exist yet
      return [];
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const orders = JSON.parse(content);
    return Array.isArray(orders) ? orders : [];
  } catch (error) {
    console.error('Error fetching orders from GitHub:', error);
    return [];
  }
}

// Save orders to GitHub
export async function saveOrdersToGitHub(orders: Order[]): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GITHUB_TOKEN, orders not persisted to GitHub');
      return false;
    }

    // First, get the current file SHA (if it exists)
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    let sha: string | undefined;
    if (getResponse.ok) {
      const data = await getResponse.json();
      sha = data.sha;
    }

    // Prepare the content
    const content = Buffer.from(JSON.stringify(orders, null, 2)).toString('base64');

    // Create or update the file
    const body: any = {
      message: `Update orders - ${new Date().toISOString()}`,
      content,
      branch: BRANCH
    };

    if (sha) {
      body.sha = sha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`GitHub API error: ${response.status} - ${error}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving orders to GitHub:', error);
    return false;
  }
}

// Add new order
export async function addOrderToGitHub(order: Order): Promise<boolean> {
  const orders = await getOrdersFromGitHub();
  orders.push(order);
  return await saveOrdersToGitHub(orders);
}

// Update order status
export async function updateOrderStatusInGitHub(orderId: string, status: Order['status']): Promise<boolean> {
  const orders = await getOrdersFromGitHub();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = Date.now();
    return await saveOrdersToGitHub(orders);
  }
  return false;
}

// Delete order
export async function deleteOrderFromGitHub(orderId: string): Promise<boolean> {
  const orders = await getOrdersFromGitHub();
  const filtered = orders.filter(o => o.id !== orderId);
  return await saveOrdersToGitHub(filtered);
}

// In-memory cache for fast reads
const memoryCache = {
  orders: [] as Order[],
  lastFetch: 0
};

// Get orders (with cache)
export async function getOrders(): Promise<Order[]> {
  const now = Date.now();
  // Refresh cache every 30 seconds only if we have GitHub token
  if (now - memoryCache.lastFetch > 30000 && GITHUB_TOKEN) {
    const githubOrders = await getOrdersFromGitHub();
    if (githubOrders.length > 0) {
      memoryCache.orders = githubOrders;
    }
    memoryCache.lastFetch = now;
  }
  return memoryCache.orders;
}

// Save order to both GitHub and cache
export async function saveOrder(order: Order): Promise<void> {
  memoryCache.orders.push(order);
  await addOrderToGitHub(order);
}

// Update order in both cache and GitHub
export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
  const order = memoryCache.orders.find(o => o.id === orderId);
  if (order) {
    order.status = status;
    order.updatedAt = Date.now();
  }
  await updateOrderStatusInGitHub(orderId, status);
}

// Delete order from both cache and GitHub
export async function deleteOrder(orderId: string): Promise<void> {
  memoryCache.orders = memoryCache.orders.filter(o => o.id !== orderId);
  await deleteOrderFromGitHub(orderId);
}

// Get single order
export async function getOrder(orderId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(o => o.id === orderId) || null;
}

// Get menu from GitHub for price validation
export async function getMenuFromGitHub(): Promise<any> {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GITHUB_TOKEN, cannot fetch menu');
      return null;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/public/data/menu.json?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error fetching menu from GitHub:', error);
    return null;
  }
}

// Validate order prices against menu
export async function validateOrderPrices(items: OrderItem[]): Promise<{ valid: boolean; error?: string; calculatedTotal?: number }> {
  const menu = await getMenuFromGitHub();
  if (!menu || !menu.categories) {
    // If we can't fetch menu, accept the order (fallback)
    return { valid: true };
  }

  let calculatedTotal = 0;

  for (const item of items) {
    // Find the item in menu categories
    let foundItem: MenuItem | null = null;
    for (const categoryKey of Object.keys(menu.categories)) {
      const category = menu.categories[categoryKey];
      const menuItem = category.items.find((i: MenuItem) => i.id === item.id);
      if (menuItem) {
        foundItem = menuItem;
        break;
      }
    }

    if (!foundItem) {
      return { valid: false, error: `Item ${item.id} not found in menu` };
    }

    // Validate base price
    const expectedPrice = foundItem.prices?.[item.size || ''] || foundItem.price || 0;
    if (expectedPrice !== item.price) {
      return { 
        valid: false, 
        error: `Price mismatch for ${item.name?.de || item.id}: expected ${expectedPrice}, got ${item.price}` 
      };
    }

    // Calculate with toppings
    let itemTotal = item.price;
    if (item.toppings && item.toppings.length > 0) {
      for (const topping of item.toppings) {
        // Find topping in menu item
        const menuTopping = foundItem.toppings?.find((t: Topping) => t.id === topping.id);
        if (menuTopping) {
          itemTotal += menuTopping.price;
        } else {
          return { valid: false, error: `Topping ${topping.id} not found for ${item.id}` };
        }
      }
    }

    calculatedTotal += itemTotal * (item.quantity || 1);
  }

  return { valid: true, calculatedTotal };
}

export type { Order, OrderItem, MenuItem, Topping };
