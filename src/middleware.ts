import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Pular middleware para rotas que não precisam de verificação
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/' ||
    pathname.startsWith('/prestadores') ||
    pathname.startsWith('/servicos') ||
    pathname.startsWith('/prestador/') ||
    pathname.startsWith('/debug-cookies') ||
    pathname.startsWith('/test-session') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Rotas que precisam de autenticação
  const protectedRoutes = [
    '/minhas-festas',
    '/dashboard',
    '/perfil',
    '/pagamento',
    '/admin'
  ];

  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificação de autenticação baseada em cookies do Supabase
  const cookies = request.cookies;
  
  // Buscar cookies do Supabase (formato padrão: sb-{projectid}-auth-token)
  const supabaseCookies = Array.from(cookies.getAll()).filter(cookie => 
    cookie.name.includes('auth-token') &&
    cookie.value && 
    cookie.value !== 'null' && 
    cookie.value !== 'undefined' &&
    cookie.value.length > 20 // Token válido deve ter conteúdo substancial
  );
  
  // Se não há cookies de autenticação válidos, redirecionar para login
  if (supabaseCookies.length === 0) {
    console.log(`Middleware: Nenhum cookie de auth válido encontrado para ${pathname}`);
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    redirectUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(redirectUrl);
  }

  console.log(`Middleware: Cookies de auth encontrados para ${pathname}, permitindo acesso`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}; 