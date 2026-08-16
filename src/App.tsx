import { useState } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/pages/AuthPage';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Revenus from '@/pages/Revenus';
import Calendrier from '@/pages/Calendrier';
import Objectifs from '@/pages/Objectifs';
import Statistiques from '@/pages/Statistiques';
import Parametres from '@/pages/Parametres';

type Page = 'dashboard' | 'revenus' | 'calendrier' | 'objectifs' | 'statistiques' | 'parametres';

function AppInner() {
  const { session, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return <AuthPage />;

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {page === 'dashboard' && <Dashboard onNavigate={setPage} />}
      {page === 'revenus' && <Revenus />}
      {page === 'calendrier' && <Calendrier />}
      {page === 'objectifs' && <Objectifs />}
      {page === 'statistiques' && <Statistiques />}
      {page === 'parametres' && <Parametres />}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
