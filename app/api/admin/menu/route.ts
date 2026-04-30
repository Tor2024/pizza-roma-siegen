import { NextResponse } from 'next/server';

// GET - получить текущее меню
export async function GET() {
  try {
    const menuData = await import('@/data/menu.json');
    return NextResponse.json(menuData.default);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}

// POST - обновить меню через GitHub API
export async function POST(req: Request) {
  try {
    const newMenuData = await req.json();
    
    // Проверка авторизации
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Переменные окружения
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN2;
    const REPO_OWNER = process.env.VERCEL_GIT_REPO_OWNER || 'tor2024';
    const REPO_NAME = process.env.VERCEL_GIT_REPO_SLUG || 'pizza-roma-siegen';
    const FILE_PATH = 'public/data/menu.json';

    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      return NextResponse.json({ error: 'GitHub config missing' }, { status: 500 });
    }

    // 1. Пробуем получить текущий SHA файла (если файл существует)
    let sha: string | undefined;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}?ref=main`,
        {
          headers: { 
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (getResponse.ok) {
        const currentFile = await getResponse.json();
        sha = currentFile.sha;
        console.log('Got SHA for existing file:', sha);
      } else if (getResponse.status === 404) {
        console.log('File does not exist, will create new');
      } else {
        console.log('GitHub GET error:', getResponse.status);
      }
    } catch (e) {
      console.log('Error fetching file SHA:', e);
    }

    // 2. Кодируем новые данные в Base64
    const content = Buffer.from(JSON.stringify(newMenuData, null, 2)).toString('base64');

    // 3. Делаем коммит (создаем или обновляем)
    const requestBody: any = {
      message: 'Update menu from Admin Panel',
      content: content,
      branch: 'main'
    };
    
    // Если файл существует, добавляем SHA для обновления
    if (sha && sha.length > 0) {
      requestBody.sha = sha;
      console.log('Adding SHA to request:', sha);
    } else {
      console.log('No SHA - creating new file');
    }

    const updateResponse = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: { 
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (updateResponse.ok) {
      return NextResponse.json({ 
        success: true, 
        message: 'Menu updated! Vercel is rebuilding the site...',
        commit: await updateResponse.json()
      });
    } else {
      const error = await updateResponse.text();
      return NextResponse.json({ error: `GitHub commit failed: ${error}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
