const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2].trim();
    }
  });
}

const token = process.env.GITHUB_TOKEN2;
if (!token) {
  console.error('GITHUB_TOKEN2 is not set');
  process.exit(1);
}

const owner = 'Tor2024';
const repo = 'pizza-roma-siegen';
const filePath = 'public/data/menu.json';
const branch = 'main';

// Read local file
const localPath = path.join(__dirname, 'data', 'menu.json');
const content = fs.readFileSync(localPath, 'utf8');
const base64Content = Buffer.from(content).toString('base64');

// First, get the current file's SHA
const getOptions = {
  hostname: 'api.github.com',
  path: `/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
  method: 'GET',
  headers: {
    'Authorization': `token ${token}`,
    'User-Agent': 'Node.js'
  }
};

const getReq = https.request(getOptions, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.error('Failed to get file SHA:', res.statusCode, data);
      process.exit(1);
    }
    const fileData = JSON.parse(data);
    const sha = fileData.sha;

    // Now update the file
    const updateData = JSON.stringify({
      message: 'Update menu data with fixed image paths and allergens',
      content: base64Content,
      branch: branch,
      sha: sha
    });

    const putOptions = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Node.js',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(updateData)
      }
    };

    const putReq = https.request(putOptions, (putRes) => {
      let putData = '';
      putRes.on('data', chunk => putData += chunk);
      putRes.on('end', () => {
        console.log('GitHub update response:', putRes.statusCode);
        console.log(putData);
        process.exit(0);
      });
    });

    putReq.on('error', (e) => {
      console.error('PUT error:', e);
      process.exit(1);
    });
    putReq.write(updateData);
    putReq.end();
  });
});

getReq.on('error', (e) => {
  console.error('GET error:', e);
  process.exit(1);
});
getReq.end();