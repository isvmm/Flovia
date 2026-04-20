'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { apiUrl } from '@/lib/apiUrl';

export default function ReferralsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [referralCode, setReferralCode] = useState(null);
  const [referralUrl, setReferralUrl] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user?.id) {
      generateReferralCode();
      fetchReferralData();
    }
  }, [user?.id, loading]);

  const generateReferralCode = async () => {
    try {
      const response = await fetch(
        apiUrl(`/referrals/generate-code`),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id })
        }
      );
      const data = await response.json();
      setReferralCode(data.referral_code);
      setReferralUrl(data.referral_url);
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  };

  const fetchReferralData = async () => {
    setLoadingData(true);
    try {
      const response = await fetch(
        apiUrl(`/referrals/status?userId=${user.id}`)
      );
      const data = await response.json();
      setReferralData(data);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const copyToClipboard = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralLink = async () => {
    if (referralUrl && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Flovia',
          text: 'Create amazing AI content on Flovia. Sign up with my referral link and get 10 free AI Credits!',
          url: referralUrl
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white w-full min-h-screen overflow-hidden relative font-sans pt-[55px] pb-20">
      {/* Ambient Blur Globs */}
      <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen z-0"></div>
      <div className="absolute bottom-[15%] right-[-15%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen z-0" style={{ animationDelay: '2s' }}></div>

      {/* Main Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 mb-6">
          <h1 className="text-2xl font-bold drop-shadow-lg">Earn Credits</h1>
          <button className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/15 transition-colors" onClick={() => router.back()}>
            <i className="ph-bold ph-x text-xl"></i>
          </button>
        </div>

        {/* Referral Code Card */}
        <div className="px-4 mb-6">
          <div className="glass-effect rounded-2xl border border-white/15 p-6 relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-sm font-bold uppercase text-white/60 tracking-wider mb-4">Your Referral Code</h2>
              
              {referralCode && (
                <>
                  {/* Code Display */}
                  <div className="mb-4">
                    <p className="text-xs text-white/60 mb-2">Share this code with friends</p>
                    <div className="bg-black/40 rounded-xl p-4 border border-white/10 mb-3">
                      <p className="text-2xl font-bold text-cyan-400 tracking-widest text-center font-mono">{referralCode}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                      onClick={copyToClipboard}
                      className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <i className="ph-bold ph-copy text-lg"></i>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button 
                      onClick={shareReferralLink}
                      className="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 border border-fuchsia-500/50 text-fuchsia-400 font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <i className="ph-bold ph-share-network text-lg"></i>
                      Share
                    </button>
                  </div>

                  {/* Referral URL */}
                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 mb-4">
                    <p className="text-xs text-white/60 mb-1">Full referral link</p>
                    <p className="text-xs text-white/80 break-all font-mono">{referralUrl}</p>
                  </div>
                </>
              )}

              {/* How It Works */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                <p className="text-xs font-semibold text-cyan-400 mb-2">✓ How it works</p>
                <ol className="text-xs text-white/70 space-y-2 list-decimal list-inside">
                  <li>Share your referral code with friends</li>
                  <li>They sign up using your code</li>
                  <li>After they verify their email, you get 10 free AI Credits</li>
                  <li>No limits - earn credits for unlimited referrals!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card */}
        {referralData && (
          <div className="px-4 mb-6">
            <div className="glass-effect rounded-2xl border border-white/15 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-cyan-500/10 pointer-events-none"></div>
              
              <div className="relative z-10">
                <h2 className="text-sm font-bold uppercase text-white/60 tracking-wider mb-4">Your Referral Stats</h2>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-cyan-400">{referralData.stats.total_referrals}</p>
                    <p className="text-xs text-white/60 mt-1">Total Referrals</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-fuchsia-400">{referralData.stats.pending}</p>
                    <p className="text-xs text-white/60 mt-1">Pending</p>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center">
                    <p className="text-2xl font-bold text-green-400">{referralData.stats.verified}</p>
                    <p className="text-xs text-white/60 mt-1">Verified</p>
                  </div>
                </div>

                {/* Earned Credits */}
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/60 mb-1">Credits Earned</p>
                      <p className="text-2xl font-bold text-cyan-400">{referralData.referral_credits_earned}</p>
                    </div>
                    <i className="ph-fill ph-lightning text-4xl text-amber-400 opacity-50"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Referral History */}
        {referralData && referralData.referrals.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="text-sm font-bold uppercase text-white/60 tracking-wider mb-3">Recent Referrals</h2>
            <div className="glass-effect rounded-2xl border border-white/15 overflow-hidden divide-y divide-white/10">
              {referralData.referrals.map((referral) => (
                <div key={referral.id} className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <i className={`ph-bold ${
                        referral.status === 'pending' ? 'ph-hourglass text-yellow-400' :
                        referral.status === 'verified' ? 'ph-check-circle text-green-400' :
                        'ph-x-circle text-red-400'
                      } text-lg`}></i>
                      <span className="text-xs font-semibold text-white/80">{referral.id.slice(0, 8)}</span>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      referral.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      referral.status === 'verified' ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {referral.status === 'pending' ? 'Awaiting Email' : 
                       referral.status === 'verified' ? 'Email Verified ✓' : 'Cancelled'}
                    </span>
                  </div>
                  <p className="text-xs text-white/60">
                    {referral.status === 'pending' && 'Waiting for email verification...'}
                    {referral.status === 'verified' && `Verified via ${referral.verification_type} on ${new Date(referral.referred_user_verified_at).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {referralData && referralData.referrals.length === 0 && (
          <div className="px-4 mb-6">
            <div className="glass-effect rounded-2xl border border-white/15 p-8 text-center">
              <i className="ph-bold ph-user-plus text-4xl text-white/40 mb-3 block"></i>
              <p className="text-white/60 mb-2">No referrals yet</p>
              <p className="text-xs text-white/40">Share your code above to start earning!</p>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
