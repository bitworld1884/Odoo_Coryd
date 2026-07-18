import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Search, Map, Shield } from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { apiError } from '../api.js';
import Brand, { Logo } from '../components/Brand.jsx';
import { Button, Input, Alert } from '../components/ui.jsx';

const perks = [
  { Icon: Search, text: 'Find rides matching your route' },
  { Icon: Map,    text: 'Live GPS tracking during trips' },
  { Icon: Shield, text: 'Secure UPI & wallet payments' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setBusy(true);
    try {
      await login(form.email, form.password);
      const next = new URLSearchParams(location.search).get('next');
      navigate(next?.startsWith('/app') ? next : '/app');
    } catch (err) { setError(apiError(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="glass-card w-full max-w-5xl overflow-hidden">
        <div className="glass-body flex min-h-[36rem] flex-col lg:flex-row">

          {/* ── Left brand panel (hidden on mobile) ── */}
          <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-brand-mid p-10 lg:flex lg:w-[44%]">
            {/* decorative orbs */}
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-52 w-52 rounded-full bg-brand-light/20 blur-2xl" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            <div className="relative">
              <Link to="/">
                <Brand size="md" tone="light" tagline="Ride together" />
              </Link>
            </div>

            <div className="relative">
              <h2 className="text-[2rem] font-extrabold leading-snug tracking-tight text-white">
                Your daily commute,<br />
                <span className="text-brand-light">simplified.</span>
              </h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
                Connect with colleagues, share rides, and make every journey count.
              </p>
              <ul className="mt-8 space-y-3">
                {perks.map(({ Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3.5 py-2.5 text-sm text-white/90 backdrop-blur-md"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <p className="relative text-xs text-white/45">© 2026 CoRYD · Enterprise ride sharing</p>
          </div>

          {/* ── Right form panel ── */}
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10">
            {/* Mobile logo */}
            <Link to="/" className="mb-8 lg:hidden">
              <Brand size="md" />
            </Link>

            {/* Desktop-only floating mark above the form */}
            <div className="mb-6 hidden lg:block">
              <Logo size="lg" />
            </div>

            <div className="w-full max-w-sm">
              <h1 className="text-2xl font-extrabold tracking-tight text-ink-900">Welcome back</h1>
              <p className="mt-1 text-sm text-ink-500">Log in to your organization account.</p>

              <form onSubmit={submit} className="mt-8 space-y-5">
                <Input
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@company.com"
                />

                {/* Password with show/hide */}
                <label className="block">
                  <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-ink-500">Password</span>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="glass-input w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm text-ink-800 placeholder:text-ink-400 outline-none transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-brand"
                      tabIndex={-1}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {error && <Alert variant="error">{error}</Alert>}

                <Button type="submit" disabled={busy} size="lg" className="w-full">
                  {busy ? 'Signing in…' : <>Log in <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-500">
                New here?{' '}
                <Link to="/signup" className="font-bold text-brand-dark transition hover:text-brand hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
