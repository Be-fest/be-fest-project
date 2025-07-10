import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  console.log('🔍 [MIDDLEWARE] Executando para:', pathname);
  
  // Pular middleware para rotas que não precisam de verificação
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname === '/' ||
    pathname.startsWith('/prestadores') ||
    pathname.startsWith('/categorias') ||
    pathname.startsWith('/prestador/') ||
    pathname.startsWith('/debug-cookies') ||
    pathname.startsWith('/test-session') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    console.log('🚫 [MIDDLEWARE] Rota ignorada:', pathname);
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
    console.log('🔓 [MIDDLEWARE] Rota não protegida, permitindo acesso:', pathname);
    return NextResponse.next();
  }

  console.log('🔒 [MIDDLEWARE] Rota protegida detectada:', pathname);

  // Verificação simples: verificar se há algum cookie de autenticação do Supabase
  const cookies = request.cookies;
  const authCookies = cookies.getAll().filter(cookie => 
    cookie.name.includes('auth-token') || 
    cookie.name.includes('sb-') ||
    cookie.name.includes('supabase')
  );

  console.log('🍪 [MIDDLEWARE] Cookies de auth encontrados:', authCookies.length);
  
  if (authCookies.length === 0) {
    console.log('🚨 [MIDDLEWARE] Nenhum cookie de auth encontrado, redirecionando para login');
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  console.log('✅ [MIDDLEWARE] Cookies de auth presentes, permitindo acesso - verificação detalhada será feita no client-side');
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