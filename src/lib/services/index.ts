export * from './auth.service';
export * from './event.service';
export * from './service.service';
export * from './pricing.service';

import { createClient } from '../supabase/client';
import { AuthService } from './auth.service';
import { EventService } from './event.service';
import { ServiceService } from './service.service';
import { PricingService } from './pricing.service';

// Factory para criar instâncias dos serviços
export const createServices = () => {
  const supabase = createClient();
  return {
    auth: new AuthService(supabase),
    events: new EventService(supabase),
    services: new ServiceService(supabase),
    pricing: new PricingService(supabase),
  };
}; 