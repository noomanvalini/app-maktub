import { create } from 'zustand';
import { AI_PROFILES_SEED, LOCKED_LIKES_SEED } from '../data/aiProfilesSeed';
import { generateAIChatResponse } from '../services/aiChatService';
import {
  GiftItem,
  InterestFilter,
  LLMWebhookConfig,
  Match,
  Message,
  Profile,
  UserRegistrationProfile,
} from '../types/dating';

interface DatingState {
  // Perfil do Usuário Cadastrado
  userProfile: UserRegistrationProfile;

  // Navegação principal (Discovery | Curtidas Bloqueadas VIP | Chat)
  activeTab: 'discovery' | 'likes' | 'chat';
  selectedMatchId: string | null;

  // Plano VIP (para visualizar a lista de Matches Bloqueados estilo Tinder Gold)
  hasVipPlan: boolean;
  lockedLikes: Profile[];

  // Carteira de Moedas (1 moeda = R$ 4,00)
  coinsBalance: number;

  // Controle de Modal de Planos & Moedas
  walletModalTab: 'plans' | 'coins' | null;

  // Fila de perfis e histórico de swipes
  profilesQueue: Profile[];
  swipedHistory: { profile: Profile; direction: 'left' | 'right' }[];

  // Matches ativos (instantâneos ou desbloqueados) e modal de novo match
  matches: Match[];
  latestMatchedProfile: Profile | null;
  aiMatchProbability: number;

  // Mensagens e status de digitação (2-3s delay)
  messagesByMatchId: Record<string, Message[]>;
  typingByMatchId: Record<string, boolean>;

  // Configuração de Webhook / LLM (OpenAI ou endpoint customizado)
  webhookConfig: LLMWebhookConfig;

  // Actions
  completeRegistration: (data: Omit<UserRegistrationProfile, 'isRegistered'>) => void;
  enterWithoutRegistration: () => void;
  reopenRegistration: () => void;
  setActiveTab: (tab: 'discovery' | 'likes' | 'chat') => void;
  selectMatchChat: (matchId: string | null) => void;
  openWalletModal: (tab: 'plans' | 'coins') => void;
  closeWalletModal: () => void;
  subscribeVipPlan: () => void;
  toggleVipPlanForTest: () => void;
  depositCoins: (coinsAmount: number) => void;
  unlockAndMatchProfile: (profileId: string) => void;
  swipeProfile: (profileId: string, direction: 'left' | 'right') => void;
  rewindLastSwipe: () => void;
  resetDiscoveryQueue: () => void;
  dismissMatchModal: () => void;
  openChatFromMatchModal: (profileId: string) => void;
  sendMessage: (matchId: string, text: string) => Promise<void>;
  sendGiftInChat: (matchId: string, gift: GiftItem) => Promise<boolean>;
  updateWebhookConfig: (config: Partial<LLMWebhookConfig>) => void;
}

const formatTimeNow = () =>
  new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function filterProfilesByPreferences(
  interestedIn: InterestFilter,
  searchRadiusKm: number
): Profile[] {
  const byGender = AI_PROFILES_SEED.filter((p) =>
    interestedIn === 'todos' ? true : p.gender === interestedIn
  );
  const byRadius = byGender.filter((p) => p.distance <= searchRadiusKm);
  return byRadius.length > 0 ? byRadius : byGender;
}

const initialSeedMatchProfile = AI_PROFILES_SEED[6]; // Valentina Ríos (1.2km)
const initialMatchId = `match-${initialSeedMatchProfile.id}`;

