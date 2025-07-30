/**
 * Script para corrigir os preços incorretos dos serviços no banco de dados
 * Executa a lógica: fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2)
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Calcula o valor correto de um serviço
 */
function calculateCorrectServiceValue(pricePerGuest, fullGuests, halfGuests) {
  const fullGuestsValue = fullGuests * pricePerGuest;
  const halfGuestsValue = halfGuests * (pricePerGuest / 2);
  return fullGuestsValue + halfGuestsValue;
}

/**
 * Verifica se um preço está correto
 */
function isPriceCorrect(currentPrice, calculatedPrice) {
  return Math.abs(currentPrice - calculatedPrice) <= 0.01;
}

/**
 * Corrige os preços incorretos no banco de dados
 */
async function fixIncorrectPrices() {
  try {
    console.log('🔍 Buscando serviços com preços incorretos...');
    
    // Buscar todos os event_services com preços
    const { data: eventServices, error: fetchError } = await supabase
      .from('event_services')
      .select(`
        id,
        price_per_guest_at_booking,
        total_estimated_price,
        event_id,
        events!inner (
          full_guests,
          half_guests,
          free_guests
        )
      `)
      .not('price_per_guest_at_booking', 'is', null)
      .not('total_estimated_price', 'is', null);

    if (fetchError) {
      console.error('❌ Erro ao buscar serviços:', fetchError);
      return;
    }

    console.log(`📊 Encontrados ${eventServices.length} serviços para verificar`);

    let correctedCount = 0;
    let totalDifference = 0;

    for (const service of eventServices) {
      const pricePerGuest = Number(service.price_per_guest_at_booking);
      const currentPrice = Number(service.total_estimated_price);
      const fullGuests = Number(service.events.full_guests) || 0;
      const halfGuests = Number(service.events.half_guests) || 0;

      // Calcular preço correto
      const correctPrice = calculateCorrectServiceValue(pricePerGuest, fullGuests, halfGuests);

      // Verificar se o preço está incorreto
      if (!isPriceCorrect(currentPrice, correctPrice)) {
        const difference = currentPrice - correctPrice;
        totalDifference += difference;

        console.log(`🔧 Corrigindo serviço ${service.id}:`);
        console.log(`   Preço atual: R$ ${currentPrice.toFixed(2)}`);
        console.log(`   Preço correto: R$ ${correctPrice.toFixed(2)}`);
        console.log(`   Diferença: R$ ${difference.toFixed(2)}`);

        // Atualizar o preço no banco
        const { error: updateError } = await supabase
          .from('event_services')
          .update({ 
            total_estimated_price: correctPrice,
            updated_at: new Date().toISOString()
          })
          .eq('id', service.id);

        if (updateError) {
          console.error(`❌ Erro ao atualizar serviço ${service.id}:`, updateError);
        } else {
          correctedCount++;
          console.log(`✅ Serviço ${service.id} corrigido`);
        }
      }
    }

    console.log('\n📈 Resumo da correção:');
    console.log(`   Serviços corrigidos: ${correctedCount}`);
    console.log(`   Diferença total: R$ ${totalDifference.toFixed(2)}`);
    
    if (correctedCount > 0) {
      console.log('✅ Correção concluída com sucesso!');
    } else {
      console.log('✅ Todos os preços já estão corretos!');
    }

  } catch (error) {
    console.error('❌ Erro durante a correção:', error);
  }
}

/**
 * Verifica se a correção foi aplicada corretamente
 */
async function verifyCorrection() {
  try {
    console.log('\n🔍 Verificando correção...');
    
    const { data: eventServices, error } = await supabase
      .from('event_services')
      .select(`
        id,
        price_per_guest_at_booking,
        total_estimated_price,
        events!inner (
          full_guests,
          half_guests
        )
      `)
      .not('price_per_guest_at_booking', 'is', null)
      .not('total_estimated_price', 'is', null)
      .limit(10);

    if (error) {
      console.error('❌ Erro ao verificar:', error);
      return;
    }

    console.log('\n📊 Amostra de serviços após correção:');
    eventServices.forEach(service => {
      const pricePerGuest = Number(service.price_per_guest_at_booking);
      const currentPrice = Number(service.total_estimated_price);
      const fullGuests = Number(service.events.full_guests) || 0;
      const halfGuests = Number(service.events.half_guests) || 0;
      const correctPrice = calculateCorrectServiceValue(pricePerGuest, fullGuests, halfGuests);
      const isCorrect = isPriceCorrect(currentPrice, correctPrice);

      console.log(`   Serviço ${service.id}:`);
      console.log(`     Preço atual: R$ ${currentPrice.toFixed(2)}`);
      console.log(`     Preço calculado: R$ ${correctPrice.toFixed(2)}`);
      console.log(`     Status: ${isCorrect ? '✅ Correto' : '❌ Incorreto'}`);
    });

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

// Executar o script
async function main() {
  console.log('🚀 Iniciando correção de preços...\n');
  
  await fixIncorrectPrices();
  await verifyCorrection();
  
  console.log('\n🎉 Script concluído!');
}

// Executar apenas se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { fixIncorrectPrices, verifyCorrection }; 