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
      if (this.apiKey) {
        const googleResult = await this.geocodeWithGoogle(address);
        if (googleResult) return googleResult;
      }
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }

  private async geocodeWithGoogle(address: string): Promise<GeocodingResult | null> {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&region=br`
    );
    const data = await response.json();
    return data.results?.[0]?.geometry?.location ? {
      latitude: data.results[0].geometry.location.lat,
      longitude: data.results[0].geometry.location.lng,
      formatted_address: data.results[0].formatted_address
    } : null;
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`
    );
    const data = await response.json();
    return data?.[0] ? {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      formatted_address: data[0].display_name
    } : null;
  }
}

export const geocodingService = GeocodingService.getInstance();