'use client';

import { MdMyLocation } from 'react-icons/md';

interface ServiceRadiusPickerProps {
  value: number;
  onChange: (radius: number) => void;
  disabled?: boolean;
  className?: string;
}

export function ServiceRadiusPicker({ 
  value, 
  onChange, 
  disabled = false, 
  className = '' 
}: ServiceRadiusPickerProps) {
  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    onChange(newValue);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MdMyLocation className="text-purple-600" />
        Raio de Atuação
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Distância máxima de atendimento (km)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="500"
            value={value}
            onChange={handleRadiusChange}
            disabled={disabled}
            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-gray-600">km</span>
        </div>
        <p className="text-xs text-gray-500">
          Defina a distância máxima que você está disposto a atender a partir do seu endereço
        </p>
      </div>

      {value > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Área de cobertura:</strong> {value} km de raio
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Você poderá atender eventos em um raio de {value} km do seu endereço
          </div>
        </div>
      )}
    </div>
  );
}