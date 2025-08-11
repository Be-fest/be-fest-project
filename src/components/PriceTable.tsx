'use client';

import { formatPrice, calculatePriceWithFee } from '@/utils/pricingUtils';
import { MdPeople, MdAttachMoney } from 'react-icons/md';
import { ServiceGuestTier } from '@/types/database';

interface PriceTableProps {
  guestTiers: ServiceGuestTier[];
  className?: string;
}

export default function PriceTable({ guestTiers, className = '' }: PriceTableProps) {
  console.log('🔍 [PriceTable] Guest tiers recebidos:', guestTiers);
  
  if (!guestTiers || guestTiers.length === 0) {
    console.log('⚠️ [PriceTable] Nenhum guest tier encontrado');
    return (
      <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
        <div className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] px-3 md:px-6 py-3 md:py-4">
          <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
            <MdAttachMoney className="text-lg md:text-xl" />
            Tabela de Preços
          </h3>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            Preços por convidado baseados na quantidade
          </p>
        </div>
        <div className="p-3 md:p-6 text-center text-gray-500 text-sm md:text-base">
          Nenhuma faixa de preço configurada para este serviço.
        </div>
      </div>
    );
  }

  // Ordenar tiers por número mínimo de convidados
  const sortedTiers = [...guestTiers].sort((a, b) => a.min_total_guests - b.min_total_guests);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] px-3 md:px-6 py-3 md:py-4">
        <h3 className="text-base md:text-lg font-semibold text-white flex items-center gap-2">
          <MdAttachMoney className="text-lg md:text-xl" />
          Tabela de Preços
        </h3>
        <p className="text-white/80 text-xs md:text-sm mt-1">
          Preços por convidado baseados na quantidade (inclui taxa de 10%)
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="hidden sm:inline">Número de Convidados</span>
                <span className="sm:hidden">Convidados</span>
              </th>
              <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <span className="hidden sm:inline">Preço por Convidado</span>
                <span className="sm:hidden">Preço</span>
              </th>
              <th className="px-2 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Preço Total (Mínimo)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTiers.map((tier, index) => {
              const guestRange = tier.max_total_guests 
                ? `${tier.min_total_guests} - ${tier.max_total_guests}`
                : `${tier.min_total_guests}+`;
              
              // Aplicar taxa de 10% nos preços
              const priceWithFee = calculatePriceWithFee(tier.base_price_per_adult);
              const minTotalPriceWithFee = tier.min_total_guests * priceWithFee;
              
              return (
                <tr key={tier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 md:gap-2">
                      <MdPeople className="text-gray-400 text-sm md:text-base flex-shrink-0" />
                      <span className="text-xs md:text-sm font-medium text-gray-900">
                        <span className="hidden sm:inline">{guestRange} pessoas</span>
                        <span className="sm:hidden">{guestRange}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap">
                    <span className="text-sm md:text-lg font-semibold text-[#FF0080]">
                      {formatPrice(priceWithFee)}
                    </span>
                  </td>
                  <td className="px-2 md:px-6 py-2 md:py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="text-xs md:text-sm text-gray-600">
                      A partir de {formatPrice(minTotalPriceWithFee)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Nota explicativa sobre a taxa */}
      <div className="px-3 md:px-6 py-3 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          * Os preços exibidos já incluem a taxa de serviço de 10%
        </p>
      </div>

    </div>
  );
}