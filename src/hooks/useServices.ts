import { useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { AuthService, EventService, ServiceService, PricingService } from '@/lib/services';

export const useServices = () => {
  const services = useMemo(() => {
    const auth = new AuthService(supabase);
    const event = new EventService(supabase);
    const service = new ServiceService(supabase);
    const pricing = new PricingService(supabase);

    return {
      auth,
      event,
      service,
      pricing
    };
  }, []);

  return services;
}; 