import assert from 'node:assert/strict'
import {
  dispatchFestEvent,
  resetFestMensagesMemoryStore,
  getQueueItems,
  getLogItems,
  retryFailedNotification,
  calculateRetryBackoffMinutes,
  executeCampaign,
  updateRecipientPreferences,
  saveCampaign
} from '../engine'
import { renderFestTemplate } from '../template-engine'
import { DEFAULT_TEMPLATES } from '../defaults'
import { verifyAdminPermission } from '../../actions/festmensages'

async function runFestMensagesTestSuite() {
  console.log('==============================================================')
  console.log('🧪 Iniciando Suíte de Testes — FestMensages | Be Fest')
  console.log('==============================================================\n')

  // Ensure test environment
  ;(process.env as any).NODE_ENV = 'test'
  delete process.env.RESEND_API_KEY
  delete process.env.WHATSAPP_ACCESS_TOKEN

  let passed = 0

  // -------------------------------------------------------------------------
  // TESTE 1: Cada evento dispara a notificação correta
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    const summary = await dispatchFestEvent({
      eventType: 'order.created',
      entityId: 'order-101',
      client: {
        id: 'cli-1',
        role: 'client',
        name: 'Maria Clara',
        email: 'maria@exemplo.com',
        phone: '21988887777'
      },
      provider: {
        id: 'prov-1',
        role: 'provider',
        name: 'Buffet Imperial',
        email: 'contato@buffetimperial.com',
        phone: '21977776666'
      },
      variables: {
        numero_pedido: '#BF-101',
        servico_contratado: 'Buffet Infantil Completo',
        nome_cliente: 'Maria Clara',
        nome_prestador: 'Buffet Imperial',
        data_evento: '15/12/2026',
        horario_evento: '18:00',
        valor_pedido: 'R$ 5.200,00',
        link_pedido: 'https://befest.vercel.app/perfil'
      },
      forceTestMode: true
    })

    assert.equal(summary.matchedRules, 2, 'order.created deve acionar 2 regras (cliente e prestador)')
    assert.equal(summary.enqueued, 4, 'Deve enfileirar 4 envios (email + whatsapp para cliente e prestador)')
    const templatesUsed = new Set(summary.items.map((i) => i.template_code))
    assert.ok(templatesUsed.has('client_order_pending_agenda'), 'Deve usar o modelo correto do cliente')
    assert.ok(templatesUsed.has('provider_order_arrived'), 'Deve usar o modelo correto do prestador')
    console.log('✅ [Critério 1] Cada evento dispara a notificação correta.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 2: Clientes e prestadores recebem somente as mensagens destinadas a eles
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    // Evento exclusivo de prestador: service.created
    const summary = await dispatchFestEvent({
      eventType: 'service.created',
      entityId: 'srv-55',
      client: {
        id: 'cli-1',
        role: 'client',
        name: 'Cliente Indevido',
        email: 'cliente@exemplo.com',
        phone: '21988887777'
      },
      provider: {
        id: 'prov-1',
        role: 'provider',
        name: 'Chef Gourmet',
        email: 'chef@gourmet.com',
        phone: '21977776666'
      },
      variables: {
        servico_contratado: 'Cardápio Finger Food'
      },
      forceTestMode: true
    })

    const clientItems = summary.items.filter((i) => i.recipient_role === 'client')
    const providerItems = summary.items.filter((i) => i.recipient_role === 'provider')
    assert.equal(clientItems.length, 0, 'Cliente NUNCA deve receber notificação exclusiva de prestador')
    assert.equal(providerItems.length, 2, 'Prestador deve receber confirmação de serviço cadastrado')
    console.log('✅ [Critério 2] Clientes e prestadores recebem somente as mensagens destinadas a eles.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 3: As variáveis são preenchidas corretamente (e variáveis ausentes bloqueiam envio)
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    const orderTpl = DEFAULT_TEMPLATES.find((t) => t.code === 'provider_order_arrived')!
    const rendered = renderFestTemplate(orderTpl, {
      nome: 'Buffet Sol',
      data_evento: '20/11/2026',
      horario_evento: '19:30',
      link_pedido: 'https://befest.vercel.app/dashboard/prestador'
    })

    assert.equal(rendered.valid, true)
    assert.ok(
      rendered.bodyText.includes(
        'Olá, Buffet Sol! Você recebeu um novo pedido na Be Fest. O evento está previsto para 20/11/2026, às 19:30.'
      ),
      'Texto deve interpolar todas as variáveis corretamente'
    )

    // Testar bloqueio quando variável obrigatória está ausente
    const missingRender = renderFestTemplate(orderTpl, {
      nome: 'Buffet Sol'
      // faltando data_evento, horario_evento, link_pedido
    })
    assert.equal(missingRender.valid, false, 'Deve invalidar quando variáveis obrigatórias estão ausentes')
    assert.ok(missingRender.missingVariables.includes('data_evento'))
    console.log('✅ [Critério 3] Variáveis dinâmicas preenchidas e validadas antes do envio.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 4: Eventos repetidos não geram notificações duplicadas (Idempotência)
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    const payload = {
      eventType: 'client.registered',
      entityId: 'user-dup-99',
      client: {
        id: 'user-dup-99',
        role: 'client' as const,
        name: 'Carlos Eduardo',
        email: 'carlos@exemplo.com',
        phone: '21999991111'
      },
      variables: {
        nome: 'Carlos Eduardo',
        email: 'carlos@exemplo.com'
      },
      forceTestMode: true
    }

    const firstRun = await dispatchFestEvent(payload)
    const secondRun = await dispatchFestEvent(payload)

    assert.equal(firstRun.enqueued, 2, 'Primeiro disparo deve enfileirar e processar')
    assert.equal(secondRun.enqueued, 0, 'Segundo disparo idêntico não deve enfileirar novamente')
    assert.equal(secondRun.skippedDuplicates, 2, 'Deve contabilizar 2 duplicidades bloqueadas')
    console.log('✅ [Critério 4] Eventos repetidos não geram notificações duplicadas.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 5: Pagamentos pendentes não geram confirmação de pagamento
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    const pendingAttempt = await dispatchFestEvent({
      eventType: 'payment.approved',
      entityId: 'order-pay-77',
      paymentStatus: 'waiting_payment', // Pendente / não aprovado!
      client: {
        id: 'cli-77',
        role: 'client',
        name: 'Fernanda Lima',
        email: 'fernanda@exemplo.com',
        phone: '21988881111'
      },
      variables: {
        numero_pedido: '#BF-77',
        servico_contratado: 'Decoração Provençal',
        nome_prestador: 'Arte Festas',
        data_evento: '10/12/2026',
        valor_pedido: 'R$ 2.100,00',
        status_pagamento: 'Pendente'
      },
      forceTestMode: true
    })

    assert.equal(pendingAttempt.enqueued, 0, 'Pagamento pendente jamais deve gerar confirmação de pagamento')
    assert.ok(pendingAttempt.blockedPaymentGuard > 0, 'Guard de pagamento deve bloquear o disparo')

    // Agora com pagamento efetivamente aprovado
    const approvedAttempt = await dispatchFestEvent({
      eventType: 'payment.approved',
      entityId: 'order-pay-77',
      paymentStatus: 'approved',
      client: {
        id: 'cli-77',
        role: 'client',
        name: 'Fernanda Lima',
        email: 'fernanda@exemplo.com',
        phone: '21988881111'
      },
      variables: {
        numero_pedido: '#BF-77',
        servico_contratado: 'Decoração Provençal',
        nome_prestador: 'Arte Festas',
        data_evento: '10/12/2026',
        valor_pedido: 'R$ 2.100,00',
        status_pagamento: 'Aprovado'
      },
      forceTestMode: true
    })

    assert.equal(approvedAttempt.enqueued, 2, 'Pagamento aprovado deve enviar confirmação normalmente')
    console.log('✅ [Critério 5] Pagamentos pendentes não geram confirmação de pagamento.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 6: Falhas temporárias e reprocessamento seguro funcionam corretamente
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    assert.equal(calculateRetryBackoffMinutes(1), 5, '1ª tentativa -> backoff de 5 min')
    assert.equal(calculateRetryBackoffMinutes(2), 30, '2ª tentativa -> backoff de 30 min')
    assert.equal(calculateRetryBackoffMinutes(3), 120, '3ª tentativa -> backoff de 120 min')

    // Forçar falha de validação por variável ausente e testar bloqueio/reprocessamento
    const failRun = await dispatchFestEvent({
      eventType: 'order.waiting_payment',
      entityId: 'order-fail-1',
      client: {
        id: 'cli-fail',
        role: 'client',
        name: 'Lucas',
        email: 'lucas@exemplo.com',
        phone: '21988882222'
      },
      variables: {
        // omitindo valor_pedido, data_evento, servico_contratado, nome_prestador
      },
      forceTestMode: true
    })

    assert.equal(failRun.failedValidation, 2, 'Deve registrar falha quando faltam variáveis obrigatórias')
    const failedQueueItem = failRun.items[0]
    assert.equal(failedQueueItem.status, 'failed')

    // Corrigir variáveis do item e reprocessar com segurança
    failedQueueItem.variables = {
      ...failedQueueItem.variables,
      nome: 'Lucas',
      nome_prestador: 'DJ Sound',
      servico_contratado: 'Som e Iluminação',
      numero_pedido: '#BF-901',
      data_evento: '22/12/2026',
      valor_pedido: 'R$ 1.800,00',
      link_pagamento: 'https://befest.vercel.app/pagamento'
    }
    const retryRes = await retryFailedNotification(failedQueueItem.id, { forceTestMode: true })
    assert.equal(retryRes.success, true, 'Reprocessamento deve ter sucesso após correção')
    console.log('✅ [Critério 6] Falhas, backoff progressivo e reprocessamento seguro validados.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 7: O histórico registra o resultado das operações
  // -------------------------------------------------------------------------
  {
    const logs = await getLogItems()
    const queue = await getQueueItems()
    assert.ok(logs.length > 0, 'O histórico de logs deve registrar as tentativas e resultados')
    assert.ok(queue.length > 0, 'A fila deve manter o estado rastreável de cada mensagem')
    console.log('✅ [Critério 7] O histórico registra o resultado de todas as operações.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 8: Campanhas respeitam período, público-alvo e preferências LGPD
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    // Cliente 2 faz opt-out promocional (LGPD)
    await updateRecipientPreferences({
      userId: 'cli-optout',
      email: 'optout@exemplo.com',
      unsubscribeAllPromotional: true,
      reason: 'Teste LGPD'
    })

    const audience = [
      { id: 'cli-active', role: 'client' as const, name: 'Cliente Ativo', email: 'ativo@exemplo.com', phone: '21999990001' },
      { id: 'cli-optout', role: 'client' as const, name: 'Cliente OptOut', email: 'optout@exemplo.com', phone: '21999990002' },
      { id: 'prov-ignored', role: 'provider' as const, name: 'Prestador Ignorado', email: 'prov@exemplo.com', phone: '21999990003' }
    ]

    // Testar fora da janela de execução
    const outOfWindowRes = await executeCampaign('camp-seasonality-fim-ano', audience, {
      now: new Date('2025-01-01T00:00:00.000Z'),
      forceTestMode: true
    })
    assert.equal(outOfWindowRes.success, false, 'Campanha fora da vigência não deve ser executada')

    // Testar dentro da janela de execução
    const inWindowRes = await executeCampaign('camp-seasonality-fim-ano', audience, {
      now: new Date('2026-11-15T12:00:00.000Z'),
      forceTestMode: true
    })
    assert.equal(inWindowRes.success, true, 'Campanha dentro da vigência deve executar')
    assert.equal(inWindowRes.totalEligible, 2, 'Apenas clientes (2) devem ser elegíveis em campanha all_clients')
    assert.equal(inWindowRes.totalSent, 2, 'Apenas o cliente com consentimento deve receber nos 2 canais')
    assert.equal(inWindowRes.totalSkippedConsent, 2, 'O cliente descadastrado via LGPD deve ser bloqueado nos 2 canais')
    console.log('✅ [Critério 8] Campanhas respeitam período, público-alvo e consentimento LGPD.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 9: As permissões administrativas funcionam corretamente
  // -------------------------------------------------------------------------
  {
    const clientPerm = await verifyAdminPermission({ id: 'u1', role: 'client', email: 'cli@teste.com' })
    const providerPerm = await verifyAdminPermission({ id: 'u2', role: 'provider', email: 'prov@teste.com' })
    const adminPerm = await verifyAdminPermission({ id: 'u3', role: 'admin', email: 'adm@befest.com' })
    const superAdminPerm = await verifyAdminPermission({
      id: 'u4',
      role: 'client',
      email: 'befestsuperadmin@superadm.com'
    })

    assert.equal(clientPerm.authorized, false, 'Cliente não pode acessar o painel FestMensages')
    assert.equal(providerPerm.authorized, false, 'Prestador não pode acessar o painel FestMensages')
    assert.equal(adminPerm.authorized, true, 'Admin deve ter acesso autorizado')
    assert.equal(superAdminPerm.authorized, true, 'Super Admin deve ter acesso autorizado')
    console.log('✅ [Critério 9] Permissões administrativas validadas com segurança.')
    passed++
  }

  // -------------------------------------------------------------------------
  // TESTE 10: O sistema opera em modo de teste sem enviar mensagens reais
  // -------------------------------------------------------------------------
  {
    resetFestMensagesMemoryStore()
    const testRun = await dispatchFestEvent({
      eventType: 'provider.registered',
      entityId: 'prov-sandbox-1',
      provider: {
        id: 'prov-sandbox-1',
        role: 'provider',
        name: 'Doces Finos RJ',
        email: 'doces@exemplo.com',
        phone: '21988889999'
      },
      variables: {
        nome: 'Doces Finos RJ',
        email: 'doces@exemplo.com'
      },
      forceTestMode: true
    })

    assert.equal(testRun.sent, 0, 'Em modo de teste, nenhuma mensagem deve ser marcada como enviada externamente (sent)')
    assert.equal(testRun.testModeLogged, 2, 'Deve registrar explicitamente como test_mode_logged')
    assert.ok(testRun.items.every((i) => i.is_test === true && i.status === 'test_mode_logged'))
    console.log('✅ [Critério 10] Modo de teste controlado opera sem simular entregas reais falsas.')
    passed++
  }

  console.log(`\n🎉 TODOS OS ${passed}/10 CRITÉRIOS DE ACEITAÇÃO PASSARAM COM SUCESSO!`)
}

runFestMensagesTestSuite().catch((err) => {
  console.error('❌ Falha nos testes do FestMensages:', err)
  process.exit(1)
})
