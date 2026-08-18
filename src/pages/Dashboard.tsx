import { useEffect, useState } from 'react';
import {
  Plus,
  Target,
  TrendingUp,
  Wallet,
  CalendarDays,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import { Revenue } from '@/types/revenue';
import { Goal } from '@/types/goal';

import { getRevenuesByYear } from '@/services/revenue.service';
import { getGoalsByYear } from '@/services/goal.service';

import { formatAr, monthName } from '@/lib/format';

type Props = {
  onNavigate: (
    page:
      | 'revenus'
      | 'objectifs'
      | 'statistiques'
      | 'calendrier'
      | 'dashboard'
      | 'parametres'
  ) => void;
};

const COLORS = {
  primary: '#10b981',
  primaryLight: '#d1fae5',
  secondary: '#6366f1',
  muted: '#e2e8f0',
  grid: '#f1f5f9',
};

const MONTH_LABELS = [
  'Jan',
  'Fév',
  'Mar',
  'Avr',
  'Mai',
  'Juin',
  'Juil',
  'Août',
  'Sep',
  'Oct',
  'Nov',
  'Déc',
];

/* =========================================================
   CARD
========================================================= */

function CardShell({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-slate-700">
          {title}
        </h2>

        {action}
      </div>

      {children}
    </div>
  );
}

/* =========================================================
   TOOLTIP
========================================================= */

function ChartTooltip({
  active,
  payload,
  label,
}: any) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="bg-slate-800 text-white text-xs rounded px-3 py-2 shadow-lg">
      <p className="font-medium mb-1">
        {label}
      </p>

      {payload.map((p: any, i: number) => (
        <p key={i}>
          {p.name} : {formatAr(p.value)}
        </p>
      ))}
    </div>
  );
}

/* =========================================================
   QUICK STAT
========================================================= */

function QuickStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">

      <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
        <span className="text-emerald-500">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      {/* Montant volontairement moins imposant */}
      <p className="text-xl font-semibold text-slate-700 tracking-tight">
        {value}
      </p>

      {hint && (
        <p className="text-xs text-slate-400 mt-1">
          {hint}
        </p>
      )}

    </div>
  );
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard({
  onNavigate,
}: Props) {

  const now = new Date();

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================================================
     CHARGEMENT DES DONNÉES VIA LES SERVICES
  ======================================================= */

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const [rev, gl] = await Promise.all([
          getRevenuesByYear(currentYear),
          getGoalsByYear(currentYear),
        ]);

        setRevenues(rev ?? []);
        setGoals(gl ?? []);
      } catch (error) {
        console.error(
          'Erreur lors du chargement du dashboard :',
          error
        );

        setRevenues([]);
        setGoals([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [currentYear]);

  /* =======================================================
     REVENUS DU MOIS
  ======================================================= */

  const monthlyTotal = revenues
    .filter(
      r =>
        parseInt(r.date.split('-')[1], 10) ===
        currentMonth
    )
    .reduce(
      (sum, r) => sum + r.amount,
      0
    );

  /* =======================================================
     REVENUS ANNUELS
  ======================================================= */

  const annualTotal = revenues.reduce(
    (sum, r) => sum + r.amount,
    0
  );

  /* =======================================================
     OBJECTIFS
  ======================================================= */

  const monthlyGoal = goals.find(
    g =>
      g.type === 'monthly' &&
      g.month === currentMonth
  );

  const annualGoal = goals.find(
    g => g.type === 'annual'
  );

  /* =======================================================
     POURCENTAGE OBJECTIF MENSUEL
  ======================================================= */

  const monthlyPct =
    monthlyGoal &&
    monthlyGoal.target_amount > 0
      ? Math.min(
          (monthlyTotal /
            monthlyGoal.target_amount) *
            100,
          100
        )
      : 0;

  /* =======================================================
     POURCENTAGE OBJECTIF ANNUEL
  ======================================================= */

  const annualPct =
    annualGoal &&
    annualGoal.target_amount > 0
      ? Math.min(
          (annualTotal /
            annualGoal.target_amount) *
            100,
          100
        )
      : 0;

  /* =======================================================
     RESTANT OBJECTIF MENSUEL
  ======================================================= */

  const monthlyRemaining = monthlyGoal
    ? Math.max(
        monthlyGoal.target_amount -
          monthlyTotal,
        0
      )
    : 0;

  /* =======================================================
     RESTANT OBJECTIF ANNUEL
  ======================================================= */

  const annualRemaining = annualGoal
    ? Math.max(
        annualGoal.target_amount -
          annualTotal,
        0
      )
    : 0;

  /* =======================================================
     REVENUS PAR MOIS
  ======================================================= */

  const monthlyTotals = Array.from(
    { length: 12 },
    (_, i) =>
      revenues
        .filter(
          r =>
            parseInt(
              r.date.split('-')[1],
              10
            ) === i + 1
        )
        .reduce(
          (sum, r) => sum + r.amount,
          0
        )
  );

  const barData = monthlyTotals.map(
    (total, index) => ({
      mois: MONTH_LABELS[index],
      total,
    })
  );

  /* =======================================================
     CUMUL ANNUEL
  ======================================================= */

  let running = 0;

  const areaData = monthlyTotals.map(
    (total, index) => {

      running += total;

      return {
        mois: MONTH_LABELS[index],
        cumul: running,
      };
    }
  );

  /* =======================================================
     RÉALISÉ VS OBJECTIF
  ======================================================= */

  const comparisonData =
    monthlyTotals.map(
      (total, index) => {

        const goal = goals.find(
          g =>
            g.type === 'monthly' &&
            g.month === index + 1
        );

        return {
          mois: MONTH_LABELS[index],
          réalisé: total,
          objectif:
            goal?.target_amount ?? 0,
        };
      }
    );

  const hasMonthlyGoals =
    comparisonData.some(
      item => item.objectif > 0
    );

  /* =======================================================
     DONUT OBJECTIF ANNUEL
  ======================================================= */

  const pieData = annualGoal
    ? [
        {
          name: 'Atteint',
          value: Math.min(
            annualTotal,
            annualGoal.target_amount
          ),
        },
        {
          name: 'Restant',
          value: Math.max(
            annualGoal.target_amount -
              annualTotal,
            0
          ),
        },
      ]
    : [];

  const hasAnyRevenue =
    revenues.length > 0;

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="p-4 max-w-6xl mx-auto">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-6">

        <h1 className="text-xl font-semibold text-slate-800">
          Tableau de bord
        </h1>

        <p className="text-slate-500 text-sm mt-0.5">
          {monthName(currentMonth)} {currentYear}
        </p>

      </div>

      {/* ===================================================
          STATISTIQUES RAPIDES
      =================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">

        <QuickStat
          icon={
            <Wallet className="w-4 h-4" />
          }
          label="Revenus du mois"
          value={formatAr(monthlyTotal)}
          hint={
            monthlyGoal
              ? `${monthlyPct.toFixed(
                  0
                )}% de l'objectif`
              : 'Aucun objectif mensuel'
          }
        />

        <QuickStat
          icon={
            <TrendingUp className="w-4 h-4" />
          }
          label="Revenus de l'année"
          value={formatAr(annualTotal)}
          hint={
            annualGoal
              ? `${annualPct.toFixed(
                  0
                )}% de l'objectif annuel`
              : 'Aucun objectif annuel'
          }
        />

        <QuickStat
          icon={
            <Target className="w-4 h-4" />
          }
          label="Objectif mensuel"
          value={
            monthlyGoal
              ? formatAr(
                  monthlyGoal.target_amount
                )
              : '—'
          }
          hint={
            monthlyGoal
              ? monthlyRemaining > 0
                ? `Reste ${formatAr(
                    monthlyRemaining
                  )}`
                : 'Objectif atteint'
              : 'Définir un objectif'
          }
        />

        <QuickStat
          icon={
            <CalendarDays className="w-4 h-4" />
          }
          label="Objectif annuel"
          value={
            annualGoal
              ? formatAr(
                  annualGoal.target_amount
                )
              : '—'
          }
          hint={
            annualGoal
              ? annualRemaining > 0
                ? `Reste ${formatAr(
                    annualRemaining
                  )}`
                : 'Objectif atteint'
              : 'Définir un objectif'
          }
        />

      </div>

      {/* ===================================================
          AUCUN REVENU
      =================================================== */}

      {!hasAnyRevenue ? (

        <div className="bg-white rounded-md p-10 border border-slate-100 shadow-sm text-center">

          <div className="w-11 h-11 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">

            <Wallet className="w-5 h-5 text-emerald-500" />

          </div>

          <h2 className="font-medium text-slate-700 mb-1">
            Bienvenue sur votre tableau de bord
          </h2>

          <p className="text-slate-400 text-sm mb-5">
            Aucun revenu n'est encore enregistré.
          </p>

          <button
            onClick={() =>
              onNavigate('revenus')
            }
            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded transition-colors"
          >
            <Plus className="w-4 h-4" />

            Ajouter mon premier revenu
          </button>

        </div>

      ) : (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* =================================================
              REVENUS PAR MOIS
          ================================================= */}

          <CardShell
            title="Revenus par mois"
            action={
              <button
                onClick={() =>
                  onNavigate('statistiques')
                }
                className="text-xs text-emerald-600 hover:underline"
              >
                Voir les statistiques
              </button>
            }
          >

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <BarChart data={barData}>

                <CartesianGrid
                  vertical={false}
                  stroke={COLORS.grid}
                />

                <XAxis
                  dataKey="mois"
                  tick={{
                    fontSize: 11,
                    fill: '#94a3b8',
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#94a3b8',
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                  cursor={{
                    fill: '#f8fafc',
                  }}
                />

                <Bar
                  dataKey="total"
                  name="Revenus"
                  fill={COLORS.primary}
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                />

              </BarChart>

            </ResponsiveContainer>

          </CardShell>

          {/* =================================================
              FLUX CUMULÉ
          ================================================= */}

          <CardShell
            title="Flux de trésorerie cumulé"
          >

            <ResponsiveContainer
              width="100%"
              height={220}
            >

              <AreaChart
                data={areaData}
              >

                <defs>

                  <linearGradient
                    id="cumulGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="0%"
                      stopColor={
                        COLORS.primary
                      }
                      stopOpacity={0.3}
                    />

                    <stop
                      offset="100%"
                      stopColor={
                        COLORS.primary
                      }
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  vertical={false}
                  stroke={COLORS.grid}
                />

                <XAxis
                  dataKey="mois"
                  tick={{
                    fontSize: 11,
                    fill: '#94a3b8',
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#94a3b8',
                  }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />

                <Tooltip
                  content={
                    <ChartTooltip />
                  }
                />

                <Area
                  type="monotone"
                  dataKey="cumul"
                  name="Cumul"
                  stroke={
                    COLORS.primary
                  }
                  strokeWidth={2}
                  fill="url(#cumulGradient)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </CardShell>

          {/* =================================================
              RÉALISÉ VS OBJECTIF
          ================================================= */}

          <CardShell
            title="Réalisé vs objectif mensuel"
            action={
              !hasMonthlyGoals ? (
                <button
                  onClick={() =>
                    onNavigate(
                      'objectifs'
                    )
                  }
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Définir
                </button>
              ) : null
            }
          >

            {hasMonthlyGoals ? (

              <ResponsiveContainer
                width="100%"
                height={220}
              >

                <BarChart
                  data={
                    comparisonData
                  }
                >

                  <CartesianGrid
                    vertical={false}
                    stroke={COLORS.grid}
                  />

                  <XAxis
                    dataKey="mois"
                    tick={{
                      fontSize: 11,
                      fill: '#94a3b8',
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: '#94a3b8',
                    }}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip
                    content={
                      <ChartTooltip />
                    }
                    cursor={{
                      fill: '#f8fafc',
                    }}
                  />

                  <Bar
                    dataKey="réalisé"
                    name="Réalisé"
                    fill={
                      COLORS.primary
                    }
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />

                  <Bar
                    dataKey="objectif"
                    name="Objectif"
                    fill={
                      COLORS.secondary
                    }
                    radius={[
                      4,
                      4,
                      0,
                      0,
                    ]}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-[220px] flex flex-col items-center justify-center">

                <Target className="w-7 h-7 text-slate-200 mb-2" />

                <p className="text-slate-400 text-sm mb-3">
                  Aucun objectif mensuel défini
                </p>

                <button
                  onClick={() =>
                    onNavigate(
                      'objectifs'
                    )
                  }
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Définir maintenant
                </button>

              </div>

            )}

          </CardShell>

          {/* =================================================
              OBJECTIF ANNUEL
          ================================================= */}

          <CardShell
            title="Progression de l'objectif annuel"
            action={
              annualGoal ? (
                <button
                  onClick={() =>
                    onNavigate(
                      'objectifs'
                    )
                  }
                  className="text-xs text-slate-500 hover:text-emerald-600"
                >
                  Modifier
                </button>
              ) : (
                <button
                  onClick={() =>
                    onNavigate(
                      'objectifs'
                    )
                  }
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Définir
                </button>
              )
            }
          >

            {annualGoal ? (

              <div className="flex items-center gap-4">

                <div className="w-[58%]">

                  <ResponsiveContainer
                    width="100%"
                    height={200}
                  >

                    <PieChart>

                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={55}
                        outerRadius={78}
                        paddingAngle={2}
                        startAngle={90}
                        endAngle={-270}
                      >

                        <Cell
                          fill={
                            COLORS.primary
                          }
                        />

                        <Cell
                          fill={
                            COLORS.muted
                          }
                        />

                      </Pie>

                      <Tooltip
                        content={
                          <ChartTooltip />
                        }
                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

                <div className="flex-1">

                  {/* Pourcentage moins lourd */}
                  <p className="text-2xl font-semibold text-slate-700">
                    {annualPct.toFixed(0)}%
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    de l'objectif annuel
                  </p>

                  <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">

                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          COLORS.primary,
                      }}
                    />

                    Réalisé —{' '}
                    {formatAr(
                      annualTotal
                    )}

                  </div>

                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">

                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        background:
                          COLORS.muted,
                      }}
                    />

                    Objectif —{' '}
                    {formatAr(
                      annualGoal.target_amount
                    )}

                  </div>

                  {annualRemaining > 0 && (

                    <p className="text-xs text-slate-400 mt-3">

                      Reste à réaliser :{' '}

                      <span className="font-medium text-slate-600">

                        {formatAr(
                          annualRemaining
                        )}

                      </span>

                    </p>

                  )}

                  {annualRemaining === 0 && (

                    <p className="text-xs text-emerald-600 font-medium mt-3">

                      ✓ Objectif annuel atteint

                    </p>

                  )}

                </div>

              </div>

            ) : (

              <div className="h-[200px] flex flex-col items-center justify-center gap-2">

                <Target className="w-7 h-7 text-slate-200" />

                <p className="text-slate-400 text-sm">
                  Aucun objectif annuel défini
                </p>

                <button
                  onClick={() =>
                    onNavigate(
                      'objectifs'
                    )
                  }
                  className="text-xs text-emerald-600 hover:underline"
                >
                  Définir l'objectif
                </button>

              </div>

            )}

          </CardShell>

        </div>
      )}

    </div>
  );
}