'use client';

import { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { geocodingService } from '@/lib/services/geocoding';
import { useAuth } from '@/hooks/useAuth';
import { GeolocationFilters } from '@/types/geolocation';
import { Button, Input, Select } from '@/components/ui';
import { MdLocationOn, MdMyLocation } from 'react-icons/md';

export function LocationFilter({ onFiltersChange }: { onFiltersChange: (filters: GeolocationFilters) => void }) {
  const { user } = useAuth();
  const { location, loading, error, getCurrentLocation } = useGeolocation();
  const [eventLocation, setEventLocation] = useState<{ lat: number; lon: number } | null>(null);
  
  const [raio, setRaio] = useState(50);
  const [endereco, setEndereco] = useState('');

  useEffect(() => {
    if (location) {
      onFiltersChange({
        event_latitude: eventLocation?.lat || location.latitude,
        event_longitude: eventLocation?.lon || location.longitude,
        raio_maximo: raio
      });
    }
  }, [location, eventLocation, raio, onFiltersChange]);

  const handleGeocode = async () => {
    const result = await geocodingService.geocodeAddress(endereco);
    if (result && user) {
      getCurrentLocation();
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div className="flex gap-2">
        <Button 
          onClick={getCurrentLocation}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <MdMyLocation />
          {loading ? 'Detectando...' : 'Usar minha localização'}
        </Button>
        
        <div className="flex-1 flex gap-2">
          <Input
            value={endereco}
            placeholder="Endereço do evento"
            onChange={async (e) => {
              const location = await geocodingService.geocodeAddress(e.target.value);
              if (location) {
                setEventLocation({ lat: location.latitude, lon: location.longitude });
                onFiltersChange({
                  event_latitude: location.latitude,
                  event_longitude: location.longitude,
                  raio_maximo: raio
                });
              }
              setEndereco(e.target.value);
            }}
          />
          <Button onClick={handleGeocode}>Buscar</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span>Raio de busca:</span>
        <Select
          value={raio.toString()}
          onChange={(e) => {
            setRaio(Number(e.target.value));
            if (eventLocation) {
              onFiltersChange({
                event_latitude: eventLocation.lat,
                event_longitude: eventLocation.lon,
                raio_maximo: Number(e.target.value)
              });
            }
          }}
          options={[
            { value: '10', label: '10 km' },
            { value: '25', label: '25 km' },
            { value: '50', label: '50 km' },
            { value: '100', label: '100 km' }
          ]}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm flex items-center gap-1">
          <MdLocationOn />
          {error.message}
        </div>
      )}
    </div>
  );
}