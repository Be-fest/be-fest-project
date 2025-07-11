import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Database } from '@/types/supabase';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const supabase = createRouteHandlerClient<Database>({ cookies });

  // Buscar o tipo do usuário
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role === 'provider') {
      return NextResponse.redirect(`${requestUrl.origin}/dashboard/prestador`);
    }
  }

  // Se não for prestador ou se houver algum erro, redireciona para a home
  return NextResponse.redirect(requestUrl.origin);
} 