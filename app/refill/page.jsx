'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/app/components/BottomNav';
import { apiUrl } from '@/lib/apiUrl';

function RefillContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [creditBalance, setCreditBalance] = useState(0);
  const [selectedTier, setSelectedTier] = useState('pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const contentType = searchParams.get('from') || 'image';

  useEffect(() => {
    if (user?.id) {
      fetchCreditBalance();
    }
  }, [user?.id]);

  const fetchCreditBalance = async () => {
    try {
      const response = await fetch(
        apiUrl(`/credits/balance?userId=${user.id}`)
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
      const response = await fetch(apiUrl(`/credits/add`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tierName: selectedTier }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreditBalance(data.newBalance);
        alert(`✨ ${data.message}`);
        if (contentType === 'video') {
          router.push('/text-to-content');
        } else {
          router.push('/creative-studio');
        }
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
      icon: '⚡'
    },
    { 
      id: 'pro', 
      name: 'Flovia Pro', 
      credits: 2000, 
      price: '$33', 
      period: '6 months',
      costPerCredit: '$0.0165',
      icon: '🚀',
      recommended: true
    },
    { 
      id: 'elite', 
      name: 'Flovia Elite', 
      credits: 5000, 
      price: '$70', 
      period: '1 year',
      costPerCredit: '$0.014',
      icon: '👑'
    },
  ];

  const contentInfo = {
    image: { name: 'AI Image', cost: 1, icon: '🖼️' },
    video: { name: 'AI Video', cost: 15, icon: '🎬' },
  };

  const info = contentInfo[contentType] || contentInfo.image;

  return (
    <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans pt-[55px] pb-20">
      <div className="absolute top-[10%] left-[-20%] w-80 h-80 bg-red-600/20 rounded-full blur-[100px] pointer-events-none animate-blob z-0"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-pink-600/15 rounded-full blur-[100px] pointer-events-none animate-blob z-0" style={{ animationDelay: '2s' }}></div>

      <main className="relative z-10 w-full h-full px-6 overflow-y-auto pb-40 no-scrollbar">
        <div className="text-center pt-8 mb-8">
          <div className="text-6xl mb-4 animate-bounce">🔋</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Refill Your Flovia</h1>
          <p className="text-white/60">You've used all your {info.name.toLowerCase()} credits</p>
        </div>

        <div className="mb-8 bg-gradient-to-br from-red-500/20 via-pink-500/10 to-black border border-red-500/30 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/60 text-sm font-medium mb-1">Remaining Balance</p>
              <p className="text-4xl font-bold text-white">0 credits</p>
            </div>
            <div className="text-5xl opacity-20">
              <i className="ph-fill ph-lightning"></i>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-full mb-4"></div>
          <p className="text-xs text-white/60">
            Generate more {info.name.toLowerCase()} content (costs {info.cost} credit{info.cost > 1 ? 's' : ''} each)
          </p>
        </div>

        <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-4">
          <p className="text-sm font-semibold text-white mb-3">Why Refill?</p>
          <ul className="space-y-2">
            <li className="text-xs text-white/70 flex items-start gap-2">
              <i className="ph-fill ph-check text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>Keep creating amazing AI content without interruption</span>
            </li>
            <li className="text-xs text-white/70 flex items-start gap-2">
              <i className="ph-fill ph-check text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>Credits never expire — use them whenever you're ready</span>
            </li>
            <li className="text-xs text-white/70 flex items-start gap-2">
              <i className="ph-fill ph-check text-green-400 mt-0.5 flex-shrink-0"></i>
              <span>Higher tiers give better value per credit</span>
            </li>
          </ul>
        </div>

        <div className="space-y-3 mb-8">
          {tiers.map((tier) => (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative w-full text-left rounded-2xl border-2 transition-all p-4 ${
                selectedTier === tier.id
                  ? 'border-purple-500/60 bg-purple-500/15 shadow-lg shadow-purple-500/20'
                  : 'border-white/15 bg-white/5 hover:border-white/25'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                    ⭐ Best Value
                  </span>
                </div>
              )}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{tier.icon}</span>
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                  </div>
                  <p className="text-xs text-white/60 mb-3">{tier.period}</p>
                  <div className="inline-block px-3 py-1 bg-white/10 border border-white/20 rounded-lg">
                    <p className="text-sm font-bold text-white">
                      <i className="ph-fill ph-lightning text-purple-400 mr-1"></i>
                      {tier.credits.toLocaleString()} credits
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-white">{tier.price}</p>
                  <p className="text-xs text-white/60">{tier.costPerCredit}/credit</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-4 flex items-start gap-3">
          <i className="ph-fill ph-shield-check text-green-400 text-xl flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="text-xs font-semibold text-white mb-1">You're Protected</p>
            <p className="text-xs text-white/70">All purchases are secure. Credits never expire and are yours to keep forever.</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              isProcessing
                ? 'bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-[0.98] active:scale-95 shadow-lg shadow-purple-600/50'
            }`}
          >
            <i className={`ph-fill ${isProcessing ? 'ph-spinner animate-spin' : 'ph-credit-card'} text-lg mr-2`}></i>
            {isProcessing ? 'Processing...' : `Get ${tiers.find(t => t.id === selectedTier)?.name || ''}`}
          </button>
          <button
            onClick={() => router.back()}
            className="w-full py-3 bg-white/10 border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-colors"
          >
            Maybe Later
          </button>
        </div>
      </main>
    </div>
  );
}

export default function RefillPage() {
  return (
    <>
      <Suspense>
        <RefillContent />
      </Suspense>
      <BottomNav />
    </>
  );
}
