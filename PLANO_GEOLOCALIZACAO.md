# PLANO DE IMPLEMENTAÇÃO - SISTEMA DE GEOLOCALIZAÇÃO BE FEST

## **VISÃO GERAL**

Este documento apresenta um plano completo para implementar um sistema de geolocalização no Be Fest, similar ao iFood, permitindo que usuários encontrem serviços próximos à sua localização.

---

## **CONTEXTO ATUAL DO SISTEMA**

### **Estrutura Existente**
- **Tabela `users`**: Armazena dados de clientes e prestadores
- **Tabela `services`**: Serviços oferecidos pelos prestadores  
- **Tabela `events`**: Festas criadas pelos clientes
- **Tabela `event_services`**: Relacionamento entre festas e serviços

### **Limitações Identificadas**
- Não há sistema de localização
- Busca de serviços não considera proximidade
- Prestadores não definem área de atuação
- Clientes não podem filtrar por distância

---

## **ARQUITETURA PROPOSTA**

### **1. Estrutura de Dados**

#### **Migração da Tabela `users`**
```sql
-- Adicionar campos de geolocalização
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
ADD COLUMN IF NOT EXISTS raio_atuacao INTEGER DEFAULT 50, -- em km
ADD COLUMN IF NOT EXISTS endereco_completo TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT;
```

#### **Índices para Performance**
```sql
-- Criar índices espaciais
CREATE INDEX IF NOT EXISTS idx_users_location ON public.users(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_users_cidade ON public.users(cidade);
CREATE INDEX IF NOT EXISTS idx_users_estado ON public.users(estado);
```

#### **Funções SQL**
```sql
-- Função para calcular distância (Haversine)
CREATE OR REPLACE FUNCTION calcular_distancia(
  lat1 DECIMAL,
  lon1 DECIMAL,
  lat2 DECIMAL,
  lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN (
    6371 * acos(
      cos(radians(lat1)) * 
      cos(radians(lat2)) * 
      cos(radians(lon2) - radians(lon1)) + 
      sin(radians(lat1)) * 
      sin(radians(lat2))
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Função para buscar serviços próximos
CREATE OR REPLACE FUNCTION buscar_servicos_proximos(
  user_lat DECIMAL,
  user_lon DECIMAL,
  raio_maximo INTEGER DEFAULT 50,
  categoria_servico TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL
) RETURNS TABLE (
  service_id UUID,
  service_name TEXT,
  service_description TEXT,
  service_category TEXT,
  service_base_price NUMERIC,
  service_images_urls TEXT[],
  provider_id UUID,
  provider_name TEXT,
  provider_organization TEXT,
  provider_logo_url TEXT,
  provider_latitude DECIMAL,
  provider_longitude DECIMAL,
  provider_cidade TEXT,
  provider_estado TEXT,
  distancia DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as service_id,
    s.name as service_name,
    s.description as service_description,
    s.category as service_category,
    s.base_price as service_base_price,
    s.images_urls as service_images_urls,
    u.id as provider_id,
    u.full_name as provider_name,
    u.organization_name as provider_organization,
    u.logo_url as provider_logo_url,
    u.latitude as provider_latitude,
    u.longitude as provider_longitude,
    u.cidade as provider_cidade,
    u.estado as provider_estado,
    calcular_distancia(user_lat, user_lon, u.latitude, u.longitude) as distancia
  FROM public.services s
  JOIN public.users u ON s.provider_id = u.id
  WHERE s.is_active = true
    AND u.is_active = true
    AND u.latitude IS NOT NULL
    AND u.longitude IS NOT NULL
    AND calcular_distancia(user_lat, user_lon, u.latitude, u.longitude) <= LEAST(raio_maximo, u.raio_atuacao)
    AND (categoria_servico IS NULL OR s.category = categoria_servico)
    AND (search_query IS NULL OR (
      s.name ILIKE '%' || search_query || '%' OR
      s.description ILIKE '%' || search_query || '%' OR
      u.organization_name ILIKE '%' || search_query || '%'
    ))
  ORDER BY distancia ASC;
END;
$$ LANGUAGE plpgsql;
```

### **2. Tipos TypeScript**

