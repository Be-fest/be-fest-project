'use client';

import { StatusFilterOption } from '@/types/admin';

interface StatusFilterProps {
  value: string;
  onChange: (value: string) => void;
  options: StatusFilterOption[];
}

export function StatusFilter({ value, onChange, options }: StatusFilterProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors bg-white text-sm sm:text-base"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
} 