import { User, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Parametres() {
  const { user, signOut } = useAuth();

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Paramètres</h1>
        <p className="text-slate-500 text-sm mt-0.5">Informations de votre compte</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3 mb-1">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">Compte</span>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Email</label>
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-sm text-slate-700 truncate">{user?.email}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Identifiant</label>
            <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-400 font-mono">{user?.id}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">Membre depuis</label>
            <div className="px-4 py-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-sm text-slate-600">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </span>
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
