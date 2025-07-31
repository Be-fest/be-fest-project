import { createServerClient } from '@/lib/supabase/server';
import { GeolocationFilters, ServiceWithDistance } from '@/types/geolocation';

export const getNearbyServicesAction = async (filters: GeolocationFilters): Promise<ServiceWithDistance[]> => {
  const supabase = await createServerClient();

  const { data: services, error } = await supabase
    .rpc('get_nearby_services', {
      event_lat: filters.event_latitude,
      event_lon: filters.event_longitude,
      max_distance: filters.raio_maximo || 50,
      category_filter: filters.categoria_servico || '',
      search_query: filters.search_query || ''
    })
    .select('*');

  if (error) throw new Error(error.message);
  return services as ServiceWithDistance[];
};

// Função SQL para buscar serviços próximos
export const nearbyServicesSQL = `
create or replace function get_nearby_services(
  event_lat float8,
  event_lon float8,
  max_distance integer,
  category_filter text,
  search_query text
)
returns table (
  service_id uuid,
  service_name text,
  service_description text,
  service_category text,
  service_base_price numeric,
  service_images_urls text[],
  provider_id uuid,
  provider_name text,
  provider_organization text,
  provider_profile_image text,
  provider_latitude float8,
  provider_longitude float8,
  provider_cidade text,
  provider_estado text,
  distancia_do_evento numeric
)
as $$
select
  s.id as service_id,
  s.name as service_name,
  s.description as service_description,
  s.category as service_category,
  s.base_price as service_base_price,
  s.images as service_images_urls,
  p.id as provider_id,
  p.full_name as provider_name,
  p.organization as provider_organization,
  p.profile_image as provider_profile_image,
  p.latitude as provider_latitude,
  p.longitude as provider_longitude,
  p.city as provider_cidade,
  p.state as provider_estado,
  ST_DistanceSphere(
    ST_MakePoint(p.longitude, p.latitude),
    ST_MakePoint(event_lon, event_lat)
  ) / 1000 as distancia_do_evento
from services s
join providers p on s.provider_id = p.id
where 
  ST_DWithin(
    ST_MakePoint(p.longitude, p.latitude)::geography,
    ST_MakePoint(event_lon, event_lat)::geography,
    max_distance * 1000
  )
  and (category_filter = '' or s.category = category_filter)
  and (search_query = '' or s.name ilike '%' || search_query || '%')
order by distancia_do_evento;
$$ language sql stable;
`