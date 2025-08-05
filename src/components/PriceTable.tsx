'use client';

import { formatPrice } from '@/utils/pricingUtils';
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
        <div className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] px-6 py-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MdAttachMoney className="text-xl" />
            Tabela de Preços
          </h3>
          <p className="text-white/80 text-sm mt-1">
            Preços por convidado baseados na quantidade
          </p>
        </div>
        <div className="p-6 text-center text-gray-500">
          Nenhuma faixa de preço configurada para este serviço.
        </div>
      </div>
    );
  }

  // Ordenar tiers por número mínimo de convidados
  const sortedTiers = [...guestTiers].sort((a, b) => a.min_total_guests - b.min_total_guests);

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-[#FF0080] to-[#E6006F] px-6 py-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MdAttachMoney className="text-xl" />
          Tabela de Preços
        </h3>
        <p className="text-white/80 text-sm mt-1">
          Preços por convidado baseados na quantidade
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Convidados
              </th>
              <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço por Convidado
              </th>
              <th className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                Preço Total (Mínimo)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTiers.map((tier, index) => {
              const guestRange = tier.max_total_guests 
                ? `${tier.min_total_guests} - ${tier.max_total_guests}`
                : `${tier.min_total_guests}+`;
              
              const minTotalPrice = tier.min_total_guests * tier.base_price_per_adult;
              
              return (
                <tr key={tier.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <MdPeople className="text-gray-400 text-sm md:text-base" />
                      <span className="text-xs md:text-sm font-medium text-gray-900">
                        {guestRange} pessoas
                      </span>
                    </div>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <span className="text-base md:text-lg font-semibold text-[#FF0080]">
                      {formatPrice(tier.base_price_per_adult)}
                    </span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap hidden sm:table-cell">
                    <span className="text-xs md:text-sm text-gray-600">
                      A partir de {formatPrice(minTotalPrice)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="bg-blue-50 px-4 md:px-6 py-3 md:py-4 border-t border-gray-200">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 md:mt-2 flex-shrink-0"></div>
          <div className="text-xs md:text-sm text-blue-800">
            <p className="font-medium mb-1">Como funciona o cálculo:</p>
            <p className="leading-relaxed">
              Se você tiver menos convidados que o mínimo de uma faixa, o preço será calculado 
              com base no mínimo da faixa, mas dividido pelo seu número real de convidados.
            </p>
            <p className="mt-2 text-xs text-blue-600 leading-relaxed">
              <strong>Exemplo:</strong> Faixa de 30+ pessoas a R$ 50,00 cada. Se você tem 10 convidados, 
              pagará R$ 1.500,00 (30 × R$ 50,00) ÷ 10 = R$ 150,00 por convidado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}