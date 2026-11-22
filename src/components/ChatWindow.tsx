import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  Sparkles,
  Webhook,
  CheckCheck,
  MapPin,
  Gift,
  Coins,
  Plus,
  X,
} from 'lucide-react';
import { GiftItem, Match, Message } from '../types/dating';
import { GIFTS_CATALOG } from '../data/giftsCatalog';

interface ChatWindowProps {
  match: Match;
  messages: Message[];
  isTyping: boolean;
  coinsBalance: number;
  onBack: () => void;
  onSendMessage: (matchId: string, text: string) => void;
  onSendGift: (matchId: string, gift: GiftItem) => Promise<boolean>;
  onOpenCoinsModal: () => void;
  onOpenWebhookSettings: () => void;
  webhookEnabled: boolean;
}

const ICEBREAKER_SUGGESTIONS = [
  'Qual é o seu pedido de café favorito? ☕',
  'Bora tomar um drink essa semana? 🍸',
  'Qual música não sai do seu repeat? 🎧',
  'Me conta um lugar secreto na cidade!',
];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  match,
  messages,
  isTyping,
  coinsBalance,
  onBack,
  onSendMessage,
  onSendGift,
  onOpenCoinsModal,
  onOpenWebhookSettings,
  webhookEnabled,
}) => {
  const [inputText, setInputText] = useState('');
  const [showGiftTray, setShowGiftTray] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showGiftTray]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(match.id, inputText);
    setInputText('');
  };

  const handleChipClick = (suggestion: string) => {
    onSendMessage(match.id, suggestion);
  };

  const handleSelectGift = async (gift: GiftItem) => {
    const sent = await onSendGift(match.id, gift);
    if (sent) {
      setShowGiftTray(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0D1117] relative overflow-hidden">
      {/* Pontos de Luz Radiais de Fundo */}
      <div className="absolute -top-20 right-0 w-64 h-64 rounded-full bg-[#3B82F6]/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 -left-16 w-64 h-64 rounded-full bg-[#2F4536]/35 blur-3xl pointer-events-none" />

      {/* Header da Janela de Chat */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 glass-olive">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar para lista de conversas"
            className="p-2 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="relative shrink-0">
            <img
              src={match.profile.photos[0]}
              alt={match.profile.name}
              className="w-10 h-10 rounded-2xl object-cover border border-[#3B82F6]/50"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0D1117]" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-white truncate">
                {match.profile.name.split(' ')[0]}, {match.profile.age}
              </h3>
              {match.profile.is_ai && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-[9px] font-semibold text-[#60A5FA]">
                  <Sparkles className="w-2.5 h-2.5 text-[#3B82F6]" />
                  IA
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/65 flex items-center gap-1.5 truncate">
              {isTyping ? (
                <span className="text-[#60A5FA] font-semibold">
                  Digitando...
                </span>
              ) : (
                <>
                  <MapPin className="w-3 h-3 text-[#3B82F6] shrink-0" />
                  <span>{match.profile.distance} km</span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Saldo de Moedas + Botão de Webhook */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={onOpenCoinsModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-extrabold text-amber-300 transition-all"
            title="Depositar Moedas (1 moeda = R$ 4,00)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span>{coinsBalance}</span>
            <Plus className="w-3 h-3 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={onOpenWebhookSettings}
            title="Configurar Webhook / OpenAI LLM"
            className={`p-2 rounded-xl border transition-all ${
              webhookEnabled
                ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#60A5FA]'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Webhook className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4 space-y-3 no-scrollbar">
        {/* Card Resumo do Match & Persona no Topo do Histórico */}
        <div className="p-3 rounded-2xl glass-olive border border-white/10 text-center mb-3">
          <p className="text-xs text-white/85 font-medium">
            Você deu match com{' '}
            <span className="font-bold text-white">{match.profile.name}</span>
          </p>
          <p className="text-[11px] text-[#60A5FA] mt-0.5">
            Envie um presente (Flores, Bombom, Vinho...) para surpreender! 🎁
          </p>
        </div>

        {/* Lista de Mensagens */}
        {messages.map((msg) => {
          const isUser = msg.senderId === 'user';
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`flex flex-col ${
                isUser ? 'items-end' : 'items-start'
              }`}
            >
              {msg.gift ? (
                /* Card Especial de Presente Enviado */
                <div className="max-w-[85%] rounded-2xl p-3.5 bg-gradient-to-br from-amber-500/25 via-[#1A241E] to-[#3B82F6]/30 border border-amber-400/50 shadow-[0_10px_30px_rgba(251,191,36,0.2)] flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#0D1117]/80 border border-amber-400/40 flex items-center justify-center text-3xl shrink-0">
                    {msg.gift.emoji}
                  </div>
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400/20 text-[9px] font-extrabold uppercase tracking-wider text-amber-300 mb-0.5">
                      Presente Enviado • {msg.gift.coins}{' '}
                      {msg.gift.coins === 1 ? 'Moeda' : 'Moedas'}
                    </span>
                    <h4 className="text-sm font-extrabold text-white">
                      {msg.gift.name}
                    </h4>
                    <p className="text-[11px] text-white/75">
                      {msg.gift.description}
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-[#3B82F6] text-white rounded-br-xs shadow-[0_8px_24px_rgba(59,130,246,0.3)]'
                      : 'glass-olive text-white rounded-bl-xs border border-white/10'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              )}

              <div className="flex items-center gap-1.5 mt-1 px-1 text-[10px] text-white/45">
                <span>{msg.timestamp}</span>
                {!isUser && msg.source === 'webhook_llm' && (
                  <span className="text-[#60A5FA] font-medium">
                    • via LLM Webhook
                  </span>
                )}
                {!isUser && msg.source === 'mock_ai' && (
                  <span className="text-emerald-400/80 font-medium">
                    • Motor IA
                  </span>
                )}
                {isUser && <CheckCheck className="w-3 h-3 text-[#3B82F6]" />}
              </div>
            </motion.div>
          );
        })}

        {/* Bolha de Simulação de Digitação (Delay de 2 a 3 segundos) */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2.5"
          >
            <img
              src={match.profile.photos[0]}
              alt={match.profile.name}
              className="w-7 h-7 rounded-full object-cover border border-white/15"
            />
            <div className="px-4 py-3 rounded-2xl rounded-bl-xs glass-olive border border-[#3B82F6]/30 flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-xs text-white/75 font-medium">
                {match.profile.name.split(' ')[0]} está digitando...
              </span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Bandeja Interativa de Presentes (1 a 8 Moedas) */}
      <AnimatePresence>
        {showGiftTray && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-20 border-t border-white/15 bg-[#131820]/98 backdrop-blur-xl px-4 py-3 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-extrabold text-white">
                  Enviar Presente para {match.profile.name.split(' ')[0]}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenCoinsModal}
                  className="text-[11px] font-bold text-[#60A5FA] hover:underline flex items-center gap-1"
                >
                  <Coins className="w-3 h-3 text-amber-400" />
                  <span>Saldo: {coinsBalance} moedas (+ Recarregar)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGiftTray(false)}
                  className="p-1 text-white/50 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto no-scrollbar py-1">
              {GIFTS_CATALOG.map((gift) => {
                const canAfford = coinsBalance >= gift.coins;
                return (
                  <button
                    key={gift.id}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSelectGift(gift)}
                    className={`p-2 rounded-2xl border flex flex-col items-center text-center transition-all ${
                      canAfford
                        ? 'glass-olive border-white/15 hover:border-amber-400/70 active:scale-95'
                        : 'bg-white/5 border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <span className="text-2xl mb-1">{gift.emoji}</span>
                    <span className="text-[11px] font-bold text-white truncate w-full">
                      {gift.name}
                    </span>
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[10px] font-extrabold text-amber-300">
                      {gift.coins} 🪙
                    </span>
                    <span className="text-[9px] text-white/45 mt-0.5">
                      R$ {gift.priceBrl}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chips de Quebra-Gelo Rápido */}
      {!showGiftTray && (
        <div className="relative z-10 px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/5 bg-[#0D1117]/80">
          {ICEBREAKER_SUGGESTIONS.map((chip) => (
            <button
              key={chip}
              type="button"
              disabled={isTyping}
              onClick={() => handleChipClick(chip)}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 hover:bg-[#3B82F6]/20 hover:border-[#3B82F6]/50 border border-white/10 text-white/85 transition-all disabled:opacity-40"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Input de Mensagem + Botão de Presente */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 p-3 border-t border-white/10 bg-[#0D1117]/95 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={() => setShowGiftTray((prev) => !prev)}
          title="Enviar Presente (Flores, Bombom, etc.)"
          className={`p-3 rounded-2xl border transition-all shrink-0 flex items-center justify-center ${
            showGiftTray
              ? 'bg-amber-500 text-[#0D1117] border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.5)]'
              : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/40 text-amber-300'
          }`}
        >
          <Gift className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center gap-2 rounded-2xl bg-[#131820] border border-white/15 focus-within:border-[#3B82F6] px-3.5 py-1.5 transition-colors">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Mensagem para ${match.profile.name.split(' ')[0]}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none py-1.5"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            aria-label="Enviar"
            className="p-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-35 disabled:hover:bg-[#3B82F6] text-white transition-all shadow-[0_0_16px_rgba(59,130,246,0.45)]"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
