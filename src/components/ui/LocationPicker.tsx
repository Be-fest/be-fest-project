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
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
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
    });
  }, [initialLat, initialLng, initialRadius, onLocationChange]);

  return (
    <div className="h-96 w-full">
      <div id="map" className="h-full w-full rounded-lg border" />
      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">
          Raio de Atuação (km)
        </label>
        <input
          type="range"
          min="5"
          max="100"
          defaultValue={initialRadius}
          onChange={(e) => {
            const radius = Number(e.target.value);
            onRadiusChange(radius);
            circle?.setRadius(radius * 1000);
          }}
          className="w-full"
        />
        <div className="text-sm text-gray-600 mt-1">
          {initialRadius} km
        </div>
      </div>
    </div>
  );
}