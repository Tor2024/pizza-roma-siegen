import { NextResponse } from 'next/server';

// POST - загрузить изображение на GitHub
export async function POST(req: Request) {
  try {
    // Проверка авторизации
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Конвертируем файл в base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Content = buffer.toString('base64');

    // GitHub API
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN2;
    const REPO_OWNER = process.env.VERCEL_GIT_REPO_OWNER || 'tor2024';
    const REPO_NAME = process.env.VERCEL_GIT_REPO_SLUG || 'pizza-roma-siegen';
    const FILE_PATH = `public/images/${filename}`;

    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
    }

    // Проверяем существование файла для получения SHA
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
      }
    } catch (e) {
      // Файл не существует - создадим новый
    }

    // Создаем/обновляем файл на GitHub
    const requestBody: any = {
      message: `Upload image: ${filename}`,
      content: base64Content,
      branch: 'main'
    };
    if (sha) {
      requestBody.sha = sha;
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
        body: JSON.stringify(requestBody)
      }
    );

    if (response.ok) {
      return NextResponse.json({ 
        success: true, 
        path: `/images/${filename}`,
        message: 'Image uploaded successfully'
      });
    } else {
      const error = await response.text();
      return NextResponse.json({ error: `GitHub API error: ${error}` }, { status: 500 });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
