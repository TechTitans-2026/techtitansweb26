import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      if (isLogin) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: cleanEmail, 
          password 
        });
        if (signInError) throw signInError;
        navigate('/profile');
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (signUpError) throw signUpError;
        navigate('/profile');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden">
      <div className="anchor-glow" style={{ width: '500px', height: '500px', top: '-180px', left: '-140px', background: 'radial-gradient(circle, rgba(174,151,214,0.4), transparent 70%)' }}></div>
      <div className="anchor-glow" style={{ width: '420px', height: '420px', bottom: '-100px', right: '-160px', background: 'radial-gradient(circle, rgba(96,165,250,0.3), transparent 70%)', animationDelay: '3s' }}></div>
      
      <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10">
        
        <h2 className="text-3xl font-black text-white text-center mb-6 tracking-tight">
          {isLogin ? 'SYSTEM ACCESS' : 'MEMBER REGISTRATION'}
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-400 text-sm mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-glass"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-400 text-sm mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-keycap w-full py-4 mt-2 text-sm rounded-lg"
          >
            {loading ? 'PROCESSING...' : isLogin ? 'INITIALIZE LOGIN' : 'REGISTER'}
          </button>
        </form>

        <p className="text-gray-500 text-center mt-6 text-sm">
          {isLogin ? "Need a member account? " : "Already registered? "}
          <button 
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="text-[#b89eff] font-semibold hover:text-white transition-colors"
            type="button"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>

      </div>
    </div>
  );
};

export default Auth;
