'use client';

import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

type LocationPickerProps = {
  onLocationChange: (lat: number, lng: number) => void;
  onRadiusChange: (radius: number) => void;
  initialLat?: number;
  initialLng?: number;
  initialRadius?: number;
};

export function LocationPicker({
  onLocationChange,
  onRadiusChange,
  initialLat,
  initialLng,
  initialRadius = 50,
}: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map>();
  const [marker, setMarker] = useState<google.maps.Marker>();
  const [circle, setCircle] = useState<google.maps.Circle>();
  const [radius, setRadius] = useState(initialRadius);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
      version: 'weekly',
    });

    loader.load().then(() => {
      const mapInstance = new google.maps.Map(document.getElementById('map')!, {
        center: { lat: initialLat || -23.5505, lng: initialLng || -46.6333 },
        zoom: 12,
      });

      const markerInstance = new google.maps.Marker({
        map: mapInstance,
        draggable: true,
        position: { lat: initialLat || -23.5505, lng: initialLng || -46.6333 },
      });

      const circleInstance = new google.maps.Circle({
        map: mapInstance,
        center: { lat: initialLat || -23.5505, lng: initialLng || -46.6333 },
        radius: initialRadius * 1000,
        strokeColor: '#A502CA',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#A502CA',
        fillOpacity: 0.2,
      });

      markerInstance.addListener('dragend', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const position = e.latLng.toJSON();
          onLocationChange(position.lat, position.lng);
          circleInstance.setCenter(position);
        }
      });

      mapInstance.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          const position = e.latLng.toJSON();
          markerInstance.setPosition(position);
          onLocationChange(position.lat, position.lng);
          circleInstance.setCenter(position);
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setCircle(circleInstance);
      setIsLoaded(true);
    });
  }, [initialLat, initialLng, initialRadius, onLocationChange]);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    onRadiusChange(newRadius);
    circle?.setRadius(newRadius * 1000);
  };

  return (
    <div className="space-y-4">
      {/* Controle de raio */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 min-w-fit">
          Raio de atuação:
        </label>
        <input
          type="range"
          min="5"
          max="100"
          value={radius}
          onChange={(e) => handleRadiusChange(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <span className="text-sm font-medium text-gray-900 min-w-fit">
          {radius} km
        </span>
      </div>

      {/* Mapa */}
      <div className="relative">
        <div 
          id="map" 
          className="w-full h-64 md:h-80 rounded-lg border border-gray-300 bg-gray-100"
        />
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A502CA] mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Carregando mapa...</p>
            </div>
          </div>
        )}
      </div>

      {/* Instruções */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <p className="font-medium mb-1">Como usar:</p>
        <ul className="space-y-1">
          <li>• Clique no mapa para definir sua localização</li>
          <li>• Arraste o marcador para ajustar a posição</li>
          <li>• Use o controle deslizante para ajustar o raio de atuação</li>
        </ul>
      </div>
    </div>
  );
}