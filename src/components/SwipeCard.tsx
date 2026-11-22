import React, { useState } from 'react';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { MapPin, Sparkles, Briefcase, ChevronLeft, ChevronRight } from 'lucide-react';
import { Profile } from '../types/dating';

interface SwipeCardProps {
  profile: Profile;
  isTopCard: boolean;
  stackIndex: number;
  onSwipe: (profileId: string, direction: 'left' | 'right') => void;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({
  profile,
  isTopCard,
  stackIndex,
  onSwipe,
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [exitX, setExitX] = useState<number | null>(null);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 0, 220], [-13, 0, 13]);
  const likeOpacity = useTransform(x, [25, 120], [0, 1]);
  const nopeOpacity = useTransform(x, [-25, -120], [0, 1]);
  const cardGlowOpacity = useTransform(x, [-160, 0, 160], [0.9, 0.55, 1]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const threshold = 105;
    const velocityThreshold = 500;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      setExitX(420);
      onSwipe(profile.id, 'right');
    } else if (
      info.offset.x < -threshold ||
      info.velocity.x < -velocityThreshold
    ) {
      setExitX(-420);
      onSwipe(profile.id, 'left');
    }
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex < profile.photos.length - 1) {
      setPhotoIndex((prev) => prev + 1);
    } else {
      setPhotoIndex(0);
    }
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (photoIndex > 0) {
      setPhotoIndex((prev) => prev - 1);
    } else {
      setPhotoIndex(profile.photos.length - 1);
    }
  };

  // Escala e deslocamento da pilha para os cards de trás
  const scale = isTopCard ? 1 : Math.max(0.92, 1 - stackIndex * 0.045);
  const translateY = isTopCard ? 0 : stackIndex * 12;

  return (
    <motion.div
      style={{
        x: isTopCard ? x : 0,
        rotate: isTopCard ? rotate : 0,
        zIndex: 30 - stackIndex,
      }}
      initial={{ scale: 0.94, opacity: 0, y: 20 }}
      animate={{
        scale,
        y: translateY,
        opacity: stackIndex > 2 ? 0 : 1 - stackIndex * 0.18,
      }}
      exit={{
        x: exitX ?? 380,
        opacity: 0,
        scale: 0.9,
        transition: { duration: 0.26, ease: 'easeOut' },
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      drag={isTopCard ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTopCard ? handleDragEnd : undefined}
      className={`absolute inset-0 rounded-[28px] overflow-hidden select-none ${
        isTopCard
          ? 'cursor-grab active:cursor-grabbing shadow-[0_22px_60px_-12px_rgba(0,0,0,0.92)] border border-white/15'
          : 'pointer-events-none border border-white/5'
      }`}
    >
      {/* Pontos de luz radiais (Radial Light Points) destacando o card ativo no topo da pilha */}
      {isTopCard && (
        <motion.div
          style={{ opacity: cardGlowOpacity }}
          className="absolute inset-0 pointer-events-none z-10 radial-card-spotlight"
        />
      )}

      {/* Ponto de luz radial superior direito (Electric Blue + Dark Olive) */}
      {isTopCard && (
        <>
          <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-[#3B82F6]/25 blur-3xl pointer-events-none z-10" />
          <div className="absolute -bottom-16 -left-12 w-60 h-60 rounded-full bg-[#2F4536]/55 blur-3xl pointer-events-none z-10" />
        </>
      )}

      {/* Foto de Perfil em Tela Cheia */}
      <img
        src={profile.photos[photoIndex]}
        alt={profile.name}
        draggable={false}
        className="w-full h-full object-cover object-center pointer-events-none select-none"
      />

      {/* Gradiente Dark Olive + Matte Black sobre a imagem */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(13,17,23,0.45) 0%, rgba(26,36,30,0.12) 38%, rgba(26,36,30,0.78) 72%, rgba(13,17,23,0.97) 100%)',
        }}
      />

      {/* Barras de Progresso de Fotos no Topo */}
      <div className="absolute top-3.5 left-4 right-4 z-20 flex gap-1.5">
        {profile.photos.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 rounded-full overflow-hidden bg-white/25 backdrop-blur-sm"
          >
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                idx === photoIndex
                  ? 'w-full bg-white shadow-[0_0_8px_#FFFFFF]'
                  : idx < photoIndex
                  ? 'w-full bg-white/70'
                  : 'w-0'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Cabeçalho do Card: Distância & Status IA */}
      <div className="absolute top-7 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0D1117]/65 backdrop-blur-md border border-white/10 text-xs font-medium text-white/90">
          <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
          <span>a {profile.distance} km de você</span>
        </div>

        {profile.is_ai && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A241E]/85 backdrop-blur-md border border-[#3B82F6]/40 text-[11px] font-semibold text-white shadow-[0_0_15px_rgba(59,130,246,0.28)]">
            <Sparkles className="w-3 h-3 text-[#3B82F6]" />
            <span>IA Ativa</span>
          </div>
        )}
      </div>

      {/* Zonas de Toque para Trocar de Foto */}
      {isTopCard && profile.photos.length > 1 && (
        <div className="absolute inset-x-0 top-14 bottom-60 z-20 flex justify-between">
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={handlePrevPhoto}
            className="w-1/3 h-full flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity focus:outline-none"
          >
            <span className="p-1.5 rounded-full bg-[#0D1117]/50 backdrop-blur-md border border-white/10 text-white/80">
              <ChevronLeft className="w-4 h-4" />
            </span>
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={handleNextPhoto}
            className="w-1/3 h-full flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity focus:outline-none"
          >
            <span className="p-1.5 rounded-full bg-[#0D1117]/50 backdrop-blur-md border border-white/10 text-white/80">
              <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* Selos Dinâmicos de Swipe: LIKE (Direita) e NOPE (Esquerda) */}
      {isTopCard && (
        <>
          <motion.div
            style={{ opacity: likeOpacity }}
            className="absolute top-16 left-5 z-30 pointer-events-none -rotate-12 border-2 border-[#3B82F6] bg-[#3B82F6]/20 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-[0_0_25px_rgba(59,130,246,0.5)]"
          >
            <span className="text-xl font-extrabold tracking-widest text-white uppercase">
              LIKE
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: nopeOpacity }}
            className="absolute top-16 right-5 z-30 pointer-events-none rotate-12 border-2 border-rose-500 bg-rose-500/20 backdrop-blur-md px-4 py-1.5 rounded-xl shadow-[0_0_25px_rgba(244,63,94,0.45)]"
          >
            <span className="text-xl font-extrabold tracking-widest text-rose-100 uppercase">
              NOPE
            </span>
          </motion.div>
        </>
      )}

      {/* Painel Inferior com Efeito Glassmorphism + Gradiente Dark Olive */}
      <div className="absolute bottom-3 left-3 right-3 z-20 rounded-2xl p-4 glass-olive shadow-[0_12px_32px_rgba(0,0,0,0.65)]">
        {/* Ponto de luz radial interno no painel glassmorphism */}
        <div className="absolute -top-8 right-6 w-28 h-28 rounded-full bg-[#3B82F6]/20 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Nome + Idade */}
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span>{profile.name}</span>
              <span className="text-xl font-semibold text-white/80">
                {profile.age}
              </span>
            </h2>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Online agora
            </span>
          </div>

          {/* Ocupação */}
          {profile.occupation && (
            <div className="flex items-center gap-1.5 mt-1 text-xs font-medium text-white/75">
              <Briefcase className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span>{profile.occupation}</span>
            </div>
          )}

          {/* Bio */}
          <p className="mt-2.5 text-sm leading-relaxed text-white/90 line-clamp-3">
            {profile.bio}
          </p>

          {/* Tags de Interesse */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {profile.interests.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/90 border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
