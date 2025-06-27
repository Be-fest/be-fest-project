import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { BaseService } from './base.service'
import { Service } from '@/types/database'

interface PricingResult {
  basePrice: number
  guestPrice: number
  subtotal: number
  platformFee: number
  total: number
}

export class PricingService extends BaseService {
  private readonly PLATFORM_FEE_PERCENTAGE = 0.10 // 10% platform fee

  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'services')
  }

  async calculateServicePrice(serviceId: string, guestCount: number): Promise<PricingResult> {
    const service = await this.getById<Service>(serviceId)
    if (!service) {
      throw new Error('Service not found')
    }

    if (guestCount < service.min_guests) {
      throw new Error(`Minimum guest count is ${service.min_guests}`)
    }

    if (service.max_guests && guestCount > service.max_guests) {
      throw new Error(`Maximum guest count is ${service.max_guests}`)
    }

    // Base price is always charged
    const basePrice = service.base_price

    // Calculate per guest price (if applicable)
    const guestPrice = 0 // In this implementation, we're not using per-guest pricing
    const subtotal = basePrice + guestPrice

    // Calculate platform fee
    const platformFee = subtotal * this.PLATFORM_FEE_PERCENTAGE

    // Calculate total
    const total = subtotal + platformFee

    return {
      basePrice,
      guestPrice,
      subtotal,
      platformFee,
      total
    }
  }

  async calculateEventTotal(services: Array<{ serviceId: string; guestCount: number }>): Promise<{
    services: Array<{ serviceId: string; price: PricingResult }>
    total: number
  }> {
    const calculations = await Promise.all(
      services.map(async ({ serviceId, guestCount }) => ({
        serviceId,
        price: await this.calculateServicePrice(serviceId, guestCount)
      }))
    )

    const total = calculations.reduce((sum, calc) => sum + calc.price.total, 0)

    return {
      services: calculations,
      total
    }
  }

  async validatePricing(serviceId: string, guestCount: number, expectedTotal: number): Promise<boolean> {
    const pricing = await this.calculateServicePrice(serviceId, guestCount)
    // Use a small epsilon for floating point comparison
    const epsilon = 0.01
    return Math.abs(pricing.total - expectedTotal) < epsilon
  }
} 