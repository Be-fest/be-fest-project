'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PaymentForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { generatePaymentLink, redirectToPayment, PaymentLinkResponse } from '@/lib/services/payment';
import { getEventServicesAction } from '@/lib/actions/event-services';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { EventServiceWithDetails } from '@/types/database';
import { ClientOnlyGuard } from '@/components/guards/ClientOnlyGuard';

function PaymentPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<EventServiceWithDetails[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentLinkResponse | null>(null);
  const [generatingPayment, setGeneratingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'waiting_payment' | 'confirmed' | 'paid' | 'completed' | 'cancelled'>('waiting_payment');
  const toast = useToastGlobal();

  const eventId = searchParams.get('eventId');
  const serviceIdsParam = searchParams.get('services');
  const statusParam = searchParams.get('status');
  const serviceIds = serviceIdsParam 
    ? serviceIdsParam.split(',').map(id => id.trim()).filter(id => id !== '')
    : [];

  console.log('🔍 Parâmetros extraídos da URL:');
  console.log('  - eventId:', eventId);
  console.log('  - serviceIdsParam:', serviceIdsParam);
  console.log('  - serviceIds processados:', serviceIds);
  console.log('  - statusParam:', statusParam);

  // Atualizar status do pagamento baseado no parâmetro da URL
  useEffect(() => {
    if (statusParam) {
      const validStatuses = ['pending', 'waiting_payment', 'confirmed', 'paid', 'completed', 'cancelled'];
      if (validStatuses.includes(statusParam)) {
        setPaymentStatus(statusParam as any);
      }
    }
  }, [statusParam]);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) {
        setLoadingData(false);
        return;
      }

      try {
        const result = await getEventServicesAction({ event_id: eventId });
        
        if (result.success && result.data) {
          console.log('📋 Todos os event_services carregados:', result.data.map(s => ({ 
            id: s.id, 
            service_id: s.service_id, 
            booking_status: s.booking_status 
          })));
          
          // Por enquanto, vamos usar todos os serviços para debug
          // Depois voltamos para filtrar apenas os aprovados
          setServices(result.data);
          
          // Calcular valor total apenas dos aprovados
          const approvedServices = result.data.filter(
            service => service.booking_status === 'approved'
          );
          
          console.log('📋 Serviços aprovados:', approvedServices.map(s => ({ 
            id: s.id, 
            service_id: s.service_id 
          })));
          
          const total = approvedServices.reduce(
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
      if (!eventId || serviceIds.length === 0 || loadingData || generatingPayment || services.length === 0) {
        console.log('⏭️ Pulando geração - condições não atendidas:', {
          hasEventId: !!eventId,
          hasServiceIds: serviceIds.length > 0,
          loadingData,
          generatingPayment,
          hasServices: services.length > 0
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
        console.log('📋 serviceIds (event_service IDs):', serviceIds);
        
        // Filtrar os serviços que correspondem aos event_service IDs fornecidos
        const matchingServices = services.filter(service => 
          serviceIds.includes(service.id)
        );
        
        console.log('🔍 Serviços encontrados:', matchingServices.length);
        console.log('🔍 IDs dos event_services:', matchingServices.map(s => s.id));
        console.log('🔍 Todos os serviços carregados:', services.map(s => ({ id: s.id, service_id: s.service_id })));
        
        // Extrair os service_id reais dos serviços encontrados
        const actualServiceIds = matchingServices.map(service => service.service_id);
        console.log('🔍 Service IDs reais extraídos:', actualServiceIds);
        
        if (actualServiceIds.length === 0) {
          console.error('❌ Nenhum service ID válido encontrado');
          return;
        }
        
        const paymentResponse = await generatePaymentLink({
          event_id: eventId,
          service_ids: actualServiceIds,
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
  }, [eventId, serviceIds, loadingData, services]); // Adicionado services às dependências

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
      // Filtrar os serviços que correspondem aos event_service IDs fornecidos
      const matchingServices = services.filter(service => 
        serviceIds.includes(service.id)
      );
      
      // Extrair os service_id reais dos serviços encontrados
      const actualServiceIds = matchingServices.map(service => service.service_id);
      
      if (actualServiceIds.length === 0) {
        toast.error('Erro ao processar serviços', 'Não foi possível identificar os serviços selecionados');
        return;
      }

      const paymentResponse = await generatePaymentLink({
        event_id: eventId,
        service_ids: actualServiceIds,
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
    provider: service.provider.name || 'Prestador não informado',
  })) || formattedServices;

  const displayTotalValue = paymentData?.pricing?.total || totalValue;

  // Não mostrar skeleton de página inteira, apenas passar o estado de loading para o componente

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
            paymentStatus={paymentStatus}
            dataLoading={loadingData || generatingPayment}
          />
        </div>
      </div>
    </AuthLayout>
  );
}

export default function PaymentPage() {
  return (
    <ClientOnlyGuard>
      <Suspense fallback={
        <AuthLayout>
          <div className="relative w-full px-4 sm:px-0">
            <div className="w-full max-w-sm mx-auto sm:max-w-md">
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Carregando...</div>
              </div>
            </div>
          </div>
        </AuthLayout>
      }>
        <PaymentPageContent />
      </Suspense>
    </ClientOnlyGuard>
  );
}