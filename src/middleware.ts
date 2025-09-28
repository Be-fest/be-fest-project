import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Pular middleware apenas para rotas que realmente não precisam de verificação
  if (
    pathname.startsWith('/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/super-admin') ||
    pathname === '/favicon.ico' ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // PRIMEIRO: Verificar se é prestador e bloquear rotas de cliente
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('role, id')
        .eq('id', user.id)
        .single();

      if (userData?.role === 'provider') {
        // Rotas públicas que prestadores podem acessar (sem redirecionamento)
        const publicRoutes = [
          '/servicos',
          '/prestadores',
          `/prestador/${userData.id}` // Apenas o site público próprio do prestador
        ];

        // Rotas privadas permitidas para prestadores
        const allowedProviderRoutes = [
          '/dashboard/prestador',
          '/prestador' // Permitir acesso às páginas do próprio prestador
        ];

        // Verificar se é uma rota pública (não redirecionar)
        const isPublicRoute = publicRoutes.some(route => 
          pathname === route || 
          pathname.startsWith(route + '/') ||
          pathname.startsWith('/servicos/') // Permitir páginas de serviços
        );

        // Se é rota pública, permitir acesso
        if (isPublicRoute) {
          return NextResponse.next();
        }

        // Verificar se é uma rota privada permitida
        const isAllowedRoute = allowedProviderRoutes.some(route => 
          pathname === route || pathname.startsWith(route + '/')
        );

        // Se não é nem pública nem privada permitida, redirecionar
        if (!isAllowedRoute) {
          return NextResponse.redirect(new URL('/dashboard/prestador', request.url));
        }
      }
    }
  } catch (error) {
    // Em caso de erro na verificação, continuar com o fluxo normal
  }

  // Rotas que precisam de autenticação
  const protectedRoutes = [
    '/dashboard',
    '/perfil',
    '/pagamento',
    '/admin'
  ];

  // Rotas que precisam de super-admin
  const superAdminRoutes = [
    '/admin/cadastrar-admin'
  ];

  // Verificar se a rota atual é protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isSuperAdminRoute = superAdminRoutes.some(route => pathname.startsWith(route));
  
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
    // Removido console.log para produção
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    redirectUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(redirectUrl);
  }

  // Removido console.log para produção
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