#### **Arquivo: `src/types/geolocation.ts`**
```typescript
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
  provider_logo_url: string;
  provider_latitude: number;
  provider_longitude: number;
  provider_cidade: string;
  provider_estado: string;
  distancia: number;
}

export interface GeolocationFilters {
  raio_maximo?: number;
  categoria_servico?: string;
  search_query?: string;
  user_latitude?: number;
  user_longitude?: number;
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
```

---

## **COMPONENTES A SEREM IMPLEMENTADOS**

### **1. Hook de Geolocalização**

#### **Arquivo: `src/hooks/useGeolocation.ts`**
```typescript
import { useState, useEffect, useCallback } from 'react';
import { GeolocationCache, GeolocationError, Location } from '@/types/geolocation';

interface UseGeolocationReturn {
  location: Location | null;
  loading: boolean;
  error: GeolocationError | null;
  getCurrentLocation: () => Promise<Location | null>;
  saveLocationToCache: (location: Location) => void;
  getLocationFromCache: () => GeolocationCache | null;
  isLocationValid: (cache: GeolocationCache) => boolean;
  requestPermission: () => Promise<boolean>;
}

const CACHE_KEY = 'userLocation';
const CACHE_DURATION = 60 * 60 * 1000; // 1 hora

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);

  // Verificar se geolocalização é suportada
  const isGeolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  // Salvar localização no cache
  const saveLocationToCache = useCallback((location: Location) => {
    const cache: GeolocationCache = {
      ...location,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }, []);

  // Obter localização do cache
  const getLocationFromCache = useCallback((): GeolocationCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  // Verificar se localização em cache ainda é válida
  const isLocationValid = useCallback((cache: GeolocationCache): boolean => {
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, []);

  // Obter localização atual
  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!isGeolocationSupported) {
      setError({ code: 1, message: 'Geolocalização não suportada neste navegador' });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000, // 1 minuto
        });
      });

      const newLocation: Location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(newLocation);
      saveLocationToCache(newLocation);
      return newLocation;
    } catch (err: any) {
      const geolocationError: GeolocationError = {
        code: err.code || 0,
        message: getErrorMessage(err.code),
      };
      setError(geolocationError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isGeolocationSupported, saveLocationToCache]);

  // Função para obter mensagem de erro
  const getErrorMessage = (code: number): string => {
    switch (code) {
      case 1:
        return 'Permissão de localização negada';
      case 2:
        return 'Localização indisponível';
      case 3:
        return 'Tempo limite excedido';
      default:
        return 'Erro ao obter localização';
    }
  };

  // Carregar localização do cache na inicialização
  useEffect(() => {
    const cached = getLocationFromCache();
    if (cached && isLocationValid(cached)) {
      setLocation({
        latitude: cached.latitude,
        longitude: cached.longitude,
      });
    }
  }, [getLocationFromCache, isLocationValid]);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    saveLocationToCache,
    getLocationFromCache,
    isLocationValid,
    requestPermission: async () => true, // Simplificado
  };
}
```

### **2. Serviço de Geocodificação**

#### **Arquivo: `src/lib/services/geocoding.ts`**
```typescript
import { UserLocation } from '@/types/geolocation';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  formatted_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export class GeocodingService {
  private static instance: GeocodingService;
  private apiKey: string | null = null;

  private constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || null;
  }

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      // Tentar Google Maps API primeiro
      if (this.apiKey) {
        const result = await this.geocodeWithGoogle(address);
        if (result) return result;
      }

      // Fallback para OpenStreetMap Nominatim
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodingResult | null> {
    if (!this.apiKey) return null;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&region=br`
      );

      if (!response.ok) return null;

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const location = result.geometry.location;

        return {
          latitude: location.lat,
          longitude: location.lng,
          formatted_address: result.formatted_address,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro na geocodificação Google:', error);
      return null;
    }
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`
      );

      if (!response.ok) return null;

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        return {
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formatted_address: result.display_name,
        };
      }

      return null;
    } catch (error) {
      console.error('Erro na geocodificação Nominatim:', error);
      return null;
    }
  }

  async geocodeCEP(cep: string): Promise<GeocodingResult | null> {
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      throw new Error('CEP inválido');
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);

      if (!response.ok) return null;

      const data = await response.json();

      if (data.erro) return null;

      const address = `${data.logradouro}, ${data.localidade}, ${data.uf}, ${data.cep}`;
      
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('Erro na geocodificação ViaCEP:', error);
      return null;
    }
  }
}

export const geocodingService = GeocodingService.getInstance();
```

