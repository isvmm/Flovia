'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';

export default function BuyCreditsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState(0);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchCreditBalance();
    }
  }, [user?.id]);

  const fetchCreditBalance = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/credits/balance?userId=${user.id}`
      );
      const data = await response.json();
      setCreditBalance(data.totalCredits || 0);
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
    }
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/credits/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tierName: selectedTier }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.newBalance);
        alert(`✨ ${data.message}`);
        setTimeout(() => router.push('/creative-studio'), 1000);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to process purchase');
    } finally {
      setIsProcessing(false);
    }
  };

  const tiers = [
    { 
      id: 'plus', 
      name: 'Flovia Plus', 
      credits: 500, 
      price: '$10', 
      period: 'per month',
      costPerCredit: '$0.02',
      benefits: [
        '500 credits/month',
        'Standard support',
        'Basic analytics',
      ]
    },
    { 
      id: 'pro', 
      name: 'Flovia Pro', 
      credits: 2000, 
      price: '$33', 
      period: '6 months',
      costPerCredit: '$0.0165',
      benefits: [
        '2,000 credits',
        'Priority support',
        'Advanced analytics',
        'Export up to 4K'
      ],
      recommended: true
    },
    { 
      id: 'elite', 
      name: 'Flovia Elite', 
      credits: 5000, 
      price: '$70', 
      period: '1 year',
      costPerCredit: '$0.014',
      benefits: [
        '5,000 credits',
        '24/7 support',
        'Full analytics',
        'Priority rendering',
        'Commercial use rights'
      ]
    },
  ];

  return (
    <>
      <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
        {/* Ambient Blur Globs */}
        <div className="absolute top-[10%] left-[-20%] w-80 h-80 bg-amber-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-yellow-600/15 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDelay: '2s' }}></div>

        <main className="relative z-10 w-full h-full px-6 overflow-y-auto pb-40 no-scrollbar">
          {/* Header */}
          <header className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Buy Credits</h1>
              <p className="text-white/60 text-sm mt-1">Unlock unlimited AI creation</p>
            </div>
            <button 
              onClick={() => router.push('/settings')}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors"
            >
              <i className="ph-bold ph-x text-lg"></i>
            </button>
          </header>

          {/* Current Balance Card */}
          <div className="mb-8 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-black border border-cyan-500/30 rounded-3xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/60 text-sm font-medium mb-1">Total Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-cyan-400">{creditBalance}</span>
                  <span className="text-white/60">credits</span>
                </div>
              </div>
              <div className="text-5xl opacity-20">
                <i className="ph-fill ph-lightning"></i>
              </div>
            </div>
            
            {/* Breakdown */}
            <div className="space-y-2 mb-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <i className="ph-fill ph-gift text-green-400"></i>
                  <span className="text-white/70">Lifetime Gift (Never Expire)</span>
                </div>
                <span className="text-green-400 font-bold">+10</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <i className="ph-fill ph-coin text-amber-400"></i>
                  <span className="text-white/70">Paid Credits</span>
                </div>
                <span className="text-amber-400 font-bold">+{Math.max(0, creditBalance - 10)}</span>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/60 leading-relaxed">
                💡 Tip: Higher plans offer better value per credit. Pro saves 18% and Elite saves 30%! Your gift credits can be used for any feature.
              </p>
            </div>
          </div>

          {/* Credit Pricing Info */}
          <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <p className="text-sm font-semibold text-white mb-3">Pricing</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                <p className="text-white/60 mb-1">🖼️ Image</p>
                <p className="text-white font-bold">1 credit</p>
              </div>
              <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                <p className="text-white/60 mb-1">🎬 Video</p>
                <p className="text-white font-bold">15 credits</p>
              </div>
              <div className="bg-black/50 rounded-lg p-3 border border-white/10">
                <p className="text-white/60 mb-1">🎯 Remix</p>
                <p className="text-white font-bold">1 credit</p>
              </div>
            </div>
          </div>

          {/* Subscription Tiers */}
          <div className="space-y-4 mb-8">
            <p className="text-sm font-semibold text-white/80 ml-1">Select a Plan</p>
            {tiers.map((tier) => (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`relative w-full text-left rounded-2xl border-2 transition-all p-4 ${
                  selectedTier === tier.id
                    ? 'border-amber-500/60 bg-amber-500/15 shadow-lg shadow-amber-500/20'
                    : 'border-white/15 bg-white/5 hover:border-white/25'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                      ⭐ Most Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <p className="text-xs text-white/60 mt-1">{tier.period}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">{tier.price}</p>
                    <p className="text-xs text-white/60">{tier.costPerCredit} per credit</p>
                  </div>
                </div>

                {/* Credits Badge */}
                <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-lg mb-3">
                  <p className="text-sm font-bold text-white">
                    <i className="ph-fill ph-lightning text-amber-400 mr-1"></i>
                    {tier.credits.toLocaleString()} credits
                  </p>
                </div>

                {/* Benefits */}
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, idx) => (
                    <li key={idx} className="text-xs text-white/60 flex items-center gap-2">
                      <i className="ph ph-check text-green-400 text-sm"></i>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Purchase Button */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                isProcessing
                  ? 'bg-gradient-to-r from-amber-600/50 to-orange-600/50 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:scale-[0.98] active:scale-95 shadow-lg shadow-amber-600/50'
              }`}
            >
              <i className={`ph-fill ${isProcessing ? 'ph-spinner animate-spin' : 'ph-credit-card'} text-lg mr-2`}></i>
              {isProcessing ? 'Processing...' : 'Purchase Now'}
            </button>
            <button
              onClick={() => router.push('/creative-studio')}
              className="w-full py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3 mb-8">
            <p className="text-sm font-semibold text-white">Frequently Asked Questions</p>
            
            <details className="group">
              <summary className="cursor-pointer text-sm text-white/80 hover:text-white font-medium flex items-center gap-2">
                <i className="ph ph-plus group-open:hidden text-white/40"></i>
                <i className="ph ph-minus hidden group-open:inline text-white/40"></i>
                Do credits expire?
              </summary>
              <p className="text-xs text-white/60 mt-2 ml-6">No, credits never expire. Use them whenever you want!</p>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm text-white/80 hover:text-white font-medium flex items-center gap-2">
                <i className="ph ph-plus group-open:hidden text-white/40"></i>
                <i className="ph ph-minus hidden group-open:inline text-white/40"></i>
                Can I get a refund?
              </summary>
              <p className="text-xs text-white/60 mt-2 ml-6">Yes, we offer 30-day refunds if you're not satisfied.</p>
            </details>

            <details className="group">
              <summary className="cursor-pointer text-sm text-white/80 hover:text-white font-medium flex items-center gap-2">
                <i className="ph ph-plus group-open:hidden text-white/40"></i>
                <i className="ph ph-minus hidden group-open:inline text-white/40"></i>
                What if I need more credits?
              </summary>
              <p className="text-xs text-white/60 mt-2 ml-6">You can purchase additional credits anytime. No limits!</p>
            </details>
          </div>
        </main>
      </div>
      <BottomNav />
    </>
  );
}
