/**
 * Remove tags HTML potencialmente perigosas e mantém apenas formatação básica
 */
export function sanitizeHTML(html: string): string {
  if (!html) return '';
  
  // Lista de tags permitidas para rich text
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'sub', 'sup',
    'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'a', 'span', 'div'
  ];
  
  // Lista de atributos permitidos por tag
  const allowedAttributes: { [tag: string]: string[] } = {
    'a': ['href', 'title', 'target'],
    'span': ['class'],
    'div': ['class']
  };
  
  // Regex para encontrar tags HTML
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^<>]*>/gi;
  
  // Remove todas as tags exceto as permitidas
  let cleanHTML = html.replace(tagRegex, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (!allowedTags.includes(tag)) {
      return '';
    }
    
    // Se a tag tem atributos permitidos, filtra apenas os seguros
    if (allowedAttributes[tag]) {
      const attributeRegex = /(\w+)=["']([^"']*)["']/g;
      const filteredMatch = match.replace(attributeRegex, (attrMatch, attrName, attrValue) => {
        if (allowedAttributes[tag].includes(attrName.toLowerCase())) {
          // Validações especiais para atributos específicos
          if (attrName.toLowerCase() === 'href') {
            // Permite apenas URLs http/https ou mailto
            if (/^(https?:\/\/|mailto:)/i.test(attrValue)) {
              return attrMatch;
            }
            return '';
          }
          if (attrName.toLowerCase() === 'target') {
            // Permite apenas _blank
            return attrValue === '_blank' ? attrMatch : '';
          }
          return attrMatch;
        }
        return '';
      });
      return filteredMatch;
    }
    
    return match;
  });
  
  // Remove atributos perigosos que possam ter passado
  const dangerousAttributeRegex = /\s*(on\w+|javascript:|data-|script|style)\s*=\s*["'][^"']*["']/gi;
  cleanHTML = cleanHTML.replace(dangerousAttributeRegex, '');
  
  // Converte quebras de linha simples em parágrafos se não houver tags de parágrafo
  if (!cleanHTML.includes('<p>') && !cleanHTML.includes('<br>') && cleanHTML.includes('\n')) {
    cleanHTML = cleanHTML
      .split('\n')
      .filter(line => line.trim())
      .map(line => `<p>${line.trim()}</p>`)
      .join('');
  }
  
  return cleanHTML;
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