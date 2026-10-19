import { FestTemplate, FestRule, FestCampaign, FestChannelConfig } from './types'

const NOW_ISO = '2026-01-01T00:00:00.000Z'

export const SUPPORTED_VARIABLES: { key: string; label: string; example: string }[] = [
  { key: 'nome', label: 'Nome do destinatário', example: 'Ana Souza' },
  { key: 'email', label: 'E-mail do destinatário', example: 'ana@exemplo.com.br' },
  { key: 'nome_cliente', label: 'Nome do cliente', example: 'Ana Souza' },
  { key: 'nome_prestador', label: 'Nome do prestador', example: 'Buffet Estrela' },
  { key: 'numero_pedido', label: 'Número do pedido', example: '#BF-8492' },
  { key: 'servico_contratado', label: 'Serviço contratado', example: 'Churrasco Premium Completo' },
  { key: 'data_evento', label: 'Data do evento', example: '25/11/2026' },
  { key: 'horario_evento', label: 'Horário do evento', example: '19:00' },
  { key: 'local_evento', label: 'Local do evento', example: ' Barra da Tijuca, Rio de Janeiro - RJ' },
  { key: 'valor_pedido', label: 'Valor do pedido', example: 'R$ 4.850,00' },
  { key: 'status_pagamento', label: 'Status do pagamento', example: 'Aprovado' },
  { key: 'data_cadastro', label: 'Data de cadastro', example: '19/10/2026' },
  { key: 'link_agenda', label: 'Link para confirmar a agenda', example: 'https://befest.vercel.app/dashboard/prestador' },
  { key: 'link_pedido', label: 'Link para consultar o pedido', example: 'https://befest.vercel.app/perfil' },
  { key: 'link_pagamento', label: 'Link para pagamento', example: 'https://befest.vercel.app/pagamento' },
  { key: 'link_avaliacao', label: 'Link para realizar avaliação', example: 'https://befest.vercel.app/perfil?avaliar=true' },
  { key: 'link_campanha', label: 'Link para acessar cupons ou campanhas', example: 'https://befest.vercel.app/servicos' },
  { key: 'link_descadastro', label: 'Link de descadastro (LGPD)', example: 'https://befest.vercel.app/api/festmensages/unsubscribe' }
]

