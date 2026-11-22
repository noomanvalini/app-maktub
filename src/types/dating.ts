export type GenderType = 'homem' | 'mulher';
export type InterestFilter = 'homem' | 'mulher' | 'todos';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: GenderType;
  bio: string;
  photos: string[];
  distance: number; // in km
  city?: string;
  is_ai: boolean;
  occupation?: string;
  interests?: string[];
  ai_persona?: {
    vibe: string;
    systemPrompt: string;
    openingMessages: string[];
    contextualReplies: string[];
  };
}

export interface UserRegistrationProfile {
  name: string;
  age: number;
  photos: string[];
  city: string;
  coordinates?: {
    lat: number;
    lng: number;
  } | null;
  searchRadiusKm: number;
  interestedIn: InterestFilter;
  isRegistered: boolean;
}

export interface GiftItem {
  id: string;
  name: string;
  emoji: string;
  coins: number; // 1 a 8 moedas
  priceBrl: number; // coins * 4 reais
  description: string;
  rarity: 'comum' | 'especial' | 'luxo' | 'lendario';
}

export interface Message {
  id: string;
  matchId: string;
  senderId: 'user' | string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  source?: 'mock_ai' | 'webhook_llm' | 'user';
  gift?: GiftItem;
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: string;
  unreadCount: number;
  hasInteracted: boolean;
}

export interface LLMWebhookConfig {
  enabled: boolean;
  endpointUrl: string;
  apiKey: string;
  model: string;
}
