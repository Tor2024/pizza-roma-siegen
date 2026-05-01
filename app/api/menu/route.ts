import { NextResponse } from 'next/server';
import { getMenuFromGitHub } from '@/lib/githubMenuStorage';

export async function GET() {
  try {
    // Try to get from GitHub first
    const githubMenu = await getMenuFromGitHub();
    
    if (githubMenu) {
      return NextResponse.json(githubMenu, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }

    // Fallback to local file
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      const menuPath = path.join(process.cwd(), 'public', 'data', 'menu.json');
      const localMenu = JSON.parse(await fs.readFile(menuPath, 'utf-8'));
      
      return NextResponse.json(localMenu, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (localError) {
      console.error('Error reading local menu:', localError);
      return NextResponse.json({ error: 'Menu not available' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in menu API:', error);
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}
