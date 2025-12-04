import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const providerId = request.nextUrl.searchParams.get('providerId');

    if (!providerId) {
      return NextResponse.json(
        { error: 'providerId é obrigatório' },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Buscar contagem de serviços do prestador
    const { count, error } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId);

    if (error) {
      console.error('Error fetching provider services count:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar serviços do prestador' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { count: count || 0 },
      { status: 200 }
    );
  } catch (error) {
    console.error('Provider services API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
