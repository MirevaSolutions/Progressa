import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Plus, Target } from 'lucide-react';
import { supabase, Revenue, Goal } from '@/lib/supabase';
import { formatAr, monthName } from '@/lib/format';

type Props = {
  onNavigate: (page: 'revenus' | 'objectifs' | 'statistiques' | 'calendrier' | 'dashboard' | 'parametres') => void;
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="mt-2">
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-right text-xs text-slate-500 mt-1">{pct.toFixed(1)}%</p>
    </div>
  );
}

function MiniBarChart({ data }: { data: { month: number; total: number }[] }) {
  const max = Math.max(...data.map(d => d.total), 1);
  const labels = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  return (
    <div className="flex items-end gap-1 h-24">
      {Array.from({ length: 12 }, (_, i) => {
        const d = data.find(x => x.month === i + 1);
        const h = d ? Math.max((d.total / max) * 100, 4) : 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-emerald-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
              style={{ height: `${h}%` }}
              title={d ? formatAr(d.total) : '0 Ar'}
            />
            <span className="text-[9px] text-slate-400">{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ onNavigate }: Props) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: rev }, { data: gl }] = await Promise.all([
        supabase.from('revenues').select('*').gte('date', `${currentYear}-01-01`).lte('date', `${currentYear}-12-31`),
        supabase.from('goals').select('*').eq('year', currentYear),
      ]);
      setRevenues(rev ?? []);
      setGoals(gl ?? []);
      setLoading(false);
    }
    load();
  }, [currentYear]);

  const monthlyRevenues = revenues.filter(r => {
    const m = parseInt(r.date.split('-')[1]);
    return m === currentMonth;
  });
  const monthlyTotal = monthlyRevenues.reduce((s, r) => s + r.amount, 0);
  const annualTotal = revenues.reduce((s, r) => s + r.amount, 0);

  const monthlyGoal = goals.find(g => g.type === 'monthly' && g.month === currentMonth);
  const annualGoal = goals.find(g => g.type === 'annual');

  // Monthly chart data
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    total: revenues.filter(r => parseInt(r.date.split('-')[1]) === i + 1).reduce((s, r) => s + r.amount, 0),
  }));

  const hasAnyRevenue = revenues.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-0.5">{monthName(currentMonth)} {currentYear}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Revenus du mois</p>
          <p className="text-2xl font-bold text-slate-800">{formatAr(monthlyTotal)}</p>
          <p className="text-xs text-slate-400 mt-1">{monthName(currentMonth)} {currentYear}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Revenus de l'année</p>
          <p className="text-2xl font-bold text-slate-800">{formatAr(annualTotal)}</p>
          <p className="text-xs text-slate-400 mt-1">Année {currentYear}</p>
        </div>
      </div>

      {/* Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-500" />
              <p className="text-sm font-medium text-slate-700">Objectif mensuel</p>
            </div>
            {!monthlyGoal && (
              <button onClick={() => onNavigate('objectifs')} className="text-xs text-emerald-600 hover:underline">
                Définir
              </button>
            )}
          </div>
          {monthlyGoal ? (
            <>
              <p className="text-sm text-slate-600">{formatAr(monthlyTotal)} / {formatAr(monthlyGoal.target_amount)}</p>
              <ProgressBar value={monthlyTotal} max={monthlyGoal.target_amount} />
            </>
          ) : (
            <p className="text-sm text-slate-400">Aucun objectif défini</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <p className="text-sm font-medium text-slate-700">Objectif annuel</p>
            </div>
            {!annualGoal && (
              <button onClick={() => onNavigate('objectifs')} className="text-xs text-emerald-600 hover:underline">
                Définir
              </button>
            )}
          </div>
          {annualGoal ? (
            <>
              <p className="text-sm text-slate-600">{formatAr(annualTotal)} / {formatAr(annualGoal.target_amount)}</p>
              <ProgressBar value={annualTotal} max={annualGoal.target_amount} />
            </>
          ) : (
            <p className="text-sm text-slate-400">Aucun objectif défini</p>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">Évolution des revenus — {currentYear}</h2>
          </div>
          {hasAnyRevenue && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Par mois</span>
            </div>
          )}
        </div>

        {hasAnyRevenue ? (
          <MiniBarChart data={chartData} />
        ) : (
          <div className="text-center py-10">
            <TrendingDown className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm mb-4">Aucun revenu enregistré.</p>
            <button
              onClick={() => onNavigate('revenus')}
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter mon premier revenu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
