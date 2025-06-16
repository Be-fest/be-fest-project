import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
  customColor?: string;
}

export function Button({
  children,
  variant = 'primary',
  isLoading = false,
  customColor,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'w-full py-4 px-6 cursor-pointer rounded-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variants = {
    primary: 'text-white hover:opacity-90 focus:ring-2 focus:ring-offset-2',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500'
  };  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      style={variant === 'primary' ? { backgroundColor: customColor || '#FF0080' } : undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Carregando...
        </div>
      ) : (
        children
      )}
    </button>
  );
}
