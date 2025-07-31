'use client';

import { useState, useEffect } from 'react';
import { MdLocationOn } from 'react-icons/md';

interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

interface AddressFieldsProps {
  value: AddressData;
  onChange: (address: AddressData) => void;
  onFullAddressChange?: (fullAddress: string) => void;
  disabled?: boolean;
  className?: string;
}

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

export function AddressFields({ 
  value, 
  onChange, 
  onFullAddressChange, 
  disabled = false, 
  className = '' 
}: AddressFieldsProps) {
  const [fullAddress, setFullAddress] = useState('');

  const generateFullAddress = (addressData: AddressData): string => {
    const parts = [];
    
    if (addressData.street) {
      parts.push(addressData.street);
    }
    
    if (addressData.number) {
      parts.push(addressData.number);
    }
    
    if (addressData.neighborhood) {
      parts.push(addressData.neighborhood);
    }
    
    if (addressData.city) {
      parts.push(addressData.city);
    }
    
    if (addressData.state) {
      parts.push(addressData.state);
    }
    
    return parts.join(', ');
  };

  useEffect(() => {
    const newFullAddress = generateFullAddress(value);
    setFullAddress(newFullAddress);
    if (onFullAddressChange) {
      onFullAddressChange(newFullAddress);
    }
  }, [value, onFullAddressChange]);

  const handleFieldChange = (field: keyof AddressData, fieldValue: string) => {
    const newValue = { ...value, [field]: fieldValue };
    onChange(newValue);
  };

  const formatZipCode = (zipcode: string) => {
    const numbers = zipcode.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleZipCodeChange = (zipcode: string) => {
    const formatted = formatZipCode(zipcode);
    handleFieldChange('zipcode', formatted);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
        <MdLocationOn className="text-purple-600" />
        Endereço
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua/Avenida
          </label>
          <input
            type="text"
            value={value.street}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            placeholder="Ex: Rua das Flores"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número
          </label>
          <input
            type="text"
            value={value.number}
            onChange={(e) => handleFieldChange('number', e.target.value)}
            placeholder="123"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bairro
          </label>
          <input
            type="text"
            value={value.neighborhood}
            onChange={(e) => handleFieldChange('neighborhood', e.target.value)}
            placeholder="Ex: Jardins"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CEP
          </label>
          <input
            type="text"
            value={value.zipcode}
            onChange={(e) => handleZipCodeChange(e.target.value)}
            placeholder="00000-000"
            maxLength={9}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cidade
          </label>
          <input
            type="text"
            value={value.city}
            onChange={(e) => handleFieldChange('city', e.target.value)}
            placeholder="Ex: São Paulo"
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            value={value.state}
            onChange={(e) => handleFieldChange('state', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Selecione</option>
            {BRAZILIAN_STATES.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {fullAddress && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md border">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Preview do endereço:
          </div>
          <div className="text-sm text-gray-600">
            {fullAddress}
          </div>
        </div>
      )}
    </div>
  );
}