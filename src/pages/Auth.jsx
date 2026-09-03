
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ============================================================
  // EXISTING PROJECT NAVIGATION / REGISTRATION DATA
  // ============================================================

  const pendingReg = location.state?.pendingRegistration;
  const redirectMessage = location.state?.message;
  const fromPath = location.state?.from || '/profile';

  // ============================================================
  // FORM STATE
  // ============================================================

  const [isLogin, setIsLogin] = useState(!pendingReg);

  const [fullName, setFullName] = useState(
    pendingReg?.name || ''
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ============================================================
  // UI STATE
  // ============================================================

  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    redirectMessage ||
      (pendingReg
        ? `Registering for: ${
            pendingReg.activity || 'Tech Games'
          }`
        : '')
  );

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);
 
 
  const [showForgotPassword, setShowForgotPassword] =
  useState(false);
  const [resetEmail, setResetEmail] = useState('');



  const [checkingSession, setCheckingSession] = useState(true);

  // ============================================================
  // PASSWORD STRENGTH
  // ============================================================

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: '',
      };
    }

    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        score,
        label: 'Weak',
      };
    }

    if (score <= 4) {
      return {
        score,
        label: 'Medium',
      };
    }

    return {
      score,
      label: 'Strong',
    };
  }, [password]);

  // ============================================================
  // CHECK EXISTING SUPABASE SESSION
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          const oauthRedirectPath =
            sessionStorage.getItem('oauthRedirectPath');

          if (oauthRedirectPath) {
            sessionStorage.removeItem('oauthRedirectPath');
            navigate(oauthRedirectPath);
          }
        }
      } catch (err) {
        console.error(
          'Session check failed:',
          err
        );
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // LISTEN FOR SUPABASE AUTH CHANGES
  // ============================================================

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {});

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================
  // EMAIL VALIDATION
  // ============================================================

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );
  };

  // ============================================================
  // FRIENDLY SUPABASE ERROR MESSAGES
  // ============================================================

  const getFriendlyError = (message) => {
    const text = message?.toLowerCase() || '';

    if (text.includes('invalid login credentials')) {
      return 'Incorrect email or password.';
    }

    if (text.includes('email not confirmed')) {
      return 'Please confirm your email before signing in.';
    }

    if (text.includes('user already registered')) {
      return 'An account with this email already exists.';
    }

    if (text.includes('password')) {
      return message;
    }

    if (text.includes('rate limit')) {
      return 'Too many attempts. Please wait a moment and try again.';
    }

    if (
      text.includes('network') ||
      text.includes('fetch')
    ) {
      return 'Network error. Please check your internet connection.';
    }

    return message || 'Something went wrong.';
  };

  // ============================================================
  // HANDLE LOGIN / REGISTER
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError('');
    setNotice('');

    const cleanEmail = email
      .trim()
      .toLowerCase();

    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (!isValidEmail(cleanEmail)) {
      setError(
        'Please enter a valid email address.'
      );
      return;
    }

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      return;
    }

    // ========================================================
    // REGISTRATION VALIDATION
    // ========================================================

    if (!isLogin) {
      if (!fullName.trim()) {
        setError('Please enter your full name.');
        return;
      }

      if (password !== confirmPassword) {
        setError(
          'Passwords do not match.'
        );
        return;
      }

      if (passwordStrength.score < 3) {
        setError(
          'Please choose a stronger password.'
        );
        return;
      }
    }

    setLoading(true);

    try {
      // ======================================================
      // LOGIN
      // ======================================================

      if (isLogin) {
        const {
          data,
          error: signInError,
        } =
          await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });

        if (signInError) {
          throw signInError;
        }

        if (!data?.user) {
          throw new Error(
            'Login failed. Please try again.'
          );
        }

        setNotice(
          'Login successful! Redirecting...'
        );

        setTimeout(() => {
          navigate(fromPath);
        }, 500);

        return;
      }

      // ======================================================
      // REGISTRATION
      // ======================================================

      const {
        data,
        error: signUpError,
      } = await supabase.auth.signUp({
        email: cleanEmail,
        password,

        options: {
          // Email confirmation redirects here
          emailRedirectTo:
            `${window.location.origin}/profile`,

          // Metadata stored with Supabase Auth user
          data: {
            full_name:
              fullName.trim(),

            course:
              pendingReg?.course || null,

            registered_activity:
              pendingReg?.activity || null,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // ======================================================
      // SESSION CREATED IMMEDIATELY
      // ======================================================

      if (data?.session && data?.user) {
        setNotice(
          'Registration successful! Redirecting...'
        );

        setTimeout(() => {
          navigate(fromPath);
        }, 500);

        return;
      }

      // ======================================================
      // CHECK FOR EXISTING EMAIL / EMAIL CONFIRMATION
      // ======================================================

      // Supabase may return an empty identities array when
      // the email is already registered.
      if (
        data?.user &&
        Array.isArray(data.user.identities) &&
        data.user.identities.length === 0
      ) {
        setError(
          'This email is already registered. Please Sign In instead. If you forgot your password, use Forgot Password.'
        );

        setIsLogin(true);
        setPassword('');
        setConfirmPassword('');
        return;
      }

      // New user - email confirmation required
      setNotice(
        'Registration successful! Please check your email and confirm your account.'
      );

      setIsLogin(true);
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
              console.error(
                'Authentication error:',
                   err
         );

        setError(
          getFriendlyError(err.message)
        );
      } finally {
        setLoading(false);
      }
    };
  // ============================================================
  // GOOGLE LOGIN
  // ============================================================

  const handleGoogleLogin = async () => {
    if (loading) return;

    setError('');
    setNotice('');
    setLoading(true);

    try {
      sessionStorage.setItem('oauthRedirectPath', fromPath);

      const { error: oauthError } =
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth`,
          },
        });

      if (oauthError) {
        throw oauthError;
      }
    } catch (err) {
      sessionStorage.removeItem('oauthRedirectPath');
      console.error('Google authentication error:', err);
      setError(getFriendlyError(err.message));
      setLoading(false);
    }
  };

  // ============================================================
// SEND PASSWORD RESET EMAIL
// ============================================================

const handleForgotPassword = async (e) => {
  e.preventDefault();

  setError('');
  setNotice('');

 const cleanEmail = resetEmail.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    setError('Please enter a valid email address.');
    return;
  }

  setLoading(true);

  try {
const { error: resetError } =
   await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

    if (resetError) {
      throw resetError;
    }

    setNotice(
      'If this email is registered, a password reset link has been sent.'
    );

    setResetEmail('');

    setTimeout(() => {
      setShowForgotPassword(false);
    }, 2500);

  } catch (err) {
    console.error(
      'Password reset request error:',
      err
    );

    setError(
      getFriendlyError(err.message)
    );
  } finally {
    setLoading(false);
  }
};
  // ============================================================
  // SWITCH LOGIN / REGISTER
  // ============================================================

  const switchMode = () => {
    setIsLogin(!isLogin);

    setError('');
    setNotice('');

    setPassword('');
    setConfirmPassword('');
  };

  // ============================================================
  // LOADING SESSION CHECK
  // ============================================================

  if (checkingSession) {
    return (
      <div className="home-body min-h-screen flex items-center justify-center">
        <div className="text-accent font-mono text-sm">
          CHECKING AUTHENTICATION...
        </div>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="home-body min-h-screen flex items-center justify-center p-4 pt-24 pb-16 relative overflow-hidden">

      {/* ======================================================
          BACKGROUND GLOW
      ====================================================== */}

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

      {/* ======================================================
          AUTH CARD
      ====================================================== */}

      <div className="max-w-md w-full glass-panel p-8 relative overflow-hidden z-10">

        {/* HEADER */}

        <div className="text-center mb-6">

          <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-2 block">
            TITAN NETWORK
          </span>

          <h2 className="text-3xl font-black text-white tracking-tight">
            {isLogin
              ? 'SIGN IN'
              : 'MEMBER REGISTRATION'}
          </h2>

          <p className="text-gray-500 text-xs font-mono mt-2">
            {isLogin
              ? 'Access your Titan account'
              : 'Create your Titan account'}
          </p>

        </div>

        {/* NOTICE */}

        {notice && (
          <div className="bg-[#ae97d6]/10 border border-[#ae97d6]/40 text-[#ae97d6] p-3 rounded-lg mb-6 text-xs font-mono text-center">
            {notice}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-6 text-xs font-mono text-center">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className={`btn-keycap w-full py-3.5 mb-4 text-sm ${
            loading
              ? 'opacity-60 cursor-not-allowed'
              : 'cursor-pointer'
          }`}
        >
          {loading ? 'PROCESSING...' : 'CONTINUE WITH GOOGLE'}
        </button>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* FULL NAME */}

          {!isLogin && (
            <div>

              <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">
                Full Name
              </label>

              <input
                type="text"
                required
                value={fullName}
                onChange={(e) =>
                  setFullName(
                    e.target.value
                  )
                }
                className="input-glass w-full text-sm"
                placeholder="John Doe"
                autoComplete="name"
              />

            </div>
          )}

          {/* EMAIL */}

          <div>

            <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">
              Email Address
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="input-glass w-full text-sm"
              placeholder="you@example.com"
              autoComplete="email"
            />

          </div>

          {/* PASSWORD */}

          <div>

            <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                required
                minLength={8}
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="input-glass w-full pr-10 text-sm"
                placeholder="••••••••"
                autoComplete={
                  isLogin
                    ? 'current-password'
                    : 'new-password'
                }
              />

              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white cursor-pointer"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? 'Hide password'
                    : 'Show password'
                }
              >
                {showPassword
                  ? '🙈'
                  : '👁'}
              </button>

            </div>

            {/* PASSWORD STRENGTH */}

            {!isLogin &&
              password && (
                <div className="mt-2">

                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map(
                      (level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <=
                            passwordStrength.score
                              ? 'bg-[#ae97d6]'
                              : 'bg-gray-700'
                          }`}
                        />
                      )
                    )}

                  </div>

                  <p className="text-gray-500 text-[10px] font-mono mt-1">
                    Password strength:{' '}
                    {passwordStrength.label}
                  </p>

                </div>
              )}

          </div>
          {/* FORGOT PASSWORD */}

        {isLogin && (
          <div className="text-right -mt-2">
           <button
            type="button"
            onClick={() => {
             setShowForgotPassword(true);
             setResetEmail(email);
             setError('');
             setNotice('');
              }}
               className="text-accent text-xs font-mono hover:text-white transition-colors cursor-pointer"
                >
                Forgot Password?
                </button>
                 </div>
          )}

          {/* CONFIRM PASSWORD */}

          {!isLogin && (
            <div>

              <label className="block text-gray-400 font-mono text-xs uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>

              <div className="relative">

                <input
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  className="input-glass w-full pr-10 text-sm"
                  placeholder="••••••••"
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-white cursor-pointer"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Hide confirm password'
                      : 'Show confirm password'
                  }
                >
                  {showConfirmPassword
                    ? '🙈'
                    : '👁'}
                </button>

              </div>

            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className={`btn-keycap w-full py-3.5 mt-2 text-sm ${
              loading
                ? 'opacity-60 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
          >

            {loading
              ? 'PROCESSING...'
              : isLogin
                ? 'SIGN IN'
                : 'REGISTER'}

          </button>

        </form>

        {/* SWITCH MODE */}

        <p className="text-gray-400 font-mono text-center mt-6 text-xs">

          {isLogin
            ? 'Need a member account? '
            : 'Already registered? '}

          <button
            onClick={switchMode}
            className="text-accent font-semibold hover:text-white transition-colors cursor-pointer"
            type="button"
            disabled={loading}
          >
            {isLogin
              ? 'Sign Up'
              : 'Sign In'}
          </button>

        </p>

                {/* SECURITY MESSAGE */}

        <div className="text-center mt-5">
          <p className="text-gray-600 text-[10px] font-mono">
            SECURED BY SUPABASE AUTH
          </p>
        </div>

      </div>



     
     
      {/* FORGOT PASSWORD MODAL */}

      {showForgotPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">

          <div className="max-w-md w-full glass-panel p-8 relative">

            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setError('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>

            <h3 className="text-xl font-bold text-white text-center mb-2">
              Forgot Password?
            </h3>

            <p className="text-gray-400 text-xs font-mono text-center mb-6">
              Enter your registered email address and we'll send you a password reset link.
            </p>

            <form
              onSubmit={handleForgotPassword}
              className="space-y-4"
            >

              <input
                type="email"
                required
                value={resetEmail}
                onChange={(e) =>
                  setResetEmail(e.target.value)
                }
                className="input-glass w-full text-sm"
                placeholder="you@example.com"
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-keycap w-full py-3 text-sm"
              >
                {loading
                  ? 'SENDING...'
                  : 'SEND RESET LINK'}
              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default Auth;