### **3. Actions de Geolocalização**

#### **Arquivo: `src/lib/actions/geolocation.ts`**
```typescript
import { createServerClient } from '@/lib/supabase/server';
import { ActionResult } from '@/types/auth';
import { ServiceWithDistance, GeolocationFilters, UserLocation } from '@/types/geolocation';

export async function updateUserLocationAction(
  userId: string,
  location: UserLocation
): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    
    const { error } = await supabase
      .from('users')
      .update({
        latitude: location.latitude,
        longitude: location.longitude,
        endereco_completo: location.endereco_completo,
        cidade: location.cidade,
        estado: location.estado,
        cep: location.cep,
        raio_atuacao: location.raio_atuacao,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao atualizar localização:', error);
      return { success: false, error: 'Erro ao atualizar localização' };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar localização:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar localização' 
    };
  }
}

export async function getNearbyServicesAction(
  filters: GeolocationFilters
): Promise<ActionResult<ServiceWithDistance[]>> {
  try {
    const supabase = await createServerClient();
    
    if (!filters.user_latitude || !filters.user_longitude) {
      return { success: false, error: 'Localização do usuário não fornecida' };
    }

    const { data, error } = await supabase
      .rpc('buscar_servicos_proximos', {
        user_lat: filters.user_latitude,
        user_lon: filters.user_longitude,
        raio_maximo: filters.raio_maximo || 50,
        categoria_servico: filters.categoria_servico || null,
        search_query: filters.search_query || null,
      });

    if (error) {
      console.error('Erro ao buscar serviços próximos:', error);
      return { success: false, error: 'Erro ao buscar serviços próximos' };
    }

    return { success: true, data: data as ServiceWithDistance[] };
  } catch (error) {
    console.error('Erro ao buscar serviços próximos:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar serviços próximos' 
    };
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
           Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
           Math.sin(dLon/2) * Math.sin(dLon/2);
           
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
}
```

---

## **COMPONENTES DE INTERFACE**

### **1. Componente de Filtro de Localização**

#### **Arquivo: `src/components/ui/LocationFilter.tsx`**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { geocodingService } from '@/lib/services/geocoding';
import { updateUserLocationAction } from '@/lib/actions/geolocation';
import { useAuth } from '@/hooks/useAuth';
import { GeolocationFilters } from '@/types/geolocation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { MdLocationOn, MdMyLocation, MdSearch } from 'react-icons/md';

interface LocationFilterProps {
  onFiltersChange: (filters: GeolocationFilters) => void;
  className?: string;
}

