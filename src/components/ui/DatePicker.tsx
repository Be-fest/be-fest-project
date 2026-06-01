import React, { forwardRef, useRef, useState, useEffect, useImperativeHandle } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MdCalendarToday } from 'react-icons/md';

interface DatePickerProps {
  label?: string;
  error?: string;
  value?: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
}

const CustomDatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ label, error, value, onChange, minDate, disabled, className, placeholder, required }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        setIsOpen(true);
      },
      blur: () => {
        inputRef.current?.blur();
        setIsOpen(false);
      }
    } as any));

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      } else {
        document.removeEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const displayValue = value ? value.toLocaleDateString('pt-BR') : '';

    return (
      <div className={className} ref={containerRef}>
        {label && (
          <label className="block text-sm font-semibold text-[#520029] mb-2">
            <MdCalendarToday className="inline mr-1" />
            {label} {required && '*'}
          </label>
        )}
        <div className="relative">
          <input
            type="text"
            readOnly
            ref={inputRef}
            value={displayValue}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            placeholder={placeholder || "dd/mm/aaaa"}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none bg-white cursor-pointer ${
              error ? 'border-red-500' : 'border-gray-200'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          
          {isOpen && (
            <div className="absolute z-50 mt-1 bg-white shadow-lg border border-gray-200 rounded-lg p-2">
              <Calendar
                onChange={(date) => {
                  onChange(date as Date);
                  setIsOpen(false);
                }}
                value={value}
                minDate={minDate}
                locale="pt-BR"
                className="border-0 font-sans"
              />
            </div>
          )}
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

CustomDatePicker.displayName = 'CustomDatePicker';

export default CustomDatePicker;