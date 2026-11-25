import React, { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';

export const AdminLoginPage: React.FC = () => {
  const {
    loginWithPassword,
    isAdminAuthenticated,
    authLoading,
    navigate,
    siteSettings,
    postLoginRoute,
  } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAdminAuthenticated) {
      navigate(postLoginRoute && postLoginRoute !== 'admin-login' ? postLoginRoute : 'admin-dashboard');
    }
  }, [authLoading, isAdminAuthenticated, navigate, postLoginRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Invalid email or password');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const { error } = await loginWithPassword(trimmedEmail, password);
      if (error) {
        setErrorMsg(error);
        return;
      }
      navigate(postLoginRoute && postLoginRoute !== 'admin-login' ? postLoginRoute : 'admin-dashboard');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4" dir="ltr">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl border border-surface-container shadow-lg p-6 sm:p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={siteSettings.logo_url}
              alt={`${siteSettings.site_name} Logo`}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-lg object-contain border border-surface-container bg-white"
            />
            <div className="text-left">
              <span className="text-xl font-extrabold text-primary tracking-tight block leading-none">
                {siteSettings.site_name}
              </span>
              <span className="font-spec-code text-[11px] text-on-surface-variant uppercase">
                Operations Control
              </span>
            </div>
          </div>

          <h1 className="text-headline-md font-extrabold text-on-surface">Admin Login</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Sign in with your administrator email and password to manage orders, catalog, and settings.
          </p>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="admin-email" className="text-xs font-semibold text-on-surface block mb-1">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              required
              disabled={submitting}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3.5 py-2.5 text-sm font-spec-code focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-xs font-semibold text-on-surface block mb-1">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                disabled={submitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3.5 py-2.5 pr-10 text-sm font-spec-code focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 text-on-surface-variant hover:text-on-surface"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || authLoading}
            className="w-full py-3 rounded-lg bg-primary hover:bg-on-primary-fixed-variant text-on-primary font-bold text-sm shadow-md flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[19px]">
              {submitting ? 'hourglass_top' : 'lock_open'}
            </span>
            <span>{submitting ? 'Logging in...' : 'Login'}</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-surface-container flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => navigate('home')}
            className="text-primary font-semibold hover:underline flex items-center gap-1"
          >
            <span>← Return to Public Storefront</span>
          </button>
        </div>
      </div>
    </div>
  );
};
