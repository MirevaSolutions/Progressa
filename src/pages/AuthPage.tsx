import { useState } from 'react';
import { AuthService } from '@/services/auth.service';
import { TrendingUp, Eye, EyeOff, Target, CalendarDays, Wallet } from 'lucide-react';

const FEATURES = [
  { icon: Wallet, text: 'Enregistrez chaque revenu en quelques secondes' },
  { icon: Target, text: 'Fixez des objectifs mensuels et annuels' },
  { icon: CalendarDays, text: 'Planifiez vos activités sur un calendrier dédié' },
];

function ProductPreview() {
  return (
    <div className="relative w-full max-w-sm">
      {/* Carte principale : mini dashboard */}
      <div className="bg-white/95 backdrop-blur rounded-md shadow-2xl p-4 border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-slate-500">Revenus — Août</p>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 font-medium">+18%</span>
        </div>
        <p className="text-xl font-bold text-slate-800 mb-3">2 450 000 Ar</p>
        <div className="flex items-end gap-1.5 h-16">
          {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
            <div key={i} className="flex-1 bg-emerald-100 rounded-sm overflow-hidden flex items-end" style={{ height: '100%' }}>
              <div className="w-full bg-emerald-500 rounded-sm" style={{ height: `${h}%` }} />
            </div>
          ))}
        </div>
      </div>

      {/* Carte flottante : progression d'objectif */}
      <div className="absolute -bottom-5 -left-6 bg-white rounded-md shadow-xl p-3 border border-slate-100 flex items-center gap-3 w-48">
        <svg viewBox="0 0 36 36" className="w-10 h-10 flex-shrink-0">
          <path d="M18 2.5 a15.5 15.5 0 1 1 0 31 a15.5 15.5 0 1 1 0-31" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
          <path d="M18 2.5 a15.5 15.5 0 1 1 0 31 a15.5 15.5 0 1 1 0-31" fill="none" stroke="#10b981" strokeWidth="3.5" strokeDasharray="78, 100" strokeLinecap="round" />
          <text x="18" y="21.5" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1e293b">78%</text>
        </svg>
        <div>
          <p className="text-xs font-semibold text-slate-800">Objectif mensuel</p>
          <p className="text-[11px] text-slate-400">Bientôt atteint</p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  if (!email.trim()) {
    setError('Veuillez saisir votre email.');
    return;
  }

  if (!password.trim()) {
    setError('Veuillez saisir votre mot de passe.');
    return;
  }

  if (password.length < 6) {
    setError('Le mot de passe doit contenir au moins 6 caractères.');
    return;
  }

  setLoading(true);

  try {
    await AuthService.authenticate(mode, email, password);
  } catch (err: unknown) {
    const message = (err as { message?: string }).message ?? '';
    setError(AuthService.getFriendlyError(message));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panneau gauche — visible à partir de lg */}
      <div className="hidden lg:flex relative flex-col justify-between bg-slate-900 p-10 overflow-hidden">
        {/* Texture de fond discrète */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #10b981, transparent 70%)' }}
        />

        <div className="relative flex items-center gap-2.5">
          <div className="w-9 h-9 rounded bg-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Progressa</span>
        </div>

        <div className="relative">
          <h1 className="text-3xl font-bold text-white leading-tight mb-3">
            Prenez le contrôle<br />de vos revenus.
          </h1>
          <p className="text-slate-400 text-sm mb-10 max-w-sm">
            Une seule application pour suivre vos revenus, fixer vos objectifs et organiser votre temps.
          </p>
          <ProductPreview />
        </div>

        <div className="relative space-y-3 mt-10">
          {FEATURES.map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
              <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* Panneau droit — formulaire */}
      <div className="flex items-center justify-center p-4 bg-white">
        <div className="w-full max-w-sm">
          {/* Logo mobile uniquement */}
          <div className="lg:hidden flex items-center gap-2.5 justify-center mb-8">
            <div className="w-9 h-9 rounded bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-slate-800 font-bold text-lg tracking-tight">Progressa</span>
          </div>

          <h2 className="text-xl font-semibold text-slate-800 mb-1">
            {mode === 'login' ? 'Content de vous revoir' : 'Créer votre compte'}
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {mode === 'login' ? 'Connectez-vous pour accéder à votre tableau de bord.' : 'Quelques secondes suffisent pour commencer.'}
          </p>

          {/* Toggle login / signup */}
          <div className="flex border border-slate-200 rounded p-1 mb-6 text-sm">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-1.5 rounded transition-colors font-medium ${mode === 'login' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-1.5 rounded transition-colors font-medium ${mode === 'signup' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              S'inscrire
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                placeholder="exemple@email.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder-slate-400 pr-10"
                  placeholder="••••••••"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-slate-400 mt-1">Minimum 6 caractères</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white font-semibold py-2.5 rounded transition-colors flex items-center justify-center gap-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}