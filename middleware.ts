import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') || 
                       request.nextUrl.pathname.startsWith('/api/admin');
  
  // Исключаем login страницу из проверки
  if (request.nextUrl.pathname === '/admin/login') {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    const authCookie = request.cookies.get('admin_token');
    
    // Проверяем токен
    if (authCookie?.value !== process.env.ADMIN_SECRET) {
      // Перенаправляем на страницу логина
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
