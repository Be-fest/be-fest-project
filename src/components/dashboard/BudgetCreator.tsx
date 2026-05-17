'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  MdCalendarToday,
  MdGroup,
  MdCheckCircle,
  MdCalculate,
  MdShare,
  MdLocationOn,
  MdAccessTime,
  MdPerson,
  MdArrowBack,
  MdArrowForward,
  MdDownload,
  MdContentCopy,
  MdCheck,
  MdWarning,
  MdPictureAsPdf,
  MdHistory,
  MdDelete,
  MdPayment,
  MdSave,
  MdAttachMoney
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import { getProviderServicesAction } from '@/lib/actions/services';
import { 
  saveBudgetAction, 
  getProviderBudgetsAction, 
  deleteBudgetAction,
  updateBudgetStatusAction 
} from '@/lib/actions/budgets';
import { ServiceWithDetails, Budget } from '@/types/database';
import { useAuth } from '@/hooks/useAuth';
import { calculateMinPrice, formatPrice } from '@/utils/pricingUtils';

interface BudgetFormData {
  clientName: string;
  eventDate: string;
  location: string;
  startTime: string;
  fullGuests: number;
  halfGuests: number;
  selectedServices: {
    serviceId: string;
    serviceName: string;
    pricePerGuest: number;
  }[];
  paymentLink: string;
}

