import { useState, useEffect, useRef } from 'react';

interface ImageCache {
  [url: string]: {
    loaded: boolean;
    error: boolean;
    element?: HTMLImageElement;
  };
}

// Cache global para compartilhar entre todas as instâncias do hook
const globalImageCache: ImageCache = {};

export function useImagePreloader(imageSrc: string, fallbackSrc?: string) {
  const [imageState, setImageState] = useState(() => {
    // Verificar cache primeiro
    if (globalImageCache[imageSrc]) {
      return {
        src: globalImageCache[imageSrc].error && fallbackSrc ? fallbackSrc : imageSrc,
        loaded: globalImageCache[imageSrc].loaded,
        error: globalImageCache[imageSrc].error,
      };
    }
    
    return {
      src: imageSrc,
      loaded: false,
      error: false,
    };
  });

  const loadImageRef = useRef<(src: string) => void>();

  useEffect(() => {
    loadImageRef.current = (src: string) => {
      // Se já está no cache, usar resultado do cache
      if (globalImageCache[src]) {
        setImageState({
          src: globalImageCache[src].error && fallbackSrc ? fallbackSrc : src,
          loaded: globalImageCache[src].loaded,
          error: globalImageCache[src].error,
        });
        return;
      }

      // Inicializar entrada no cache
      globalImageCache[src] = {
        loaded: false,
        error: false,
      };

      const img = new Image();
      globalImageCache[src].element = img;

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
          loadImageRef.current?.(fallbackSrc);
        } else {
          setImageState({
            src: fallbackSrc || src,
            loaded: false,
            error: true,
          });
        }
      };

      img.src = src;
    };
  }, [fallbackSrc]);

  useEffect(() => {
    if (imageSrc) {
      loadImageRef.current?.(imageSrc);
    }
  }, [imageSrc]);

  return imageState;
}

// Hook simplificado para usar com placeholder padrão
export function useServiceImage(imageSrc?: string) {
  const fallbackSrc = '/images/placeholder-service.png';
  return useImagePreloader(imageSrc || fallbackSrc, fallbackSrc);
} 