export const DEFAULT_TEMPLATES: FestTemplate[] = [
  // =========================================================================
  // 3.1. NOTIFICAÇÕES PARA CLIENTES — POR OCASIÃO
  // =========================================================================
  {
    id: 'tpl-client-welcome',
    code: 'client_welcome',
    name: '1. Cadastro do Cliente (Boas-vindas)',
    description: 'Boas-vindas e orientações iniciais após o cadastro do cliente na Be Fest.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Bem-vindo(a) à Be Fest, {{nome}}! 🎉 Comece a planejar sua festa',
    body_text:
      'Olá, {{nome}}! Seja muito bem-vindo(a) à Be Fest! Aqui você encontra os melhores fornecedores, cardápios e serviços para tornar sua festa inesquecível. Acesse sua conta para montar seu evento: {{link_pedido}}',
    body_html:
      '<h2>Olá, {{nome}}! 🎉</h2><p>Seja muito bem-vindo(a) à <strong>Be Fest</strong>!</p><p>Agora você pode explorar cardápios, comparar preços por número de convidados e contratar os melhores prestadores com segurança.</p><p><a href="{{link_pedido}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Explorar Serviços na Be Fest</a></p>',
    whatsapp_template_name: 'befest_client_welcome',
    required_variables: ['nome', 'link_pedido'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-budget-sent',
    code: 'client_budget_sent',
    name: '2. Envio de Orçamento ao Cliente',
    description: 'Aviso ao cliente de que um orçamento de festa foi enviado e está disponível.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Seu orçamento com {{nome_prestador}} está disponível na Be Fest!',
    body_text:
      'Olá, {{nome}}! O prestador {{nome_prestador}} enviou um orçamento para o seu evento previsto para {{data_evento}}, às {{horario_evento}}. Valor estimado: {{valor_pedido}}. Confira os detalhes e garanta sua reserva: {{link_pagamento}}',
    body_html:
      '<h2>Olá, {{nome}}! 📋</h2><p>O prestador <strong>{{nome_prestador}}</strong> preparou um orçamento para o seu evento.</p><ul><li><strong>Data do evento:</strong> {{data_evento}} às {{horario_evento}}</li><li><strong>Serviços:</strong> {{servico_contratado}}</li><li><strong>Valor total:</strong> {{valor_pedido}}</li></ul><p><a href="{{link_pagamento}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Visualizar Proposta e Garantir Reserva</a></p>',
    whatsapp_template_name: 'befest_client_budget_available',
    required_variables: ['nome', 'nome_prestador', 'data_evento', 'valor_pedido', 'link_pagamento'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-order-created',
    code: 'client_order_pending_agenda',
    name: '3. Chegada de Pedido (Pendente na Agenda - Cliente)',
    description: 'Aviso ao cliente de que seu pedido foi enviado e aguarda confirmação na agenda do prestador.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Pedido {{numero_pedido}} recebido! Aguardando confirmação na agenda',
    body_text:
      'Olá, {{nome}}! Recebemos sua solicitação do serviço "{{servico_contratado}}" com {{nome_prestador}} para o dia {{data_evento}}. Seu pedido ({{numero_pedido}}) está pendente de confirmação na agenda do prestador. Acompanhe em: {{link_pedido}}',
    body_html:
      '<h2>Pedido {{numero_pedido}} registrado! 🗓️</h2><p>Olá, <strong>{{nome}}</strong>! Sua solicitação para contratar <strong>{{servico_contratado}}</strong> ({{nome_prestador}}) foi enviada.</p><p>No momento, o pedido está <strong>pendente de confirmação de disponibilidade na agenda</strong> do prestador para o dia <strong>{{data_evento}}</strong>.</p><p><a href="{{link_pedido}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Acompanhar Meu Pedido</a></p>',
    whatsapp_template_name: 'befest_client_order_pending',
    required_variables: ['nome', 'numero_pedido', 'servico_contratado', 'nome_prestador', 'data_evento', 'link_pedido'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-payment-instructions',
    code: 'client_order_payment_instructions',
    name: '4. Pagamento do Pedido (Instruções ao Cliente)',
    description: 'Enviado quando o prestador confirma disponibilidade na agenda e libera o pedido para pagamento.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Agenda confirmada! Realize o pagamento do pedido {{numero_pedido}}',
    body_text:
      'Ótima notícia, {{nome}}! {{nome_prestador}} confirmou disponibilidade na agenda para "{{servico_contratado}}" em {{data_evento}}. Valor: {{valor_pedido}}. Acesse o link abaixo para concluir o pagamento e garantir sua reserva: {{link_pagamento}}',
    body_html:
      '<h2>Disponibilidade Confirmada! 💳</h2><p>Olá, <strong>{{nome}}</strong>! O prestador <strong>{{nome_prestador}}</strong> aprovou sua solicitação para o serviço <strong>{{servico_contratado}}</strong>.</p><ul><li><strong>Pedido:</strong> {{numero_pedido}}</li><li><strong>Data do Evento:</strong> {{data_evento}}</li><li><strong>Valor:</strong> {{valor_pedido}}</li></ul><p>Para confirmar definitivamente a contratação na agenda, realize o pagamento clicando abaixo:</p><p><a href="{{link_pagamento}}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Pagar Agora com Segurança</a></p>',
    whatsapp_template_name: 'befest_client_payment_instructions',
    required_variables: ['nome', 'nome_prestador', 'servico_contratado', 'data_evento', 'valor_pedido', 'link_pagamento'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-payment-approved',
    code: 'client_payment_approved',
    name: '5. Pagamento Realizado (Confirmação ao Cliente)',
    description: 'Confirmação enviada exclusivamente após o pagamento ser efetivamente aprovado.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Pagamento Aprovado! ✅ Sua reserva {{numero_pedido}} está garantida',
    body_text:
      'Olá, {{nome}}! Confirmamos o pagamento do seu pedido {{numero_pedido}} ({{servico_contratado}} com {{nome_prestador}}) no valor de {{valor_pedido}}. O chat com o prestador já está liberado na sua conta: {{link_pedido}}',
    body_html:
      '<h2>Pagamento Confirmado! ✅</h2><p>Olá, <strong>{{nome}}</strong>! O pagamento do pedido <strong>{{numero_pedido}}</strong> foi aprovado com sucesso.</p><ul><li><strong>Serviço:</strong> {{servico_contratado}}</li><li><strong>Prestador:</strong> {{nome_prestador}}</li><li><strong>Data do Evento:</strong> {{data_evento}}</li><li><strong>Valor Pago:</strong> {{valor_pedido}}</li><li><strong>Status:</strong> {{status_pagamento}}</li></ul><p>O chat direto com o prestador já está liberado no seu painel!</p><p><a href="{{link_pedido}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Acessar Meu Evento e Chat</a></p>',
    whatsapp_template_name: 'befest_client_payment_approved',
    required_variables: ['nome', 'numero_pedido', 'servico_contratado', 'nome_prestador', 'data_evento', 'valor_pedido', 'status_pagamento', 'link_pedido'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-event-reminder',
    code: 'client_event_reminder',
    name: '6. Lembrete de Agenda (Cliente)',
    description: 'Lembrete automático enviado ao cliente antes da data do evento.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Lembrete Be Fest: Seu evento é em {{data_evento}}! 🎈',
    body_text:
      'Olá, {{nome}}! Está chegando a hora! Lembrete do seu evento na Be Fest programado para {{data_evento}}, às {{horario_evento}}, com o serviço "{{servico_contratado}}" ({{nome_prestador}}). Consulte os detalhes em: {{link_pedido}}',
    body_html:
      '<h2>Sua festa está chegando! 🎈</h2><p>Olá, <strong>{{nome}}</strong>! Este é um lembrete do seu evento confirmado na Be Fest:</p><ul><li><strong>Serviço:</strong> {{servico_contratado}}</li><li><strong>Prestador:</strong> {{nome_prestador}}</li><li><strong>Data e Horário:</strong> {{data_evento}} às {{horario_evento}}</li></ul><p><a href="{{link_pedido}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Ver Detalhes do Evento</a></p>',
    whatsapp_template_name: 'befest_client_event_reminder',
    required_variables: ['nome', 'data_evento', 'horario_evento', 'servico_contratado', 'nome_prestador', 'link_pedido'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-post-event',
    code: 'client_post_event_evaluation',
    name: '7. Avaliação Pós-Evento (Cliente)',
    description: 'Solicitação de avaliação enviada ao cliente após a realização do evento.',
    category: 'operational',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Como foi sua festa, {{nome}}? Avalie o serviço de {{nome_prestador}} ⭐',
    body_text:
      'Olá, {{nome}}! Esperamos que seu evento em {{data_evento}} tenha sido incrível! Conte para nós como foi sua experiência com "{{servico_contratado}}" ({{nome_prestador}}) clicando no link: {{link_avaliacao}}',
    body_html:
      '<h2>Como foi sua festa? ⭐</h2><p>Olá, <strong>{{nome}}</strong>! Esperamos que o seu evento em <strong>{{data_evento}}</strong> tenha sido inesquecível.</p><p>Sua opinião ajuda outros clientes e valoriza os melhores profissionais da Be Fest. Avalie o serviço <strong>{{servico_contratado}}</strong> prestado por <strong>{{nome_prestador}}</strong>:</p><p><a href="{{link_avaliacao}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Avaliar Serviço Agora</a></p>',
    whatsapp_template_name: 'befest_client_post_evaluation',
    required_variables: ['nome', 'data_evento', 'servico_contratado', 'nome_prestador', 'link_avaliacao'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },

  // =========================================================================
  // 3.2. NOTIFICAÇÕES PARA CLIENTES — SAZONALIDADE E RELACIONAMENTO
  // =========================================================================
  {
    id: 'tpl-client-seasonality',
    code: 'client_campaign_seasonality',
    name: 'Campanha Cliente: Sazonalidade Be Fest',
    description: 'Avisos de datas comemorativas e temporadas de festas na Be Fest.',
    category: 'promotional',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Temporada de Festas na Be Fest, {{nome}}! Garanta sua data 🎉',
    body_text:
      'Olá, {{nome}}! A temporada de festas chegou na Be Fest! Antecipe a reserva dos melhores buffets e serviços para sua próxima comemoração: {{link_campanha}}',
    body_html:
      '<h2>Temporada Especial na Be Fest! 🎉</h2><p>Olá, <strong>{{nome}}</strong>! As datas mais disputadas do ano já estão abertas na Be Fest.</p><p>Garanta os melhores cardápios e fornecedores com antecedência:</p><p><a href="{{link_campanha}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Conferir Fornecedores Disponíveis</a></p>',
    whatsapp_template_name: 'befest_client_seasonality',
    required_variables: ['nome', 'link_campanha'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-points-coupons',
    code: 'client_campaign_points_coupons',
    name: 'Campanha Cliente: Ofertas de Pontos e Cupons',
    description: 'Envio de ofertas especiais, pontos e cupons para clientes elegíveis.',
    category: 'promotional',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Presente para você, {{nome}}! 🎁 Cupom e benefícios exclusivos na Be Fest',
    body_text:
      'Olá, {{nome}}! Você tem vantagens especiais esperando por você na Be Fest! Aproveite nossas ofertas e cupons para sua próxima festa: {{link_campanha}}',
    body_html:
      '<h2>Benefícios Exclusivos para Você! 🎁</h2><p>Olá, <strong>{{nome}}</strong>! Preparamos condições especiais e benefícios para você realizar seu próximo evento com a Be Fest.</p><p><a href="{{link_campanha}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Resgatar Benefícios</a></p>',
    whatsapp_template_name: 'befest_client_coupons',
    required_variables: ['nome', 'link_campanha'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-client-inactive',
    code: 'client_campaign_inactive',
    name: 'Campanha Cliente: Reativação de Clientes Inativos',
    description: 'Campanha voltada para clientes sem novos eventos há mais de X dias.',
    category: 'promotional',
    recipient_type: 'client',
    channel: 'both',
    subject: 'Sentimos sua falta, {{nome}}! Veja as novidades da Be Fest 💜',
    body_text:
      'Olá, {{nome}}! Faz tempo que não planejamos uma festa juntos! Novos prestadores e cardápios incríveis chegaram na Be Fest. Venha conferir: {{link_campanha}}',
    body_html:
      '<h2>Sentimos sua falta, {{nome}}! 💜</h2><p>Novos fornecedores e cardápios completos chegaram à Be Fest para facilitar sua próxima comemoração.</p><p><a href="{{link_campanha}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Ver Novidades da Be Fest</a></p>',
    whatsapp_template_name: 'befest_client_reactivation',
    required_variables: ['nome', 'link_campanha'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },

  // =========================================================================
  // 4.1. NOTIFICAÇÕES PARA PRESTADORES — POR OCASIÃO
  // =========================================================================
  {
    id: 'tpl-provider-welcome',
    code: 'provider_welcome',
    name: '1. Cadastro do Prestador (Boas-vindas)',
    description: 'Boas-vindas e orientações iniciais após o cadastro do prestador.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Bem-vindo(a) à Be Fest, {{nome}}! 🚀 Configure seus serviços',
    body_text:
      'Olá, {{nome}}! Parabéns pelo seu cadastro como parceiro na Be Fest! Acesse seu Painel do Prestador para cadastrar seus cardápios, faixas de convidados e começar a receber pedidos: {{link_agenda}}',
    body_html:
      '<h2>Bem-vindo(a) como Parceiro Be Fest, {{nome}}! 🚀</h2><p>Sua conta de prestador foi criada com sucesso.</p><p><strong>Próximos passos recomendados:</strong></p><ol><li>Cadastre seus serviços e cardápios com fotos atraentes;</li><li>Configure as faixas de preço por número de convidados;</li><li>Mantenha sua agenda atualizada para receber pedidos.</li></ol><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Acessar Painel do Prestador</a></p>',
    whatsapp_template_name: 'befest_provider_welcome',
    required_variables: ['nome', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-service-created',
    code: 'provider_service_created',
    name: '2. Cadastro de Serviços (Confirmação ao Prestador)',
    description: 'Confirmação e orientação enviada ao prestador quando um novo serviço/cardápio é cadastrado.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Serviço "{{servico_contratado}}" cadastrado com sucesso na Be Fest!',
    body_text:
      'Olá, {{nome}}! Seu serviço "{{servico_contratado}}" foi cadastrado e já está ativo na Be Fest. Você pode gerenciar preços por faixa de convidados ou criar orçamentos no seu painel: {{link_agenda}}',
    body_html:
      '<h2>Serviço Cadastrado com Sucesso! ✨</h2><p>Olá, <strong>{{nome}}</strong>! O serviço <strong>{{servico_contratado}}</strong> já está registrado na plataforma Be Fest.</p><p>Lembre-se de manter as faixas de convidados e fotos sempre atualizadas para aumentar suas conversões.</p><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Gerenciar Meus Serviços</a></p>',
    whatsapp_template_name: 'befest_provider_service_created',
    required_variables: ['nome', 'servico_contratado', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-budget-sent',
    code: 'provider_budget_sent',
    name: '3. Envio de Orçamento (Confirmação ao Prestador)',
    description: 'Aviso ao prestador confirmando a geração/envio de um orçamento para cliente.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Orçamento para {{nome_cliente}} gerado e enviado ({{data_evento}})',
    body_text:
      'Olá, {{nome}}! O orçamento para o cliente {{nome_cliente}} (evento em {{data_evento}}, às {{horario_evento}}, no valor de {{valor_pedido}}) foi registrado como enviado. Acompanhe no painel: {{link_agenda}}',
    body_html:
      '<h2>Orçamento Registrado! 📄</h2><p>Olá, <strong>{{nome}}</strong>! Sua proposta comercial foi gerada e marcada como enviada:</p><ul><li><strong>Cliente:</strong> {{nome_cliente}}</li><li><strong>Data do Evento:</strong> {{data_evento}} às {{horario_evento}}</li><li><strong>Serviços:</strong> {{servico_contratado}}</li><li><strong>Valor Total:</strong> {{valor_pedido}}</li></ul><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Ver Histórico de Orçamentos</a></p>',
    whatsapp_template_name: 'befest_provider_budget_sent',
    required_variables: ['nome', 'nome_cliente', 'data_evento', 'valor_pedido', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-order-arrived',
    code: 'provider_order_arrived',
    name: '4. Chegada de Pedido (Confirmação na Agenda - Prestador)',
    description: 'Aviso ao prestador sobre novo pedido pendente de confirmação na agenda.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: '🔔 Novo pedido na Be Fest! Confirme sua disponibilidade para {{data_evento}}',
    body_text:
      'Olá, {{nome}}! Você recebeu um novo pedido na Be Fest. O evento está previsto para {{data_evento}}, às {{horario_evento}}. Acesse sua conta para consultar os detalhes e confirmar sua disponibilidade: {{link_pedido}}',
    body_html:
      '<h2>Novo Pedido Recebido! 🔔</h2><p>Olá, <strong>{{nome}}</strong>! Você recebeu um novo pedido na Be Fest.</p><ul><li><strong>Pedido:</strong> {{numero_pedido}}</li><li><strong>Cliente:</strong> {{nome_cliente}}</li><li><strong>Serviço:</strong> {{servico_contratado}}</li><li><strong>Data e Horário:</strong> {{data_evento}} às {{horario_evento}}</li><li><strong>Valor Estimado:</strong> {{valor_pedido}}</li></ul><p>Acesse sua conta para consultar os detalhes e confirmar sua disponibilidade na agenda:</p><p><a href="{{link_pedido}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Confirmar Disponibilidade na Agenda</a></p>',
    whatsapp_template_name: 'befest_provider_new_order',
    required_variables: ['nome', 'data_evento', 'horario_evento', 'link_pedido'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-order-waiting-payment',
    code: 'provider_order_waiting_payment',
    name: '5. Pedido Liberado para Pagamento (Prestador)',
    description: 'Informações ao prestador quando o pedido entra na etapa de pagamento pelo cliente.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Pedido {{numero_pedido}} aguardando pagamento do cliente',
    body_text:
      'Olá, {{nome}}! Você confirmou a disponibilidade para o pedido {{numero_pedido}} ({{servico_contratado}} em {{data_evento}}). O cliente {{nome_cliente}} já recebeu as instruções de pagamento ({{valor_pedido}}). Você será notificado assim que o pagamento for confirmado! Painel: {{link_agenda}}',
    body_html:
      '<h2>Etapa de Pagamento Iniciada ⏳</h2><p>Olá, <strong>{{nome}}</strong>! A disponibilidade para o pedido <strong>{{numero_pedido}}</strong> foi confirmada.</p><p>O cliente <strong>{{nome_cliente}}</strong> já foi notificado para realizar o pagamento do serviço <strong>{{servico_contratado}}</strong> ({{valor_pedido}}). Assim que o pagamento for efetivamente identificado, avisaremos você e liberaremos o chat.</p><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Acompanhar no Painel</a></p>',
    whatsapp_template_name: 'befest_provider_waiting_payment',
    required_variables: ['nome', 'numero_pedido', 'servico_contratado', 'data_evento', 'nome_cliente', 'valor_pedido', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-installment-1',
    code: 'provider_payment_installment_1',
    name: '6. Pagamento da 1ª Parcela / Confirmação (Prestador)',
    description: 'Enviado ao prestador exclusivamente quando a primeira parcela ou pagamento integral é confirmado.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: '💰 Pagamento Confirmado (1ª Parcela / Reserva) — Pedido {{numero_pedido}}',
    body_text:
      'Olá, {{nome}}! O pagamento da 1ª parcela/reserva do pedido {{numero_pedido}} ({{servico_contratado}} para {{nome_cliente}} em {{data_evento}}) foi confirmado! Valor: {{valor_pedido}}. O evento está garantido na sua agenda e o chat com o cliente está liberado: {{link_agenda}}',
    body_html:
      '<h2>Pagamento Identificado! 💰</h2><p>Olá, <strong>{{nome}}</strong>! Confirmamos o pagamento referente ao pedido <strong>{{numero_pedido}}</strong>:</p><ul><li><strong>Cliente:</strong> {{nome_cliente}}</li><li><strong>Serviço:</strong> {{servico_contratado}}</li><li><strong>Data do Evento:</strong> {{data_evento}} às {{horario_evento}}</li><li><strong>Valor Confirmado:</strong> {{valor_pedido}}</li><li><strong>Status:</strong> {{status_pagamento}}</li></ul><p>O chat direto com o cliente já está disponível no seu painel!</p><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Acessar Pedido e Chat</a></p>',
    whatsapp_template_name: 'befest_provider_installment_1_paid',
    required_variables: ['nome', 'numero_pedido', 'servico_contratado', 'nome_cliente', 'data_evento', 'valor_pedido', 'status_pagamento', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-event-reminder',
    code: 'provider_event_reminder',
    name: '7. Lembrete de Agenda (Prestador)',
    description: 'Lembrete do evento contratado enviado ao prestador antes da realização.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Lembrete de Agenda Be Fest: Evento em {{data_evento}} ({{servico_contratado}})',
    body_text:
      'Olá, {{nome}}! Lembrete da sua agenda Be Fest: você tem o evento de {{nome_cliente}} programado para {{data_evento}}, às {{horario_evento}} (Serviço: {{servico_contratado}}). Confira os detalhes em: {{link_agenda}}',
    body_html:
      '<h2>Lembrete de Evento na Agenda 📅</h2><p>Olá, <strong>{{nome}}</strong>! Confira os dados do seu próximo evento confirmado pela Be Fest:</p><ul><li><strong>Cliente:</strong> {{nome_cliente}}</li><li><strong>Serviço:</strong> {{servico_contratado}}</li><li><strong>Data e Horário:</strong> {{data_evento}} às {{horario_evento}}</li><li><strong>Local:</strong> {{local_evento}}</li></ul><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Ver Minha Agenda</a></p>',
    whatsapp_template_name: 'befest_provider_event_reminder',
    required_variables: ['nome', 'nome_cliente', 'data_evento', 'horario_evento', 'servico_contratado', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-installment-2',
    code: 'provider_payment_installment_2',
    name: '8. Pagamento da 2ª Parcela (Prestador)',
    description: 'Enviado ao prestador exclusivamente quando a segunda parcela do pedido é confirmada como paga.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: '✅ Pagamento da 2ª Parcela Confirmado — Pedido {{numero_pedido}}',
    body_text:
      'Olá, {{nome}}! A 2ª parcela do pedido {{numero_pedido}} ({{servico_contratado}} - {{nome_cliente}}) no valor de {{valor_pedido}} foi identificada como paga! Consulte seu painel: {{link_agenda}}',
    body_html:
      '<h2>2ª Parcela Confirmada! ✅</h2><p>Olá, <strong>{{nome}}</strong>! O pagamento da segunda parcela do pedido <strong>{{numero_pedido}}</strong> foi efetivamente aprovado.</p><ul><li><strong>Cliente:</strong> {{nome_cliente}}</li><li><strong>Serviço:</strong> {{servico_contratado}}</li><li><strong>Valor:</strong> {{valor_pedido}}</li><li><strong>Status:</strong> {{status_pagamento}}</li></ul><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#10b981;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Consultar no Painel</a></p>',
    whatsapp_template_name: 'befest_provider_installment_2_paid',
    required_variables: ['nome', 'numero_pedido', 'servico_contratado', 'nome_cliente', 'valor_pedido', 'status_pagamento', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-post-event',
    code: 'provider_post_event_evaluation',
    name: '9. Avaliação Pós-Evento (Prestador)',
    description: 'Aviso ao prestador sobre conclusão do evento e processo de avaliação do serviço.',
    category: 'operational',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Evento concluído! Veja o status de avaliação do pedido {{numero_pedido}} ⭐',
    body_text:
      'Olá, {{nome}}! O evento de {{nome_cliente}} ({{servico_contratado}} em {{data_evento}}) foi marcado como concluído na Be Fest. Já solicitamos a avaliação ao cliente e você pode acompanhar o resultado no seu painel: {{link_agenda}}',
    body_html:
      '<h2>Evento Concluído com Sucesso! ⭐</h2><p>Olá, <strong>{{nome}}</strong>! O serviço <strong>{{servico_contratado}}</strong> realizado em <strong>{{data_evento}}</strong> para <strong>{{nome_cliente}}</strong> foi concluído.</p><p>Enviamos o convite de avaliação para o cliente. Acompanhe seu desempenho no painel:</p><p><a href="{{link_agenda}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Acessar Meu Painel</a></p>',
    whatsapp_template_name: 'befest_provider_post_evaluation',
    required_variables: ['nome', 'nome_cliente', 'servico_contratado', 'data_evento', 'link_agenda'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },

  // =========================================================================
  // 4.2. NOTIFICAÇÕES PARA PRESTADORES — SAZONALIDADE E RELACIONAMENTO
  // =========================================================================
  {
    id: 'tpl-provider-campaign-participation',
    code: 'provider_campaign_participation',
    name: 'Campanha Prestador: Participação em Campanhas e Sazonalidade',
    description: 'Convite para prestadores participarem de campanhas oficiais e datas sazonais da Be Fest.',
    category: 'promotional',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Destaque seus serviços na próxima Campanha Sazonal da Be Fest, {{nome}}! 🚀',
    body_text:
      'Olá, {{nome}}! Estamos preparando uma nova campanha sazonal na Be Fest. Atualize seus cardápios e condições para receber ainda mais clientes: {{link_campanha}}',
    body_html:
      '<h2>Participe da Campanha Oficial Be Fest! 🚀</h2><p>Olá, <strong>{{nome}}</strong>! A alta temporada de eventos está chegando. Atualize seus cardápios e participe da nossa vitrine especial:</p><p><a href="{{link_campanha}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Participar da Campanha</a></p>',
    whatsapp_template_name: 'befest_provider_campaign',
    required_variables: ['nome', 'link_campanha'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-festplus',
    code: 'provider_campaign_festplus',
    name: 'Campanha Prestador: Oportunidades FestPlus',
    description: 'Ofertas e oportunidades exclusivas relacionadas ao programa FestPlus para prestadores.',
    category: 'promotional',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Conheça as oportunidades do FestPlus para alavancar suas vendas, {{nome}}! 💎',
    body_text:
      'Olá, {{nome}}! Quer alcançar mais clientes e ter destaque exclusivo na Be Fest? Confira as oportunidades do programa FestPlus disponíveis para o seu perfil: {{link_campanha}}',
    body_html:
      '<h2>Impulsione seus Eventos com o FestPlus! 💎</h2><p>Olá, <strong>{{nome}}</strong>! O <strong>FestPlus</strong> traz benefícios exclusivos de visibilidade e gestão para parceiros da Be Fest.</p><p><a href="{{link_campanha}}" style="display:inline-block;padding:12px 24px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Conhecer Oportunidades FestPlus</a></p>',
    whatsapp_template_name: 'befest_provider_festplus',
    required_variables: ['nome', 'link_campanha'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'tpl-provider-inactive',
    code: 'provider_campaign_inactive',
    name: 'Campanha Prestador: Reativação de Prestadores Inativos',
    description: 'Campanha para prestadores sem serviços ativos ou sem movimentação recente.',
    category: 'promotional',
    recipient_type: 'provider',
    channel: 'both',
    subject: 'Clientes estão procurando seus serviços na Be Fest, {{nome}}! 🔔',
    body_text:
      'Olá, {{nome}}! Há clientes buscando serviços na sua região na Be Fest. Revise seus cardápios e reative sua agenda para receber novos pedidos: {{link_campanha}}',
    body_html:
      '<h2>Volte a Receber Pedidos na Be Fest! 🔔</h2><p>Olá, <strong>{{nome}}</strong>! Notamos que seu perfil está sem movimentação recente. Clientes da sua região estão buscando fornecedores agora mesmo.</p><p><a href="{{link_campanha}}" style="display:inline-block;padding:12px 24px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Atualizar Meus Serviços</a></p>',
    whatsapp_template_name: 'befest_provider_reactivation',
    required_variables: ['nome', 'link_campanha'],
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  }
]

export const DEFAULT_RULES: FestRule[] = [
  // Clientes
  {
    id: 'rule-client-registered',
    code: 'rule_client_registered',
    name: 'Boas-vindas ao Cliente no Cadastro',
    description: 'Dispara e-mail e WhatsApp imediatamente quando um novo cliente se cadastra.',
    event_type: 'client.registered',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_welcome',
    delay_minutes: 0,
    conditions: { only_role: 'client' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-client-budget-sent',
    code: 'rule_client_budget_sent',
    name: 'Aviso de Orçamento Disponível (Cliente)',
    description: 'Notifica o cliente quando um orçamento é enviado.',
    event_type: 'budget.sent',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_budget_sent',
    delay_minutes: 0,
    conditions: { only_role: 'client' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-client-order-created',
    code: 'rule_client_order_created',
    name: 'Pedido Pendente de Confirmação na Agenda (Cliente)',
    description: 'Notifica o cliente assim que ele solicita um serviço para sua festa.',
    event_type: 'order.created',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_order_pending_agenda',
    delay_minutes: 0,
    conditions: { only_role: 'client' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-client-waiting-payment',
    code: 'rule_client_waiting_payment',
    name: 'Instruções de Pagamento do Pedido (Cliente)',
    description: 'Envia link e instruções de pagamento quando o prestador confirma a agenda.',
    event_type: 'order.waiting_payment',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_order_payment_instructions',
    delay_minutes: 0,
    conditions: { only_role: 'client' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-client-payment-approved',
    code: 'rule_client_payment_approved',
    name: 'Confirmação de Pagamento Aprovado (Cliente)',
    description: 'Envia confirmação somente após aprovação oficial do pagamento.',
    event_type: 'payment.approved',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_payment_approved',
    delay_minutes: 0,
    conditions: {
      only_role: 'client',
      require_approved_payment: true,
      allowed_payment_statuses: ['approved', 'paid', 'installment_1_paid', 'installment_2_paid']
    },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-client-event-reminder',
    code: 'rule_client_event_reminder',
    name: 'Lembrete de Agenda 48h Antes (Cliente)',
    description: 'Envia lembrete automático 2 dias antes da data do evento.',
    event_type: 'event.reminder',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_event_reminder',
    delay_minutes: 0,
    conditions: { only_role: 'client', days_before_event: 2 },
    allow_repeat: false,
    cooldown_hours: 48,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-client-post-evaluation',
    code: 'rule_client_post_evaluation',
    name: 'Solicitação de Avaliação Pós-Evento (Cliente)',
    description: 'Solicita avaliação do serviço após a conclusão do evento.',
    event_type: 'event.completed',
    recipient_type: 'client',
    channel: 'both',
    template_code: 'client_post_event_evaluation',
    delay_minutes: 0,
    conditions: { only_role: 'client', days_after_event: 1 },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },

  // Prestadores
  {
    id: 'rule-provider-registered',
    code: 'rule_provider_registered',
    name: 'Boas-vindas ao Prestador no Cadastro',
    description: 'Dispara e-mail e WhatsApp com orientações iniciais ao novo prestador.',
    event_type: 'provider.registered',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_welcome',
    delay_minutes: 0,
    conditions: { only_role: 'provider' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-service-created',
    code: 'rule_provider_service_created',
    name: 'Confirmação de Cadastro de Serviço (Exclusivo Prestador)',
    description: 'Confirma ao prestador o cadastro de um novo serviço/cardápio.',
    event_type: 'service.created',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_service_created',
    delay_minutes: 0,
    conditions: { only_role: 'provider' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-budget-sent',
    code: 'rule_provider_budget_sent',
    name: 'Confirmação de Envio de Orçamento (Prestador)',
    description: 'Registra e confirma ao prestador o envio de um orçamento.',
    event_type: 'budget.sent',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_budget_sent',
    delay_minutes: 0,
    conditions: { only_role: 'provider' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-order-created',
    code: 'rule_provider_order_created',
    name: 'Chegada de Novo Pedido na Agenda (Prestador)',
    description: 'Notifica o prestador para confirmar disponibilidade na agenda.',
    event_type: 'order.created',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_order_arrived',
    delay_minutes: 0,
    conditions: { only_role: 'provider' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-waiting-payment',
    code: 'rule_provider_waiting_payment',
    name: 'Pedido Encaminhado para Pagamento (Prestador)',
    description: 'Informa o prestador que o pedido aguarda pagamento do cliente.',
    event_type: 'order.waiting_payment',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_order_waiting_payment',
    delay_minutes: 0,
    conditions: { only_role: 'provider' },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-payment-installment-1',
    code: 'rule_provider_payment_installment_1',
    name: 'Pagamento da 1ª Parcela / Reserva Confirmado (Prestador)',
    description: 'Notifica o prestador quando a 1ª parcela ou pagamento integral é aprovado.',
    event_type: 'payment.approved',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_payment_installment_1',
    delay_minutes: 0,
    conditions: {
      only_role: 'provider',
      require_approved_payment: true,
      allowed_payment_statuses: ['approved', 'paid', 'installment_1_paid']
    },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-payment-installment-2',
    code: 'rule_provider_payment_installment_2',
    name: 'Pagamento da 2ª Parcela Confirmado (Prestador)',
    description: 'Notifica o prestador exclusivamente quando a 2ª parcela é confirmada como paga.',
    event_type: 'payment.installment_2_paid',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_payment_installment_2',
    delay_minutes: 0,
    conditions: {
      only_role: 'provider',
      require_approved_payment: true,
      allowed_payment_statuses: ['installment_2_paid', 'paid', 'approved']
    },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-event-reminder',
    code: 'rule_provider_event_reminder',
    name: 'Lembrete de Agenda 48h Antes (Prestador)',
    description: 'Envia lembrete ao prestador 2 dias antes do evento contratado.',
    event_type: 'event.reminder',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_event_reminder',
    delay_minutes: 0,
    conditions: { only_role: 'provider', days_before_event: 2 },
    allow_repeat: false,
    cooldown_hours: 48,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'rule-provider-post-evaluation',
    code: 'rule_provider_post_evaluation',
    name: 'Aviso de Avaliação Pós-Evento (Prestador)',
    description: 'Informa o prestador sobre a conclusão e avaliação pós-evento.',
    event_type: 'event.completed',
    recipient_type: 'provider',
    channel: 'both',
    template_code: 'provider_post_event_evaluation',
    delay_minutes: 0,
    conditions: { only_role: 'provider', days_after_event: 1 },
    allow_repeat: false,
    cooldown_hours: 0,
    max_attempts: 3,
    is_active: true,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  }
]

export const DEFAULT_CAMPAIGNS: FestCampaign[] = [
  {
    id: 'camp-seasonality-fim-ano',
    name: 'Temporada de Festas e Confraternizações Be Fest',
    description: 'Avisos de sazonalidade da Be Fest para clientes planejarem eventos.',
    campaign_type: 'seasonality',
    target_audience: 'all_clients',
    channel: 'both',
    template_code: 'client_campaign_seasonality',
    custom_variables: {
      link_campanha: 'https://befest.vercel.app/servicos'
    },
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-12-31T23:59:59.000Z',
    status: 'scheduled',
    total_eligible: 0,
    total_sent: 0,
    total_failed: 0,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'camp-client-points-coupons',
    name: 'Ofertas de Pontos e Cupons Exclusivos',
    description: 'Campanha de relacionamento com envio de cupons e benefícios para clientes.',
    campaign_type: 'points_coupons',
    target_audience: 'all_clients',
    channel: 'email',
    template_code: 'client_campaign_points_coupons',
    custom_variables: {
      link_campanha: 'https://befest.vercel.app/servicos?cupom=BEFESTVIP'
    },
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-12-31T23:59:59.000Z',
    status: 'draft',
    total_eligible: 0,
    total_sent: 0,
    total_failed: 0,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'camp-client-inactive',
    name: 'Reativação de Clientes Inativos (60+ dias)',
    description: 'Campanha automática para clientes sem novas festas nos últimos 60 dias.',
    campaign_type: 'inactive_clients',
    target_audience: 'inactive_clients',
    channel: 'both',
    template_code: 'client_campaign_inactive',
    inactive_days_threshold: 60,
    custom_variables: {
      link_campanha: 'https://befest.vercel.app/servicos'
    },
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-12-31T23:59:59.000Z',
    status: 'draft',
    total_eligible: 0,
    total_sent: 0,
    total_failed: 0,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  },
  {
    id: 'camp-provider-festplus',
    name: 'Oportunidades FestPlus para Parceiros',
    description: 'Ofertas e oportunidades relacionadas ao FestPlus para prestadores ativos.',
    campaign_type: 'festplus',
    target_audience: 'festplus_eligible',
    channel: 'both',
    template_code: 'provider_campaign_festplus',
    custom_variables: {
      link_campanha: 'https://befest.vercel.app/dashboard/prestador'
    },
    start_date: '2026-10-01T00:00:00.000Z',
    end_date: '2026-12-31T23:59:59.000Z',
    status: 'scheduled',
    total_eligible: 0,
    total_sent: 0,
    total_failed: 0,
    created_at: NOW_ISO,
    updated_at: NOW_ISO
  }
]

export const DEFAULT_CHANNEL_CONFIGS: FestChannelConfig[] = [
  {
    channel: 'email',
    provider_name: 'Resend API',
    is_enabled: true,
    test_mode: false,
    rate_limit_per_minute: 100,
    config_metadata: {
      from_env_var: 'RESEND_FROM_EMAIL',
      api_key_env_var: 'RESEND_API_KEY'
    },
    updated_at: NOW_ISO
  },
  {
    channel: 'whatsapp',
    provider_name: 'WhatsApp Business Cloud API',
    is_enabled: true,
    test_mode: false,
    rate_limit_per_minute: 60,
    config_metadata: {
      phone_id_env_var: 'WHATSAPP_PHONE_NUMBER_ID',
      token_env_var: 'WHATSAPP_ACCESS_TOKEN',
      api_url_env_var: 'WHATSAPP_API_URL'
    },
    updated_at: NOW_ISO
  }
]
