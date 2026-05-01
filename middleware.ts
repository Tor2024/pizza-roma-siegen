import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ADMIN_SECRET должен быть установлен в переменных окружения
const ADMIN_SECRET = process.env.ADMIN_SECRET;

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                       request.nextUrl.pathname.startsWith('/api/admin');
  
  // Исключаем login страницу из проверки
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    // КРИТИЧЕСКАЯ ПРОВЕРКА: если ADMIN_SECRET не установлен - запрещаем доступ
    if (!ADMIN_SECRET || ADMIN_SECRET.length < 10) {
      console.error('ADMIN_SECRET not configured or too short');
      return NextResponse.json(
        { error: 'Authentication not configured' }, 
        { status: 503 }
      );
    }

    const authCookie = request.cookies.get('admin_token');
    
    // Проверяем что cookie существует и совпадает с секретом
    if (!authCookie?.value || authCookie.value !== ADMIN_SECRET) {
      // Перенаправляем на страницу логина
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
