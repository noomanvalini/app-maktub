import { GiftItem } from '../types/dating';

/**
 * Cada moeda no Maktub vale exatamente R$ 4,00
 */
export const COIN_VALUE_BRL = 4;

/**
 * Catálogo de Presentes de 1 a 8 moedas
 * Inclui Bombom (2 moedas = R$ 8) e Flores (4 moedas = R$ 16)
 */
export const GIFTS_CATALOG: GiftItem[] = [
  {
    id: 'gift-cafe-1',
    name: 'Café Especial',
    emoji: '☕',
    coins: 1,
    priceBrl: 1 * COIN_VALUE_BRL,
    description: 'Um convite sutil para começar bem a conversa',
    rarity: 'comum',
  },
  {
    id: 'gift-bombom-2',
    name: 'Bombom',
    emoji: '🍬',
    coins: 2,
    priceBrl: 2 * COIN_VALUE_BRL,
    description: 'Caixa de bombons artesanais para adoçar o match',
    rarity: 'comum',
  },
  {
    id: 'gift-drink-3',
    name: 'Drink Autoral',
    emoji: '🍸',
    coins: 3,
    priceBrl: 3 * COIN_VALUE_BRL,
    description: 'Brinde virtual para quebrar o gelo com estilo',
    rarity: 'especial',
  },
  {
    id: 'gift-flores-4',
    name: 'Flores',
    emoji: '🌹',
    coins: 4,
    priceBrl: 4 * COIN_VALUE_BRL,
    description: 'Buquê de rosas vermelhas que destaca sua mensagem',
    rarity: 'especial',
  },
  {
    id: 'gift-pelucia-5',
    name: 'Ursinho de Pelúcia',
    emoji: '🧸',
    coins: 5,
    priceBrl: 5 * COIN_VALUE_BRL,
    description: 'Presente fofo e inesquecível de carinho',
    rarity: 'especial',
  },
  {
    id: 'gift-vinho-6',
    name: 'Vinho Reserva',
    emoji: '🍷',
    coins: 6,
    priceBrl: 6 * COIN_VALUE_BRL,
    description: 'Garrafa selecionada para propor um jantar a dois',
    rarity: 'luxo',
  },
  {
    id: 'gift-perfume-7',
    name: 'Perfume Francês',
    emoji: '✨',
    coins: 7,
    priceBrl: 7 * COIN_VALUE_BRL,
    description: 'Fragrância marcante de alta sofisticação',
    rarity: 'luxo',
  },
  {
    id: 'gift-joia-8',
    name: 'Colar de Cristal',
    emoji: '💎',
    coins: 8,
    priceBrl: 8 * COIN_VALUE_BRL,
    description: 'Presente máximo VIP — garante atenção absoluta',
    rarity: 'lendario',
  },
];

export interface CoinDepositPackage {
  id: string;
  coins: number;
  amountBrl: number;
  label: string;
  popular?: boolean;
}

export const COIN_DEPOSIT_PACKAGES: CoinDepositPackage[] = [
  {
    id: 'pkg-5',
    coins: 5,
    amountBrl: 5 * COIN_VALUE_BRL, // R$ 20,00
    label: 'Pacote Inicial',
  },
  {
    id: 'pkg-10',
    coins: 10,
    amountBrl: 10 * COIN_VALUE_BRL, // R$ 40,00
    label: 'Mais Popular',
    popular: true,
  },
  {
    id: 'pkg-20',
    coins: 20,
    amountBrl: 20 * COIN_VALUE_BRL, // R$ 80,00
    label: 'Combo Conquista',
  },
  {
    id: 'pkg-40',
    coins: 40,
    amountBrl: 40 * COIN_VALUE_BRL, // R$ 160,00
    label: 'Pacote VIP Royal',
  },
];
