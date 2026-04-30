import { NextResponse } from 'next/server';
import { getMenu, updateMenu } from '@/lib/menuStorage';

// GET - получить текущее меню
export async function GET() {
  try {
    const menuData = getMenu();
    return NextResponse.json(menuData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load menu' }, { status: 500 });
  }
}

// POST - обновить меню (in-memory storage)
export async function POST(req: Request) {
  try {
    const newMenuData = await req.json();
    
    // Проверка авторизации
    const authHeader = req.headers.get('authorization');
    if (!authHeader || authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Сохраняем в память
    updateMenu(newMenuData);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menü gespeichert! Änderungen sind sofort aktiv.'
    });
  } catch (error) {
    console.error('Menu update error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
