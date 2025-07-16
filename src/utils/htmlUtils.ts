/**
 * Remove tags HTML potencialmente perigosas e mantém apenas formatação básica
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Lista de tags permitidas
  const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li'];
  
  // Regex para encontrar tags HTML
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi;
  
  // Remove todas as tags exceto as permitidas
  const cleanHTML = html.replace(tagRegex, (match, tagName) => {
    return allowedTags.includes(tagName.toLowerCase()) ? match : '';
  });
  
  // Remove atributos perigosos
  const attributeRegex = /\s*(on\w+|javascript:|data-)\s*=\s*["'][^"']*["']/gi;
  return cleanHTML.replace(attributeRegex, '');
}

/**
 * Converte HTML para texto simples
 */
export function htmlToText(html: string): string {
  if (!html) return '';
  
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/\n\s*\n/g, '\n')
    .trim();
} 