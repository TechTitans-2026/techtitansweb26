import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkRecoverySession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError(
            'Invalid or expired password reset link. Please request a new one.'
          );
        }
      } catch (err) {
        console.error('Password reset session check failed:', err);
        setError('Unable to verify password reset link.');
      } finally {
        setCheckingSession(false);
      }
    };

    checkRecoverySession();
  }, []);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError('');
    setNotice('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) throw updateError;

      setNotice(
        'Password changed successfully! Redirecting to Sign In...'
      );

      setPassword('');
      setConfirmPassword('');

      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 1500);

    } catch (err) {
      console.error('Password reset error:', err);

      setError(
        err.message || 'Unable to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="home-body min-h-screen flex items-center justify-center">
        <div className="text-accent font-mono text-sm">
          VERIFYING RESET LINK...
        </div>
      </div>
    );
  }

  return (
    <div className="home-body min-h-screen flex items-center justify-center p-4 pt-24 pb-16 relative overflow-hidden">

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

      <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10">

        <div className="text-center mb-6">
          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
            TITAN NETWORK
          </span>

          <h2 className="text-3xl font-black text-white tracking-tight">
            RESET PASSWORD
          </h2>

          <p className="text-gray-500 text-xs font-mono mt-2">
            Create a new secure password
          </p>
        </div>

        {notice && (
          <div className="bg-[#ae97d6]/10 border border-[#ae97d6]/40 text-[#ae97d6] p-3 rounded-lg mb-6 text-xs font-mono text-center">
            {notice}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-xs font-mono text-center">
            {error}
          </div>
        )}

        <form
          onSubmit={handleResetPassword}
          className="space-y-4"
        >

          <div>
            <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">
              New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass w-full text-sm"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">
              Confirm New Password
            </label>

            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-glass w-full text-sm"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn-keycap w-full py-3.5 text-sm ${
              loading
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >
            {loading
              ? 'UPDATING PASSWORD...'
              : 'CHANGE PASSWORD'}
          </button>

        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/auth')}
            className="text-accent font-mono text-xs hover:text-white cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;