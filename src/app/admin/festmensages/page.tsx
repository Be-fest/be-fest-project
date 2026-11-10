'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdNotificationsActive,
  MdDashboard,
  MdDescription,
  MdRule,
  MdHistory,
  MdErrorOutline,
  MdCampaign,
  MdSettings,
  MdSend,
  MdRefresh,
  MdCheckCircle,
  MdWarning,
  MdEdit,
  MdAdd,
  MdVisibility,
  MdToggleOn,
  MdToggleOff,
  MdEmail,
  MdClose,
  MdSave,
  MdPlayArrow,
  MdReplay,
  MdSearch,
  MdShield
} from 'react-icons/md';
import { FaWhatsapp } from 'react-icons/fa';
import {
  getFestMensagesOverviewAction,
  upsertFestTemplateAction,
  toggleFestTemplateActiveAction,
  upsertFestRuleAction,
  toggleFestRuleActiveAction,
  retryFestNotificationAction,
  processFestQueueAndRemindersAction,
  upsertFestCampaignAction,
  runFestCampaignAction,
  updateFestChannelConfigAction,
  sendFestTestMessageAction,
  FestDashboardOverview
} from '@/lib/actions/festmensages';
import {
  FestTemplate,
  FestRule,
  FestCampaign,
  FestSingleChannel,
  FestChannel,
  FestRecipientType,
  FestCategory
} from '@/lib/festmensages/types';

type TabKey =
  | 'dashboard'
  | 'templates'
  | 'rules'
  | 'history'
  | 'failures'
  | 'campaigns'
  | 'settings'
  | 'tester';

