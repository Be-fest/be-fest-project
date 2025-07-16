import { useState, useEffect, useRef, useCallback } from 'react';

interface ImageCache {
  [url: string]: {
    loaded: boolean;
    error: boolean;
    element?: HTMLImageElement;
  };
}

// Cache global para compartilhar entre todas as instâncias do hook
const globalImageCache: ImageCache = {};

// Função para limpar cache específico ou todo o cache
export function clearImageCache(url?: string) {
  if (url) {
    delete globalImageCache[url];
  } else {
    Object.keys(globalImageCache).forEach(key => {
      delete globalImageCache[key];
    });
  }
}

// Função para invalidar cache de imagens de serviços
export function invalidateServiceImagesCache() {
  Object.keys(globalImageCache).forEach(key => {
    if (key.includes('supabase') || key.includes('be-fest-images')) {
      delete globalImageCache[key];
    }
  });
}

export function useImagePreloader(imageSrc: string, fallbackSrc?: string) {
  const [imageState, setImageState] = useState(() => {
    // Verificar se a imagem já está no cache
    if (globalImageCache[imageSrc]) {
      const cached = globalImageCache[imageSrc];
      return {
        src: cached.error && fallbackSrc ? fallbackSrc : imageSrc,
        loaded: cached.loaded,
        error: cached.error,
      };
    }
    return {
      src: imageSrc,
      loaded: false,
      error: false,
    };
  });

  const loadImage = useCallback((src: string) => {
    // Se já está no cache, usar resultado do cache
    if (globalImageCache[src]) {
      setImageState({
        src: globalImageCache[src].error && fallbackSrc ? fallbackSrc : src,
        loaded: globalImageCache[src].loaded,
        error: globalImageCache[src].error,
      });
      return;
    }

    // Se não está no cache, carregar a imagem
    const img = new Image();
    
    img.onload = () => {
      globalImageCache[src] = {
        loaded: true,
        error: false,
        element: img,
      };
      
      setImageState({
        src,
        loaded: true,
        error: false,
      });
    };

    img.onerror = () => {
      globalImageCache[src] = {
        loaded: false,
        error: true,
        element: img,
      };

      // Se há fallback, tentar carregar o fallback
      if (fallbackSrc && src !== fallbackSrc) {
        loadImage(fallbackSrc);
      } else {
        setImageState({
          src: fallbackSrc || src,
          loaded: false,
          error: true,
        });
      }
    };

    img.src = src;
  }, [fallbackSrc]);

  useEffect(() => {
    if (imageSrc) {
      loadImage(imageSrc);
    }
  }, [imageSrc, loadImage]);

  return imageState;
}

// Hook simplificado para usar com placeholder padrão
export function useServiceImage(imageSrc?: string) {
  const fallbackSrc = '/images/placeholder-service.png';
  return useImagePreloader(imageSrc || fallbackSrc, fallbackSrc);
} 