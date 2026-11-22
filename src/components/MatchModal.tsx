import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, MessageCircle, Send, Compass } from 'lucide-react';
import { Profile } from '../types/dating';

interface MatchModalProps {
  profile: Profile | null;
  userPhoto?: string;
  userName?: string;
  onClose: () => void;
  onOpenChat: (profileId: string) => void;
  onSendQuickIcebreaker: (profileId: string, message: string) => void;
}

const DEFAULT_USER_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80';

export const MatchModal: React.FC<MatchModalProps> = ({
  profile,
  userPhoto,
  userName,
  onClose,
  onOpenChat,
  onSendQuickIcebreaker,
}) => {
  const [quickText, setQuickText] = useState('');

  if (!profile) return null;

  const handleQuickSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickText.trim()) {
      onOpenChat(profile.id);
      return;
    }
    onSendQuickIcebreaker(profile.id, quickText.trim());
    setQuickText('');
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-[#0D1117]/90 backdrop-blur-xl"
      >
        {/* Pontos de Luz Radiais de Celebração */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-[#3B82F6]/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#2F4536]/60 blur-3xl pointer-events-none" />

        <motion.div
          initial={{ scale: 0.86, y: 24, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative w-full max-w-sm rounded-3xl p-6 text-center glass-olive border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Luz radial de topo */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#3B82F6]/35 blur-2xl pointer-events-none" />

          {/* Badge de Match Instantâneo IA */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#3B82F6]/15 border border-[#3B82F6]/40 text-xs font-semibold text-[#60A5FA] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Maktub • Sintonia Instantânea</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-white">
            Deu Match!
          </h2>
          <p className="mt-1.5 text-sm text-white/80">
            {userName ? (
              <>
                <span className="font-bold text-white">{userName}</span> e{' '}
                <span className="font-bold text-white">{profile.name}</span>{' '}
                curtiram um ao outro.
              </>
            ) : (
              <>
                Você e{' '}
                <span className="font-bold text-white">{profile.name}</span>{' '}
                curtiram um ao outro.
              </>
            )}
          </p>

          {/* Dupla de Avatares com Animação de Colisão */}
          <div className="relative flex items-center justify-center my-7 h-32">
            <motion.div
              initial={{ x: -50, rotate: -14, opacity: 0 }}
              animate={{ x: 10, rotate: -6, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220 }}
              className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl"
            >
              <img
                src={userPhoto || DEFAULT_USER_AVATAR}
                alt={userName || 'Você'}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.28, type: 'spring', stiffness: 360 }}
              className="z-20 -mx-3 w-11 h-11 rounded-full bg-[#3B82F6] flex items-center justify-center shadow-[0_0_24px_#3B82F6] border-2 border-[#0D1117]"
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>

            <motion.div
              initial={{ x: 50, rotate: 14, opacity: 0 }}
              animate={{ x: -10, rotate: 6, opacity: 1 }}
              transition={{ delay: 0.14, type: 'spring', stiffness: 220 }}
              className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-[#3B82F6] shadow-[0_0_30px_rgba(59,130,246,0.35)]"
            >
              <img
                src={profile.photos[0]}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {profile.ai_persona?.vibe && (
            <p className="text-xs text-white/70 bg-[#0D1117]/60 border border-white/10 rounded-xl px-3 py-2 mb-5">
              Vibe de{' '}
              <span className="text-white font-semibold">
                {profile.name.split(' ')[0]}
              </span>
              : {profile.ai_persona.vibe}
            </p>
          )}

          {/* Campo rápido de Quebra-Gelo */}
          <form onSubmit={handleQuickSend} className="mb-3">
            <div className="flex items-center gap-2 bg-[#0D1117]/85 border border-white/15 focus-within:border-[#3B82F6] rounded-2xl p-1.5 pl-3.5 transition-colors">
              <input
                type="text"
                value={quickText}
                onChange={(e) => setQuickText(e.target.value)}
                placeholder={`Diga oi para ${profile.name.split(' ')[0]}...`}
                className="w-full bg-transparent text-sm text-white placeholder-white/45 focus:outline-none"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all shadow-[0_0_16px_rgba(59,130,246,0.5)]"
                aria-label="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* CTAs Principais */}
          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onOpenChat(profile.id)}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_28px_rgba(59,130,246,0.45)] transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Abrir Conversa Agora</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-white/10 transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Continuar Explorando Perfis</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
