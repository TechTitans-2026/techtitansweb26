import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pendingReg = location.state?.pendingRegistration;
  const redirectMessage = location.state?.message;
  const fromPath = location.state?.from || '/profile';

  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    redirectMessage ||
      (pendingReg
        ? `Registering for: ${pendingReg.activity || 'Tech Games'}`
        : '')
  );
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(false);

  // Forgot Password Modal/Form State
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // Check existing Supabase session in background
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        const hasOAuthParam = window.location.href.includes('access_token') || window.location.href.includes('code=');

        if (session?.user && !hasOAuthParam) {
          const oauthRedirectPath = sessionStorage.getItem('oauthRedirectPath');
          if (oauthRedirectPath) {
            sessionStorage.removeItem('oauthRedirectPath');
            navigate(oauthRedirectPath, { replace: true });
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, [fromPath, navigate]);

  // Handle Google OAuth Sign In
  const handleGoogleLogin = async () => {
    if (loading) return;

    setError('');
    setNotice('');
    setLoading(true);
    setTimeout(() => setLoading(false), 3500);

    try {
      sessionStorage.setItem('oauthRedirectPath', fromPath);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      sessionStorage.removeItem('oauthRedirectPath');
      console.error('Google authentication error:', err);
      setError(err.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle GitHub OAuth Sign In
  const handleGithubLogin = async () => {
    if (loading) return;

    setError('');
    setNotice('');
    setLoading(true);
    setTimeout(() => setLoading(false), 3500);

    try {
      sessionStorage.setItem('oauthRedirectPath', fromPath);

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (oauthError) throw oauthError;
    } catch (err) {
      sessionStorage.removeItem('oauthRedirectPath');
      console.error('GitHub authentication error:', err);
      setError(err.message || 'GitHub sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  // Handle Reset Password Email Verification Link
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setError('Please enter your account email address.');
      return;
    }

    setError('');
    setNotice('');
    setLoading(true);

    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(
        resetEmail.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetErr) throw resetErr;

      setNotice('📩 Password reset link sent! Please check your email inbox.');
      setResetEmail('');
      setShowForgotPassword(false);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="home-body min-h-screen flex items-center justify-center">
        <div className="text-accent font-mono text-sm animate-pulse">
          VERIFYING TITAN AUTHENTICATION...
        </div>
      </div>
    );
  }

  return (
    <div className="home-body min-h-screen flex items-center justify-center p-4 pt-24 pb-16 relative overflow-hidden">
      {/* BACKGROUND GLOW */}
      <div
        className="anchor-glow"
        style={{
          width: '500px',
          height: '500px',
          top: '-180px',
          left: '-140px',
          background:
            'radial-gradient(circle, rgba(174,151,214,0.4), transparent 70%)',
        }}
      />

      <div
        className="anchor-glow"
        style={{
          width: '420px',
          height: '420px',
          bottom: '-100px',
          right: '-160px',
          background:
            'radial-gradient(circle, rgba(96,165,250,0.3), transparent 70%)',
          animationDelay: '3s',
        }}
      />

      {/* AUTH CARD */}
      <div className="max-w-md w-full glass-panel p-8 sm:p-10 relative overflow-hidden z-10 text-center">
        {/* HEADER */}
        <div className="mb-8">
          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
            TITAN NETWORK PROTOCOL
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            SIGN IN
          </h2>
          <p className="text-gray-400 text-xs font-mono mt-2 leading-relaxed">
            Select an authenticated provider to verify your identity and access your Titan operative account.
          </p>
        </div>

        {/* NOTICE BANNER */}
        {notice && (
          <div className="bg-[#ae97d6]/10 border border-[#ae97d6]/40 text-[#ae97d6] p-3 rounded-lg mb-6 text-xs font-mono text-center">
            {notice}
          </div>
        )}

        {/* ERROR BANNER */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-xs font-mono text-center">
            {error}
          </div>
        )}

        {/* OAUTH BUTTONS */}
        <div className="flex flex-col gap-4 mb-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`btn-keycap w-full py-4 px-6 text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-3 border border-white/10 hover:border-[#00f3ff]/60 transition-all ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <i className="fab fa-google text-base text-[#ea4335]"></i>
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          <button
            type="button"
            onClick={handleGithubLogin}
            disabled={loading}
            className={`btn-keycap w-full py-4 px-6 text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-3 border border-white/10 hover:border-[#b89eff]/60 transition-all ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <i className="fab fa-github text-base text-white"></i>
            <span>CONTINUE WITH GITHUB</span>
          </button>
        </div>

        {/* RESET PASSWORD SECTION */}
        <div className="mb-6">
          {!showForgotPassword ? (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-xs font-mono text-[#00f3ff] hover:text-white transition-colors inline-flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-lg border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 bg-[#00f3ff]/5"
            >
              <i className="fas fa-key text-xs"></i>
              <span>Forgot password / Need to reset?</span>
            </button>
          ) : (
            <form
              onSubmit={handleForgotPassword}
              className="p-4 bg-black/50 border border-[#00f3ff]/40 rounded-xl space-y-3 text-left transition-all shadow-lg"
            >
              <label className="block text-[11px] font-mono text-gray-300 uppercase tracking-wider">
                Send Reset Link to Email
              </label>
              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@example.com"
                className="input-glass w-full text-xs font-mono"
              />
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-keycap flex-1 py-2.5 text-xs font-mono font-bold"
                >
                  {loading ? 'SENDING...' : 'SEND RESET LINK 📩'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="px-3 py-2 text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  CANCEL
                </button>
              </div>
            </form>
          )}
        </div>

        {/* SECURITY FOOTER NOTE */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[10px] font-mono text-gray-500 leading-relaxed">
            🔒 Encrypted Auth via Supabase Security Protocol. By signing in, you agree to Tech Titans Code of Conduct.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;