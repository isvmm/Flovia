'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useState } from 'react';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Simulate password change
      setTimeout(() => {
        setMessage('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false);
      }, 1000);
    } catch (error) {
      setMessage('Failed to change password');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-black text-white w-full h-screen overflow-hidden relative font-sans pt-[55px] pb-20">
        {/* Ambient Blur Globs */}
        <div className="absolute top-[10%] left-[-10%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-blob z-0"></div>
        <div className="absolute bottom-[15%] right-[-15%] w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-blob z-0" style={{ animationDelay: '2s' }}></div>

        {/* Main Content */}
        <div className="relative z-10 w-full h-full overflow-y-auto no-scrollbar flex flex-col">
          
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 mb-6">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-white hover:bg-white/15 transition-colors">
              <i className="ph-bold ph-caret-left text-xl"></i>
            </button>
            <h1 className="text-2xl font-bold drop-shadow-lg">Change Password</h1>
          </div>

          {/* Form */}
          <div className="px-4 mb-6">
            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="text-sm font-semibold text-white/60 mb-2 block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="text-sm font-semibold text-white/60 mb-2 block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-sm font-semibold text-white/60 mb-2 block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 rounded-xl glass-effect border border-white/15 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all"
                  required
                />
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-xl text-sm ${message.includes('success') ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'}`}>
                  {message}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600/40 to-cyan-600/20 border border-cyan-500/30 text-cyan-400 font-semibold text-sm hover:from-cyan-600/50 hover:to-cyan-600/30 hover:border-cyan-500/50 transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
      <BottomNav />
    </>
  );
}
