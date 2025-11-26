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
  // Novas estatísticas
  totalEventServices: number;
  totalBookings: number;
  totalRevenue: number;
  averageEventValue: number;
  eventsByStatus: {
    draft: number;
    published: number;
    waiting_payment: number;
    completed: number;
    cancelled: number;
  };
  eventServicesByStatus: {
    pending_provider_approval: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
  recentActivity: {
    newEvents: number;
    newServices: number;
    newProviders: number;
    newClients: number;
  };
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

    // Buscar total de event_services
    const { count: eventServicesCount } = await supabase
      .from('event_services')
      .select('*', { count: 'exact', head: true });

    // Buscar total de bookings
    const { count: bookingsCount } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });

    // Buscar eventos por status
    const { data: eventsByStatusData } = await supabase
      .from('events')
      .select('status');

    const eventsByStatus = {
      draft: 0,
      published: 0,
      waiting_payment: 0,
      completed: 0,
      cancelled: 0
    };

    eventsByStatusData?.forEach(event => {
      const status = event.status as keyof typeof eventsByStatus;
      if (status in eventsByStatus) {
        eventsByStatus[status]++;
      }
    });

    // Buscar event_services por status
    const { data: eventServicesByStatusData } = await supabase
      .from('event_services')
      .select('booking_status');

    const eventServicesByStatus = {
      pending_provider_approval: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    };

    eventServicesByStatusData?.forEach(es => {
      const status = es.booking_status as keyof typeof eventServicesByStatus;
      if (status in eventServicesByStatus) {
        eventServicesByStatus[status]++;
      }
    });

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

    // Calcular receita total
    const { data: totalRevenueData } = await supabase
      .from('event_services')
      .select('total_estimated_price')
      .eq('booking_status', 'approved');

    const totalRevenue = totalRevenueData?.reduce((sum, item) => sum + (item.total_estimated_price || 0), 0) || 0;

    // Calcular valor médio por evento
    const averageEventValue = (activeEventsCount || 0) > 0 ? totalRevenue / (activeEventsCount || 1) : 0;

    // Buscar atividade recente (últimos 7 dias)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: newEventsCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: newServicesCount } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: newProvidersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'provider')
      .gte('created_at', sevenDaysAgo.toISOString());

    const { count: newClientsRecentCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'client')
      .gte('created_at', sevenDaysAgo.toISOString());

    const stats: AdminStats = {
      totalActiveEvents: activeEventsCount || 0,
      totalPendingRequests: pendingRequestsCount || 0,
      monthlyRevenue: monthlyRevenue,
      newClients: newClientsCount || 0,
      totalProviders: providersCount || 0,
      totalClients: clientsCount || 0,
      totalServices: servicesCount || 0,
      totalEvents: eventsCount || 0,
      totalEventServices: eventServicesCount || 0,
      totalBookings: bookingsCount || 0,
      totalRevenue: totalRevenue,
      averageEventValue: averageEventValue,
      eventsByStatus,
      eventServicesByStatus,
      recentActivity: {
        newEvents: newEventsCount || 0,
        newServices: newServicesCount || 0,
        newProviders: newProvidersCount || 0,
        newClients: newClientsRecentCount || 0,
      },
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
      price_per_guest: 0,
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

export async function getAllEventServicesAction(): Promise<ActionResult<Array<{
  id: string;
  event_id: string;
  service_id: string;
  provider_id: string;
  event_title: string;
  event_date: string;
  event_location: string;
  service_status: string;
  client_name: string;
  client_email: string;
  client_whatsapp: string;
  service_name: string;
  service_category: string;
  service_description: string;
  provider_name: string;
  provider_email: string;
  provider_whatsapp: string;
  provider_organization: string;
  booking_status: string;
  price_per_guest_at_booking: number;
  total_estimated_price: number;
  guest_count: number;
  created_at: string;
  updated_at: string;
}>>> {
  try {
    const supabase = createClient();

    const { data: eventServices, error } = await supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        service_id,
        provider_id,
        price_per_guest_at_booking,
        total_estimated_price,
        booking_status,
        created_at,
        updated_at,
        event:events (
          id,
          title,
          event_date,
          location,
          guest_count,
          client:users (
            full_name,
            email,
            whatsapp_number
          )
        ),
        service:services (
          id,
          name,
          category,
          description,
          status,
          provider:users (
            full_name,
            organization_name,
            email,
            whatsapp_number
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching event services:', error);
      return { success: false, error: error.message };
    }

    const formattedEventServices = eventServices?.map(es => {
      const event = es.event as any;
      const service = es.service as any;
      const client = event?.client as any;
      const provider = service?.provider as any;

      return {
        id: es.id,
        event_id: es.event_id,
        service_id: es.service_id,
        provider_id: es.provider_id,
        event_title: event?.title || 'N/A',
        event_date: event?.event_date || 'N/A',
        event_location: event?.location || 'N/A',
        // event_status removido pois não existe em events
        service_status: service?.status || 'N/A',
        client_name: client?.full_name || 'N/A',
        client_email: client?.email || 'N/A',
        client_whatsapp: client?.whatsapp_number || 'Não informado',
        service_name: service?.name || 'N/A',
        service_category: service?.category || 'N/A',
        service_description: service?.description || 'N/A',
        provider_name: provider?.organization_name || provider?.full_name || 'N/A',
        provider_email: provider?.email || 'N/A',
        provider_whatsapp: provider?.whatsapp_number || 'Não informado',
        provider_organization: provider?.organization_name || 'N/A',
        booking_status: es.booking_status || 'pending_provider_approval',
        price_per_guest_at_booking: es.price_per_guest_at_booking || 0,
        total_estimated_price: es.total_estimated_price || 0,
        guest_count: event?.guest_count || 0,
        created_at: es.created_at,
        updated_at: es.updated_at,
      };
    }) || [];

    return { success: true, data: formattedEventServices };
  } catch (error) {
    console.error('Event services fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar serviços de eventos'
    };
  }
}

export async function getEventServicesCountsAction(): Promise<ActionResult<{
  total: number;
  byStatus: Record<string, number>;
}>> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('event_services')
      .select('booking_status');

    if (error) {
      return { success: false, error: error.message };
    }

    const byStatus: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      const s = row.booking_status || 'unknown';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });

    return { success: true, data: { total: data?.length || 0, byStatus } };
  } catch (error) {
    console.error('Event services count fetch failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao buscar contagens de pedidos'
    };
  }
}

