export interface Location {
  latitude: number;
  longitude: number;
}

export interface UserLocation extends Location {
  endereco_completo?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  raio_atuacao?: number;
}

export interface ServiceWithDistance {
  service_id: string;
  service_name: string;
  service_description: string;
  service_category: string;
  service_base_price: number;
  service_images_urls: string[];
  provider_id: string;
  provider_name: string;
  provider_organization: string;
  provider_profile_image: string;
  provider_latitude: number;
  provider_longitude: number;
  provider_cidade: string;
  provider_estado: string;
  distancia_do_evento: number;  // Distância entre provedor e local do evento
  distancia_do_cliente?: number; // Distância opcional entre provedor e cliente
}

export interface GeolocationFilters {
  raio_maximo?: number;
  categoria_servico?: string;
  search_query?: string;
  event_latitude: number;  // Coordenada obrigatória do evento
  event_longitude: number; // Coordenada obrigatória do evento
  user_latitude?: number;   // Coordenada opcional do usuário
  user_longitude?: number;  // Coordenada opcional do usuário
}

export interface GeolocationCache {
  latitude: number;
  longitude: number;
  timestamp: number;
  endereco_completo?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}