export function LocationFilter({ onFiltersChange, className = '' }: LocationFilterProps) {
  const { user } = useAuth();
  const { location, loading, error, getCurrentLocation } = useGeolocation();
  
  const [raioMaximo, setRaioMaximo] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [manualAddress, setManualAddress] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);

  // Categorias disponíveis
  const categories = [
    { value: '', label: 'Todas as categorias' },
    { value: 'Buffet', label: 'Buffet' },
    { value: 'Doceria', label: 'Doceria' },
    { value: 'Bar', label: 'Bar' },
    { value: 'Adega', label: 'Adega' },
    { value: 'Churrascaria', label: 'Churrascaria' },
    { value: 'Hamburgueria', label: 'Hamburgueria' },
    { value: 'Pizzaria', label: 'Pizzaria' },
    { value: 'Sorveteria', label: 'Sorveteria' },
    { value: 'Cervejaria', label: 'Cervejaria' },
  ];

  // Opções de raio
  const raioOptions = [
    { value: 5, label: 'Até 5km' },
    { value: 10, label: 'Até 10km' },
    { value: 20, label: 'Até 20km' },
    { value: 50, label: 'Até 50km' },
  ];

  // Atualizar filtros quando mudanças ocorrerem
  useEffect(() => {
    if (location) {
      const filters: GeolocationFilters = {
        user_latitude: location.latitude,
        user_longitude: location.longitude,
        raio_maximo: raioMaximo,
        categoria_servico: selectedCategory || undefined,
        search_query: searchQuery || undefined,
      };
      onFiltersChange(filters);
    }
  }, [location, raioMaximo, selectedCategory, searchQuery, onFiltersChange]);

  // Obter localização atual automaticamente
  const handleGetCurrentLocation = async () => {
    const newLocation = await getCurrentLocation();
    if (newLocation && user) {
      await updateUserLocationAction(user.id, {
        latitude: newLocation.latitude,
        longitude: newLocation.longitude,
      });
    }
  };

  // Geocodificar endereço manual
  const handleGeocodeAddress = async () => {
    if (!manualAddress.trim()) return;

    setGeocodingLoading(true);
    try {
      const result = await geocodingService.geocodeAddress(manualAddress);
      if (result && user) {
        await updateUserLocationAction(user.id, {
          latitude: result.latitude,
          longitude: result.longitude,
          endereco_completo: result.formatted_address,
          cidade: result.city,
          estado: result.state,
          cep: result.postal_code,
        });
        
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro na geocodificação:', error);
    } finally {
      setGeocodingLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Localização e Filtros
        </h3>
        
        {/* Status da localização */}
        <div className="flex items-center gap-2 mb-4">
          <MdLocationOn className="text-[#FF0080] text-xl" />
          {location ? (
            <span className="text-sm text-gray-600">
              Localização detectada
            </span>
          ) : error ? (
            <span className="text-sm text-red-600">
              {error.message}
            </span>
          ) : loading ? (
            <span className="text-sm text-gray-600">
              Detectando localização...
            </span>
          ) : (
            <span className="text-sm text-gray-600">
              Localização não detectada
            </span>
          )}
        </div>

        {/* Botão para obter localização atual */}
        <Button
          onClick={handleGetCurrentLocation}
          disabled={loading}
          className="w-full mb-4 bg-[#FF0080] hover:bg-[#E6006F] text-white"
        >
          <MdMyLocation className="mr-2" />
          {loading ? 'Detectando...' : 'Usar minha localização'}
        </Button>

        {/* Alternativa: endereço manual */}
        <div className="mb-4">
          <Button
            onClick={() => setShowManualInput(!showManualInput)}
            variant="outline"
            className="w-full"
          >
            {showManualInput ? 'Ocultar' : 'Inserir endereço manualmente'}
          </Button>
        </div>

        {/* Input manual de endereço */}
        {showManualInput && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endereço completo
              </label>
              <div className="flex gap-2">
                <Input
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Digite seu endereço completo"
                  className="flex-1"
                />
                <Button
                  onClick={handleGeocodeAddress}
                  disabled={geocodingLoading || !manualAddress.trim()}
                  className="bg-[#FF0080] hover:bg-[#E6006F] text-white"
                >
                  {geocodingLoading ? '...' : <MdSearch />}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="space-y-4">
        {/* Raio de busca */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Raio de busca
          </label>
          <Select
            value={raioMaximo.toString()}
            onChange={(e) => setRaioMaximo(Number(e.target.value))}
            className="w-full"
          >
            {raioOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoria
          </label>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Busca por texto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Buscar serviços
          </label>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Digite o nome do serviço ou prestador"
            className="w-full"
          />
        </div>
      </div>

      {/* Informações adicionais */}
      {location && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            Buscando serviços em um raio de {raioMaximo}km da sua localização
          </p>
        </div>
      )}
    </div>
  );
}
```

### **2. Componente de Card de Serviço com Distância**

#### **Arquivo: `src/components/ui/ServiceCardWithDistance.tsx`**
```typescript
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ServiceWithDistance } from '@/types/geolocation';
import { SafeHTML } from '@/components/ui/SafeHTML';
import { MdLocationOn, MdStar, MdAdd } from 'react-icons/md';

interface ServiceCardWithDistanceProps {
  service: ServiceWithDistance;
  onAddToParty?: (service: ServiceWithDistance) => void;
  selectedParty?: any;
}

export function ServiceCardWithDistance({ 
  service, 
  onAddToParty, 
  selectedParty 
}: ServiceCardWithDistanceProps) {
  
  // Formatar preço
  const getPriceLabel = (service: ServiceWithDistance) => {
    if (service.service_base_price === 0) {
      return 'Sob consulta';
    }
    return `R$ ${service.service_base_price.toFixed(2)}`;
  };

  // Formatar distância
  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  // Obter cor baseada na distância
  const getDistanceColor = (distance: number) => {
    if (distance <= 2) return 'text-green-600';
    if (distance <= 5) return 'text-yellow-600';
    if (distance <= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Imagem do serviço */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={service.service_images_urls?.[0] || service.provider_logo_url || '/be-fest-provider-logo.png'}
          alt={service.service_name}
          className="w-full h-full object-cover"
        />
        
        {/* Badge de distância */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
          <div className="flex items-center gap-1">
            <MdLocationOn className={`text-sm ${getDistanceColor(service.distancia)}`} />
            <span className={`text-xs font-semibold ${getDistanceColor(service.distancia)}`}>
              {formatDistance(service.distancia)}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo do card */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{service.service_name}</h3>
          <p className="text-gray-600 text-sm">
            por {service.provider_organization || service.provider_name || 'Prestador'}
          </p>
        </div>

        {/* Categoria */}
        <div className="mb-4">
          <span className="inline-block bg-[#FF0080] text-white px-3 py-1 rounded-full text-xs font-medium">
            {service.service_category}
          </span>
        </div>

        {/* Descrição */}
        {service.service_description && (
          <div className="text-gray-600 text-sm mb-4 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            <SafeHTML 
              html={service.service_description} 
              fallback="Sem descrição disponível"
            />
          </div>
        )}

        {/* Localização do prestador */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MdLocationOn className="text-[#FF0080]" />
            <span>
              {service.provider_cidade}, {service.provider_estado}
            </span>
          </div>
        </div>

        {/* Preço e localização */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[#FF0080] font-bold text-lg">
            {getPriceLabel(service)}
          </div>
          
          {/* Avaliação simulada */}
          <div className="flex items-center gap-1">
            <MdStar className="text-yellow-400 text-sm" />
            <span className="text-sm text-gray-600">4.5</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <Link
            href={selectedParty 
              ? `/servicos/${service.service_id}?partyId=${selectedParty.id}&partyName=${encodeURIComponent(selectedParty.name)}`
              : `/servicos/${service.service_id}`
            }
            className="flex-1 bg-[#FF0080] hover:bg-[#E6006F] text-white py-3 px-4 rounded-lg transition-colors duration-200 font-medium text-center block"
          >
            Ver Cardápio
          </Link>
          
          {/* Botão de adicionar diretamente */}
          {onAddToParty && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onAddToParty(service)}
              className="bg-[#FF0080] hover:bg-[#E6006F] text-white w-12 h-12 rounded-full transition-colors duration-200 shadow-lg flex items-center justify-center"
              title="Adicionar à festa"
            >
              <MdAdd className="text-xl" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
```

---

## **ATUALIZAÇÕES NECESSÁRIAS**

### **1. Atualizar Página de Serviços**

#### **Modificações em `src/app/servicos/page.tsx`**
- Importar novos componentes de geolocalização
- Adicionar lógica para buscar serviços próximos
- Integrar filtros de localização
- Mostrar distância nos cards de serviços

### **2. Atualizar Formulário de Prestador**

#### **Modificações em `src/components/forms/ProviderSetupForm.tsx`**
- Adicionar campos de localização
- Integrar geocodificação de endereço
- Permitir definição de raio de atuação

---

## **APIs UTILIZADAS**

### **1. Google Maps API (Opcional)**
- Geocodificação de endereços
- Reverse geocoding
- Requer API Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### **2. OpenStreetMap Nominatim (Gratuito)**
- Geocodificação de endereços
- Reverse geocoding
- Sem limite de requisições

### **3. ViaCEP (Gratuito)**
- Geocodificação de CEPs brasileiros
- Dados oficiais dos Correios

---

## **CONFIGURAÇÃO**

### **1. Variáveis de Ambiente**
```env
# Opcional - para Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### **2. Migração do Banco**
```bash
# Executar no SQL Editor do Supabase
# Arquivo: src/lib/supabase/schema_geolocation.sql
```

### **3. Índices para Performance**
```sql
-- Criar índices espaciais
CREATE INDEX idx_users_location ON public.users(latitude, longitude);
CREATE INDEX idx_users_cidade ON public.users(cidade);
CREATE INDEX idx_users_estado ON public.users(estado);
```

---

## **FLUXO DE FUNCIONAMENTO**

### **1. Detecção de Localização**
```javascript
// Usuário acessa a plataforma
// Sistema solicita permissão de geolocalização
// Se permitido: captura coordenadas
// Se negado: oferece input manual
```

### **2. Busca de Serviços**
```javascript
// Sistema usa coordenadas do usuário
// Busca prestadores dentro do raio configurado
// Calcula distâncias usando fórmula de Haversine
// Ordena por proximidade
```

### **3. Interface do Usuário**
```javascript
// Mostra distância em cada card de serviço
// Permite filtrar por raio (5km, 10km, 20km, 50km)
// Exibe localização do prestador
```

---

## **FALLBACKS E TRATAMENTO DE ERROS**

### **1. Geolocalização Não Suportada**
- Oferece input manual de endereço
- Usa geocodificação para obter coordenadas

### **2. Permissão Negada**
- Mostra opção de inserir endereço manualmente
- Permite busca por cidade/estado

### **3. API de Geocodificação Indisponível**
- Sistema tenta múltiplas APIs
- Fallback para busca tradicional

---

## **PERFORMANCE**

### **1. Cache de Localização**
```javascript
// Cache válido por 1 hora
const CACHE_DURATION = 60 * 60 * 1000;
```

### **2. Índices Otimizados**
```sql
-- Índices espaciais para queries rápidas
CREATE INDEX idx_users_location ON public.users(latitude, longitude);
```

### **3. Paginação**
```javascript
// Limite de resultados por busca
const MAX_RESULTS = 50;
```

---

## **PRÓXIMOS PASSOS PARA IMPLEMENTAÇÃO**

### **1. Executar Migração**
```bash
# 1. Executar a migração SQL no Supabase
# 2. Verificar se os índices foram criados
# 3. Testar as funções SQL
```

### **2. Implementar Componentes**
```bash
# 1. Criar os arquivos de tipos
# 2. Implementar o hook de geolocalização
# 3. Criar o serviço de geocodificação
# 4. Implementar as actions
# 5. Criar os componentes de interface
```

### **3. Integrar com Páginas Existentes**
```bash
# 1. Atualizar página de serviços
# 2. Modificar formulário de prestador
# 3. Testar funcionalidades
```

### **4. Configurar APIs**
```bash
# 1. Obter API Key do Google Maps (opcional)
# 2. Configurar variáveis de ambiente
# 3. Testar geocodificação
```

---

## **TESTES E VALIDAÇÃO**

### **1. Testes de Funcionalidade**
- [ ] Detecção automática de localização
- [ ] Geocodificação de endereços
- [ ] Busca de serviços próximos
- [ ] Filtros de raio e categoria
- [ ] Fallbacks para diferentes cenários

### **2. Testes de Performance**
- [ ] Tempo de resposta das APIs
- [ ] Performance das queries SQL
- [ ] Cache de localização
- [ ] Paginação de resultados

### **3. Testes de Compatibilidade**
- [ ] Diferentes navegadores
- [ ] Dispositivos móveis
- [ ] Conexões lentas
- [ ] Permissões de localização

---

## **MONITORAMENTO**

### **1. Métricas Importantes**
- Taxa de sucesso na detecção de localização
- Tempo médio de resposta das APIs
- Número de buscas por localização
- Erros de geocodificação

### **2. Logs**
- Erros de geolocalização
- Falhas de geocodificação
- Performance das queries

---

## **CONCLUSÃO**

Este plano fornece uma implementação completa e robusta do sistema de geolocalização para o Be Fest, similar ao iFood. O sistema inclui:

- ✅ Detecção automática de localização
- ✅ Geocodificação com múltiplas APIs
- ✅ Busca de serviços próximos
- ✅ Interface intuitiva com filtros
- ✅ Fallbacks para diferentes cenários
- ✅ Performance otimizada
- ✅ Compatibilidade com diferentes dispositivos

A implementação pode ser feita em fases, garantindo que cada etapa seja testada e validada antes de prosseguir para a próxima. 