import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame,
  User,
  Heart,
  MapPin,
  Navigation,
  Camera,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Radar,
  Loader2,
  Compass,
  UserPlus,
} from 'lucide-react';
import { InterestFilter, UserRegistrationProfile } from '../types/dating';
import { AI_PROFILES_SEED } from '../data/aiProfilesSeed';

interface OnboardingFlowProps {
  initialData: UserRegistrationProfile;
  onComplete: (data: Omit<UserRegistrationProfile, 'isRegistered'>) => void;
  onSkipRegistration: () => void;
}

const DEMO_USER_PHOTOS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=85',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=85',
];

const POPULAR_CITIES = [
  'São Paulo, SP',
  'Rio de Janeiro, RJ',
  'Belo Horizonte, MG',
  'Curitiba, PR',
  'Florianópolis, SC',
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialData,
  onComplete,
  onSkipRegistration,
}) => {
  // Step 0 = Tela Inicial (Escolha entre Realizar Cadastro ou Entrar sem Cadastro)
  // Steps 1..4 = Etapas do Cadastro estilo Tinder
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0);

  // Step 1: Nome & Idade
  const [name, setName] = useState(initialData.name || '');
  const [age, setAge] = useState(initialData.age || 26);

  // Step 2: Interesse (Homem ou Mulher)
  const [interestedIn, setInterestedIn] = useState<InterestFilter>(
    initialData.interestedIn || 'mulher'
  );

  // Step 3: Cidade, Geolocalização & Raio de Pesquisa
  const [city, setCity] = useState(initialData.city || '');
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(initialData.coordinates || null);
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(
    initialData.searchRadiusKm || 25
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatusMessage, setGeoStatusMessage] = useState<string | null>(null);

  // Step 4: Fotos (até 6 slots estilo Tinder)
  const [photos, setPhotos] = useState<string[]>(
    initialData.photos.length > 0 ? initialData.photos : []
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Função de Geolocalização Atual (Browser GPS + Reverse Geocoding OpenStreetMap + Fallback)
  const handleDetectCurrentLocation = () => {
    setIsLocating(true);
    setGeoStatusMessage('Obtendo coordenadas de GPS do dispositivo...');

    const applyCoordinatesAndReverseGeocode = async (
      lat: number,
      lng: number,
      isFallback = false
    ) => {
      setCoordinates({ lat, lng });
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'pt-BR',
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          const addr = data.address || {};
          const detectedCity =
            addr.city ||
            addr.town ||
            addr.municipality ||
            addr.village ||
            addr.suburb ||
            'São Paulo';
          const detectedState = addr.state_code || addr.state || 'Brasil';
          const formatted = `${detectedCity}, ${detectedState}`;
          setCity(formatted);
          setGeoStatusMessage(
            isFallback
              ? `Localização aproximada detectada: ${formatted}`
              : `GPS ativo! Localização confirmada em ${formatted}`
          );
        } else {
          setCity('São Paulo, SP');
          setGeoStatusMessage('Coordenadas GPS capturadas com sucesso!');
        }
      } catch {
        setCity((prev) => prev || 'São Paulo, SP');
        setGeoStatusMessage('Coordenadas de localização aplicadas!');
      } finally {
        setIsLocating(false);
      }
    };

    if (!('geolocation' in navigator)) {
      applyCoordinatesAndReverseGeocode(-23.5505, -46.6333, true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        applyCoordinatesAndReverseGeocode(latitude, longitude, false);
      },
      async () => {
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          if (ipRes.ok) {
            const ipData = await ipRes.json();
            if (ipData.city) {
              setCoordinates({
                lat: ipData.latitude || -23.5505,
                lng: ipData.longitude || -46.6333,
              });
              const formatted = `${ipData.city}, ${ipData.region_code || ipData.country_name || 'BR'}`;
              setCity(formatted);
              setGeoStatusMessage(`Localização atual detectada: ${formatted}`);
              setIsLocating(false);
              return;
            }
          }
        } catch {
          // ignore
        }
        applyCoordinatesAndReverseGeocode(-23.5505, -46.6333, true);
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 0,
      }
    );
  };

  // Upload de fotos do dispositivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotos((prev) =>
            prev.length < 6 ? [...prev, reader.result as string] : prev
          );
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddDemoPhotos = () => {
    setPhotos((prev) => {
      const combined = [...prev];
      for (const url of DEMO_USER_PHOTOS) {
        if (combined.length < 6 && !combined.includes(url)) {
          combined.push(url);
        }
      }
      return combined;
    });
  };

  // Quantos perfis IA correspondem ao filtro atual de interesse e raio
  const matchingProfilesCount = AI_PROFILES_SEED.filter((p) => {
    const matchesGender =
      interestedIn === 'todos' ? true : p.gender === interestedIn;
    const matchesRadius = p.distance <= searchRadiusKm;
    return matchesGender && matchesRadius;
  }).length;

  const canAdvanceStep1 = name.trim().length >= 2 && age >= 18 && age <= 99;
  const canAdvanceStep2 = Boolean(interestedIn);
  const canAdvanceStep3 = city.trim().length >= 2 && searchRadiusKm >= 2;
  const canFinishStep4 = photos.length >= 1;

  const handleNext = () => {
    if (step === 1 && canAdvanceStep1) setStep(2);
    else if (step === 2 && canAdvanceStep2) setStep(3);
    else if (step === 3 && canAdvanceStep3) setStep(4);
    else if (step === 4 && canFinishStep4) {
      onComplete({
        name: name.trim(),
        age,
        interestedIn,
        city: city.trim(),
        coordinates,
        searchRadiusKm,
        photos,
      });
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => (prev - 1) as 0 | 1 | 2 | 3 | 4);
    }
  };

  // TELA INICIAL (STEP 0): Opção de Realizar Cadastro ou Entrar sem Cadastro
  if (step === 0) {
    return (
      <div className="flex flex-col justify-between h-full w-full bg-[#0D1117] text-white p-6 relative overflow-hidden">
        {/* Pontos de Luz Radiais de Destaque */}
        <div className="absolute -top-20 -right-16 w-80 h-80 rounded-full bg-[#3B82F6]/25 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-[#2F4536]/55 blur-3xl pointer-events-none" />

        {/* Topo */}
        <div className="relative z-10 flex items-center justify-between pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shadow-[0_0_24px_rgba(59,130,246,0.6)]">
              <Flame className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white block leading-none">
                MAKTUB
              </span>
              <span className="text-[10px] text-[#60A5FA] font-semibold">
                AI-Powered Dating MVP
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full glass-olive text-[11px] font-semibold text-white/90 border border-white/10">
            <Sparkles className="w-3 h-3 text-[#3B82F6]" />
            Cold-Start Engine
          </span>
        </div>

        {/* Visual Central com Preview de Cards IA */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative z-10 my-auto py-4 text-center"
        >
          {/* Leque de 3 avatares dos perfis de IA */}
          <div className="relative flex items-center justify-center h-44 mb-6">
            <motion.div
              initial={{ x: -45, rotate: -12, opacity: 0 }}
              animate={{ x: -42, rotate: -10, opacity: 0.85 }}
              transition={{ delay: 0.1 }}
              className="w-28 h-36 rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
            >
              <img
                src={AI_PROFILES_SEED[1].photos[0]}
                alt={AI_PROFILES_SEED[1].name}
                className="w-full h-full object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ y: 12, scale: 0.9, opacity: 0 }}
              animate={{ y: -6, scale: 1.06, opacity: 1 }}
              transition={{ delay: 0.18 }}
              className="z-20 w-32 h-40 rounded-2xl overflow-hidden border-2 border-[#3B82F6] shadow-[0_15px_40px_rgba(59,130,246,0.45)] relative"
            >
              <img
                src={AI_PROFILES_SEED[0].photos[0]}
                alt={AI_PROFILES_SEED[0].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-[#0D1117] via-[#0D1117]/70 to-transparent text-left">
                <p className="text-xs font-bold text-white truncate">
                  {AI_PROFILES_SEED[0].name.split(' ')[0]}, {AI_PROFILES_SEED[0].age}
                </p>
                <span className="text-[9px] text-[#60A5FA] font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> IA Online
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 45, rotate: 12, opacity: 0 }}
              animate={{ x: 42, rotate: 10, opacity: 0.85 }}
              transition={{ delay: 0.14 }}
              className="w-28 h-36 rounded-2xl overflow-hidden border border-white/15 shadow-2xl"
            >
              <img
                src={AI_PROFILES_SEED[2].photos[0]}
                alt={AI_PROFILES_SEED[2].name}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Conexões imediatas desde o primeiro swipe.
          </h1>
          <p className="text-xs text-white/70 mt-2.5 max-w-xs mx-auto leading-relaxed">
            Crie seu perfil personalizado com geolocalização ou entre diretamente no modo demonstração para testar os matches e o chat com IA.
          </p>
        </motion.div>

        {/* Botões de Ação na Tela Inicial */}
        <div className="relative z-10 space-y-3 pb-2">
          {/* Opção 1: Realizar Cadastro */}
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-4 px-5 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] active:scale-[0.99] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_10px_32px_rgba(59,130,246,0.5)] transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Realizar Cadastro</span>
          </button>

          {/* Opção 2: Entrar sem Cadastro */}
          <button
            type="button"
            onClick={onSkipRegistration}
            className="w-full py-3.5 px-5 rounded-2xl glass-olive hover:border-[#3B82F6]/50 active:scale-[0.99] text-white/90 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Compass className="w-4 h-4 text-[#3B82F6]" />
            <span>Entrar sem Cadastro (Acesso Rápido)</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0D1117] text-white relative overflow-hidden">
      {/* Pontos de Luz Radiais (Radial Light Points) */}
      <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#3B82F6]/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full bg-[#2F4536]/45 blur-3xl pointer-events-none" />

      {/* Header com Barra de Progresso Estilo Tinder */}
      <header className="relative z-20 px-5 pt-5 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 -ml-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
              aria-label="Voltar etapa"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-extrabold tracking-tight text-white">
              Cadastro MAKTUB
            </span>
          </div>

          <span className="text-xs font-bold text-[#60A5FA] bg-[#3B82F6]/15 border border-[#3B82F6]/30 px-2.5 py-1 rounded-full">
            Passo {step} de 4
          </span>
        </div>

        {/* Barra de Progresso Segmentada */}
        <div className="flex gap-1.5">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden"
            >
              <motion.div
                initial={false}
                animate={{
                  width: idx <= step ? '100%' : '0%',
                }}
                transition={{ duration: 0.3 }}
                className="h-full bg-[#3B82F6] shadow-[0_0_10px_#3B82F6]"
              />
            </div>
          ))}
        </div>
      </header>

      {/* Conteúdo das Etapas */}
      <div className="relative z-20 flex-1 overflow-y-auto px-5 py-3 no-scrollbar flex flex-col justify-between">
        <AnimatePresence mode="wait">
          {/* PASSO 1: NOME E IDADE */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-6 my-auto py-2"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#60A5FA] mb-3">
                  <User className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Vamos criar seu perfil</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Qual é o seu nome?
                </h1>
                <p className="text-xs text-white/65 mt-1.5 leading-relaxed">
                  É assim que você vai aparecer nos cards do Maktub e para os seus futuros matches.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl glass-olive border border-white/15 focus-within:border-[#3B82F6] transition-colors">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1.5">
                    Seu Primeiro Nome
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Gabriel, Amanda..."
                    className="w-full bg-transparent text-xl font-bold text-white placeholder-white/30 focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-2xl glass-olive border border-white/15">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">
                      Sua Idade
                    </label>
                    <span className="text-lg font-extrabold text-[#3B82F6]">
                      {age} anos
                    </span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={65}
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full accent-[#3B82F6] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-white/40 mt-1">
                    <span>18 anos</span>
                    <span>65+ anos</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 2: INTERESSE (HOMEM OU MULHER) */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-5 my-auto py-2"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#60A5FA] mb-3">
                  <Heart className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Preferência de Descoberta</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-white">
                  Quem você tem interesse em conhecer?
                </h1>
                <p className="text-xs text-white/65 mt-1.5 leading-relaxed">
                  Personalizamos sua fila de Discovery com perfis compatíveis com a sua preferência.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    value: 'mulher' as InterestFilter,
                    title: 'Mulheres',
                    desc: 'Mostrar perfis femininos na minha pilha de swipe',
                  },
                  {
                    value: 'homem' as InterestFilter,
                    title: 'Homens',
                    desc: 'Mostrar perfis masculinos na minha pilha de swipe',
                  },
                  {
                    value: 'todos' as InterestFilter,
                    title: 'Todos',
                    desc: 'Mostrar homens e mulheres sem restrição',
                  },
                ].map((option) => {
                  const isSelected = interestedIn === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setInterestedIn(option.value)}
                      className={`w-full p-4 rounded-2xl text-left transition-all flex items-center justify-between border ${
                        isSelected
                          ? 'glass-olive border-[#3B82F6] shadow-[0_0_25px_rgba(59,130,246,0.3)]'
                          : 'bg-[#131820]/80 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div>
                        <h3 className="text-base font-extrabold text-white">
                          {option.title}
                        </h3>
                        <p className="text-xs text-white/65 mt-0.5">
                          {option.desc}
                        </p>
                      </div>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          isSelected
                            ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                            : 'border-white/25'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* PASSO 3: CIDADE, GEOLOCALIZAÇÃO ATUAL E RAIO DE PESQUISA */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 my-auto py-1"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#60A5FA] mb-2">
                  <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Onde você está?</span>
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  Sua cidade e raio de busca
                </h1>
                <p className="text-xs text-white/65 mt-1 leading-relaxed">
                  Informe onde você mora ou use o GPS para buscar perfis próximos.
                </p>
              </div>

              {/* Botão de Geolocalização Atual (GPS) */}
              <button
                type="button"
                onClick={handleDetectCurrentLocation}
                disabled={isLocating}
                className="w-full p-3.5 rounded-2xl bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/50 flex items-center justify-between transition-all shadow-[0_0_24px_rgba(59,130,246,0.2)] group"
              >
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white shrink-0 shadow-[0_0_15px_#3B82F6]">
                    {isLocating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Navigation className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-extrabold text-white">
                      {isLocating
                        ? 'Detectando localização...'
                        : 'Usar minha localização atual'}
                    </span>
                    <span className="block text-[11px] text-[#60A5FA]">
                      {coordinates
                        ? `GPS Ativo (${coordinates.lat.toFixed(3)}, ${coordinates.lng.toFixed(3)})`
                        : 'Preencher cidade automaticamente via GPS'}
                    </span>
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-[#3B82F6] shrink-0" />
              </button>

              {geoStatusMessage && (
                <p className="text-[11px] text-emerald-400 font-medium px-1">
                  ✓ {geoStatusMessage}
                </p>
              )}

              {/* Input Manual de Cidade */}
              <div className="p-3.5 rounded-2xl glass-olive border border-white/15 focus-within:border-[#3B82F6] transition-colors">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-white/60 mb-1">
                  Cidade onde mora
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: São Paulo, SP"
                  className="w-full bg-transparent text-base font-bold text-white placeholder-white/35 focus:outline-none"
                />

                {/* Sugestões Rápidas de Cidade */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {POPULAR_CITIES.map((suggestedCity) => (
                    <button
                      key={suggestedCity}
                      type="button"
                      onClick={() => setCity(suggestedCity)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                        city === suggestedCity
                          ? 'bg-[#3B82F6] border-[#3B82F6] text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      {suggestedCity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Controle de Raio de Pesquisa de Perfil */}
              <div className="p-4 rounded-2xl glass-olive border border-white/15 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Radar className="w-4 h-4 text-[#3B82F6]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      Raio de Pesquisa de Perfil
                    </span>
                  </div>
                  <span className="text-base font-extrabold text-[#3B82F6]">
                    Até {searchRadiusKm} km
                  </span>
                </div>

                <input
                  type="range"
                  min={2}
                  max={100}
                  step={1}
                  value={searchRadiusKm}
                  onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                  className="w-full accent-[#3B82F6] cursor-pointer"
                />

                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>2 km (Vizinhança)</span>
                  <span className="text-emerald-400 font-semibold">
                    {matchingProfilesCount} perfis IA neste raio
                  </span>
                  <span>100 km</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASSO 4: UPLOAD DE FOTOS ESTILO TINDER (GRADE DE 6 FOTOS) */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
              className="space-y-4 my-auto py-1"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-[#60A5FA] mb-2">
                    <Camera className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Suas Melhores Fotos</span>
                  </div>
                  <h1 className="text-2xl font-extrabold tracking-tight text-white">
                    Adicione suas fotos
                  </h1>
                  <p className="text-xs text-white/65 mt-1">
                    Adicione pelo menos 1 foto para começar a dar swipe.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddDemoPhotos}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-[#3B82F6]/15 hover:bg-[#3B82F6]/25 border border-[#3B82F6]/40 text-[11px] font-bold text-[#60A5FA] transition-all"
                >
                  + Fotos Demo
                </button>
              </div>

              {/* Input de arquivo oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Grade de 6 Slots Estilo Tinder */}
              <div className="grid grid-cols-3 gap-2.5">
                {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
                  const photoUrl = photos[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all ${
                        photoUrl
                          ? 'border-2 border-[#3B82F6]/60 shadow-lg'
                          : 'border-2 border-dashed border-white/20 hover:border-[#3B82F6] glass-olive'
                      }`}
                    >
                      {photoUrl ? (
                        <>
                          <img
                            src={photoUrl}
                            alt={`Foto ${slotIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {slotIdx === 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#0D1117]/80 backdrop-blur-md text-[9px] font-bold uppercase text-[#60A5FA] border border-[#3B82F6]/40">
                              Principal
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(slotIdx)}
                            aria-label="Remover foto"
                            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-[#0D1117]/85 hover:bg-rose-500 text-white border border-white/15 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-full flex flex-col items-center justify-center gap-1.5 text-white/50 hover:text-white transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-[0_0_12px_#3B82F6]">
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                          </div>
                          <span className="text-[10px] font-semibold">
                            Adicionar
                          </span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Resumo do Perfil antes de entrar */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                <div className="truncate">
                  <span className="font-bold text-white">
                    {name || 'Seu Nome'}, {age}
                  </span>
                  <span className="text-white/60">
                    {' '}
                    • {city || 'Sua Cidade'} (Raio {searchRadiusKm} km)
                  </span>
                </div>
                <span className="text-[#60A5FA] font-bold shrink-0 ml-2">
                  Interesse: {interestedIn}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botão de Ação Inferior (Continuar / Concluir Cadastro + Pular) */}
        <div className="pt-3 pb-1 space-y-2">
          <button
            type="button"
            onClick={handleNext}
            disabled={
              (step === 1 && !canAdvanceStep1) ||
              (step === 2 && !canAdvanceStep2) ||
              (step === 3 && !canAdvanceStep3) ||
              (step === 4 && !canFinishStep4)
            }
            className="w-full py-3.5 px-6 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] disabled:opacity-35 disabled:pointer-events-none text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(59,130,246,0.45)] transition-all active:scale-[0.99]"
          >
            <span>
              {step < 4 ? 'Continuar' : 'Concluir Cadastro e Explorar'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onSkipRegistration}
            className="w-full py-2 text-[11px] font-semibold text-white/50 hover:text-white transition-colors"
          >
            Pular e entrar sem cadastro
          </button>
        </div>
      </div>
    </div>
  );
};