export function BudgetCreator() {
  const { userData } = useAuth();
  const [services, setServices] = useState<ServiceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [viewMode, setViewMode] = useState<'create' | 'list'>('create');
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentBudgetId, setCurrentBudgetId] = useState<string | null>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<BudgetFormData>({
    clientName: '',
    eventDate: '',
    location: '',
    startTime: '',
    fullGuests: 0,
    halfGuests: 0,
    selectedServices: [],
    paymentLink: ''
  });

  const fetchServices = async () => {
    try {
      setLoading(true);
      const result = await getProviderServicesAction();
      if (result.success && result.data) {
        setServices(result.data.filter(s => s.is_active));
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    loadSavedBudgets();
  }, []);

  const loadSavedBudgets = async () => {
    const result = await getProviderBudgetsAction();
    if (result.success && result.data) {
      setSavedBudgets(result.data);
    }
  };

  const handleSaveBudget = async (status: 'draft' | 'sent' | 'paid' = 'draft') => {
    if (!userData) return;
    
    // Evitar salvar se não houver dados básicos (como nome do cliente)
    if (!formData.clientName || !formData.eventDate) return;

    setIsSaving(true);
    try {
      const budgetData = {
        id: currentBudgetId || undefined,
        provider_id: userData.id,
        client_name: formData.clientName,
        event_date: formData.eventDate,
        location: formData.location,
        start_time: formData.startTime,
        end_time: endTime,
        full_guests: formData.fullGuests,
        half_guests: formData.halfGuests,
        selected_services: formData.selectedServices as any,
        price_per_guest_full: pricePerGuestIntegral,
        price_per_guest_half: pricePerGuestMeia,
        total_price: totalPrice,
        payment_link: formData.paymentLink,
        status: status
      };

      const result = await saveBudgetAction(budgetData);
      if (result.success && result.data) {
        setCurrentBudgetId(result.data.id);
        loadSavedBudgets();
      }
    } catch (err) {
      console.error('Error saving budget:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save on reaching Step 3
  useEffect(() => {
    if (currentStep === 3) {
      handleSaveBudget();
    }
  }, [currentStep]);

  const handleDeleteBudget = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orçamento?')) return;
    const result = await deleteBudgetAction(id);
    if (result.success) {
      loadSavedBudgets();
    }
  };

  const loadBudget = (budget: Budget) => {
    setFormData({
      clientName: budget.client_name,
      eventDate: budget.event_date,
      location: budget.location,
      startTime: budget.start_time,
      fullGuests: budget.full_guests,
      halfGuests: budget.half_guests,
      selectedServices: budget.selected_services as any,
      paymentLink: budget.payment_link || ''
    });
    setCurrentBudgetId(budget.id);
    setCurrentStep(3); // Start at preview, can go back to edit
    setViewMode('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate end time (start + 5h)
  const calculateEndTime = (start: string) => {
    if (!start) return '';
    const [h, m] = start.split(':').map(Number);
    const endH = (h + 5) % 24;
    return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Toggle service selection
  const handleServiceToggle = (service: ServiceWithDetails) => {
    const exists = formData.selectedServices.find(s => s.serviceId === service.id);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter(s => s.serviceId !== service.id)
      }));
    } else {
      const minPrice = calculateMinPrice(service);
      setFormData(prev => ({
        ...prev,
        selectedServices: [
          ...prev.selectedServices,
          {
            serviceId: service.id,
            serviceName: service.name,
            pricePerGuest: minPrice.price
          }
        ]
      }));
    }
  };

  // Price calculations
  const pricePerGuestIntegral = formData.selectedServices.reduce(
    (sum, s) => sum + s.pricePerGuest, 0
  );
  const pricePerGuestMeia = pricePerGuestIntegral / 2;
  const totalPrice =
    (pricePerGuestIntegral * formData.fullGuests) +
    (pricePerGuestMeia * formData.halfGuests);

  const endTime = calculateEndTime(formData.startTime);
  const providerName = userData?.organization_name || userData?.full_name || 'Prestador';

  // Generate PDF from budget card
  const generatePdfBlob = async (): Promise<Blob | null> => {
    if (!budgetRef.current) return null;
    try {
      const { jsPDF } = await import('jspdf');
      const { toPng } = await import('html-to-image');
      
      const dataUrl = await toPng(budgetRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);

      // Make the payment link clickable in the PDF
      const linkElement = document.getElementById('payment-link-element');
      if (linkElement && formData.paymentLink) {
        const containerRect = budgetRef.current.getBoundingClientRect();
        const linkRect = linkElement.getBoundingClientRect();
        
        const scaleX = pdfWidth / containerRect.width;
        const scaleY = pdfHeight / containerRect.height;
        
        const pdfLinkX = (linkRect.left - containerRect.left) * scaleX;
        const pdfLinkY = (linkRect.top - containerRect.top) * scaleY;
        const pdfLinkW = linkRect.width * scaleX;
        const pdfLinkH = linkRect.height * scaleY;
        
        pdf.link(pdfLinkX, pdfLinkY, pdfLinkW, pdfLinkH, { url: formData.paymentLink });
      }

      return pdf.output('blob');
    } catch (err) {
      console.error('Error generating PDF:', err);
      return null;
    }
  };

  // Generate and Download PDF
  const handleDownloadPdf = async () => {
    setGeneratingPdf(true);
    const blob = await generatePdfBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orcamento-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setGeneratingPdf(false);
  };

  // Share via WhatsApp
  const handleShareWhatsApp = async () => {
    setGeneratingPdf(true);
    const blob = await generatePdfBlob();
    setGeneratingPdf(false);
    
    handleSaveBudget('sent');
    if (blob && navigator.share) {
      const file = new File([blob], `orcamento-${formData.clientName.replace(/\s+/g, '-').toLowerCase()}.pdf`, { type: 'application/pdf' });
      try {
        await navigator.share({
          title: `Orçamento ${providerName}`,
          text: `Olá! Segue em anexo o orçamento de serviços. Você pode abrir o PDF para visualizar e clicar no link de pagamento diretamente nele.`,
          files: [file]
        });
        return;
      } catch (e) {
        console.log('Native share cancelled or failed');
      }
    }
    // Fallback: open WhatsApp with text
    const text = encodeURIComponent(`Olá! Segue o orçamento de serviços e o link de pagamento: ${formData.paymentLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Copy budget text
  const handleCopyText = () => {
    const text = `Orçamento ${providerName}\n\nCliente: ${formData.clientName}\nData: ${new Date(formData.eventDate + 'T12:00').toLocaleDateString('pt-BR')}\nLocal: ${formData.location}\nHorário: ${formData.startTime} - ${endTime}\nConvidados: ${formData.fullGuests} integrais, ${formData.halfGuests} meia\nServiços: ${formData.selectedServices.map(s => s.serviceName).join(', ')}\nPreço por Convidado (Integral): ${formatPrice(pricePerGuestIntegral)}\nPreço por Convidado (Meia): ${formatPrice(pricePerGuestMeia)}\nTotal: ${formatPrice(totalPrice)}\n\nLink de Pagamento: ${formData.paymentLink}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Validation
  const step1Valid = formData.clientName.trim() !== '' && formData.eventDate !== '' && formData.location.trim() !== '' && formData.startTime !== '' && formData.fullGuests > 0 && formData.paymentLink.trim() !== '';
  const step2Valid = formData.selectedServices.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
        <MdWarning className="text-yellow-500 text-5xl mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum serviço cadastrado</h3>
        <p className="text-gray-600">Cadastre pelo menos um serviço ativo para criar orçamentos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MdCalculate className="text-purple-600" />
          {viewMode === 'create' ? 'Criar Orçamento' : 'Histórico de Orçamentos'}
        </h1>
        <button
          onClick={() => setViewMode(viewMode === 'create' ? 'list' : 'create')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors"
        >
          {viewMode === 'create' ? (
            <><MdHistory className="text-xl" /> Histórico</>
          ) : (
            <><MdCalculate className="text-xl" /> Criar Novo</>
          )}
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-3">
          {[
            { n: 1, label: 'Dados' },
            { n: 2, label: 'Serviços' },
            { n: 3, label: 'Orçamento' }
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                currentStep >= n ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > n ? <MdCheckCircle className="text-lg" /> : n}
              </div>
              <span className={`ml-1.5 text-xs font-medium hidden sm:inline ${
                currentStep >= n ? 'text-purple-600' : 'text-gray-400'
              }`}>{label}</span>
              {n < 3 && <div className={`w-10 sm:w-16 h-0.5 mx-2 ${currentStep > n ? 'bg-purple-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Client & Event Info */}
      {currentStep === 1 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdPerson className="text-purple-600" />
            Dados do Cliente e Evento
          </h2>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Nome do Cliente */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nome do Cliente</label>
              <input type="text" placeholder="Nome completo do cliente"
                value={formData.clientName}
                onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
            </div>

            {/* Data */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data do Evento</label>
              <input type="date" value={formData.eventDate}
                onChange={e => setFormData(p => ({ ...p, eventDate: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horário de Início</label>
              <input type="time" value={formData.startTime}
                onChange={e => setFormData(p => ({ ...p, startTime: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
              {formData.startTime && (
                <p className="text-xs text-gray-500 mt-1">Término estimado: {endTime} (5h de duração)</p>
              )}
            </div>

            {/* Local */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Local do Evento</label>
              <input type="text" placeholder="Endereço completo"
                value={formData.location}
                onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
            </div>

            {/* Convidados Integrais */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nº de Convidados (Integrais)</label>
              <input type="number" min="0" placeholder="0"
                value={formData.fullGuests || ''}
                onChange={e => setFormData(p => ({ ...p, fullGuests: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
            </div>

            {/* Convidados Meia */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nº de Convidados (Meia)</label>
              <input type="number" min="0" placeholder="0"
                value={formData.halfGuests || ''}
                onChange={e => setFormData(p => ({ ...p, halfGuests: parseInt(e.target.value) || 0 }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
            </div>

            {/* Link de Pagamento */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Link de Pagamento (WhatsApp, Mercado Pago, etc.)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MdPayment className="text-gray-400" />
                </div>
                <input type="url" placeholder="https://link.pagamento.com/..."
                  value={formData.paymentLink}
                  onChange={e => setFormData(p => ({ ...p, paymentLink: e.target.value }))}
                  className="w-full pl-10 p-3 border border-gray-300 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all" />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button onClick={() => setCurrentStep(2)} disabled={!step1Valid}
              className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
              Próximo <MdArrowForward />
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Service Selection */}
      {currentStep === 2 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MdCheckCircle className="text-purple-600" />
            Selecione os Serviços
          </h2>

          <div className="space-y-3">
            {services.map(service => {
              const isSelected = formData.selectedServices.some(s => s.serviceId === service.id);
              const minPrice = calculateMinPrice(service);
              return (
                <div key={service.id}
                  onClick={() => handleServiceToggle(service)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    isSelected ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-200 hover:border-purple-300'
                  }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">{service.category}</p>
                      <p className="font-bold text-purple-600 mt-1">{formatPrice(minPrice.price)} /pessoa</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                    }`}>
                      {isSelected && <MdCheckCircle className="text-white text-sm" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {formData.selectedServices.length > 0 && (
            <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <p className="text-sm font-medium text-purple-700">
                {formData.selectedServices.length} serviço(s) selecionado(s) — Preço por convidado (Integral): <strong>{formatPrice(pricePerGuestIntegral)}</strong>
              </p>
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2 border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all">
              <MdArrowBack /> Voltar
            </button>
            <button 
              onClick={() => {
                handleSaveBudget();
                setCurrentStep(3);
              }} 
              disabled={!step2Valid || isSaving}
              className="flex items-center gap-2 bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><MdSave /> Salvar e Gerar <MdArrowForward /></>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Budget Preview & Share */}
      {currentStep === 3 && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">

          {/* Budget Card (this gets captured as image) */}
          <div ref={budgetRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header with provider info */}
            <div className="bg-gradient-to-r from-purple-700 to-purple-900 p-6 text-white relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {(userData as any)?.profile_image ? (
                    <img src={(userData as any).profile_image} alt="Logo"
                      className="w-14 h-14 rounded-xl object-cover border-2 border-white/30" />
                  ) : (
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold">
                      {providerName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{providerName}</h2>
                    <p className="text-purple-200 text-sm">Orçamento de Serviços</p>
                  </div>
                </div>
                {/* Selo */}
                <div className="bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-purple-200">Orçada Pelo</p>
                  <p className="text-sm font-bold">Prestador</p>
                </div>
              </div>
            </div>

            {/* Budget body */}
            <div className="p-6 space-y-5">
              {/* Client & Event info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Nome do Cliente</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{formData.clientName}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Data do Evento</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {new Date(formData.eventDate + 'T12:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Horário</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{formData.startTime} — {endTime} (5h)</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3.5">
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium">Local</p>
                  <p className="font-semibold text-gray-900 mt-0.5 text-sm">{formData.location}</p>
                </div>
              </div>

              {/* Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-purple-600 uppercase tracking-wider font-medium">Convidados (Integrais)</p>
                  <p className="text-2xl font-bold text-purple-700 mt-0.5">{formData.fullGuests}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-xl p-3.5">
                  <p className="text-[11px] text-purple-600 uppercase tracking-wider font-medium">Convidados (Meia)</p>
                  <p className="text-2xl font-bold text-purple-700 mt-0.5">{formData.halfGuests}</p>
                </div>
              </div>

              {/* Services */}
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-medium mb-2">Serviços Escolhidos</p>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedServices.map(s => (
                    <span key={s.serviceId}
                      className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                      {s.serviceName}
                    </span>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Pricing breakdown */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Preço por Convidado (Integral)</span>
                  <span className="font-bold text-gray-900">{formatPrice(pricePerGuestIntegral)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Preço por Convidado (Meia)</span>
                  <span className="font-bold text-gray-900">{formatPrice(pricePerGuestMeia)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>({formData.fullGuests} integrais × {formatPrice(pricePerGuestIntegral)}) + ({formData.halfGuests} meias × {formatPrice(pricePerGuestMeia)})</span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-5 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Preço Total</span>
                  <span className="text-3xl font-bold">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              {/* Payment Link - NEW */}
              <div className="border-t border-gray-100 pt-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Link para Pagamento</p>
                <a href={formData.paymentLink} target="_blank" rel="noopener noreferrer" 
                   id="payment-link-element"
                   className="inline-flex items-center gap-2 text-purple-600 font-bold hover:underline">
                  <MdPayment /> {formData.paymentLink}
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons (outside the captured area) */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={() => setCurrentStep(2)}
              className="flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 hover:text-white transition-all">
              <MdArrowBack /> Voltar
            </button>

            <button onClick={handleDownloadPdf} disabled={generatingPdf}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex-1 text-sm sm:text-base">
              <MdPictureAsPdf /> {generatingPdf ? 'Gerando PDF...' : 'Baixar PDF'}
            </button>

            <div className="relative flex-1">
              <button onClick={() => setShareMenuOpen(!shareMenuOpen)}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                <MdShare /> Compartilhar
              </button>

              {shareMenuOpen && (
                <>
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
                    <button onClick={handleShareWhatsApp}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <FaWhatsapp className="text-green-500 text-xl" />
                      <span className="text-sm text-gray-700 font-medium">Enviar por WhatsApp</span>
                    </button>
                    <button onClick={handleCopyText}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      {copied ? <MdCheck className="text-green-500 text-xl" /> : <MdContentCopy className="text-gray-600 text-xl" />}
                      <span className="text-sm text-gray-700 font-medium">{copied ? 'Copiado!' : 'Copiar texto'}</span>
                    </button>
                    <button onClick={handleDownloadPdf}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left">
                      <MdPictureAsPdf className="text-red-500 text-xl" />
                      <span className="text-sm text-gray-700 font-medium">Baixar como PDF</span>
                    </button>
                  </motion.div>
                  <div className="fixed inset-0 z-40" onClick={() => setShareMenuOpen(false)} />
                </>
              )}
            </div>
          </div>

          {/* Info note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800">
              <strong>Dica:</strong> Baixe o PDF e envie junto com a mensagem de orçamento para seu cliente via WhatsApp ou outra plataforma. O link de pagamento no PDF é clicável!
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Budgets (Visible at bottom of Create mode) */}
      {viewMode === 'create' && savedBudgets.length > 0 && currentStep === 1 && (
        <div className="pt-8 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <MdHistory className="text-purple-600" />
              Orçamentos Recentes
            </h3>
            <button 
              onClick={() => setViewMode('list')}
              className="text-sm font-medium text-purple-600 hover:underline"
            >
              Ver todos
            </button>
          </div>
          <div className="grid gap-3">
            {savedBudgets.slice(0, 3).map(budget => (
              <div key={budget.id} 
                onClick={() => loadBudget(budget)}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:border-purple-300 transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">{budget.client_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(budget.event_date + 'T12:00').toLocaleDateString('pt-BR')} • {formatPrice(budget.total_price)}
                  </p>
                </div>
                <MdArrowForward className="text-gray-300 group-hover:text-purple-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budgets List View (Full History) */}
      {viewMode === 'list' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Histórico de Orçamentos</h2>
            <div className="text-sm text-gray-500">{savedBudgets.length} orçamentos</div>
          </div>
          
          {savedBudgets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <MdHistory className="text-gray-300 text-5xl mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum orçamento salvo</h3>
              <p className="text-gray-600">Os orçamentos que você criar aparecerão aqui.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {savedBudgets.map(budget => (
                <div key={budget.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center justify-between sm:justify-start gap-3">
                      <h3 className="font-bold text-gray-900 truncate text-lg">{budget.client_name}</h3>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        budget.status === 'paid' ? 'bg-green-100 text-green-700' :
                        budget.status === 'sent' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {budget.status === 'paid' ? 'Pago' : budget.status === 'sent' ? 'Enviado' : 'Rascunho'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><MdCalendarToday className="text-purple-500" /> {new Date(budget.event_date + 'T12:00').toLocaleDateString('pt-BR')}</span>
                      <span className="flex items-center gap-1.5"><MdAttachMoney className="text-green-500" /> {formatPrice(budget.total_price)}</span>
                      <span className="flex items-center gap-1.5 col-span-2"><MdLocationOn className="text-red-400 text-sm" /> {budget.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                    <button onClick={() => loadBudget(budget)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors font-semibold text-sm" title="Visualizar/Editar">
                      <MdCalculate /> Editar
                    </button>
                    <button onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Excluir">
                      <MdDelete />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <button 
            onClick={() => setViewMode('create')}
            className="w-full py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-medium hover:border-purple-300 hover:text-purple-600 transition-all flex items-center justify-center gap-2"
          >
            <MdCalculate /> Criar Novo Orçamento
          </button>
        </motion.div>
      )}
    </div>
  );
}
