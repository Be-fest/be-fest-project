import { sanitizeHTML } from '@/utils/htmlUtils';

interface SafeHTMLProps {
  html: string;
  className?: string;
  fallback?: string;
}

/**
 * Componente para renderizar HTML de forma segura
 */
export function SafeHTML({ html, className = '', fallback = 'Sem descrição' }: SafeHTMLProps) {
  const cleanHTML = sanitizeHTML(html);
  
  if (!cleanHTML.trim()) {
    return <span className={`text-gray-500 italic ${className}`}>{fallback}</span>;
  }
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHTML }}
    />
  );
} 