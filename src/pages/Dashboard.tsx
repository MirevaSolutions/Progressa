import { useEffect, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { supabase, Revenue, Goal } from '@/lib/supabase';
import { formatAr, monthName } from '@/lib/format';

type Props = {
  onNavigate: (page: 'revenus' | 'objectifs' | 'statistiques' | 'calendrier' | 'dashboard' | 'parametres') => void;
};

// Palette centralisée : un seul endroit à modifier pour changer l'identité visuelle
const COLORS = {
  primary: '#10b981',   // emerald-500 — revenus réalisés
  secondary: '#6366f1', // indigo-500 — objectifs
  accent: '#fbbf24',    // amber-400 — accent donut
  muted: '#e2e8f0',     // slate-200 — restant / neutre
  grid: '#f1f5f9',
};

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function CardShell({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs rounded px-3 py-2 shadow-lg">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }}>{p.name} : {formatAr(p.value)}</p>
      ))}
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

  const monthlyRevenues = revenues.filter(r => parseInt(r.date.split('-')[1]) === currentMonth);
  const monthlyTotal = monthlyRevenues.reduce((s, r) => s + r.amount, 0);
  const annualTotal = revenues.reduce((s, r) => s + r.amount, 0);

  const monthlyGoal = goals.find(g => g.type === 'monthly' && g.month === currentMonth);
  const annualGoal = goals.find(g => g.type === 'annual');

  // Totaux par mois
  const monthlyTotals = Array.from({ length: 12 }, (_, i) =>
    revenues.filter(r => parseInt(r.date.split('-')[1]) === i + 1).reduce((s, r) => s + r.amount, 0)
  );

  // Données pour le bar chart simple
  const barData = monthlyTotals.map((total, i) => ({ mois: MONTH_LABELS[i], total }));

  // Données pour l'aire cumulée (façon "flux de trésorerie")
  let running = 0;
  const areaData = monthlyTotals.map((total, i) => {
    running += total;
    return { mois: MONTH_LABELS[i], cumul: running };
  });

  // Données pour le comparatif réalisé vs objectif mensuel
  const comparisonData = monthlyTotals.map((total, i) => {
    const g = goals.find(x => x.type === 'monthly' && x.month === i + 1);
    return { mois: MONTH_LABELS[i], réalisé: total, objectif: g?.target_amount ?? 0 };
  });
  const hasMonthlyGoals = comparisonData.some(d => d.objectif > 0);

  // Données pour le donut de progression de l'objectif annuel
  const pieData = annualGoal
    ? [
        { name: 'Atteint', value: Math.min(annualTotal, annualGoal.target_amount) },
        { name: 'Restant', value: Math.max(annualGoal.target_amount - annualTotal, 0) },
      ]
    : [];
  const annualPct = annualGoal ? Math.min((annualTotal / annualGoal.target_amount) * 100, 100) : 0;

  const hasAnyRevenue = revenues.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tableau de bord</h1>
        <p className="text-slate-500 text-sm mt-0.5">{monthName(currentMonth)} {currentYear}</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Revenus du mois</p>
          <p className="text-2xl font-bold text-slate-800">{formatAr(monthlyTotal)}</p>
          {monthlyGoal && (
            <p className="text-xs text-slate-400 mt-1">
              {((monthlyTotal / monthlyGoal.target_amount) * 100).toFixed(0)}% de l'objectif mensuel
            </p>
          )}
        </div>
        <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Revenus de l'année</p>
          <p className="text-2xl font-bold text-slate-800">{formatAr(annualTotal)}</p>
          {annualGoal && (
            <p className="text-xs text-slate-400 mt-1">{annualPct.toFixed(0)}% de l'objectif annuel</p>
          )}
        </div>
      </div>

      {!hasAnyRevenue ? (
        <div className="bg-white rounded-md p-10 border border-slate-100 shadow-sm text-center">
          <p className="text-slate-400 text-sm mb-4">Aucun revenu enregistré.</p>
          <button
            onClick={() => onNavigate('revenus')}
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter mon premier revenu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Revenus par mois */}
          <CardShell title="Revenus par mois">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <CartesianGrid vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="total" name="Revenus" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardShell>

          {/* Flux cumulé */}
          <CardShell title="Flux de trésorerie cumulé">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="cumulGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="cumul"
                  name="Cumul"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fill="url(#cumulGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardShell>

          {/* Réalisé vs objectif */}
          <CardShell
            title="Réalisé vs objectif mensuel"
            action={!hasMonthlyGoals && (
              <button onClick={() => onNavigate('objectifs')} className="text-xs text-emerald-600 hover:underline">
                Définir des objectifs
              </button>
            )}
          >
            {hasMonthlyGoals ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={comparisonData}>
                  <CartesianGrid vertical={false} stroke={COLORS.grid} />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="réalisé" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="objectif" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center">
                <p className="text-slate-400 text-sm">Aucun objectif mensuel défini pour l'instant</p>
              </div>
            )}
          </CardShell>

          {/* Progression objectif annuel (donut) */}
          <CardShell
            title="Progression de l'objectif annuel"
            action={!annualGoal && (
              <button onClick={() => onNavigate('objectifs')} className="text-xs text-emerald-600 hover:underline">
                Définir
              </button>
            )}
          >
            {annualGoal ? (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={COLORS.primary} />
                      <Cell fill={COLORS.muted} />
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  <p className="text-3xl font-bold text-slate-800">{annualPct.toFixed(0)}%</p>
                  <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.primary }} />
                    Atteint — {formatAr(annualTotal)}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS.muted }} />
                    Objectif — {formatAr(annualGoal.target_amount)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center gap-2">
                <Target className="w-8 h-8 text-slate-200" />
                <p className="text-slate-400 text-sm">Aucun objectif annuel défini</p>
              </div>
            )}
          </CardShell>
        </div>
      )}
    </div>
  );
}