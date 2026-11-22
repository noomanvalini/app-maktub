import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Flame,
  MessageCircle,
  X,
  Heart,
  RotateCcw,
  Sparkles,
  RefreshCw,
  Webhook,
  SlidersHorizontal,
  UserCheck,
  MapPin,
  Crown,
  Coins,
  Plus,
} from 'lucide-react';
import { useDatingStore } from './store/useDatingStore';
import { SwipeCard } from './components/SwipeCard';
import { MatchModal } from './components/MatchModal';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { OnboardingFlow } from './components/OnboardingFlow';
import { LikesLockScreen } from './components/LikesLockScreen';
import { PlansAndWalletModal } from './components/PlansAndWalletModal';

export const App: React.FC = () => {
  const {
    userProfile,
    activeTab,
    selectedMatchId,
    hasVipPlan,
    lockedLikes,
    coinsBalance,
    walletModalTab,
    profilesQueue,
    swipedHistory,
    matches,
    latestMatchedProfile,
    messagesByMatchId,
    typingByMatchId,
    webhookConfig,
    completeRegistration,
    enterWithoutRegistration,
    reopenRegistration,
    setActiveTab,
    selectMatchChat,
    openWalletModal,
    closeWalletModal,
    subscribeVipPlan,
    toggleVipPlanForTest,
    depositCoins,
    unlockAndMatchProfile,
    swipeProfile,
    rewindLastSwipe,
    resetDiscoveryQueue,
    dismissMatchModal,
    openChatFromMatchModal,
    sendMessage,
    sendGiftInChat,
    updateWebhookConfig,
  } = useDatingStore();

  const [showWebhookModal, setShowWebhookModal] = useState(false);

  const totalUnread = matches.reduce((acc, m) => acc + m.unreadCount, 0);
  const topProfile = profilesQueue[0];
  const selectedMatch = matches.find((m) => m.id === selectedMatchId) || null;

  const handleQuickIcebreakerFromModal = async (
    profileId: string,
    message: string
  ) => {
    const matchId = `match-${profileId}`;
    openChatFromMatchModal(profileId);
    await sendMessage(matchId, message);
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#0D1117] text-white flex items-center justify-center relative overflow-hidden">
      {/* Ambient Radial Light Points no Desktop */}
      <div className="hidden md:block absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#3B82F6]/10 blur-[130px] pointer-events-none" />
      <div className="hidden md:block absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-[#2F4536]/25 blur-[130px] pointer-events-none" />

      {/* Container Mobile-First */}
      <div className="w-full max-w-[430px] h-[100dvh] md:h-[92vh] md:max-h-[860px] bg-[#0D1117] md:rounded-[36px] md:border md:border-white/10 md:shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col relative overflow-hidden">
        {!userProfile.isRegistered ? (
          <OnboardingFlow
            initialData={userProfile}
            onComplete={completeRegistration}
            onSkipRegistration={enterWithoutRegistration}
          />
        ) : (
          <>
            {/* Top Header Principal */}
            {!(activeTab === 'chat' && selectedMatch) && (
              <header className="px-4 pt-3.5 pb-2.5 flex items-center justify-between border-b border-white/5 bg-[#0D1117]/90 backdrop-blur-md z-30">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] shrink-0">
                    <Flame className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h1 className="text-base font-extrabold tracking-tight text-white">
                        MAKTUB
                      </h1>
                      {hasVipPlan && (
                        <span className="px-1.5 py-0.5 text-[9px] font-extrabold uppercase rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                          GOLD
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-white/55 font-medium flex items-center gap-1 truncate">
                      <MapPin className="w-2.5 h-2.5 text-[#3B82F6] shrink-0" />
                      <span className="truncate">
                        {userProfile.city || 'Brasil'} •{' '}
                        {userProfile.searchRadiusKm} km
                      </span>
                    </p>
                  </div>
                </div>

                {/* Ações do Topo: Saldo de Moedas, Perfil e Webhook */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Botão de Saldo de Moedas (1 moeda = R$ 4,00) */}
                  <button
                    type="button"
                    onClick={() => openWalletModal('coins')}
                    title="Carteira de Moedas e Presentes (1 moeda = R$ 4,00)"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-extrabold text-amber-300 transition-all"
                  >
                    <Coins className="w-3.5 h-3.5 text-amber-400" />
                    <span>{coinsBalance}</span>
                    <Plus className="w-3 h-3 text-amber-400" />
                  </button>

                  {/* Botão de Editar Perfil / Cadastro */}
                  <button
                    type="button"
                    onClick={reopenRegistration}
                    title="Voltar para Tela Inicial / Editar Cadastro"
                    className="flex items-center gap-1.5 pl-1 pr-2 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white/85 transition-all"
                  >
                    {userProfile.photos[0] ? (
                      <img
                        src={userProfile.photos[0]}
                        alt={userProfile.name}
                        className="w-5 h-5 rounded-full object-cover border border-[#3B82F6]"
                      />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-[#3B82F6]" />
                    )}
                    <span className="max-w-[58px] truncate text-[11px]">
                      {userProfile.name || 'Perfil'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowWebhookModal(true)}
                    title="Configurar Integração LLM / Webhook"
                    className={`p-1.5 rounded-xl border transition-all ${
                      webhookConfig.enabled
                        ? 'bg-[#3B82F6]/20 border-[#3B82F6] text-[#60A5FA]'
                        : 'bg-white/5 border-white/10 text-white/75 hover:text-white'
                    }`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </header>
            )}

            {/* Área Central de Conteúdo */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
              {activeTab === 'discovery' ? (
                <div className="flex-1 flex flex-col justify-between p-3.5 relative">
                  {/* Pilha de Cards (Swipe Stack) */}
                  <div className="relative flex-1 w-full">
                    <AnimatePresence>
                      {profilesQueue.length > 0 ? (
                        profilesQueue
                          .slice(0, 3)
                          .map((profile, index) => (
                            <SwipeCard
                              key={profile.id}
                              profile={profile}
                              isTopCard={index === 0}
                              stackIndex={index}
                              onSwipe={swipeProfile}
                            />
                          ))
                      ) : (
                        <motion.div
                          key="empty-deck"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full h-full rounded-[28px] glass-olive border border-white/10 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
                        >
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-[#3B82F6]/20 blur-3xl pointer-events-none" />
                          <div className="w-16 h-16 rounded-2xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(59,130,246,0.35)]">
                            <Sparkles className="w-8 h-8 text-[#3B82F6]" />
                          </div>
                          <h3 className="text-xl font-extrabold text-white">
                            Você viu todos os perfis da fila!
                          </h3>
                          <p className="text-xs text-white/70 mt-2 max-w-xs leading-relaxed">
                            Confira também quem já curtiu você na aba{' '}
                            <strong className="text-amber-300">Curtidas</strong>{' '}
                            ou recarregue os perfis de IA abaixo.
                          </p>

                          <div className="flex flex-col gap-2.5 w-full mt-6">
                            <button
                              type="button"
                              onClick={resetDiscoveryQueue}
                              className="w-full py-3.5 px-5 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-[0_8px_25px_rgba(59,130,246,0.45)] transition-all"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Recarregar Perfis IA</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setActiveTab('likes')}
                              className="w-full py-3 px-5 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 font-bold text-xs transition-all"
                            >
                              Ver Quem Curtiu Você ({lockedLikes.length})
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Botões de Ação de Swipe (Nope / Rewind / Like) */}
                  {profilesQueue.length > 0 && topProfile && (
                    <div className="pt-3.5 pb-1 flex items-center justify-center gap-5 z-30">
                      {/* Rewind */}
                      <button
                        type="button"
                        onClick={rewindLastSwipe}
                        disabled={swipedHistory.length === 0}
                        aria-label="Voltar perfil anterior"
                        className="w-11 h-11 rounded-full glass-panel border border-white/15 flex items-center justify-center text-white/80 hover:text-white disabled:opacity-30 transition-all active:scale-90"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                      {/* Nope (Swipe Esquerda) */}
                      <button
                        type="button"
                        onClick={() => swipeProfile(topProfile.id, 'left')}
                        aria-label="Passar perfil"
                        className="w-15 h-15 p-4 rounded-full bg-[#131820] hover:bg-rose-500/15 border border-rose-500/40 text-rose-400 hover:text-rose-300 flex items-center justify-center shadow-[0_8px_25px_rgba(0,0,0,0.65)] transition-all active:scale-90"
                      >
                        <X className="w-7 h-7 stroke-[2.5]" />
                      </button>

                      {/* Like (Swipe Direita - Electric Blue #3B82F6) */}
                      <button
                        type="button"
                        onClick={() => swipeProfile(topProfile.id, 'right')}
                        aria-label="Curtir perfil"
                        className="w-16 h-16 p-4 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.65)] transition-all active:scale-90"
                      >
                        <Heart className="w-7 h-7 fill-white" />
                      </button>

                      {/* Ir para Curtidas VIP */}
                      <button
                        type="button"
                        onClick={() => setActiveTab('likes')}
                        aria-label="Ver quem curtiu você"
                        className="relative w-11 h-11 rounded-full glass-panel border border-amber-400/40 flex items-center justify-center text-amber-400 hover:text-amber-300 transition-all active:scale-90"
                      >
                        <Crown className="w-4 h-4" />
                        {lockedLikes.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-[10px] font-extrabold text-[#0D1117] flex items-center justify-center">
                            {lockedLikes.length}
                          </span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : activeTab === 'likes' ? (
                <LikesLockScreen
                  lockedLikes={lockedLikes}
                  hasVipPlan={hasVipPlan}
                  onOpenPlansModal={() => openWalletModal('plans')}
                  onUnlockAndMatch={unlockAndMatchProfile}
                  onToggleVipForTest={toggleVipPlanForTest}
                />
              ) : selectedMatch ? (
                <ChatWindow
                  match={selectedMatch}
                  messages={messagesByMatchId[selectedMatch.id] || []}
                  isTyping={!!typingByMatchId[selectedMatch.id]}
                  coinsBalance={coinsBalance}
                  onBack={() => selectMatchChat(null)}
                  onSendMessage={sendMessage}
                  onSendGift={sendGiftInChat}
                  onOpenCoinsModal={() => openWalletModal('coins')}
                  onOpenWebhookSettings={() => setShowWebhookModal(true)}
                  webhookEnabled={webhookConfig.enabled}
                />
              ) : (
                <ChatList
                  matches={matches}
                  messagesByMatchId={messagesByMatchId}
                  typingByMatchId={typingByMatchId}
                  onSelectMatch={(matchId) => selectMatchChat(matchId)}
                  onGoToDiscovery={() => setActiveTab('discovery')}
                  onOpenWebhookSettings={() => setShowWebhookModal(true)}
                  webhookEnabled={webhookConfig.enabled}
                />
              )}
            </main>

            {/* Bottom Navigation Bar (3 Abas: Discovery | Curtidas VIP | Chat) */}
            <nav className="px-3 py-2.5 border-t border-white/10 bg-[#0D1117]/95 backdrop-blur-lg flex items-center justify-around z-30">
              <button
                type="button"
                onClick={() => setActiveTab('discovery')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'discovery'
                    ? 'bg-[#3B82F6]/20 text-white border border-[#3B82F6]/50 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                <Flame
                  className={`w-4 h-4 ${
                    activeTab === 'discovery'
                      ? 'text-[#3B82F6] fill-[#3B82F6]'
                      : ''
                  }`}
                />
                <span>Discovery</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('likes')}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'likes'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.25)]'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                <Crown
                  className={`w-4 h-4 ${
                    activeTab === 'likes' ? 'text-amber-400' : 'text-amber-400/70'
                  }`}
                />
                <span>Curtidas</span>
                {lockedLikes.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-[10px] font-extrabold text-[#0D1117]">
                    {lockedLikes.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('chat');
                  selectMatchChat(null);
                }}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === 'chat'
                    ? 'bg-[#3B82F6]/20 text-white border border-[#3B82F6]/50 shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                    : 'text-white/55 hover:text-white'
                }`}
              >
                <MessageCircle
                  className={`w-4 h-4 ${
                    activeTab === 'chat'
                      ? 'text-[#3B82F6] fill-[#3B82F6]/20'
                      : ''
                  }`}
                />
                <span>Chat</span>
                {totalUnread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#3B82F6] text-[10px] font-extrabold text-white shadow-[0_0_10px_#3B82F6]">
                    {totalUnread}
                  </span>
                )}
              </button>
            </nav>
          </>
        )}

        {/* Modal de Novo Match */}
        <MatchModal
          profile={latestMatchedProfile}
          userPhoto={userProfile.photos[0]}
          userName={userProfile.name}
          onClose={dismissMatchModal}
          onOpenChat={openChatFromMatchModal}
          onSendQuickIcebreaker={handleQuickIcebreakerFromModal}
        />

        {/* Modal de Planos VIP & Carteira de Moedas (1 Moeda = R$ 4,00) */}
        <PlansAndWalletModal
          activeModalTab={walletModalTab}
          hasVipPlan={hasVipPlan}
          coinsBalance={coinsBalance}
          lockedLikesCount={lockedLikes.length}
          onClose={closeWalletModal}
          onSwitchTab={(tab) => openWalletModal(tab)}
          onSubscribeVip={subscribeVipPlan}
          onDepositCoins={depositCoins}
        />

        {/* Modal de Configuração de Webhook / Integração LLM (OpenAI) */}
        <AnimatePresence>
          {showWebhookModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1117]/85 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.92, y: 12 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="w-full max-w-sm rounded-3xl p-5 glass-olive border border-white/15 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Webhook className="w-4 h-4 text-[#3B82F6]" />
                    <h3 className="text-sm font-extrabold text-white">
                      Motor IA & Webhook LLM
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowWebhookModal(false)}
                    className="p-1 rounded-lg text-white/60 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-white/70 leading-relaxed mb-4">
                  Por padrão, os perfis com{' '}
                  <code className="text-[#60A5FA]">is_ai: true</code> utilizam o
                  simulador contextual integrado com delay realista de{' '}
                  <strong>2 a 3 segundos</strong>. Você também pode ativar um
                  Webhook externo ou a API da OpenAI abaixo:
                </p>

                <div className="space-y-3 text-left">
                  <label className="flex items-center justify-between p-3 rounded-2xl bg-[#0D1117]/70 border border-white/10 cursor-pointer">
                    <span className="text-xs font-semibold text-white">
                      Habilitar Webhook / OpenAI Live
                    </span>
                    <input
                      type="checkbox"
                      checked={webhookConfig.enabled}
                      onChange={(e) =>
                        updateWebhookConfig({ enabled: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#3B82F6]"
                    />
                  </label>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      Endpoint URL (OpenAI ou Webhook Custom)
                    </label>
                    <input
                      type="text"
                      value={webhookConfig.endpointUrl}
                      onChange={(e) =>
                        updateWebhookConfig({ endpointUrl: e.target.value })
                      }
                      placeholder="https://api.openai.com/v1/chat/completions"
                      className="w-full px-3 py-2 rounded-xl bg-[#0D1117] border border-white/15 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-1">
                      Bearer Token / OpenAI API Key (Opcional)
                    </label>
                    <input
                      type="password"
                      value={webhookConfig.apiKey}
                      onChange={(e) =>
                        updateWebhookConfig({ apiKey: e.target.value })
                      }
                      placeholder="sk-..."
                      className="w-full px-3 py-2 rounded-xl bg-[#0D1117] border border-white/15 text-xs text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowWebhookModal(false)}
                  className="mt-5 w-full py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-bold text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
                >
                  Salvar & Voltar
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
