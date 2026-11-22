import { GiftItem, LLMWebhookConfig, Message, Profile } from '../types/dating';

export interface AIChatResponseResult {
  replyText: string;
  delayMs: number;
  source: 'mock_ai' | 'webhook_llm';
}

/**
 * Calcula um delay aleatório entre 2000ms e 3000ms (2 a 3 segundos)
 * para simular a digitação humana de um perfil controlado por IA.
 */
export function getSimulatedTypingDelay(): number {
  return Math.floor(2000 + Math.random() * 1000);
}

/**
 * Gera uma reação encantada e personalizada quando o usuário envia um Presente com moedas.
 */
function buildGiftReactionReply(profile: Profile, gift: GiftItem): string {
  const firstName = profile.name.split(' ')[0];

  switch (gift.coins) {
    case 1:
      return `${gift.emoji} Amei o ${gift.name}! Já me ganhou pelo café. Agora só falta a gente marcar o café real aqui pertinho (${profile.distance} km)!`;
    case 2:
      return `${gift.emoji} Um ${gift.name}!! Como você adivinhou que eu sou apaixonada por doces? Muito obrigada pelo carinho ✨`;
    case 3:
      return `${gift.emoji} Saúde!! Adorei o ${gift.name}. O próximo brinde tem que ser olhando no olho, combinado?`;
    case 4:
      return `${gift.emoji} Meu Deus, que ${gift.name} mais lindas!! Você acabou de fazer o meu dia inteiro sorrir. Muito obrigada! ❤️`;
    case 5:
      return `${gift.emoji} Que fofura esse ${gift.name}! Confesso que derreti toda aqui. Você sabe mesmo como surpreender alguém!`;
    case 6:
      return `${gift.emoji} Um ${gift.name}! Que elegância... agora temos o pretexto perfeito para o nosso jantar essa semana.`;
    case 7:
      return `${gift.emoji} Uau, um ${gift.name}!! Você tem um gosto impecável. Já quero te encontrar pessoalmente pra agradecer à altura!`;
    case 8:
      return `${gift.emoji} Estou sem palavras com esse ${gift.name}!! Ninguém nunca tinha me mandado um presente tão incrível aqui no Maktub. Quando nos vemos?! 💎✨`;
    default:
      return `${gift.emoji} Amei receber ${gift.name} de você! — ${firstName}`;
  }
}

/**
 * Seleciona uma resposta contextualizada e natural baseada na mensagem do usuário
 * e na persona do perfil de IA.
 */
function buildContextualMockReply(
  profile: Profile,
  userMessage: string,
  history: Message[],
  gift?: GiftItem
): string {
  if (gift) {
    return buildGiftReactionReply(profile, gift);
  }

  const lower = userMessage.toLowerCase();
  const firstName = profile.name.split(' ')[0];

  if (lower.includes('café') || lower.includes('cafe') || lower.includes('espresso')) {
    return `Eu sou completamente suspeita pra falar de café! Conheço uma cafeteria artesanal incrível aqui perto (${profile.distance} km). Quando vamos lá? ☕`;
  }

  if (
    lower.includes('vinho') ||
    lower.includes('drink') ||
    lower.includes('bar') ||
    lower.includes('cerveja') ||
    lower.includes('negroni')
  ) {
    return `Agora você falou a minha língua! 🍸 Eu topo demais um drink essa semana. Qual dia fica melhor pra você?`;
  }

  if (
    lower.includes('música') ||
    lower.includes('musica') ||
    lower.includes('playlist') ||
    lower.includes('som')
  ) {
    return `A trilha sonora diz tudo sobre a química de duas pessoas! Vou separar uma faixa especial pra te mandar. Que estilo você mais ouve à noite? 🎧`;
  }

  if (
    lower.includes('oi') ||
    lower.includes('olá') ||
    lower.includes('ola') ||
    lower.includes('tudo bem')
  ) {
    return `Oi! Tudo ótimo por aqui, melhor ainda agora que você chamou ✨ Como está sendo sua semana?`;
  }

  if (
    lower.includes('encontro') ||
    lower.includes('sair') ||
    lower.includes('jantar') ||
    lower.includes('hoje') ||
    lower.includes('amanhã')
  ) {
    return `Adorei a iniciativa! Estamos a só ${profile.distance} km de distância, então não temos desculpa. Me diz o lugar e o horário! 😉`;
  }

  const pool = profile.ai_persona?.contextualReplies ?? [
    `Gostei muito da sua vibe! Me conta mais sobre o que você gosta de fazer quando quer desconectar da rotina.`,
    `Hahaha adorei! Confesso que nosso match foi a melhor surpresa do meu dia aqui no Maktub.`,
    `Estamos bem pertinho (${profile.distance} km). O que você acha de continuarmos esse papo pessoalmente essa semana?`,
  ];

  const previousAiTexts = new Set(
    history.filter((m) => m.senderId === profile.id).map((m) => m.text)
  );
  const unusedReplies = pool.filter((r) => !previousAiTexts.has(r));
  const candidates = unusedReplies.length > 0 ? unusedReplies : pool;

  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex] || `Adorei conversar com você! — ${firstName}`;
}

