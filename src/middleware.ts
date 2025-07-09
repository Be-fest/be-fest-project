import { createServerClient } from '@supabase/ssr';
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

  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );
    
    console.log('📡 [MIDDLEWARE] Verificando sessão...');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('👤 [MIDDLEWARE] Usuário encontrado:', !!user);
    console.log('🔑 [MIDDLEWARE] User ID:', user?.id || 'Nenhum');
    console.log('❌ [MIDDLEWARE] Erro:', error?.message || 'Nenhum');

    if (error) {
      console.error('❌ [MIDDLEWARE] Erro ao obter usuário:', error);
    }

    // Se não há usuário, redirecionar para login
    if (!user) {
      console.log('🚨 [MIDDLEWARE] Sem usuário válido, redirecionando para login');
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar se é uma rota só para clientes
    const clientOnlyRoutes = ['/minhas-festas', '/pagamento'];
    const isClientOnlyRoute = clientOnlyRoutes.some(route => pathname.startsWith(route));
    
    if (isClientOnlyRoute) {
      console.log('🏠 [MIDDLEWARE] Verificando role para rota de cliente...');
      
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role, full_name')
          .eq('id', user.id)
          .single();

        console.log('👥 [MIDDLEWARE] Role do usuário:', userData?.role || 'Não encontrado');
        
        if (userError) {
          console.error('❌ [MIDDLEWARE] Erro ao buscar usuário:', userError);
          // Em caso de erro, permitir acesso
          return response;
        }

        if (userData?.role === 'provider') {
          console.log('🚫 [MIDDLEWARE] Provider tentando acessar rota de cliente');
          return NextResponse.redirect(new URL('/acesso-negado', request.url));
        }
      } catch (error) {
        console.error('❌ [MIDDLEWARE] Erro ao verificar role:', error);
        return response;
      }
    }

    console.log('✅ [MIDDLEWARE] Acesso permitido para:', pathname);
    return response;

  } catch (error) {
    console.error('❌ [MIDDLEWARE] Erro geral:', error);
    
    // Em caso de erro, redirecionar para login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectTo', pathname);
    redirectUrl.searchParams.set('reason', 'middleware_error');
    return NextResponse.redirect(redirectUrl);
  }
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