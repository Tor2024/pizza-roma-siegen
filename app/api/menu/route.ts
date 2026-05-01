import { NextResponse } from 'next/server';
import { getMenuFromGitHub } from '@/lib/githubMenuStorage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  console.log('API /menu: GITHUB_TOKEN2 exists:', !!process.env.GITHUB_TOKEN2);
  try {
    // Try to get from GitHub first
    const githubMenu = await getMenuFromGitHub();
    
    if (githubMenu) {
      console.log('API /menu: returning GitHub data');
      return NextResponse.json({...githubMenu, _source: 'github', _timestamp: Date.now()}, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    console.log('API /menu: GitHub unavailable, using fallback');

    // Fallback to local file
    try {
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');
      const menuPath = path.join(process.cwd(), 'public', 'data', 'menu.json');
      const localMenu = JSON.parse(await fs.readFile(menuPath, 'utf-8'));
      
      console.log('API /menu: returning local data');
      return NextResponse.json({...localMenu, _source: 'local', _timestamp: Date.now()}, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    } catch (localError) {
      console.error('Error reading local menu:', localError);
      return NextResponse.json({ error: 'Menu not available', _timestamp: Date.now() }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in menu API:', error);
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}