export default function FestMensagesAdminPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [overview, setOverview] = useState<FestDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filters for Templates
  const [templateFilterRole, setTemplateFilterRole] = useState<'all' | 'client' | 'provider'>('all');
  const [templateSearch, setTemplateSearch] = useState('');

  // Template Modal state
  const [editingTemplate, setEditingTemplate] = useState<Partial<FestTemplate> | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<FestTemplate | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Rule Modal state
  const [editingRule, setEditingRule] = useState<Partial<FestRule> | null>(null);
  const [savingRule, setSavingRule] = useState(false);

  // History filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyChannel, setHistoryChannel] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [historyStatus, setHistoryStatus] = useState<string>('all');
  const [historyEventType, setHistoryEventType] = useState<string>('all');
  const [historyPeriodDays, setHistoryPeriodDays] = useState<number>(30);

  // Campaign Modal state
  const [editingCampaign, setEditingCampaign] = useState<Partial<FestCampaign> | null>(null);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [runningCampaignId, setRunningCampaignId] = useState<string | null>(null);

  // Tester state
  const [testTemplateCode, setTestTemplateCode] = useState('provider_order_arrived');
  const [testChannel, setTestChannel] = useState<FestSingleChannel>('email');
  const [testRecipientName, setTestRecipientName] = useState('Buffet Estrela Teste');
  const [testRecipientEmail, setTestRecipientEmail] = useState('befest21@gmail.com');
  const [testRecipientPhone, setTestRecipientPhone] = useState('5521982809609');
  const [testSandboxMode, setTestSandboxMode] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [lastTestOutput, setLastTestOutput] = useState<{
    renderedSubject: string;
    renderedBodyText: string;
    status: string;
  } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    const res = await getFestMensagesOverviewAction();
    if (res.success && res.data) {
      setOverview(res.data);
    } else {
      showNotice('error', res.error || 'Erro ao carregar o módulo FestMensages');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTemplates = useMemo(() => {
    if (!overview) return [];
    return overview.templates.filter((t) => {
      if (templateFilterRole !== 'all' && t.recipient_type !== templateFilterRole && t.recipient_type !== 'both') {
        return false;
      }
      if (templateSearch.trim()) {
        const q = templateSearch.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.code.toLowerCase().includes(q) ||
          (t.description || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [overview, templateFilterRole, templateSearch]);

  const filteredQueueHistory = useMemo(() => {
    if (!overview) return [];
    const cutoff = Date.now() - historyPeriodDays * 24 * 60 * 60 * 1000;
    return overview.queue.filter((item) => {
      if (new Date(item.created_at).getTime() < cutoff) return false;
      if (historyChannel !== 'all' && item.channel !== historyChannel) return false;
      if (historyStatus !== 'all' && item.status !== historyStatus) return false;
      if (historyEventType !== 'all' && item.event_type !== historyEventType) return false;
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchRecipient =
          (item.recipient_name || '').toLowerCase().includes(q) ||
          (item.recipient_email || '').toLowerCase().includes(q) ||
          (item.recipient_phone || '').toLowerCase().includes(q) ||
          item.template_code.toLowerCase().includes(q);
        if (!matchRecipient) return false;
      }
      return true;
    });
  }, [overview, historyChannel, historyStatus, historyEventType, historySearch, historyPeriodDays]);

  const failedItems = useMemo(() => {
    if (!overview) return [];
    return overview.queue.filter((q) => q.status === 'failed');
  }, [overview]);

  const handleSaveTemplate = async () => {
    if (!editingTemplate?.code || !editingTemplate?.name || !editingTemplate?.body_text) {
      showNotice('error', 'Preencha código, nome e texto do modelo');
      return;
    }
    setSavingTemplate(true);
    const res = await upsertFestTemplateAction({
      ...editingTemplate,
      code: editingTemplate.code,
      name: editingTemplate.name,
      body_text: editingTemplate.body_text
    });
    setSavingTemplate(false);
    if (res.success) {
      showNotice('success', 'Modelo salvo com sucesso!');
      setEditingTemplate(null);
      loadData();
    } else {
      showNotice('error', res.error || 'Erro ao salvar modelo');
    }
  };

  const handleSaveRule = async () => {
    if (!editingRule?.code || !editingRule?.name || !editingRule?.event_type || !editingRule?.template_code) {
      showNotice('error', 'Preencha código, nome, evento e modelo');
      return;
    }
    setSavingRule(true);
    const res = await upsertFestRuleAction({
      ...editingRule,
      code: editingRule.code,
      name: editingRule.name,
      event_type: editingRule.event_type,
      template_code: editingRule.template_code
    });
    setSavingRule(false);
    if (res.success) {
      showNotice('success', 'Regra de automação salva!');
      setEditingRule(null);
      loadData();
    } else {
      showNotice('error', res.error || 'Erro ao salvar regra');
    }
  };

  const handleSaveCampaign = async () => {
    if (!editingCampaign?.name || !editingCampaign?.template_code || !editingCampaign?.start_date || !editingCampaign?.end_date) {
      showNotice('error', 'Preencha nome, modelo e período da campanha');
      return;
    }
    setSavingCampaign(true);
    const res = await upsertFestCampaignAction({
      ...editingCampaign,
      name: editingCampaign.name,
      template_code: editingCampaign.template_code,
      start_date: editingCampaign.start_date,
      end_date: editingCampaign.end_date
    });
    setSavingCampaign(false);
    if (res.success) {
      showNotice('success', 'Campanha salva com sucesso!');
      setEditingCampaign(null);
      loadData();
    } else {
      showNotice('error', res.error || 'Erro ao salvar campanha');
    }
  };

  const handleRunCampaign = async (id: string, testMode: boolean) => {
    setRunningCampaignId(id);
    const res = await runFestCampaignAction(id, testMode);
    setRunningCampaignId(null);
    if (res.success && res.data) {
      showNotice(
        'success',
        `Campanha executada! Elegíveis: ${res.data.totalEligible} | Disparados: ${res.data.totalSent} | Opt-out LGPD respeitados: ${res.data.totalSkippedConsent}`
      );
      loadData();
    } else {
      showNotice('error', res.error || 'Erro ao executar campanha');
    }
  };

  const handleRetryQueueItem = async (id: string) => {
    const res = await retryFestNotificationAction(id);
    if (res.success) {
      showNotice('success', 'Notificação reprocessada com sucesso!');
    } else {
      showNotice('error', res.error || 'Falha no reprocessamento');
    }
    loadData();
  };

  const handleProcessQueueNow = async () => {
    const res = await processFestQueueAndRemindersAction();
    if (res.success && res.data) {
      showNotice(
        'success',
        `Fila processada (${res.data.processedCount} itens) e ${res.data.remindersTriggered} lembretes de agenda verificados!`
      );
      loadData();
    } else {
      showNotice('error', res.error || 'Erro ao processar fila');
    }
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    setLastTestOutput(null);
    const res = await sendFestTestMessageAction({
      templateCode: testTemplateCode,
      channel: testChannel,
      recipientName: testRecipientName,
      recipientEmail: testRecipientEmail,
      recipientPhone: testRecipientPhone,
      sandboxMode: testSandboxMode
    });
    setSendingTest(false);
    if (res.success && res.data) {
      setLastTestOutput(res.data);
      showNotice(
        'success',
        testSandboxMode
          ? 'Simulação concluída em Modo de Teste Controlado (sem envio externo)!'
          : 'Mensagem de teste disparada!'
      );
      loadData();
    } else {
      showNotice('error', res.error || 'Erro ao testar mensagem');
    }
  };

  if (loading && !overview) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: MdDashboard },
    { key: 'templates', label: 'Modelos', icon: MdDescription, badge: overview?.templates.length },
    { key: 'rules', label: 'Regras', icon: MdRule, badge: overview?.rules.length },
    { key: 'history', label: 'Histórico', icon: MdHistory, badge: overview?.queue.length },
    { key: 'failures', label: 'Falhas', icon: MdErrorOutline, badge: failedItems.length || undefined },
    { key: 'campaigns', label: 'Campanhas', icon: MdCampaign, badge: overview?.campaigns.length },
    { key: 'settings', label: 'Configurações', icon: MdSettings },
    { key: 'tester', label: 'Teste de Mensagem', icon: MdSend }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] flex items-center justify-center text-white shadow-md">
            <MdNotificationsActive className="text-2xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">FestMensages</h1>
            <p className="text-sm text-gray-600">
              Central de Notificações Automatizadas e Campanhas (WhatsApp & E-mail)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleProcessQueueNow}
            className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-sm font-semibold transition-colors"
          >
            <MdPlayArrow className="text-lg" />
            Processar Fila & Lembretes
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
          >
            <MdRefresh className="text-lg" />
            Atualizar
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-white font-medium ${
              toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
            }`}
          >
            {toast.type === 'success' ? <MdCheckCircle className="text-xl" /> : <MdWarning className="text-xl" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-[#FF4DA6] to-[#A502CA] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-purple-700'
              }`}
            >
              <Icon className="text-lg" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 1. TAB: DASHBOARD */}
      {activeTab === 'dashboard' && overview && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold uppercase text-gray-400">Total Processadas</p>
              <p className="text-3xl font-black text-gray-900 mt-2">{overview.stats.totalProcessed}</p>
              <p className="text-xs text-gray-500 mt-1">
                E-mail: {overview.stats.emailSent} | WhatsApp: {overview.stats.whatsappSent}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold uppercase text-emerald-600">Enviadas / Registradas</p>
              <p className="text-3xl font-black text-emerald-600 mt-2">
                {overview.stats.sent + overview.stats.testModeLogged}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Produção: {overview.stats.sent} | Modo Teste: {overview.stats.testModeLogged}
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold uppercase text-amber-600">Na Fila (Pendentes)</p>
              <p className="text-3xl font-black text-amber-600 mt-2">{overview.stats.pending}</p>
              <p className="text-xs text-gray-500 mt-1">Aguardando janela ou agendamento</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-xs font-bold uppercase text-red-600">Com Falha</p>
              <p className="text-3xl font-black text-red-600 mt-2">{overview.stats.failed}</p>
              <p className="text-xs text-gray-500 mt-1">Elegíveis para reprocessamento</p>
            </div>
          </div>

          {/* Channel Status Banner */}
          <div className="grid md:grid-cols-2 gap-4">
            {overview.channelConfigs.map((cfg) => (
              <div
                key={cfg.channel}
                className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      cfg.channel === 'whatsapp'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {cfg.channel === 'whatsapp' ? (
                      <FaWhatsapp className="text-xl" />
                    ) : (
                      <MdEmail className="text-xl" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">
                      Canal {cfg.channel === 'whatsapp' ? 'WhatsApp Business' : 'E-mail (Resend)'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Credenciais no servidor:{' '}
                      <strong className={cfg.has_credentials ? 'text-emerald-600' : 'text-amber-600'}>
                        {cfg.has_credentials ? 'Configuradas' : 'Pendentes (Operando em Modo de Teste)'}
                      </strong>
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    cfg.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {cfg.is_enabled ? 'Canal Ativo' : 'Desativado'}
                </span>
              </div>
            ))}
          </div>

          {/* Recent Logs Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Últimos Disparos e Eventos</h3>
            {overview.logs.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">
                Nenhuma notificação processada ainda nesta sessão. Use a aba &quot;Teste de Mensagem&quot; para validar os disparos!
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                      <th className="p-3">Horário</th>
                      <th className="p-3">Evento / Modelo</th>
                      <th className="p-3">Destinatário</th>
                      <th className="p-3">Canal</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {overview.logs.slice(0, 10).map((log) => (
                      <tr key={log.id}>
                        <td className="p-3 text-gray-500">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900">{log.event_type}</div>
                          <div className="text-xs text-gray-500">{log.template_code}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-800">
                            {log.recipient_name} ({log.recipient_role === 'client' ? 'Cliente' : 'Prestador'})
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.channel === 'email' ? log.recipient_email : log.recipient_phone}
                          </div>
                        </td>
                        <td className="p-3 uppercase font-semibold text-xs">{log.channel}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              log.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-700'
                                : log.status === 'test_mode_logged'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. TAB: MODELOS (TEMPLATES) */}
      {activeTab === 'templates' && overview && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {(['all', 'client', 'provider'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTemplateFilterRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    templateFilterRole === r
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r === 'all' ? 'Todos' : r === 'client' ? 'Clientes' : 'Prestadores'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative flex-1">
                <MdSearch className="absolute left-3 top-2.5 text-gray-400 text-lg" />
                <input
                  type="text"
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  placeholder="Buscar modelo por nome ou código..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <button
                onClick={() =>
                  setEditingTemplate({
                    code: '',
                    name: '',
                    description: '',
                    category: 'operational',
                    recipient_type: 'client',
                    channel: 'both',
                    subject: '',
                    body_text: 'Olá, {{nome}}! ',
                    body_html: '<p>Olá, <strong>{{nome}}</strong>!</p>',
                    required_variables: ['nome'],
                    is_active: true
                  })
                }
                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
              >
                <MdAdd className="text-lg" />
                Novo Modelo
              </button>
            </div>
          </div>

          {/* Variables helper */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
            <p className="text-xs font-bold text-purple-900 uppercase mb-2">
              Variáveis Dinâmicas Suportadas (validadas antes do envio):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {overview.supportedVariables.map((v) => (
                <code
                  key={v.key}
                  title={`${v.label} (Ex: ${v.example})`}
                  className="bg-white border border-purple-200 text-purple-800 px-2 py-0.5 rounded text-xs"
                >
                  {`{{${v.key}}}`}
                </code>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => (
              <div
                key={tpl.code}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold uppercase mr-2 ${
                          tpl.recipient_type === 'client'
                            ? 'bg-pink-100 text-pink-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {tpl.recipient_type === 'client' ? 'Cliente' : 'Prestador'}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-700 uppercase mr-2">
                        {tpl.category === 'operational' ? 'Operacional' : 'Promocional'}
                      </span>
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 uppercase">
                        Canal: {tpl.channel}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        tpl.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tpl.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{tpl.name}</h3>
                  <p className="text-xs text-gray-500 mb-3">{tpl.description}</p>
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-700 mb-3">
                    <div className="font-semibold text-gray-900 mb-1">Assunto: {tpl.subject}</div>
                    <div className="line-clamp-3">{tpl.body_text}</div>
                  </div>
                  <div className="text-[11px] text-gray-500 mb-4">
                    <strong>Variáveis obrigatórias:</strong>{' '}
                    {tpl.required_variables.map((v) => `{{${v}}}`).join(', ')}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEditingTemplate(tpl)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700"
                  >
                    <MdEdit /> Editar
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
                  >
                    <MdVisibility /> Preview
                  </button>
                  <button
                    onClick={async () => {
                      await toggleFestTemplateActiveAction(tpl.code);
                      loadData();
                    }}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200"
                  >
                    {tpl.is_active ? <MdToggleOff className="text-base" /> : <MdToggleOn className="text-base" />}
                    {tpl.is_active ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. TAB: REGRAS (RULES) */}
      {activeTab === 'rules' && overview && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div>
              <h2 className="font-bold text-gray-900">Regras e Gatilhos de Automação</h2>
              <p className="text-xs text-gray-500">
                Defina qual modelo e canal são disparados para cada evento da plataforma
              </p>
            </div>
            <button
              onClick={() =>
                setEditingRule({
                  code: `rule_custom_${Date.now()}`,
                  name: '',
                  description: '',
                  event_type: 'order.created',
                  recipient_type: 'client',
                  channel: 'both',
                  template_code: overview.templates[0]?.code || 'client_welcome',
                  delay_minutes: 0,
                  max_attempts: 3,
                  allow_repeat: false,
                  is_active: true
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
            >
              <MdAdd className="text-lg" /> Nova Regra
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="p-4">Regra</th>
                    <th className="p-4">Evento Gatilho</th>
                    <th className="p-4">Destinatário</th>
                    <th className="p-4">Canal</th>
                    <th className="p-4">Modelo Vinculado</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {overview.rules.map((rule) => (
                    <tr key={rule.code}>
                      <td className="p-4">
                        <div className="font-bold text-gray-900">{rule.name}</div>
                        <div className="text-xs text-gray-500">{rule.description}</div>
                      </td>
                      <td className="p-4">
                        <code className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold">
                          {rule.event_type}
                        </code>
                      </td>
                      <td className="p-4 capitalize font-medium">
                        {rule.recipient_type === 'client'
                          ? 'Cliente'
                          : rule.recipient_type === 'provider'
                          ? 'Prestador'
                          : 'Ambos'}
                      </td>
                      <td className="p-4 uppercase text-xs font-bold">{rule.channel}</td>
                      <td className="p-4 text-xs text-gray-700 font-mono">{rule.template_code}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            rule.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {rule.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingRule(rule)}
                          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-semibold text-gray-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={async () => {
                            await toggleFestRuleActiveAction(rule.code);
                            loadData();
                          }}
                          className="px-3 py-1 bg-purple-50 hover:bg-purple-100 rounded-lg text-xs font-semibold text-purple-700"
                        >
                          {rule.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB: HISTÓRICO */}
      {activeTab === 'history' && overview && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Destinatário, e-mail ou telefone..."
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            />
            <select
              value={historyChannel}
              onChange={(e) => setHistoryChannel(e.target.value as any)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value="all">Todos os Canais</option>
              <option value="email">E-mail</option>
              <option value="whatsapp">WhatsApp</option>
            </select>
            <select
              value={historyStatus}
              onChange={(e) => setHistoryStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="sent">Enviado (Produção)</option>
              <option value="test_mode_logged">Modo de Teste</option>
              <option value="pending">Pendente</option>
              <option value="failed">Falha</option>
            </select>
            <select
              value={historyEventType}
              onChange={(e) => setHistoryEventType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value="all">Todos os Eventos</option>
              <option value="client.registered">Cadastro Cliente</option>
              <option value="provider.registered">Cadastro Prestador</option>
              <option value="service.created">Cadastro Serviço</option>
              <option value="budget.sent">Envio de Orçamento</option>
              <option value="order.created">Chegada de Pedido</option>
              <option value="order.waiting_payment">Pedido p/ Pagamento</option>
              <option value="payment.approved">Pagamento Confirmado</option>
              <option value="event.reminder">Lembrete de Agenda</option>
              <option value="event.completed">Avaliação Pós-Evento</option>
            </select>
            <select
              value={historyPeriodDays}
              onChange={(e) => setHistoryPeriodDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
            >
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
              <option value={365}>Último ano</option>
            </select>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {filteredQueueHistory.length === 0 ? (
              <p className="text-sm text-gray-500 py-10 text-center">
                Nenhum registro encontrado para os filtros selecionados.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                    <tr>
                      <th className="p-3">Data</th>
                      <th className="p-3">Destinatário</th>
                      <th className="p-3">Evento / Modelo</th>
                      <th className="p-3">Canal</th>
                      <th className="p-3">ID Provedor</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredQueueHistory.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3 text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="p-3">
                          <div className="font-semibold text-gray-900">{item.recipient_name}</div>
                          <div className="text-xs text-gray-500">
                            {item.channel === 'email' ? item.recipient_email : item.recipient_phone}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{item.event_type}</div>
                          <div className="text-xs text-gray-500">{item.template_code}</div>
                        </td>
                        <td className="p-3 uppercase text-xs font-bold">{item.channel}</td>
                        <td className="p-3 text-xs font-mono text-gray-500">
                          {item.provider_message_id || '-'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.status === 'sent'
                                ? 'bg-emerald-100 text-emerald-700'
                                : item.status === 'test_mode_logged'
                                ? 'bg-blue-100 text-blue-700'
                                : item.status === 'failed'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB: FALHAS E REPROCESSAMENTO */}
      {activeTab === 'failures' && overview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Controle de Falhas e Reprocessamento Seguro</h2>
              <p className="text-xs text-gray-500">
                Visualize o motivo da falha, próxima tentativa automática (backoff progressivo) ou reprocesse manualmente sem duplicidade.
              </p>
            </div>
          </div>

          {failedItems.length === 0 ? (
            <div className="text-center py-12 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <MdCheckCircle className="text-emerald-500 text-4xl mx-auto mb-2" />
              <p className="font-semibold text-emerald-900">Nenhuma notificação com falha no momento!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {failedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-red-200 bg-red-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold uppercase">
                        {item.channel}
                      </span>
                      <span className="font-bold text-gray-900">
                        {item.recipient_name} ({item.recipient_email || item.recipient_phone})
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Evento: <strong>{item.event_type}</strong> | Modelo: <strong>{item.template_code}</strong> | Tentativas:{' '}
                      <strong>
                        {item.attempts}/{item.max_attempts}
                      </strong>
                    </p>
                    <p className="text-xs text-red-700 font-medium mt-1">
                      Erro registrado: {item.last_error}
                    </p>
                    {item.next_retry_at && (
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Próxima retentativa automática: {new Date(item.next_retry_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRetryQueueItem(item.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold self-start sm:self-center"
                  >
                    <MdReplay className="text-base" />
                    Reprocessar Agora
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: CAMPANHAS SAZONAIS E RELACIONAMENTO */}
      {activeTab === 'campaigns' && overview && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Campanhas Sazonais, Pontos/Cupons, Inativos e FestPlus</h2>
              <p className="text-xs text-gray-500">
                Respeita automaticamente o período de vigência, público-alvo e o consentimento promocional (LGPD)
              </p>
            </div>
            <button
              onClick={() =>
                setEditingCampaign({
                  name: '',
                  description: '',
                  campaign_type: 'seasonality',
                  target_audience: 'all_clients',
                  channel: 'both',
                  template_code: 'client_campaign_seasonality',
                  start_date: new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z',
                  end_date: '2026-12-31T23:59:59.000Z',
                  status: 'scheduled',
                  custom_variables: { link_campanha: 'https://befest.vercel.app/servicos' }
                })
              }
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700"
            >
              <MdAdd className="text-lg" /> Nova Campanha
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {overview.campaigns.map((camp) => (
              <div
                key={camp.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-purple-100 text-purple-700 text-xs font-bold uppercase">
                      {camp.campaign_type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                      Status: {camp.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{camp.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{camp.description}</p>
                  <div className="mt-3 space-y-1 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl">
                    <div>
                      <strong>Público-alvo:</strong> {camp.target_audience}
                    </div>
                    <div>
                      <strong>Canal:</strong> {camp.channel.toUpperCase()} | <strong>Modelo:</strong> {camp.template_code}
                    </div>
                    <div>
                      <strong>Vigência:</strong> {new Date(camp.start_date).toLocaleDateString('pt-BR')} até{' '}
                      {new Date(camp.end_date).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <strong>Enviados:</strong> {camp.total_sent} (Elegíveis última execução: {camp.total_eligible})
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => setEditingCampaign(camp)}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                  >
                    Editar
                  </button>
                  <button
                    disabled={runningCampaignId === camp.id}
                    onClick={() => handleRunCampaign(camp.id, true)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
                  >
                    Simular Disparo (Teste)
                  </button>
                  <button
                    disabled={runningCampaignId === camp.id}
                    onClick={() => handleRunCampaign(camp.id, false)}
                    className="ml-auto px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Executar Campanha
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. TAB: CONFIGURAÇÕES E LGPD */}
      {activeTab === 'settings' && overview && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {overview.channelConfigs.map((cfg) => (
              <div key={cfg.channel} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">
                    Integração {cfg.channel === 'whatsapp' ? 'WhatsApp Business API' : 'E-mail (Resend)'}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cfg.has_credentials
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {cfg.has_credentials ? 'Credenciais Detectadas' : 'Sem Credenciais (Modo Teste)'}
                  </span>
                </div>

                <div className="text-xs text-gray-600 bg-gray-50 p-4 rounded-xl space-y-1">
                  <p>
                    <strong>Provedor:</strong> {cfg.provider_name}
                  </p>
                  <p>
                    <strong>Variáveis de ambiente esperadas (nunca expostas no código):</strong>
                  </p>
                  {cfg.channel === 'email' ? (
                    <ul className="list-disc list-inside text-gray-500">
                      <li>RESEND_API_KEY</li>
                      <li>RESEND_FROM_EMAIL</li>
                    </ul>
                  ) : (
                    <ul className="list-disc list-inside text-gray-500">
                      <li>WHATSAPP_ACCESS_TOKEN</li>
                      <li>WHATSAPP_PHONE_NUMBER_ID (ou WHATSAPP_API_URL)</li>
                      <li>WHATSAPP_USE_TEMPLATES (opcional: true/false)</li>
                    </ul>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="text-sm font-medium text-gray-700">Canal Habilitado</label>
                  <input
                    type="checkbox"
                    checked={cfg.is_enabled}
                    onChange={async (e) => {
                      await updateFestChannelConfigAction({
                        channel: cfg.channel,
                        is_enabled: e.target.checked,
                        test_mode: cfg.test_mode,
                        rate_limit_per_minute: cfg.rate_limit_per_minute
                      });
                      loadData();
                    }}
                    className="h-5 w-5 accent-purple-600"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    Forçar Modo de Teste (não envia mensagens reais)
                  </label>
                  <input
                    type="checkbox"
                    checked={cfg.test_mode}
                    onChange={async (e) => {
                      await updateFestChannelConfigAction({
                        channel: cfg.channel,
                        is_enabled: cfg.is_enabled,
                        test_mode: e.target.checked,
                        rate_limit_per_minute: cfg.rate_limit_per_minute
                      });
                      loadData();
                    }}
                    className="h-5 w-5 accent-purple-600"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-2">
              <MdShield className="text-purple-600 text-xl" />
              <h3 className="font-bold text-gray-900">Conformidade LGPD e Proteção de Dados</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1.5 list-disc list-inside">
              <li>Separação estrita entre mensagens <strong>operacionais</strong> (pedidos, agenda, pagamentos) e <strong>promocionais</strong> (campanhas, cupons, FestPlus).</li>
              <li>Endpoint de descadastro automático ativo em <code>/api/festmensages/unsubscribe</code> incluído no rodapé das comunicações promocionais.</li>
              <li>Sanitização automática de logs técnicos: chaves de API, tokens Bearer e senhas jamais são gravados no histórico.</li>
            </ul>
          </div>
        </div>
      )}

      {/* 8. TAB: TESTE DE MENSAGEM */}
      {activeTab === 'tester' && overview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-3xl space-y-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Ambiente Controlado de Teste de Mensagens</h2>
            <p className="text-xs text-gray-500">
              Valide interpolação de variáveis, layout e disparo de qualquer modelo antes de ativá-lo em produção.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Modelo de Mensagem</label>
              <select
                value={testTemplateCode}
                onChange={(e) => setTestTemplateCode(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
              >
                {overview.templates.map((t) => (
                  <option key={t.code} value={t.code}>
                    {t.name} ({t.recipient_type === 'client' ? 'Cliente' : 'Prestador'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Canal de Disparo</label>
              <select
                value={testChannel}
                onChange={(e) => setTestChannel(e.target.value as FestSingleChannel)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Destinatário</label>
              <input
                type="text"
                value={testRecipientName}
                onChange={(e) => setTestRecipientName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>

            {testChannel === 'email' ? (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">E-mail de Destino</label>
                <input
                  type="email"
                  value={testRecipientEmail}
                  onChange={(e) => setTestRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">WhatsApp de Destino</label>
                <input
                  type="text"
                  value={testRecipientPhone}
                  onChange={(e) => setTestRecipientPhone(e.target.value)}
                  placeholder="5521982809609"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 p-3 rounded-xl">
            <input
              type="checkbox"
              id="sandboxToggle"
              checked={testSandboxMode}
              onChange={(e) => setTestSandboxMode(e.target.checked)}
              className="h-4 w-4 accent-purple-600"
            />
            <label htmlFor="sandboxToggle" className="text-xs font-medium text-blue-900">
              Executar em <strong>Modo de Teste Controlado (Sandbox)</strong> — valida variáveis, gera prévia e registra no histórico como <code>test_mode_logged</code> sem enviar mensagem real ao destinatário.
            </label>
          </div>

          <button
            onClick={handleSendTest}
            disabled={sendingTest}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF4DA6] to-[#A502CA] text-white rounded-xl font-bold text-sm shadow-md hover:opacity-95 disabled:opacity-50"
          >
            <MdSend />
            {sendingTest ? 'Processando Teste...' : 'Executar Disparo de Teste'}
          </button>

          {lastTestOutput && (
            <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-purple-700">Resultado do Teste</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  Status: {lastTestOutput.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900">Assunto: {lastTestOutput.renderedSubject}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded-lg border border-gray-100">
                {lastTestOutput.renderedBodyText}
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODAL: EDITAR / CRIAR MODELO */}
      <AnimatePresence>
        {editingTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-bold text-gray-900">Configurar Modelo de Mensagem</h3>
                <button onClick={() => setEditingTemplate(null)}>
                  <MdClose className="text-xl text-gray-500" />
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Código Único</label>
                  <input
                    type="text"
                    value={editingTemplate.code || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    placeholder="ex: client_welcome"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome do Modelo</label>
                  <input
                    type="text"
                    value={editingTemplate.name || ''}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Destinatário</label>
                  <select
                    value={editingTemplate.recipient_type || 'client'}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        recipient_type: e.target.value as FestRecipientType
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="client">Cliente</option>
                    <option value="provider">Prestador</option>
                    <option value="both">Ambos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Canal</label>
                  <select
                    value={editingTemplate.channel || 'both'}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, channel: e.target.value as FestChannel })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="both">WhatsApp & E-mail</option>
                    <option value="whatsapp">Apenas WhatsApp</option>
                    <option value="email">Apenas E-mail</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Categoria (LGPD)</label>
                  <select
                    value={editingTemplate.category || 'operational'}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, category: e.target.value as FestCategory })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="operational">Operacional (Transacional)</option>
                    <option value="promotional">Promocional / Campanha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Template WhatsApp Aprovado (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingTemplate.whatsapp_template_name || ''}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, whatsapp_template_name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Assunto do E-mail</label>
                <input
                  type="text"
                  value={editingTemplate.subject || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Mensagem Texto / WhatsApp
                </label>
                <textarea
                  rows={4}
                  value={editingTemplate.body_text || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body_text: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Conteúdo HTML (E-mail)
                </label>
                <textarea
                  rows={5}
                  value={editingTemplate.body_html || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, body_html: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveTemplate}
                  disabled={savingTemplate}
                  className="flex items-center gap-1.5 px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  <MdSave /> {savingTemplate ? 'Salvando...' : 'Salvar Modelo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: PREVIEW MODELO */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-gray-900">Preview: {previewTemplate.name}</h3>
                <button onClick={() => setPreviewTemplate(null)}>
                  <MdClose className="text-xl text-gray-500" />
                </button>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Prévia WhatsApp / Texto:</p>
                <p className="text-sm text-gray-800">{previewTemplate.body_text}</p>
              </div>
              <div className="border rounded-xl p-4">
                <p className="text-xs font-bold text-purple-800 uppercase mb-2">
                  Assunto E-mail: {previewTemplate.subject}
                </p>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.body_html }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: EDITAR REGRA */}
      <AnimatePresence>
        {editingRule && overview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingRule(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-gray-900">Configurar Regra de Automação</h3>
                <button onClick={() => setEditingRule(null)}>
                  <MdClose className="text-xl text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Regra</label>
                  <input
                    type="text"
                    value={editingRule.name || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Evento Gatilho</label>
                  <input
                    type="text"
                    value={editingRule.event_type || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, event_type: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Destinatário</label>
                    <select
                      value={editingRule.recipient_type || 'client'}
                      onChange={(e) =>
                        setEditingRule({
                          ...editingRule,
                          recipient_type: e.target.value as FestRecipientType
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="client">Cliente</option>
                      <option value="provider">Prestador</option>
                      <option value="both">Ambos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Canal</label>
                    <select
                      value={editingRule.channel || 'both'}
                      onChange={(e) =>
                        setEditingRule({ ...editingRule, channel: e.target.value as FestChannel })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="both">WhatsApp & E-mail</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">E-mail</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Modelo de Mensagem</label>
                  <select
                    value={editingRule.template_code || ''}
                    onChange={(e) => setEditingRule({ ...editingRule, template_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {overview.templates.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name} ({t.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setEditingRule(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveRule}
                  disabled={savingRule}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  {savingRule ? 'Salvando...' : 'Salvar Regra'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: EDITAR CAMPANHA */}
      <AnimatePresence>
        {editingCampaign && overview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setEditingCampaign(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="font-bold text-gray-900">Configurar Campanha</h3>
                <button onClick={() => setEditingCampaign(null)}>
                  <MdClose className="text-xl text-gray-500" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nome da Campanha</label>
                  <input
                    type="text"
                    value={editingCampaign.name || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Público-Alvo</label>
                  <select
                    value={editingCampaign.target_audience || 'all_clients'}
                    onChange={(e) =>
                      setEditingCampaign({
                        ...editingCampaign,
                        target_audience: e.target.value as FestCampaign['target_audience']
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="all_clients">Todos os Clientes</option>
                    <option value="inactive_clients">Clientes Inativos</option>
                    <option value="all_providers">Todos os Prestadores</option>
                    <option value="inactive_providers">Prestadores Inativos</option>
                    <option value="festplus_eligible">Prestadores Elegíveis FestPlus</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Modelo de Mensagem</label>
                  <select
                    value={editingCampaign.template_code || ''}
                    onChange={(e) => setEditingCampaign({ ...editingCampaign, template_code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  >
                    {overview.templates.map((t) => (
                      <option key={t.code} value={t.code}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Início</label>
                    <input
                      type="date"
                      value={(editingCampaign.start_date || '').slice(0, 10)}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          start_date: `${e.target.value}T00:00:00.000Z`
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Término</label>
                    <input
                      type="date"
                      value={(editingCampaign.end_date || '').slice(0, 10)}
                      onChange={(e) =>
                        setEditingCampaign({
                          ...editingCampaign,
                          end_date: `${e.target.value}T23:59:59.000Z`
                        })
                      }
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveCampaign}
                  disabled={savingCampaign}
                  className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                >
                  {savingCampaign ? 'Salvando...' : 'Salvar Campanha'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
