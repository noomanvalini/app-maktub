import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquareHeart, Compass, Webhook } from 'lucide-react';
import { Match, Message } from '../types/dating';

interface ChatListProps {
  matches: Match[];
  messagesByMatchId: Record<string, Message[]>;
  typingByMatchId: Record<string, boolean>;
  onSelectMatch: (matchId: string) => void;
  onGoToDiscovery: () => void;
  onOpenWebhookSettings: () => void;
  webhookEnabled: boolean;
}

export const ChatList: React.FC<ChatListProps> = ({
  matches,
  messagesByMatchId,
  typingByMatchId,
  onSelectMatch,
  onGoToDiscovery,
  onOpenWebhookSettings,
  webhookEnabled,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Seção Superior: Matches em Formato de Bolhas (Stories) */}
      <div className="px-4 pt-3 pb-4 border-b border-white/10 bg-[#0D1117]/90">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/80">
              Seus Matches
            </h2>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#3B82F6]/20 text-[#60A5FA] border border-[#3B82F6]/30">
              {matches.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenWebhookSettings}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
              webhookEnabled
                ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-white shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
            }`}
          >
            <Webhook className="w-3 h-3 text-[#3B82F6]" />
            <span>{webhookEnabled ? 'Webhook LLM Ativo' : 'LLM / Webhook'}</span>
          </button>
        </div>

        {/* Carrossel Horizontal de Stories (Matches) */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1">
          {matches.map((match, idx) => {
            const isTyping = typingByMatchId[match.id];
            return (
              <motion.button
                key={match.id}
                type="button"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onSelectMatch(match.id)}
                className="flex flex-col items-center shrink-0 group focus:outline-none"
              >
                <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-[#3B82F6] via-[#4C6B57] to-[#60A5FA] shadow-[0_0_18px_rgba(59,130,246,0.35)] group-hover:scale-105 transition-transform">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#0D1117] bg-[#131820]">
                    <img
                      src={match.profile.photos[0]}
                      alt={match.profile.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badge IA / Status */}
                  {match.profile.is_ai && (
                    <span
                      title="Perfil IA Ativo"
                      className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#0D1117] border border-[#3B82F6]/60 flex items-center justify-center shadow"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-[#3B82F6]" />
                    </span>
                  )}

                  {/* Indicador Online / Digitando */}
                  <span
                    className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0D1117] ${
                      isTyping
                        ? 'bg-[#3B82F6] animate-ping'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <span className="mt-1.5 text-xs font-semibold text-white/90 group-hover:text-white max-w-[70px] truncate">
                  {match.profile.name.split(' ')[0]}
                </span>
              </motion.button>
            );
          })}

          {/* Botão rápido para descobrir mais perfis */}
          <button
            type="button"
            onClick={onGoToDiscovery}
            className="flex flex-col items-center shrink-0 group focus:outline-none"
          >
            <div className="w-[68px] h-[68px] rounded-full border border-dashed border-white/25 hover:border-[#3B82F6] bg-white/5 flex items-center justify-center transition-colors">
              <Compass className="w-6 h-6 text-[#3B82F6] group-hover:rotate-45 transition-transform" />
            </div>
            <span className="mt-1.5 text-xs font-medium text-white/60 group-hover:text-white">
              Explorar
            </span>
          </button>
        </div>
      </div>

      {/* Lista de Mensagens e Conversas Ativas */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5 no-scrollbar">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white/70">
            Conversas Recentes
          </h3>
          <span className="text-[11px] text-white/45">
            Motor IA Cold-Start • Resposta 2–3s
          </span>
        </div>

        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl glass-olive border border-white/10 mt-4">
            <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center mb-3">
              <MessageSquareHeart className="w-6 h-6 text-[#3B82F6]" />
            </div>
            <h4 className="text-base font-bold text-white">
              Nenhum match ainda
            </h4>
            <p className="text-xs text-white/70 mt-1 max-w-xs">
              Deslize para a direita na tela Discovery para dar match instantâneo com nossos perfis controlados por IA.
            </p>
            <button
              type="button"
              onClick={onGoToDiscovery}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#3B82F6] text-xs font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              Ir para Discovery
            </button>
          </div>
        ) : (
          matches.map((match) => {
            const messages = messagesByMatchId[match.id] || [];
            const lastMessage = messages[messages.length - 1];
            const isTyping = typingByMatchId[match.id];

            return (
              <motion.button
                key={match.id}
                type="button"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelectMatch(match.id)}
                className="w-full flex items-center gap-3.5 p-3 rounded-2xl glass-olive hover:border-[#3B82F6]/50 transition-all text-left group relative overflow-hidden"
              >
                {/* Ponto de luz radial discreto no card de conversa */}
                <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-[#3B82F6]/10 blur-xl pointer-events-none group-hover:bg-[#3B82F6]/25 transition-all" />

                <div className="relative shrink-0">
                  <img
                    src={match.profile.photos[0]}
                    alt={match.profile.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-white/15"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0D1117]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-bold text-sm text-white truncate">
                        {match.profile.name}
                      </span>
                      {match.profile.is_ai && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#3B82F6]/15 border border-[#3B82F6]/30 text-[10px] font-semibold text-[#60A5FA] shrink-0">
                          IA
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/50 shrink-0">
                      {lastMessage ? lastMessage.timestamp : match.matchedAt}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between gap-2">
                    {isTyping ? (
                      <span className="text-xs font-medium text-[#60A5FA] flex items-center gap-1.5">
                        <span className="inline-flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:150ms]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:300ms]" />
                        </span>
                        Digitando resposta...
                      </span>
                    ) : lastMessage ? (
                      <p
                        className={`text-xs truncate ${
                          match.unreadCount > 0
                            ? 'text-white font-semibold'
                            : 'text-white/70'
                        }`}
                      >
                        {lastMessage.senderId === 'user' ? 'Você: ' : ''}
                        {lastMessage.text}
                      </p>
                    ) : (
                      <p className="text-xs text-[#60A5FA] font-medium">
                        Novo match! Quebre o gelo ✨
                      </p>
                    )}

                    {match.unreadCount > 0 && !isTyping && (
                      <span className="w-5 h-5 rounded-full bg-[#3B82F6] text-white text-[11px] font-extrabold flex items-center justify-center shrink-0 shadow-[0_0_12px_#3B82F6]">
                        {match.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};
