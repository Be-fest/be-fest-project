import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

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
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      // Se for provider tentando acessar rota de cliente, redireciona
      if (userData?.role === 'provider') {
        const redirectUrl = new URL('/acesso-negado', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    } catch (error) {
      console.error('Erro ao verificar role do usuário:', error);
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/minhas-festas/:path*',
    '/dashboard/:path*',
    '/perfil/:path*',
    '/pagamento/:path*',
  ],
}; 