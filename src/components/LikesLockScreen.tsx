import React from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Lock,
  Unlock,
  Heart,
  Sparkles,
  MapPin,
  Eye,
} from 'lucide-react';
import { Profile } from '../types/dating';

interface LikesLockScreenProps {
  lockedLikes: Profile[];
  hasVipPlan: boolean;
  onOpenPlansModal: () => void;
  onUnlockAndMatch: (profileId: string) => void;
  onToggleVipForTest: () => void;
}

export const LikesLockScreen: React.FC<LikesLockScreenProps> = ({
  lockedLikes,
  hasVipPlan,
  onOpenPlansModal,
  onUnlockAndMatch,
  onToggleVipForTest,
}) => {
  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0D1117] relative">
      {/* Pontos de Luz Radiais */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#3B82F6]/15 blur-3xl pointer-events-none" />

      {/* Cabeçalho da Aba de Curtidas / Matches do Plano */}
      <div className="px-4 pt-3.5 pb-3 border-b border-white/10 bg-[#0D1117]/90 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Crown className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <span>Quem Curtiu Você</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  {lockedLikes.length}
                </span>
              </h2>
              <p className="text-[11px] text-white/60">
                {hasVipPlan
                  ? 'Plano Maktub Gold Ativo • Clique para dar Match!'
                  : 'Contrate o plano para revelar os perfis e dar match'}
              </p>
            </div>
          </div>

          {/* Botão rápido para alternar o plano durante testes */}
          <button
            type="button"
            onClick={onToggleVipForTest}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all flex items-center gap-1 ${
              hasVipPlan
                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                : 'bg-white/5 border-white/15 text-white/70 hover:text-white'
            }`}
          >
            {hasVipPlan ? (
              <>
                <Unlock className="w-3 h-3" />
                <span>VIP Ativo</span>
              </>
            ) : (
              <>
                <Lock className="w-3 h-3" />
                <span>Simular VIP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Banner de Upgrade quando o usuário ainda não tem o Plano */}
      {!hasVipPlan && (
        <div className="mx-4 mt-3 p-3.5 rounded-2xl glass-olive border border-amber-400/30 flex items-center justify-between gap-3 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
              <Sparkles className="w-3 h-3" /> Maktub Gold
            </span>
            <h3 className="text-xs font-bold text-white mt-0.5">
              Veja quem já deu Like em você sem precisar esperar!
            </h3>
          </div>
          <button
            type="button"
            onClick={onOpenPlansModal}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-extrabold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all"
          >
            Ver Plano
          </button>
        </div>
      )}

      {/* Grade de Cards (Desfocados se sem Plano, Nítidos se com Plano) */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        {lockedLikes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-3xl glass-olive border border-white/10">
            <Heart className="w-10 h-10 text-[#3B82F6] mb-2" />
            <h3 className="text-base font-bold text-white">
              Você já converteu todas as curtidas em Match!
            </h3>
            <p className="text-xs text-white/65 mt-1 max-w-xs">
              Continue dando swipe na aba Discovery ou converse com seus matches na aba de Chat.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {lockedLikes.map((profile, idx) => {
              const maskedName = `${profile.name.charAt(0)}•••••`;
              return (
                <motion.div
                  key={profile.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() =>
                    hasVipPlan
                      ? onUnlockAndMatch(profile.id)
                      : onOpenPlansModal()
                  }
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/15 bg-[#131820] cursor-pointer group shadow-xl"
                >
                  {/* Imagem do Perfil (Com Blur se não tiver Plano VIP) */}
                  <img
                    src={profile.photos[0]}
                    alt={hasVipPlan ? profile.name : 'Perfil Bloqueado'}
                    className={`w-full h-full object-cover transition-all duration-500 ${
                      hasVipPlan
                        ? 'blur-0 scale-100 group-hover:scale-105'
                        : 'blur-xl scale-115 brightness-75'
                    }`}
                  />

                  {/* Gradiente Escuro */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/35 to-transparent" />

                  {/* Overlay Central de Cadeado quando Bloqueado */}
                  {!hasVipPlan && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                      <div className="w-11 h-11 rounded-full bg-[#0D1117]/80 border border-amber-400/50 flex items-center justify-center shadow-[0_0_24px_rgba(251,191,36,0.35)] mb-2 group-hover:scale-110 transition-transform">
                        <Lock className="w-5 h-5 text-amber-400" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#0D1117]/80 border border-white/10 text-[10px] font-bold text-amber-300">
                        Curtiu Você ❤️
                      </span>
                    </div>
                  )}

                  {/* Rodapé do Card */}
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-white truncate">
                        {hasVipPlan
                          ? `${profile.name.split(' ')[0]}, ${profile.age}`
                          : `${maskedName}, ${profile.age}`}
                      </h4>
                    </div>

                    <p className="text-[10px] text-white/70 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 text-[#3B82F6]" />
                      <span>a {profile.distance} km</span>
                    </p>

                    <button
                      type="button"
                      className={`mt-2 w-full py-1.5 px-2 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1 transition-all ${
                        hasVipPlan
                          ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                          : 'bg-amber-500/20 border border-amber-400/40 text-amber-300 group-hover:bg-amber-500 group-hover:text-[#0D1117]'
                      }`}
                    >
                      {hasVipPlan ? (
                        <>
                          <Heart className="w-3 h-3 fill-white" />
                          <span>Dar Match Agora</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" />
                          <span>Desbloquear</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
