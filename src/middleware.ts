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

  // Verificação híbrida: cookies do Supabase + header customizado para localStorage
  const cookies = request.cookies;
  
  // Procurar por cookies específicos do Supabase
  const authTokenCookie = cookies.get('sb-auth-token');
  const accessTokenCookie = cookies.get('sb-access-token');
  
  // Buscar qualquer cookie que comece com sb- e contenha informações de auth
  const supabaseCookies = Array.from(cookies.getAll()).filter(cookie => 
    cookie.name.startsWith('sb-') && 
    cookie.value && 
    cookie.value !== 'null' && 
    cookie.value !== 'undefined' &&
    cookie.value.length > 10 // Cookie válido deve ter conteúdo substancial
  );
  
  // Verificar header customizado que pode ser enviado pelo cliente
  const localStorageAuth = request.headers.get('x-localstorage-auth');
  
  // Se não há cookies de autenticação válidos E não há header de localStorage, redirecionar para login
  if (supabaseCookies.length === 0 && !authTokenCookie && !accessTokenCookie && !localStorageAuth) {
    console.log(`Middleware: Nenhuma autenticação válida encontrada para ${pathname}`);
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    redirectUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(redirectUrl);
  }

  console.log(`Middleware: Autenticação encontrada para ${pathname}, permitindo acesso`);
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