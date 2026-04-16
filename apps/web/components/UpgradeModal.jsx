'use client';

import { useState } from 'react';

export default function UpgradeModal({ isOpen, onClose, requiredCredits, currentCredits, onUpgrade }) {
  const [selectedTier, setSelectedTier] = useState('plus');

  if (!isOpen) return null;

  const tiers = [
    { id: 'plus', name: 'Flovia Plus', credits: 500, price: '$10', period: '/month', color: 'from-blue-600 to-cyan-600' },
    { id: 'pro', name: 'Flovia Pro', credits: 2000, price: '$33', period: '/6 months', color: 'from-purple-600 to-pink-600', recommended: true },
    { id: 'elite', name: 'Flovia Elite', credits: 5000, price: '$70', period: '/year', color: 'from-yellow-600 to-orange-600' },
  ];

  const handleUpgrade = () => {
    onUpgrade(selectedTier);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md mx-4 rounded-3xl overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-black/90 to-black/80"></div>
        <div className="absolute inset-0 opacity-30 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"></div>

        <div className="relative z-10 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Insufficient Credits</h2>
              <p className="text-white/60 text-sm mt-1">You need {requiredCredits} credits to continue</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <i className="ph-bold ph-x text-white text-lg"></i>
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-white/60 font-medium">Current Balance</span>
              <span className="text-2xl font-bold text-cyan-400">{currentCredits}</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                style={{ width: `${Math.min(currentCredits, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-white/40 mt-2">You need {requiredCredits - currentCredits} more credits</p>
            <p className="text-xs text-green-400/70 mt-2 flex items-center gap-1">
              <i className="ph-fill ph-check-circle"></i>
              You have 10 lifetime gift credits (never expire!)
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-xs text-white/60 font-semibold">Select a plan:</p>
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative w-full p-4 rounded-2xl border-2 transition-all ${
                  selectedTier === tier.id
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <p className="font-bold text-white">{tier.name}</p>
                    <p className="text-xs text-white/60 mt-1">{tier.credits.toLocaleString()} credits</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">{tier.price}</p>
                    <p className="text-xs text-white/60">{tier.period}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 text-xs text-white/70">
            <div className="flex justify-between">
              <span>Cost per image:</span>
              <span className="text-white">1 credit</span>
            </div>
            <div className="flex justify-between">
              <span>Cost per video:</span>
              <span className="text-white">15 credits</span>
            </div>
            <div className="flex justify-between">
              <span>Free daily allowance:</span>
              <span className="text-white">5 credits</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleUpgrade}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-bold text-white hover:scale-[0.98] transition-transform"
            >
              <i className="ph-fill ph-sparkles mr-2"></i>
              Upgrade Now
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-xl font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-[10px] text-white/50 text-center leading-relaxed">
            Payments are securely processed. Credits are added instantly after purchase.
          </p>
        </div>
      </div>
    </div>
  );
}
