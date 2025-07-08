import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  
  // Verificar se já estamos em uma rota de auth para evitar recursividade
  if (request.nextUrl.pathname.startsWith('/auth/')) {
    return res;
  }

  try {
    const supabase = createMiddlewareClient({ req: request, res });

    let session = null;
    
    try {
      const { data: { session: userSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Erro ao obter sessão:', error);
        // Se há erro na sessão, limpar cookies corrompidos
        const response = NextResponse.next();
        response.cookies.delete('sb-access-token');
        response.cookies.delete('sb-refresh-token');
        return response;
      }
      
      session = userSession;
    } catch (cookieError) {
      console.error('Erro ao fazer parse dos cookies:', cookieError);
      // Limpar cookies corrompidos
      const response = NextResponse.next();
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      return response;
    }

    // Rotas que precisam de autenticação
    const protectedRoutes = [
      '/minhas-festas',
      '/dashboard',
      '/perfil',
      '/pagamento',
    ];

    // Rotas bloqueadas para providers
    const clientOnlyRoutes = [
      '/minhas-festas',
      '/pagamento',
    ];

    // Verifica se a rota atual precisa de autenticação
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    );

    // Se for uma rota protegida e não houver sessão, redireciona para login
    if (isProtectedRoute && !session) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar role do usuário para rotas específicas de cliente
    if (session && clientOnlyRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Erro ao verificar role do usuário:', userError);
          // Se houver erro, permitir acesso (não bloquear por erro de DB)
          return res;
        }

        // Se for provider tentando acessar rota de cliente, redireciona
        if (userData?.role === 'provider') {
          const redirectUrl = new URL('/acesso-negado', request.url);
          return NextResponse.redirect(redirectUrl);
        }
      } catch (error) {
        console.error('Erro ao verificar role do usuário:', error);
        // Se houver erro, permitir acesso (não bloquear por erro)
        return res;
      }
    }

    return res;
  } catch (error) {
    console.error('Erro geral no middleware:', error);
    
    // Em caso de erro geral, limpar cookies e permitir acesso
    const response = NextResponse.next();
    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-refresh-token');
    
    return response;
  }
}

export const config = {
  matcher: [
    '/minhas-festas/:path*',
    '/dashboard/:path*',
    '/perfil/:path*',
    '/pagamento/:path*',
  ],
}; 