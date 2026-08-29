import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pendingReg = location.state?.pendingRegistration;
  const redirectMessage = location.state?.message;
  const fromPath = location.state?.from || '/profile';

  const [isLogin, setIsLogin] = useState(!pendingReg);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(pendingReg?.name || '');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    redirectMessage || (pendingReg ? `Registering for: ${pendingReg.activity || 'Tech Games'}` : '')
  );
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        if (signInError) throw signInError;
        navigate(fromPath);
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/profile`,
            data: { 
              full_name: fullName,
              course: pendingReg?.course || null,
              registered_activity: pendingReg?.activity || null
            }
          }
        });
        if (signUpError) throw signUpError;
        
        if (data?.session) {
          navigate(fromPath);
        } else {
          setNotice('Registration successful! Please check your email to confirm your account.');
          setIsLogin(true);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-body min-h-screen flex items-center justify-center p-4 pt-24 pb-16 relative overflow-hidden">
      <div className="anchor-glow" style={{ width: '500px', height: '500px', top: '-180px', left: '-140px', background: 'radial-gradient(circle, rgba(174,151,214,0.4), transparent 70%)' }}></div>
      <div className="anchor-glow" style={{ width: '420px', height: '420px', bottom: '-100px', right: '-160px', background: 'radial-gradient(circle, rgba(96,165,250,0.3), transparent 70%)', animationDelay: '3s' }}></div>
      
      <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10">
        
        <div className="text-center mb-6">
          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">TITAN NETWORK</span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin ? 'SIGN IN' : 'MEMBER REGISTRATION'}
          </h2>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-glass w-full text-sm"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass w-full text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full pr-10 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-keycap w-full py-3.5 mt-2 text-sm cursor-pointer"
          >
            {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'REGISTER'}
          </button>
        </form>

        <p className="text-gray-400 font-mono text-center mt-6 text-xs">
          {isLogin ? "Need a member account? " : "Already registered? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); setNotice(''); }}
            className="text-accent font-semibold hover:text-white transition-colors cursor-pointer"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;
