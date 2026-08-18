import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Wallet, BarChart3, Trophy } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Revenue } from '@/types/revenue';
import { getAllRevenues, getRevenuesByYear } from '@/services/statistics.service';
import { formatAr, MONTHS } from '@/lib/format';

// Palette resserrée : une seule teinte (emerald) à intensité variable, plus du gris neutre.
const COLORS = {
  strong: '#10b981',  // emerald-500 — valeur mise en avant
  soft: '#d1fae5',    // emerald-100 — valeurs normales
  neutral: '#e2e8f0', // slate-200 — hors focus
  grid: '#f1f5f9',
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 text-white text-xs rounded px-2.5 py-1.5 shadow-lg">
      <p className="font-medium mb-0.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i}>{formatAr(p.value)}</p>
      ))}
    </div>
  );
}

function StatCard({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="bg-white rounded-md border border-slate-100 shadow-sm p-3">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
        <span className="text-emerald-500">{icon}</span>
        {label}
      </div>
      <p className="text-lg font-bold text-slate-800">{value}</p>
      {hint && <p className="text-xs text-slate-400 mt-0.5">{hint}</p>}
    </div>
  );
}

function CardShell({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-md border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-slate-700 text-sm">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

export default function Statistiques() {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [compareMonth, setCompareMonth] = useState(now.getMonth() + 1);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [allRevenues, setAllRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function load() {
    try {
      setLoading(true);

      const [yearRevenues, allRevenues] = await Promise.all([
        getRevenuesByYear(selectedYear),
        getAllRevenues(),
      ]);

      setRevenues(yearRevenues);
      setAllRevenues(allRevenues);
    } catch (error) {
      console.error(
        'Erreur lors du chargement des statistiques:',
        error
      );

      setRevenues([]);
      setAllRevenues([]);
    } finally {
      setLoading(false);
    }
  }

  load();
}, [selectedYear]);

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: MONTHS[i].slice(0, 3),
    total: revenues.filter(r => parseInt(r.date.split('-')[1]) === i + 1).reduce((s, r) => s + r.amount, 0),
  }));
  const yearlyTotal = revenues.reduce((s, r) => s + r.amount, 0);
  const activeMonths = monthlyData.filter(d => d.total > 0);
  const avgMonthly = activeMonths.length > 0 ? yearlyTotal / activeMonths.length : 0;
  const bestMonth = activeMonths.length > 0
    ? activeMonths.reduce((max, d) => (d.total > max.total ? d : max), activeMonths[0])
    : null;

  // Annual comparison
  const years = Array.from(new Set(allRevenues.map(r => parseInt(r.date.split('-')[0])))).sort((a, b) => a - b);
  const annualData = years.map(y => ({
    year: String(y),
    total: allRevenues.filter(r => r.date.startsWith(String(y))).reduce((s, r) => s + r.amount, 0),
  }));

  // Month comparison
  const currentMonthTotal = revenues.filter(r => parseInt(r.date.split('-')[1]) === compareMonth).reduce((s, r) => s + r.amount, 0);
  const prevMonth = compareMonth === 1 ? 12 : compareMonth - 1;
  const prevYear = compareMonth === 1 ? selectedYear - 1 : selectedYear;
  const prevRevenues = allRevenues.filter(r => r.date.startsWith(`${prevYear}-`));
  const prevMonthTotal = prevRevenues.filter(r => parseInt(r.date.split('-')[1]) === prevMonth).reduce((s, r) => s + r.amount, 0);

  let evolution: number | null = null;
  if (prevMonthTotal > 0) evolution = ((currentMonthTotal - prevMonthTotal) / prevMonthTotal) * 100;

  const years2 = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].filter(y => !years.includes(y));
  const displayYears = Array.from(new Set([...years, ...years2])).sort((a, b) => b - a);

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Statistiques</h1>
          <p className="text-slate-500 text-sm mt-0.5">Analyse de vos revenus</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600 font-medium">Année</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {displayYears.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          icon={<Wallet className="w-3.5 h-3.5" />}
          label="Total de l'année"
          value={formatAr(yearlyTotal)}
          hint={`Année ${selectedYear}`}
        />
        <StatCard
          icon={<BarChart3 className="w-3.5 h-3.5" />}
          label="Moyenne mensuelle"
          value={formatAr(Math.round(avgMonthly))}
          hint={activeMonths.length > 0 ? `sur ${activeMonths.length} mois actifs` : 'aucun mois actif'}
        />
        <StatCard
          icon={<Trophy className="w-3.5 h-3.5" />}
          label="Meilleur mois"
          value={bestMonth ? formatAr(bestMonth.total) : '—'}
          hint={bestMonth ? `${MONTHS[bestMonth.month - 1]} ${selectedYear}` : 'pas encore de revenu'}
        />
      </div>

      {/* Monthly chart */}
      <CardShell
        title={`Revenus mensuels — ${selectedYear}`}
        action={<span className="text-sm font-bold text-emerald-600">{formatAr(yearlyTotal)}</span>}
      >
        {revenues.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center">Aucun revenu pour cette période.</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={monthlyData} barCategoryGap="20%">
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                {monthlyData.map((d, i) => (
                  <Cell key={i} fill={bestMonth && d.month === bestMonth.month ? COLORS.strong : COLORS.soft} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardShell>

      {/* Annual totals */}
      {annualData.length > 0 && (
        <CardShell title="Revenus par année">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={annualData} barCategoryGap="30%">
              <CartesianGrid vertical={false} stroke={COLORS.grid} />
              <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={36} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="total" radius={[3, 3, 0, 0]}>
                {annualData.map((d, i) => (
                  <Cell key={i} fill={Number(d.year) === selectedYear ? COLORS.strong : COLORS.neutral} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardShell>
      )}

      {/* Month comparison */}
      <CardShell title="Comparaison mensuelle">
        <div className="flex flex-wrap gap-3 mb-3">
          <label className="text-sm text-slate-600 self-center">Mois</label>
          <select
            value={compareMonth}
            onChange={e => setCompareMonth(Number(e.target.value))}
            className="px-3 py-1.5 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-50 rounded p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">{MONTHS[prevMonth - 1]} {prevYear}</p>
            <p className="font-bold text-slate-800 text-sm">{formatAr(prevMonthTotal)}</p>
          </div>
          <div className="bg-slate-50 rounded p-3 text-center flex flex-col items-center justify-center">
            {evolution === null ? (
              <>
                <Minus className="w-4 h-4 text-slate-400" />
                <p className="text-xs text-slate-400 mt-1">Pas de données précédentes</p>
              </>
            ) : evolution > 0 ? (
              <>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <p className="font-bold text-emerald-600 text-sm">+{evolution.toFixed(1)}%</p>
              </>
            ) : evolution < 0 ? (
              <>
                <TrendingDown className="w-4 h-4 text-red-500" />
                <p className="font-bold text-red-500 text-sm">{evolution.toFixed(1)}%</p>
              </>
            ) : (
              <>
                <Minus className="w-4 h-4 text-slate-500" />
                <p className="font-bold text-slate-500 text-sm">0%</p>
              </>
            )}
          </div>
          <div className="bg-slate-50 rounded p-3 text-center">
            <p className="text-xs text-slate-500 mb-1">{MONTHS[compareMonth - 1]} {selectedYear}</p>
            <p className="font-bold text-slate-800 text-sm">{formatAr(currentMonthTotal)}</p>
          </div>
        </div>
      </CardShell>
    </div>
  );
}