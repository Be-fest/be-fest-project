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

  private constructor() {}

  public static getInstance(): GeocodingService {
    if (!GeocodingService.instance) {
      GeocodingService.instance = new GeocodingService();
    }
    return GeocodingService.instance;
  }

  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      return await this.geocodeWithNominatim(address);
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      return null;
    }
  }

  private async geocodeWithNominatim(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`,
        {
          headers: {
            'User-Agent': 'BeFest-App/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || data.length === 0) {
        console.warn('Nenhum resultado encontrado para o endereço:', address);
        return null;
      }
      
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
        formatted_address: data[0].display_name
      };
    } catch (error) {
      console.error('Erro na geocodificação com Nominatim:', error);
      return null;
    }
  }
}

export const geocodingService = GeocodingService.getInstance();