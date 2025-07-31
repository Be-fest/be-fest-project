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
const CACHE_DURATION = 60 * 60 * 1000;

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<GeolocationError | null>(null);

  const isGeolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  const saveLocationToCache = useCallback((location: Location) => {
    const cache: GeolocationCache = {
      ...location,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }, []);

  const getLocationFromCache = useCallback((): GeolocationCache | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }, []);

  const isLocationValid = useCallback((cache: GeolocationCache): boolean => {
    return Date.now() - cache.timestamp < CACHE_DURATION;
  }, []);

  const getCurrentLocation = useCallback(async (): Promise<Location | null> => {
    if (!isGeolocationSupported) {
      setError({ code: 1, message: 'Geolocalização não suportada' });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
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
        message: err.message || 'Erro ao obter localização'
      };
      setError(geolocationError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isGeolocationSupported, saveLocationToCache]);

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
    requestPermission: async () => true,
  };
}