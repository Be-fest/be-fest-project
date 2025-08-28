import React, { forwardRef } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ptBR } from 'date-fns/locale';
import { MdCalendarToday } from 'react-icons/md';

// Registrar a localização portuguesa brasileira
registerLocale('pt-BR', ptBR);

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
    return (
      <div className={className}>
        {label && (
          <label className="block text-sm font-semibold text-[#520029] mb-2">
            <MdCalendarToday className="inline mr-1" />
            {label} {required && '*'}
          </label>
        )}
        <div className="relative">
          <DatePicker
            selected={value}
            onChange={onChange}
            dateFormat="dd/MM/yyyy"
            locale="pt-BR"
            minDate={minDate}
            disabled={disabled}
            placeholderText={placeholder || "dd/mm/aaaa"}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#A502CA] focus:border-transparent outline-none ${
              error ? 'border-red-500' : 'border-gray-200'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            wrapperClassName="w-full"
            showPopperArrow={false}
            popperClassName="z-50"
            calendarClassName="shadow-lg border border-gray-200 rounded-lg"
            dayClassName={(date) => {
              const today = new Date();
              const isToday = date.toDateString() === today.toDateString();
              const isSelected = value && date.toDateString() === value.toDateString();
              
              if (isSelected) {
                return 'bg-[#A502CA] text-white hover:bg-[#8A0222] rounded';
              }
              if (isToday) {
                return 'bg-blue-100 text-blue-800 rounded';
              }
              return 'hover:bg-gray-100 rounded';
            }}
            ref={ref}
          />
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