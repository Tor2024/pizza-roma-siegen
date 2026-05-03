// GitHub storage for users - works on Vercel serverless
const GITHUB_TOKEN = process.env.GITHUB_TOKEN2;
const REPO_OWNER = process.env.VERCEL_GIT_REPO_OWNER || 'tor2024';
const REPO_NAME = process.env.VERCEL_GIT_REPO_SLUG || 'pizza-roma-siegen';
const USERS_FILE_PATH = 'data/users.json';
const BRANCH = 'main';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  createdAt: number;
  orders: string[];
}

// In-memory cache
let cachedUsers: User[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30000; // 30 seconds

async function getUsersFromGitHub(): Promise<User[]> {
  if (!GITHUB_TOKEN) {
    console.log('No GITHUB_TOKEN, users unavailable');
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${USERS_FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store'
      }
    );

    if (response.status === 404) return [];
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);

    const data = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    const users = JSON.parse(content);
    return Array.isArray(users) ? users : [];
  } catch (error) {
    console.error('Error fetching users from GitHub:', error);
    return [];
  }
}

async function saveUsersToGitHub(users: User[]): Promise<boolean> {
  if (!GITHUB_TOKEN) {
    console.log('No GITHUB_TOKEN, cannot save users');
    return false;
  }

  try {
    // Get current file SHA
    let sha: string | undefined;
    const getResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${USERS_FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    if (getResponse.ok) {
      const getData = await getResponse.json();
      sha = getData.sha;
    }

    const content = Buffer.from(JSON.stringify(users, null, 2)).toString('base64');
    const body: any = {
      message: `Update users - ${new Date().toISOString()}`,
      content,
      branch: BRANCH
    };
    if (sha) body.sha = sha;

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${USERS_FILE_PATH}`,
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
      const error = await response.json();
      console.error('GitHub API error:', error);
      return false;
    }

    // Update cache
    cachedUsers = users;
    cacheTimestamp = Date.now();
    return true;
  } catch (error) {
    console.error('Error saving users to GitHub:', error);
    return false;
  }
}

// Get all users (with cache)
export async function getUsers(): Promise<User[]> {
  const now = Date.now();
  if (cachedUsers && now - cacheTimestamp < CACHE_TTL) {
    return cachedUsers;
  }
  const users = await getUsersFromGitHub();
  cachedUsers = users;
  cacheTimestamp = now;
  return users;
}

// Save all users
export async function saveUsers(users: User[]): Promise<void> {
  await saveUsersToGitHub(users);
}

// Add new user
export async function addUser(user: User): Promise<void> {
  const users = await getUsers();
  users.push(user);
  await saveUsersToGitHub(users);
}

// Find user by email
export async function findUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

// Add order to user's history
export async function addOrderToUser(email: string, orderId: string): Promise<boolean> {
  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return false;
  if (!user.orders) user.orders = [];
  user.orders.push(orderId);
  await saveUsersToGitHub(users);
  return true;
}