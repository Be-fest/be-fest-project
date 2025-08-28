import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  focusColor?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, focusColor = '#FF0080', className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 transition-all ${
            error ? 'ring-2 ring-red-500' : ''
          } ${className}`}
          style={{
            '--tw-ring-color': error ? '#ef4444' : focusColor,
            ...(props.type === 'date' && {
              colorScheme: 'light',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield'
            })
          } as React.CSSProperties}
          {...(props.type === 'date' && { lang: 'pt-BR' })}
          {...props}
        />
        {error && (
          <span className="text-sm text-red-500">{error}</span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