export const useDatingStore = create<DatingState>((set, get) => ({
  userProfile: {
    name: '',
    age: 26,
    photos: [],
    city: '',
    coordinates: null,
    searchRadiusKm: 25,
    interestedIn: 'mulher',
    isRegistered: false,
  },

  activeTab: 'discovery',
  selectedMatchId: null,

  // Começa sem o plano ativo para que o usuário possa ver os matches bloqueados com blur e testar a contratação
  hasVipPlan: false,
  lockedLikes: [...LOCKED_LIKES_SEED],

  // Saldo inicial de 6 moedas (equivale a R$ 24,00) para testar envio de Bombom (2) ou Flores (4) imediatamente
  coinsBalance: 6,
  walletModalTab: null,

  profilesQueue: AI_PROFILES_SEED.slice(0, 6),
  swipedHistory: [],

  matches: [
    {
      id: initialMatchId,
      profile: initialSeedMatchProfile,
      matchedAt: 'Agora mesmo',
      unreadCount: 1,
      hasInteracted: true,
    },
  ],
  latestMatchedProfile: null,
  aiMatchProbability: 0.65, // 65% geram Match Instantâneo na tela; os outros 35% vão para a lista bloqueada do Plano!

  messagesByMatchId: {
    [initialMatchId]: [
      {
        id: 'msg-seed-1',
        matchId: initialMatchId,
        senderId: initialSeedMatchProfile.id,
        text:
          initialSeedMatchProfile.ai_persona?.openingMessages[0] ||
          'Oi! Adorei nosso match ✨',
        timestamp: formatTimeNow(),
        status: 'delivered',
        source: 'mock_ai',
      },
    ],
  },
  typingByMatchId: {},

  webhookConfig: {
    enabled: false,
    endpointUrl: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    model: 'gpt-4o-mini',
  },

  completeRegistration: (data) => {
    const filteredQueue = filterProfilesByPreferences(
      data.interestedIn,
      data.searchRadiusKm
    );

    const seedMatchCandidate =
      filteredQueue[filteredQueue.length - 1] || AI_PROFILES_SEED[0];
    const seedMatchId = `match-${seedMatchCandidate.id}`;
    const queueWithoutSeedMatch = filteredQueue.filter(
      (p) => p.id !== seedMatchCandidate.id
    );

    const filteredLocked = LOCKED_LIKES_SEED.filter((p) =>
      data.interestedIn === 'todos' ? true : p.gender === data.interestedIn
    );

    set({
      userProfile: {
        ...data,
        isRegistered: true,
      },
      activeTab: 'discovery',
      selectedMatchId: null,
      lockedLikes:
        filteredLocked.length > 0 ? filteredLocked : [...LOCKED_LIKES_SEED],
      profilesQueue:
        queueWithoutSeedMatch.length > 0
          ? queueWithoutSeedMatch
          : filteredQueue,
      swipedHistory: [],
      matches: [
        {
          id: seedMatchId,
          profile: seedMatchCandidate,
          matchedAt: 'Agora mesmo',
          unreadCount: 1,
          hasInteracted: true,
        },
      ],
      messagesByMatchId: {
        [seedMatchId]: [
          {
            id: `msg-seed-${Date.now()}`,
            matchId: seedMatchId,
            senderId: seedMatchCandidate.id,
            text:
              seedMatchCandidate.ai_persona?.openingMessages[0] ||
              `Oi ${data.name}! Que bom que demos match ✨`,
            timestamp: formatTimeNow(),
            status: 'delivered',
            source: 'mock_ai',
          },
        ],
      },
    });
  },

  enterWithoutRegistration: () => {
    const demoPhoto =
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=85';

    set((state) => ({
      userProfile: {
        name: state.userProfile.name || 'Visitante',
        age: state.userProfile.age || 26,
        photos:
          state.userProfile.photos.length > 0
            ? state.userProfile.photos
            : [demoPhoto],
        city: state.userProfile.city || 'São Paulo, SP',
        coordinates: state.userProfile.coordinates || {
          lat: -23.5505,
          lng: -46.6333,
        },
        searchRadiusKm: state.userProfile.searchRadiusKm || 50,
        interestedIn: state.userProfile.interestedIn || 'todos',
        isRegistered: true,
      },
      activeTab: 'discovery',
      selectedMatchId: null,
      profilesQueue: AI_PROFILES_SEED.filter(
        (p) => p.id !== initialSeedMatchProfile.id
      ),
    }));
  },

  reopenRegistration: () =>
    set((state) => ({
      userProfile: {
        ...state.userProfile,
        isRegistered: false,
      },
    })),

  setActiveTab: (tab) =>
    set({
      activeTab: tab,
      selectedMatchId: tab !== 'chat' ? null : get().selectedMatchId,
    }),

  selectMatchChat: (matchId) => {
    if (!matchId) {
      set({ selectedMatchId: null });
      return;
    }
    set((state) => ({
      activeTab: 'chat',
      selectedMatchId: matchId,
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, unreadCount: 0 } : m
      ),
    }));
  },

  openWalletModal: (tab) => set({ walletModalTab: tab }),
  closeWalletModal: () => set({ walletModalTab: null }),

  subscribeVipPlan: () =>
    set({
      hasVipPlan: true,
      walletModalTab: null,
    }),

  toggleVipPlanForTest: () =>
    set((state) => ({
      hasVipPlan: !state.hasVipPlan,
    })),

  depositCoins: (coinsAmount) =>
    set((state) => ({
      coinsBalance: state.coinsBalance + coinsAmount,
    })),

  unlockAndMatchProfile: (profileId) => {
    const state = get();
    if (!state.hasVipPlan) {
      set({ walletModalTab: 'plans' });
      return;
    }

    const targetProfile = state.lockedLikes.find((p) => p.id === profileId);
    if (!targetProfile) return;

    const matchId = `match-${targetProfile.id}`;
    const alreadyMatched = state.matches.some((m) => m.id === matchId);

    const newMatch: Match = {
      id: matchId,
      profile: targetProfile,
      matchedAt: 'Desbloqueado VIP',
      unreadCount: 1,
      hasInteracted: false,
    };

    const openingText =
      targetProfile.ai_persona?.openingMessages?.[0] ||
      `Oi! Que incrível que você me desbloqueou no Maktub Gold ✨`;

    const openingMsg: Message = {
      id: `msg-vip-open-${Date.now()}`,
      matchId,
      senderId: targetProfile.id,
      text: openingText,
      timestamp: formatTimeNow(),
      status: 'delivered',
      source: 'mock_ai',
    };

    set({
      lockedLikes: state.lockedLikes.filter((p) => p.id !== profileId),
      matches: alreadyMatched ? state.matches : [newMatch, ...state.matches],
      latestMatchedProfile: targetProfile,
      messagesByMatchId: {
        ...state.messagesByMatchId,
        [matchId]: state.messagesByMatchId[matchId] || [openingMsg],
      },
    });
  },

  swipeProfile: (profileId, direction) => {
    const state = get();
    const targetProfile = state.profilesQueue.find((p) => p.id === profileId);
    if (!targetProfile) return;

    const remainingQueue = state.profilesQueue.filter((p) => p.id !== profileId);
    const updatedHistory = [
      ...state.swipedHistory,
      { profile: targetProfile, direction },
    ];

    if (direction === 'left') {
      set({
        profilesQueue: remainingQueue,
        swipedHistory: updatedHistory,
      });
      return;
    }

    // Mecânica Dupla de Match:
    // 1) No primeiro Like (ou ~65% das vezes), acontece o Match Instantâneo na tela.
    // 2) Nos demais Likes (~35%), o perfil vai para a lista de Matches Bloqueados ("Quem Curtiu Você"),
    //    onde o usuário precisa do Plano VIP para revelar e conversar!
    const rightSwipesCount = state.swipedHistory.filter(
      (h) => h.direction === 'right'
    ).length;
    const isInstantMatch =
      rightSwipesCount === 0 ||
      ( rightSwipesCount !== 1 && Math.random() <= state.aiMatchProbability );

    if (!isInstantMatch) {
      const alreadyInLocked = state.lockedLikes.some(
        (p) => p.id === targetProfile.id
      );
      set({
        profilesQueue: remainingQueue,
        swipedHistory: updatedHistory,
        lockedLikes: alreadyInLocked
          ? state.lockedLikes
          : [targetProfile, ...state.lockedLikes],
      });
      return;
    }

    const matchId = `match-${targetProfile.id}`;
    const alreadyMatched = state.matches.some((m) => m.id === matchId);

    const newMatch: Match = {
      id: matchId,
      profile: targetProfile,
      matchedAt: 'Agora',
      unreadCount: 0,
      hasInteracted: false,
    };

    set({
      profilesQueue: remainingQueue,
      swipedHistory: updatedHistory,
      matches: alreadyMatched ? state.matches : [newMatch, ...state.matches],
      latestMatchedProfile: targetProfile,
      messagesByMatchId: {
        ...state.messagesByMatchId,
        [matchId]: state.messagesByMatchId[matchId] || [],
      },
    });

    if (targetProfile.is_ai && !alreadyMatched) {
      set((s) => ({
        typingByMatchId: { ...s.typingByMatchId, [matchId]: true },
      }));

      setTimeout(() => {
        const currentMessages = get().messagesByMatchId[matchId] || [];
        if (currentMessages.length > 0) {
          set((s) => ({
            typingByMatchId: { ...s.typingByMatchId, [matchId]: false },
          }));
          return;
        }

        const openingPool = targetProfile.ai_persona?.openingMessages || [
          `Oi! Que bom que demos match ✨`,
        ];
        const openingText =
          openingPool[Math.floor(Math.random() * openingPool.length)];

        const openingMsg: Message = {
          id: `msg-ai-open-${Date.now()}`,
          matchId,
          senderId: targetProfile.id,
          text: openingText,
          timestamp: formatTimeNow(),
          status: 'delivered',
          source: 'mock_ai',
        };

        const isViewingThisChat =
          get().activeTab === 'chat' && get().selectedMatchId === matchId;

        set((s) => ({
          typingByMatchId: { ...s.typingByMatchId, [matchId]: false },
          messagesByMatchId: {
            ...s.messagesByMatchId,
            [matchId]: [openingMsg],
          },
          matches: s.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  unreadCount: isViewingThisChat ? 0 : m.unreadCount + 1,
                }
              : m
          ),
        }));
      }, 2400);
    }
  },

  rewindLastSwipe: () => {
    const state = get();
    if (state.swipedHistory.length === 0) return;

    const lastEntry = state.swipedHistory[state.swipedHistory.length - 1];
    set({
      profilesQueue: [lastEntry.profile, ...state.profilesQueue],
      swipedHistory: state.swipedHistory.slice(0, -1),
    });
  },

  resetDiscoveryQueue: () => {
    const { userProfile, matches } = get();
    const filtered = filterProfilesByPreferences(
      userProfile.interestedIn,
      userProfile.searchRadiusKm
    );
    const matchedIds = new Set(matches.map((m) => m.profile.id));
    const unseen = filtered.filter((p) => !matchedIds.has(p.id));
    set({
      profilesQueue: unseen.length > 0 ? unseen : [...filtered],
      swipedHistory: [],
    });
  },

  dismissMatchModal: () => set({ latestMatchedProfile: null }),

  openChatFromMatchModal: (profileId) => {
    const matchId = `match-${profileId}`;
    set((state) => ({
      latestMatchedProfile: null,
      activeTab: 'chat',
      selectedMatchId: matchId,
      matches: state.matches.map((m) =>
        m.id === matchId ? { ...m, unreadCount: 0 } : m
      ),
    }));
  },

  sendMessage: async (matchId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const state = get();
    const match = state.matches.find((m) => m.id === matchId);
    if (!match) return;

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      matchId,
      senderId: 'user',
      text: trimmed,
      timestamp: formatTimeNow(),
      status: 'read',
      source: 'user',
    };

    const existingHistory = state.messagesByMatchId[matchId] || [];
    const updatedHistory = [...existingHistory, userMsg];

    set((s) => ({
      messagesByMatchId: {
        ...s.messagesByMatchId,
        [matchId]: updatedHistory,
      },
      matches: s.matches.map((m) =>
        m.id === matchId ? { ...m, hasInteracted: true, unreadCount: 0 } : m
      ),
    }));

    if (match.profile.is_ai) {
      set((s) => ({
        typingByMatchId: { ...s.typingByMatchId, [matchId]: true },
      }));

      const aiResponse = await generateAIChatResponse(
        match.profile,
        trimmed,
        updatedHistory,
        get().webhookConfig
      );

      if (aiResponse) {
        const aiMessage: Message = {
          id: `msg-ai-${Date.now()}`,
          matchId,
          senderId: match.profile.id,
          text: aiResponse.replyText,
          timestamp: formatTimeNow(),
          status: 'delivered',
          source: aiResponse.source,
        };

        const isStillViewingChat =
          get().activeTab === 'chat' && get().selectedMatchId === matchId;

        set((s) => ({
          typingByMatchId: { ...s.typingByMatchId, [matchId]: false },
          messagesByMatchId: {
            ...s.messagesByMatchId,
            [matchId]: [...(s.messagesByMatchId[matchId] || []), aiMessage],
          },
          matches: s.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  hasInteracted: true,
                  unreadCount: isStillViewingChat ? 0 : m.unreadCount + 1,
                }
              : m
          ),
        }));
      } else {
        set((s) => ({
          typingByMatchId: { ...s.typingByMatchId, [matchId]: false },
        }));
      }
    }
  },

  sendGiftInChat: async (matchId, gift) => {
    const state = get();
    if (state.coinsBalance < gift.coins) {
      set({ walletModalTab: 'coins' });
      return false;
    }

    const match = state.matches.find((m) => m.id === matchId);
    if (!match) return false;

    const giftMsg: Message = {
      id: `msg-gift-${Date.now()}`,
      matchId,
      senderId: 'user',
      text: `Enviou um presente: ${gift.emoji} ${gift.name}`,
      timestamp: formatTimeNow(),
      status: 'read',
      source: 'user',
      gift,
    };

    const existingHistory = state.messagesByMatchId[matchId] || [];
    const updatedHistory = [...existingHistory, giftMsg];

    set((s) => ({
      coinsBalance: s.coinsBalance - gift.coins,
      messagesByMatchId: {
        ...s.messagesByMatchId,
        [matchId]: updatedHistory,
      },
      matches: s.matches.map((m) =>
        m.id === matchId ? { ...m, hasInteracted: true, unreadCount: 0 } : m
      ),
    }));

    if (match.profile.is_ai) {
      set((s) => ({
        typingByMatchId: { ...s.typingByMatchId, [matchId]: true },
      }));

      const aiResponse = await generateAIChatResponse(
        match.profile,
        giftMsg.text,
        updatedHistory,
        get().webhookConfig,
        gift
      );

      if (aiResponse) {
        const aiMessage: Message = {
          id: `msg-ai-gift-${Date.now()}`,
          matchId,
          senderId: match.profile.id,
          text: aiResponse.replyText,
          timestamp: formatTimeNow(),
          status: 'delivered',
          source: aiResponse.source,
        };

        const isStillViewingChat =
          get().activeTab === 'chat' && get().selectedMatchId === matchId;

        set((s) => ({
          typingByMatchId: { ...s.typingByMatchId, [matchId]: false },
          messagesByMatchId: {
            ...s.messagesByMatchId,
            [matchId]: [...(s.messagesByMatchId[matchId] || []), aiMessage],
          },
          matches: s.matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  hasInteracted: true,
                  unreadCount: isStillViewingChat ? 0 : m.unreadCount + 1,
                }
              : m
          ),
        }));
      }
    }

    return true;
  },

  updateWebhookConfig: (config) =>
    set((state) => ({
      webhookConfig: { ...state.webhookConfig, ...config },
    })),
}));