/**
 * Mock Function + Integração LLM / Webhook:
 * Quando `profile.is_ai` é verdadeiro, aguarda de 2 a 3 segundos simulando digitação
 * e retorna uma resposta automática contextualizada (ou via Webhook/OpenAI se configurado).
 */
export async function generateAIChatResponse(
  profile: Profile,
  userMessage: string,
  history: Message[],
  webhookConfig?: LLMWebhookConfig,
  gift?: GiftItem
): Promise<AIChatResponseResult | null> {
  if (!profile.is_ai) {
    return null;
  }

  const delayMs = getSimulatedTypingDelay();

  if (webhookConfig?.enabled && webhookConfig.endpointUrl.trim() !== '') {
    const startTime = Date.now();
    try {
      const isOpenAI = webhookConfig.endpointUrl.includes('openai.com');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (webhookConfig.apiKey) {
        headers['Authorization'] = `Bearer ${webhookConfig.apiKey}`;
      }

      const payload = isOpenAI
        ? {
            model: webhookConfig.model || 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  profile.ai_persona?.systemPrompt ||
                  `Você é ${profile.name}, ${profile.age} anos. Bio: ${profile.bio}. Responda de forma natural, charmosa e curta em português.`,
              },
              ...history.map((m) => ({
                role: m.senderId === 'user' ? 'user' : 'assistant',
                content: m.text,
              })),
              {
                role: 'user',
                content: gift
                  ? `[Enviou o presente: ${gift.emoji} ${gift.name} (${gift.coins} moedas)] ${userMessage}`
                  : userMessage,
              },
            ],
            temperature: 0.85,
            max_tokens: 120,
          }
        : {
            event: gift ? 'ai_profile.gift_received' : 'ai_profile.message_received',
            profile: {
              id: profile.id,
              name: profile.name,
              age: profile.age,
              bio: profile.bio,
              persona: profile.ai_persona,
            },
            gift,
            userMessage,
            history,
          };

      const response = await fetch(webhookConfig.endpointUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const extractedText =
          data.reply ||
          data.message ||
          data.choices?.[0]?.message?.content ||
          null;

        if (extractedText) {
          const elapsed = Date.now() - startTime;
          if (elapsed < delayMs) {
            await new Promise((res) => setTimeout(res, delayMs - elapsed));
          }
          return {
            replyText: extractedText.trim(),
            delayMs: Math.max(elapsed, delayMs),
            source: 'webhook_llm',
          };
        }
      }
    } catch (error) {
      console.warn('[Maktub AI Engine] Fallback para simulação local:', error);
    }
  }

  await new Promise((resolve) => setTimeout(resolve, delayMs));
  const replyText = buildContextualMockReply(profile, userMessage, history, gift);

  return {
    replyText,
    delayMs,
    source: 'mock_ai',
  };
}
