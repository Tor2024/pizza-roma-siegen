// GitHub storage for menu - persistent storage for menu data
// Menu is saved to public/data/menu.json in the GitHub repo

const GITHUB_TOKEN = process.env.GITHUB_TOKEN2;
const REPO_OWNER = process.env.VERCEL_GIT_REPO_OWNER || 'tor2024'; 
const REPO_NAME = process.env.VERCEL_GIT_REPO_SLUG || 'pizza-roma-siegen';
const MENU_FILE_PATH = 'public/data/menu.json';
const BRANCH = 'main';

// Get menu from GitHub
export async function getMenuFromGitHub(): Promise<any> {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GITHUB_TOKEN for menu, using fallback');
      return null;
    }

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${MENU_FILE_PATH}?ref=${BRANCH}`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        cache: 'no-store' // Important: no caching
      }
    );

    if (response.status === 404) {
      console.log('Menu file not found on GitHub');
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

// Save menu to GitHub
export async function saveMenuToGitHub(menuData: any): Promise<boolean> {
  try {
    if (!GITHUB_TOKEN) {
      console.log('No GITHUB_TOKEN, cannot save menu');
      return false;
    }

    // Get current file to get SHA
    let sha = '';
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${MENU_FILE_PATH}?ref=${BRANCH}`,
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
    } catch (e) {
      // File doesn't exist, will create new
    }

    const content = Buffer.from(JSON.stringify(menuData, null, 2)).toString('base64');

    const response = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${MENU_FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Update menu data - ${new Date().toISOString()}`,
          content: content,
          branch: BRANCH,
          sha: sha || undefined
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('GitHub API error:', error);
      return false;
    }

    console.log('Menu saved to GitHub successfully');
    return true;
  } catch (error) {
    console.error('Error saving menu to GitHub:', error);
    return false;
  }
}
