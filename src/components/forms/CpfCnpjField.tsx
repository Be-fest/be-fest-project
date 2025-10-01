'use client';

import { useState, useEffect } from 'react';
import { MdInfo } from 'react-icons/md';

type DocumentType = 'cpf' | 'cnpj';

interface CpfCnpjFieldProps {
  value: string;
  onChange: (value: string, type: DocumentType) => void;
  error?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  defaultType?: DocumentType;
}

/**
 * Componente para entrada de CPF ou CNPJ com seletor de tipo,
 * máscara condicional, validação e auto-detector inteligente
 */
export function CpfCnpjField({
  value,
  onChange,
  error,
  label = 'CPF ou CNPJ',
  required = false,
  disabled = false,
  defaultType = 'cpf'
}: CpfCnpjFieldProps) {
  const [documentType, setDocumentType] = useState<DocumentType>(defaultType);

  // Aplicar máscara de CPF: 000.000.000-00
  const applyCpfMask = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  // Aplicar máscara de CNPJ: 00.000.000/0000-00
  const applyCnpjMask = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  // Validar dígito verificador de CPF
  const validateCpf = (cpf: string): boolean => {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return false;
    
    // Verificar sequências inválidas
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(digits.charAt(9))) return false;

    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(digits.charAt(10))) return false;

    return true;
  };

  // Validar dígito verificador de CNPJ
  const validateCnpj = (cnpj: string): boolean => {
    const digits = cnpj.replace(/\D/g, '');
    if (digits.length !== 14) return false;

    // Verificar sequências inválidas
    if (/^(\d)\1{13}$/.test(digits)) return false;

    // Validar primeiro dígito verificador
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(digits.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(digits.charAt(12))) return false;

    // Validar segundo dígito verificador
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(digits.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (digit !== parseInt(digits.charAt(13))) return false;

    return true;
  };

  // Detectar tipo baseado no número de dígitos
  const detectDocumentType = (digits: string): DocumentType | null => {
    if (digits.length === 11) return 'cpf';
    if (digits.length === 14) return 'cnpj';
    return null;
  };

  // Handler de mudança no input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '');

    // Aplicar máscara apropriada
    const maskedValue = documentType === 'cpf' 
      ? applyCpfMask(rawValue)
      : applyCnpjMask(rawValue);

    onChange(maskedValue, documentType);
  };

  // Handler de mudança de tipo
  const handleTypeChange = (newType: DocumentType) => {
    setDocumentType(newType);
    // Limpar o valor ao trocar de tipo
    onChange('', newType);
  };

  // Gerar mensagem de erro específica
  const getErrorMessage = (): string | undefined => {
    if (!error) return undefined;
    
    const digits = value.replace(/\D/g, '');
    if (documentType === 'cpf') {
      if (digits.length > 0 && digits.length < 11) {
        return 'Informe 11 dígitos (CPF).';
      }
      if (digits.length === 11 && !validateCpf(value)) {
        return 'CPF inválido. Verifique os dígitos.';
      }
    } else {
      if (digits.length > 0 && digits.length < 14) {
        return 'Informe 14 dígitos (CNPJ).';
      }
      if (digits.length === 14 && !validateCnpj(value)) {
        return 'CNPJ inválido. Verifique os dígitos.';
      }
    }
    
    return error;
  };

  const placeholder = documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00';
  const example = documentType === 'cpf' ? 'Ex.: 123.456.789-09' : 'Ex.: 12.345.678/0001-90';
  const errorMessage = getErrorMessage();

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Seletor de Tipo (Segmented Control) */}
      <div 
        role="tablist" 
        aria-label="Tipo de documento"
        className="inline-flex rounded-lg bg-gray-100 p-1 w-full sm:w-auto"
      >
        <button
          type="button"
          role="tab"
          aria-selected={documentType === 'cpf'}
          aria-label="CPF - Cadastro de Pessoa Física"
          onClick={() => handleTypeChange('cpf')}
          disabled={disabled}
          className={`
            flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
            ${documentType === 'cpf'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          CPF
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={documentType === 'cnpj'}
          aria-label="CNPJ - Cadastro Nacional de Pessoa Jurídica"
          onClick={() => handleTypeChange('cnpj')}
          disabled={disabled}
          className={`
            flex-1 sm:flex-initial px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2
            ${documentType === 'cnpj'
              ? 'bg-white text-pink-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          CNPJ
        </button>
      </div>

      {/* Input com máscara */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          inputMode="numeric"
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? 'document-error' : undefined}
          className={`
            w-full px-4 py-3 border rounded-lg transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent
            ${errorMessage 
              ? 'border-red-300 bg-red-50' 
              : 'border-gray-300 bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
          `}
        />
        
        {/* Ícone de info */}
        {!errorMessage && value && (
          <MdInfo className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        )}
      </div>

      {/* Mensagem de erro (sem exemplo) */}
      {errorMessage && (
        <p id="document-error" className="text-sm text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
          {errorMessage}
        </p>
      )}

      {/* Modal de Auto-detector - REMOVIDO */}
    </div>
  );
}

/**
 * Utilidades para uso externo
 */

// Extrair apenas dígitos
export const getDigitsOnly = (value: string): string => {
  return value.replace(/\D/g, '');
};

// Validar CPF
export const isValidCpf = (cpf: string): boolean => {
  const digits = cpf.replace(/\D/g, '');
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(digits.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(digits.charAt(10))) return false;

  return true;
};

// Validar CNPJ
export const isValidCnpj = (cnpj: string): boolean => {
  const digits = cnpj.replace(/\D/g, '');
  if (digits.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(digits)) return false;

  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(digits.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(digits.charAt(12))) return false;

  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(digits.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (digit !== parseInt(digits.charAt(13))) return false;

  return true;
};