export async function deleteClientAction(clientId: string): Promise<ActionResult<void>> {
  try {
    const supabase = createClient();

    // Primeiro, buscar todos os eventos do cliente para deletar seus event_services
    const { data: events, error: fetchEventsError } = await supabase
      .from('events')
      .select('id')
      .eq('client_id', clientId);

    if (fetchEventsError) {
      console.error('Error fetching client events:', fetchEventsError);
      return { success: false, error: 'Erro ao buscar eventos do cliente' };
    }

    // Deletar todos os event_services dos eventos
    if (events && events.length > 0) {
      const eventIds = events.map(e => e.id);
      const { error: deleteEventServicesError } = await supabase
        .from('event_services')
        .delete()
        .in('event_id', eventIds);

      if (deleteEventServicesError) {
        console.error('Error deleting event services:', deleteEventServicesError);
        return { success: false, error: 'Erro ao deletar serviços de eventos' };
      }
    }

    // Depois, deletar todos os eventos do cliente
    const { error: deleteEventsError } = await supabase
      .from('events')
      .delete()
      .eq('client_id', clientId);

    if (deleteEventsError) {
      console.error('Error deleting client events:', deleteEventsError);
      return { success: false, error: 'Erro ao deletar eventos do cliente' };
    }

    // Por fim, deletar o usuário (cliente)
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', clientId);

    if (deleteUserError) {
      console.error('Error deleting client:', deleteUserError);
      return { success: false, error: 'Erro ao deletar cliente' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete client failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar cliente'
    };
  }
}

export async function deleteProviderAction(providerId: string): Promise<ActionResult<void>> {
  try {
    const supabase = createClient();

    // Buscar todos os serviços do prestador uma única vez
    const { data: services, error: fetchServicesError } = await supabase
      .from('services')
      .select('id')
      .eq('provider_id', providerId);

    if (fetchServicesError) {
      console.error('Error fetching provider services:', fetchServicesError);
      return { success: false, error: 'Erro ao buscar serviços do prestador' };
    }

    const serviceIds = services?.map(s => s.id) || [];
    console.log(`Found ${serviceIds.length} services for provider ${providerId}`);

    // Se há serviços, deletar suas dependências
    if (serviceIds.length > 0) {
      // Deletar service_guest_tiers
      const { error: deleteGuestTiersError } = await supabase
        .from('service_guest_tiers')
        .delete()
        .in('service_id', serviceIds);

      if (deleteGuestTiersError) {
        console.error('Error deleting service guest tiers:', deleteGuestTiersError);
        return { success: false, error: 'Erro ao deletar níveis de preço dos serviços' };
      }

      // Deletar event_services
      const { error: deleteEventServicesError } = await supabase
        .from('event_services')
        .delete()
        .in('service_id', serviceIds);

      if (deleteEventServicesError) {
        console.error('Error deleting event services:', deleteEventServicesError);
        return { success: false, error: 'Erro ao deletar serviços de eventos' };
      }
    }

    // Deletar todos os serviços do prestador
    const { error: deleteServicesError } = await supabase
      .from('services')
      .delete()
      .eq('provider_id', providerId);

    if (deleteServicesError) {
      console.error('Error deleting provider services:', deleteServicesError);
      return { success: false, error: 'Erro ao deletar serviços do prestador' };
    }

    // Por fim, deletar o usuário (prestador)
    const { error: deleteUserError } = await supabase
      .from('users')
      .delete()
      .eq('id', providerId);

    if (deleteUserError) {
      console.error('Error deleting provider:', deleteUserError);
      return { success: false, error: 'Erro ao deletar prestador' };
    }

    return { success: true };
  } catch (error) {
    console.error('Delete provider failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao deletar prestador'
    };
  }
}