'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { generatePaymentLink, redirectToPayment, PaymentLinkResponse } from '@/lib/services/payment';
import { getEventServicesAction } from '@/lib/actions/event-services';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { EventServiceWithDetails } from '@/types/database';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<EventServiceWithDetails[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentLinkResponse | null>(null);
  const [generatingPayment, setGeneratingPayment] = useState(false);
  const toast = useToastGlobal();

  const eventId = searchParams.get('eventId');
  const serviceIdsParam = searchParams.get('services');
  const serviceIds = serviceIdsParam 
    ? serviceIdsParam.split(',').map(id => id.trim()).filter(id => id !== '')
    : [];

  console.log('🔍 Parâmetros extraídos da URL:');
  console.log('  - eventId:', eventId);
  console.log('  - serviceIdsParam:', serviceIdsParam);
  console.log('  - serviceIds processados:', serviceIds);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setLoadingData(false);
        return;
      }

      try {
        const result = await getEventServicesAction({ event_id: eventId });
        
        if (result.success && result.data) {
          // Filtrar apenas os serviços que estão aguardando pagamento
          const waitingPaymentServices = result.data.filter(
            service => service.booking_status === 'waiting_payment'
          );
          
          setServices(waitingPaymentServices);
          
          // Calcular valor total
          const total = waitingPaymentServices.reduce(
            (sum, service) => sum + (service.total_estimated_price || 0), 
            0
          );
          setTotalValue(total);
        } else {
          console.error('Erro ao buscar dados do evento:', result.error);
          toast.error('Erro ao carregar dados do evento', result.error || 'Não foi possível carregar os dados do evento');
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Erro ao carregar dados', 'Ocorreu um erro inesperado ao carregar os dados');
      } finally {
        setLoadingData(false);
      }
    };

    fetchEventData();
  }, [eventId, toast]);

  // Gerar dados do pagamento automaticamente quando os dados do evento carregam
  useEffect(() => {
    const generatePaymentData = async () => {
      if (!eventId || serviceIds.length === 0 || loadingData || generatingPayment) {
        console.log('⏭️ Pulando geração - condições não atendidas:', {
          hasEventId: !!eventId,
          hasServiceIds: serviceIds.length > 0,
          loadingData,
          generatingPayment
        });
        return;
      }

      // Verificar se já temos dados do pagamento
      if (paymentData) {
        console.log('✅ Dados do pagamento já existem, pulando geração');
        return;
      }

      console.log('🚀 Iniciando geração de dados do pagamento...');
      setGeneratingPayment(true);
      
      try {
        console.log('🔄 Gerando dados do pagamento...');
        console.log('📋 eventId:', eventId);
        console.log('📋 serviceIds:', serviceIds);
        
        // Garantir que serviceIds é um array válido
        const validServiceIds = serviceIds.filter(id => id && id.trim() !== '');
        console.log('🔍 Service IDs válidos:', validServiceIds);
        
        if (validServiceIds.length === 0) {
          console.error('❌ Nenhum service ID válido encontrado');
          return;
        }
        
        const paymentResponse = await generatePaymentLink({
          event_id: eventId,
          service_ids: validServiceIds,
        });

        setPaymentData(paymentResponse);
        console.log('✅ Dados do pagamento gerados com sucesso');
      } catch (error) {
        console.error('❌ Erro ao gerar dados do pagamento:', error);
        // Não mostrar erro aqui, pois o usuário ainda não tentou pagar
      } finally {
        setGeneratingPayment(false);
      }
    };

    generatePaymentData();
  }, [eventId, serviceIds, loadingData]); // Removido paymentData das dependências para evitar recursão

  const handlePayment = async () => {
    if (!eventId || serviceIds.length === 0) {
      toast.error('Dados de pagamento inválidos', 'Verifique se você acessou a página corretamente');
      return;
    }

    setLoading(true);
    try {
      // Se já temos os dados do pagamento, usar eles
      if (paymentData) {
        redirectToPayment(paymentData);
        return;
      }

      // Caso contrário, gerar novamente
      const paymentResponse = await generatePaymentLink({
        event_id: eventId,
        service_ids: serviceIds,
      });

      setPaymentData(paymentResponse);
      redirectToPayment(paymentResponse);
    } catch (error) {
      console.error('Erro ao gerar pagamento:', error);
      toast.error('Erro ao gerar link de pagamento', 'Não foi possível gerar o link de pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Dados formatados para o componente PaymentForm
  const formattedServices = services.map(service => ({
    name: service.service.name,
    provider: service.service.provider?.organization_name || 'Prestador não informado',
  }));

  // Se temos dados do pagamento da API, usar eles
  const displayServices = paymentData?.services?.map(service => ({
    name: service.name,
    provider: service.provider.email || 'Prestador não informado',
  })) || formattedServices;

  const displayTotalValue = paymentData?.pricing?.total || totalValue;

  if (loadingData || generatingPayment) {
    return (
      <AuthLayout>
        <div className="relative w-full px-4 sm:px-0">
          <div className="w-full max-w-sm mx-auto sm:max-w-md">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!eventId || serviceIds.length === 0) {
    return (
      <AuthLayout>
        <div className="relative w-full px-4 sm:px-0">
          <div className="w-full max-w-sm mx-auto sm:max-w-md">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dados inválidos</h2>
              <p className="text-gray-600 mb-8">
                Não foi possível carregar os dados do pagamento. Verifique se você acessou a página corretamente.
              </p>
              <a
                href="/perfil?tab=minhas-festas"
                className="bg-[#F71875] text-white px-6 py-3 rounded-lg hover:bg-[#E6006F] transition-colors"
              >
                Voltar para Minhas Festas
              </a>
            </div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="relative w-full px-4 sm:px-0">
        <div className="w-full max-w-sm mx-auto sm:max-w-md">
          <PaymentForm
            services={displayServices}
            totalValue={displayTotalValue}
            onSubmit={handlePayment}
            loading={loading}
            paymentData={paymentData}
          />
        </div>
      </div>
    </AuthLayout>
  );
} 