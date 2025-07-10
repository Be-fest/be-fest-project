import { createClient } from '@/lib/supabase/client';

interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface AdminStats {
  totalActiveEvents: number;
  totalPendingRequests: number;
  monthlyRevenue: number;
  newClients: number;
  totalProviders: number;
  totalClients: number;
  totalServices: number;
  totalEvents: number;
}

export interface AdminEvent {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  event_date: string;
  location: string;
  guest_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  total_estimated_value: number;
  services_count: number;
  progress: number;
}

export interface AdminEventDetails extends AdminEvent {
  services: Array<{
    id: string;
    service_name: string;
    provider_name: string;
    status: string;
    total_estimated_price: number;
  }>;
}

export async function getAdminStatsAction(): Promise<ActionResult<AdminStats>> {
  try {
    const supabase = createClient();
    
    // Buscar eventos ativos (não draft nem cancelled)
    const { count: activeEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'draft')
      .neq('status', 'cancelled');

    // Buscar solicitações pendentes
    const { count: pendingRequestsCount } = await supabase
      .from('event_services')
      .select('*', { count: 'exact', head: true })
      .eq('booking_status', 'pending_provider_approval');

    // Buscar novos clientes (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: newClientsCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')
      .gte('created_at', thirtyDaysAgo.toISOString());

    // Buscar total de prestadores
    const { count: providersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'provider');

    // Buscar total de clientes
    const { count: clientsCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client');

    // Buscar total de serviços
    const { count: servicesCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Buscar total de eventos
    const { count: eventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });

    // Calcular receita mensal (soma dos valores estimados de eventos aprovados no mês atual)
    const currentMonth = new Date();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data: monthlyRevenueData } = await supabase
      .from('event_services')
      .select('total_estimated_price')
      .eq('booking_status', 'approved')
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());

    const monthlyRevenue = monthlyRevenueData?.reduce((sum, item) => sum + (item.total_estimated_price || 0), 0) || 0;

    const stats: AdminStats = {
      totalActiveEvents: activeEventsCount || 0,
      totalPendingRequests: pendingRequestsCount || 0,
      monthlyRevenue: monthlyRevenue,
      newClients: newClientsCount || 0,
      totalProviders: providersCount || 0,
      totalClients: clientsCount || 0,
      totalServices: servicesCount || 0,
      totalEvents: eventsCount || 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    console.error('Admin stats fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar estatísticas' 
    };
  }
}

export async function getAdminEventsAction(): Promise<ActionResult<AdminEvent[]>> {
  try {
    const supabase = createClient();
    
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        location,
        guest_count,
        status,
        created_at,
        updated_at,
        client:users!client_id (
          full_name,
          email
        ),
        event_services (
          id,
          booking_status,
          total_estimated_price
        )
      `)
      .neq('status', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin events:', error);
      return { success: false, error: error.message };
    }

    const adminEvents: AdminEvent[] = events?.map(event => {
      const services = event.event_services || [];
      const totalValue = services.reduce((sum, service) => sum + (service.total_estimated_price || 0), 0);
      const approvedServices = services.filter(s => s.booking_status === 'approved').length;
      const progress = services.length > 0 ? Math.round((approvedServices / services.length) * 100) : 0;

      return {
        id: event.id,
        title: event.title,
        client_name: (event.client as any)?.full_name || 'N/A',
        client_email: (event.client as any)?.email || 'N/A',
        event_date: event.event_date,
        location: event.location || 'N/A',
        guest_count: event.guest_count,
        status: event.status,
        created_at: event.created_at,
        updated_at: event.updated_at,
        total_estimated_value: totalValue,
        services_count: services.length,
        progress: progress,
      };
    }) || [];

    return { success: true, data: adminEvents };
  } catch (error) {
    console.error('Admin events fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar eventos' 
    };
  }
}

export async function getAdminEventDetailsAction(eventId: string): Promise<ActionResult<AdminEventDetails>> {
  try {
    const supabase = createClient();
    
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        event_date,
        location,
        guest_count,
        status,
        created_at,
        updated_at,
        client:users!client_id (
          full_name,
          email
        ),
        event_services (
          id,
          booking_status,
          total_estimated_price,
          service:services (
            name
          ),
          provider:users!provider_id (
            full_name,
            organization_name
          )
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) {
      console.error('Error fetching admin event details:', error);
      return { success: false, error: error.message };
    }

    const services = event.event_services || [];
    const totalValue = services.reduce((sum, service) => sum + (service.total_estimated_price || 0), 0);
    const approvedServices = services.filter(s => s.booking_status === 'approved').length;
    const progress = services.length > 0 ? Math.round((approvedServices / services.length) * 100) : 0;

    const adminEventDetails: AdminEventDetails = {
      id: event.id,
      title: event.title,
      client_name: (event.client as any)?.full_name || 'N/A',
      client_email: (event.client as any)?.email || 'N/A',
      event_date: event.event_date,
      location: event.location || 'N/A',
      guest_count: event.guest_count,
      status: event.status,
      created_at: event.created_at,
      updated_at: event.updated_at,
      total_estimated_value: totalValue,
      services_count: services.length,
      progress: progress,
      services: services.map(service => ({
        id: service.id,
        service_name: (service.service as any)?.name || 'N/A',
        provider_name: (service.provider as any)?.organization_name || (service.provider as any)?.full_name || 'N/A',
        status: service.booking_status,
        total_estimated_price: service.total_estimated_price || 0,
      })),
    };

    return { success: true, data: adminEventDetails };
  } catch (error) {
    console.error('Admin event details fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar detalhes do evento' 
    };
  }
}

export async function getAllUsersAction(): Promise<ActionResult<Array<{
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  organization_name?: string;
  whatsapp_number?: string;
}>>> {
  try {
    const supabase = createClient();
    
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        created_at,
        organization_name,
        whatsapp_number
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: users || [] };
  } catch (error) {
    console.error('Users fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar usuários' 
    };
  }
}

export async function getAllServicesAction(): Promise<ActionResult<Array<{
  id: string;
  name: string;
  description: string;
  provider_name: string;
  category: string;
  price_per_guest: number;
  is_active: boolean;
  status: string;
  created_at: string;
}>>> {
  try {
    const supabase = createClient();
    
    const { data: services, error } = await supabase
      .from('services')
      .select(`
        id,
        name,
        description,
        category,
        price_per_guest,
        is_active,
        status,
        created_at,
        provider:users!provider_id (
          full_name,
          organization_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching services:', error);
      return { success: false, error: error.message };
    }

    const formattedServices = services?.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      provider_name: (service.provider as any)?.organization_name || (service.provider as any)?.full_name || 'N/A',
      category: service.category || 'N/A',
      price_per_guest: service.price_per_guest || 0,
      is_active: service.is_active || false,
      status: service.status || 'draft',
      created_at: service.created_at,
    })) || [];

    return { success: true, data: formattedServices };
  } catch (error) {
    console.error('Services fetch failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar serviços' 
    };
  }
} 