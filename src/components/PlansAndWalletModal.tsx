import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Crown,
  Coins,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  Gift,
  Eye,
  Zap,
} from 'lucide-react';
import {
  COIN_DEPOSIT_PACKAGES,
  COIN_VALUE_BRL,
  GIFTS_CATALOG,
} from '../data/giftsCatalog';

interface PlansAndWalletModalProps {
  activeModalTab: 'plans' | 'coins' | null;
  hasVipPlan: boolean;
  coinsBalance: number;
  lockedLikesCount: number;
  onClose: () => void;
  onSwitchTab: (tab: 'plans' | 'coins') => void;
  onSubscribeVip: () => void;
  onDepositCoins: (coins: number) => void;
}

export const PlansAndWalletModal: React.FC<PlansAndWalletModalProps> = ({
  activeModalTab,
  hasVipPlan,
  coinsBalance,
  lockedLikesCount,
  onClose,
  onSwitchTab,
  onSubscribeVip,
  onDepositCoins,
}) => {
  const [customCoinsInput, setCustomCoinsInput] = useState<number>(5);
  const [depositSuccessToast, setDepositSuccessToast] = useState<string | null>(
    null
  );

  if (!activeModalTab) return null;

  const handleBuyPackage = (coins: number) => {
    onDepositCoins(coins);
    const totalBrl = coins * COIN_VALUE_BRL;
    setDepositSuccessToast(
      `Depósito de R$ ${totalBrl.toFixed(2)} confirmado! +${coins} moedas adicionadas.`
    );
    setTimeout(() => setDepositSuccessToast(null), 3200);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0D1117]/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.92, y: 18, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          className="relative w-full max-w-sm max-h-[88vh] flex flex-col rounded-3xl glass-olive border border-white/15 shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Topo & Abas */}
          <div className="p-4 border-b border-white/10 bg-[#0D1117]/75">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-sm font-extrabold text-white">
                  Maktub Store • Planos & Moedas
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seletor de Aba: Plano VIP vs Carteira de Moedas */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#0D1117] border border-white/10">
              <button
                type="button"
                onClick={() => onSwitchTab('plans')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  activeModalTab === 'plans'
                    ? 'bg-[#3B82F6] text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Plano VIP</span>
              </button>

              <button
                type="button"
                onClick={() => onSwitchTab('coins')}
                className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
                  activeModalTab === 'coins'
                    ? 'bg-[#3B82F6] text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Moedas ({coinsBalance})</span>
              </button>
            </div>
          </div>

          {/* Conteúdo Rolável */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {activeModalTab === 'plans' ? (
              <div className="space-y-4">
                {/* Card Principal do Plano Maktub Gold */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[#1A241E] to-[#0D1117] border border-amber-400/40 relative overflow-hidden">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-[10px] font-extrabold text-amber-300 uppercase mb-2">
                    <Crown className="w-3 h-3" /> Estilo Tinder Gold
                  </div>
                  <h4 className="text-xl font-extrabold text-white">
                    Maktub Gold VIP
                  </h4>
                  <p className="text-xs text-white/75 mt-1 leading-relaxed">
                    Desbloqueie imediatamente a lista de{' '}
                    <strong className="text-amber-300">
                      {lockedLikesCount} pessoas que já curtiram você
                    </strong>{' '}
                    e escolha com quem quer dar Match na hora.
                  </p>

                  <div className="mt-4 space-y-2.5">
                    {[
                      {
                        icon: Eye,
                        text: 'Veja todas as fotos sem desfoque na aba "Curtidas"',
                      },
                      {
                        icon: Zap,
                        text: 'Converta qualquer curtida pendente em Match Instantâneo',
                      },
                      {
                        icon: Gift,
                        text: 'Selo VIP exclusivo no topo das conversas e presentes',
                      },
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs">
                        <div className="w-6 h-6 rounded-lg bg-[#3B82F6]/20 border border-[#3B82F6]/40 flex items-center justify-center shrink-0">
                          <benefit.icon className="w-3.5 h-3.5 text-[#60A5FA]" />
                        </div>
                        <span className="text-white/90 font-medium">
                          {benefit.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-white/55 uppercase font-bold block">
                        Assinatura Mensal
                      </span>
                      <span className="text-2xl font-extrabold text-white">
                        R$ 29,90
                      </span>
                      <span className="text-xs text-white/60">/mês</span>
                    </div>

                    {hasVipPlan ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-xs font-extrabold text-emerald-300">
                        <CheckCircle2 className="w-4 h-4" />
                        Plano Ativo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={onSubscribeVip}
                        className="px-4 py-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-extrabold text-xs shadow-[0_0_24px_rgba(59,130,246,0.6)] transition-all"
                      >
                        Contratar Plano Agora
                      </button>
                    )}
                  </div>
                </div>

                {/* Atalho para ir comprar moedas */}
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white">
                      Quer enviar Flores ou Bombons?
                    </h5>
                    <p className="text-[11px] text-white/60">
                      Deposite saldo em Moedas (1 moeda = R$ 4,00)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSwitchTab('coins')}
                    className="px-3 py-1.5 rounded-xl bg-[#3B82F6]/20 border border-[#3B82F6]/40 text-xs font-bold text-[#60A5FA]"
                  >
                    Abrir Carteira
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Saldo Atual da Carteira */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1A241E] via-[#131820] to-[#0D1117] border border-[#3B82F6]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#60A5FA]">
                      Seu Saldo Disponível
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl font-extrabold text-white">
                        {coinsBalance} Moedas
                      </span>
                      <span className="text-xs text-white/60 font-medium">
                        (equivale a R$ {(coinsBalance * COIN_VALUE_BRL).toFixed(2)})
                      </span>
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-2xl bg-[#3B82F6]/20 border border-[#3B82F6]/50 flex items-center justify-center">
                    <Coins className="w-6 h-6 text-[#3B82F6]" />
                  </div>
                </div>

                {depositSuccessToast && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-xs font-bold text-emerald-300 text-center"
                  >
                    ✓ {depositSuccessToast}
                  </motion.div>
                )}

                {/* Pacotes de Depósito (1 Moeda = R$ 4,00) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/80">
                      Depositar Saldo (1 Moeda = R$ 4,00)
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {COIN_DEPOSIT_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => handleBuyPackage(pkg.coins)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                          pkg.popular
                            ? 'glass-olive border-[#3B82F6] shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                            : 'bg-[#131820] border-white/10 hover:border-[#3B82F6]/50'
                        }`}
                      >
                        {pkg.popular && (
                          <span className="inline-block px-2 py-0.5 rounded bg-[#3B82F6] text-[9px] font-extrabold text-white uppercase mb-1">
                            {pkg.label}
                          </span>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-amber-400" />
                          <span className="text-base font-extrabold text-white">
                            +{pkg.coins} Moedas
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[#60A5FA] mt-1">
                          Depositar R$ {pkg.amountBrl.toFixed(2)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Depósito Personalizado */}
                <div className="p-3.5 rounded-2xl bg-[#131820] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/85">
                      Quantidade Personalizada
                    </span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      Total: R$ {(customCoinsInput * COIN_VALUE_BRL).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={customCoinsInput}
                      onChange={(e) =>
                        setCustomCoinsInput(
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="w-24 px-3 py-2 rounded-xl bg-[#0D1117] border border-white/15 text-sm font-bold text-white focus:border-[#3B82F6] focus:outline-none"
                    />
                    <span className="text-xs text-white/60">moedas</span>
                    <button
                      type="button"
                      onClick={() => handleBuyPackage(customCoinsInput)}
                      className="ml-auto px-3.5 py-2 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-xs font-extrabold text-white flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Depositar</span>
                    </button>
                  </div>
                </div>

                {/* Tabela de Presentes Disponíveis no Chat (1 a 8 moedas) */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-white/80 mb-2">
                    Catálogo de Presentes (1 a 8 Moedas)
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {GIFTS_CATALOG.map((gift) => (
                      <div
                        key={gift.id}
                        className="p-2.5 rounded-xl bg-[#0D1117]/70 border border-white/10 flex items-center gap-2.5"
                      >
                        <span className="text-2xl">{gift.emoji}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {gift.name}
                          </p>
                          <p className="text-[10px] font-semibold text-amber-300">
                            {gift.coins} {gift.coins === 1 ? 'moeda' : 'moedas'}{' '}
                            <span className="text-white/45">
                              (R$ {gift.priceBrl})
                            </span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
