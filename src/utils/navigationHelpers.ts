import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Helper para navegar para a criação de festa
 * Centraliza a lógica para ser usada tanto no topbar quanto na seção CTA
 */
export const goToCreateParty = (router: AppRouterInstance, isLoggedIn: boolean) => {
  if (isLoggedIn) {
    // Cliente logado - vai direto para a tela de criação de festa
    router.push('/perfil?tab=minhas-festas&create=1');
  } else {
    // Não logado - vai para login com redirect
    const returnUrl = encodeURIComponent('/perfil?tab=minhas-festas&create=1');
    router.push(`/auth/login?returnUrl=${returnUrl}`);
  }
};

/**
 * Helper para telemetria (opcional)
 */
export const trackCreatePartyClick = (source: 'topbar' | 'home_cta' | 'mobile') => {
  // Implementar analytics se necessário  
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', `cta_create_party_${source}`, {
      event_category: 'engagement',
      event_label: source
    });
  }
};