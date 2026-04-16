'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [appleLoading, setAppleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setError('');
    setAppleLoading(true);

    try {
      await signInWithApple();
      router.push('/');
    } catch (err) {
      setError(err.message || 'Apple sign in failed');
    } finally {
      setAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      await signInWithGoogle();
      router.push('/');
    } catch (err) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="bg-black text-white w-full h-[100dvh] overflow-hidden relative font-sans flex flex-col">
      {/* Ambient Blur Globs */}
      <div className="absolute top-[-10%] left-[-20%] w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px] pointer-events-none animate-blob z-0"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-96 h-96 bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none animate-blob z-0" style={{ animationDelay: '2s' }}></div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none z-10"></div>

      {/* Content */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 py-8">
        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <i className="ph-fill ph-play text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold mb-2">MuseFlow</h1>
          <p className="text-white/50 text-sm">Create. Share. Inspire.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-widest">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="input-field w-full"
              disabled={loading}
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-widest">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field w-full pr-12"
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
              >
                <i className={`ph-fill ${showPassword ? 'ph-eye' : 'ph-eye-slash'} text-lg`}></i>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-200 flex items-center gap-2">
              <i className="ph-fill ph-warning text-lg flex-shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 hover:from-cyan-600 hover:to-fuchsia-600 disabled:from-white/20 disabled:to-white/20 text-white font-bold py-3 rounded-xl transition-all duration-200 uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:shadow-none mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <i className="ph-fill ph-circle-notch animate-spin"></i>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/50 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {googleLoading ? (
              <>
                <i className="ph-fill ph-circle-notch animate-spin"></i>
                <span className="text-sm">Connecting...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="text-sm">Sign in with Google</span>
              </>
            )}
          </button>
        </form>

        {/* Social Sign In */}
        <div className="mt-6 w-full max-w-sm space-y-4">
          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/40 uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Apple Sign In Button */}
          <button
            onClick={handleAppleSignIn}
            disabled={appleLoading}
            className="w-full bg-white hover:bg-white/90 disabled:bg-white/20 text-black disabled:text-white/40 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:shadow-none"
          >
            {appleLoading ? (
              <>
                <i className="ph-fill ph-circle-notch animate-spin"></i>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <i className="ph-fill ph-apple-logo text-xl"></i>
                <span>Sign in with Apple</span>
              </>
            )}
          </button>
        </div>

        {/* Demo Account Info */}
        <div className="mt-6 p-3 bg-white/5 border border-cyan-500/30 rounded-lg text-center text-xs text-white/60">
          <p className="font-semibold text-cyan-300 mb-1">Demo Account</p>
          <p>demo@appgen.com / demo1234</p>
        </div>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/signup')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
