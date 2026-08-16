import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase, Revenue } from '@/lib/supabase';
import { formatAr, MONTHS } from '@/lib/format';

function Bar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 2 : 0) : 0;
  return (
    <div className="flex items-end gap-2">
      <div className="w-20 text-right text-xs text-slate-500 pb-0.5 flex-shrink-0">{label}</div>
      <div className="flex-1 h-7 bg-slate-100 rounded overflow-hidden">
        <div className="h-full bg-emerald-500 rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-28 text-xs text-slate-600 pb-0.5 flex-shrink-0">{formatAr(value)}</div>
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
      const [{ data: yr }, { data: all }] = await Promise.all([
        supabase.from('revenues').select('*').gte('date', `${selectedYear}-01-01`).lte('date', `${selectedYear}-12-31`),
        supabase.from('revenues').select('*'),
      ]);
      setRevenues(yr ?? []);
      setAllRevenues(all ?? []);
      setLoading(false);
    }
    load();
  }, [selectedYear]);

  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    label: MONTHS[i].slice(0, 3),
    total: revenues.filter(r => parseInt(r.date.split('-')[1]) === i + 1).reduce((s, r) => s + r.amount, 0),
  }));
  const maxMonthly = Math.max(...monthlyData.map(d => d.total), 1);
  const yearlyTotal = revenues.reduce((s, r) => s + r.amount, 0);

  // Annual comparison
  const years = Array.from(new Set(allRevenues.map(r => parseInt(r.date.split('-')[0])))).sort((a, b) => a - b);
  const annualData = years.map(y => ({
    year: y,
    total: allRevenues.filter(r => r.date.startsWith(String(y))).reduce((s, r) => s + r.amount, 0),
  }));
  const maxAnnual = Math.max(...annualData.map(d => d.total), 1);

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
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Statistiques</h1>
        <p className="text-slate-500 text-sm mt-0.5">Analyse de vos revenus</p>
      </div>

      {/* Year selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 font-medium">Année :</label>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
          {displayYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Monthly chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-700">Revenus mensuels — {selectedYear}</h2>
          <span className="text-sm font-bold text-emerald-600">{formatAr(yearlyTotal)}</span>
        </div>
        {revenues.length === 0 ? (
          <p className="text-slate-400 text-sm py-6 text-center">Aucun revenu pour cette période.</p>
        ) : (
          <div className="space-y-2.5">
            {monthlyData.map(d => (
              <Bar key={d.month} value={d.total} max={maxMonthly} label={d.label} />
            ))}
          </div>
        )}
      </div>

      {/* Annual totals */}
      {annualData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-700 mb-4">Revenus par année</h2>
          <div className="space-y-2.5">
            {annualData.map(d => (
              <Bar key={d.year} value={d.total} max={maxAnnual} label={String(d.year)} />
            ))}
          </div>
        </div>
      )}

      {/* Month comparison */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-700 mb-4">Comparaison mensuelle</h2>
        <div className="flex flex-wrap gap-3 mb-4">
          <label className="text-sm text-slate-600 self-center">Mois :</label>
          <select value={compareMonth} onChange={e => setCompareMonth(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{MONTHS[prevMonth - 1]} {prevYear}</p>
            <p className="font-bold text-slate-800">{formatAr(prevMonthTotal)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 text-center flex flex-col items-center justify-center">
            {evolution === null ? (
              <><Minus className="w-5 h-5 text-slate-400" /><p className="text-xs text-slate-400 mt-1">Pas de données précédentes</p></>
            ) : evolution > 0 ? (
              <><TrendingUp className="w-5 h-5 text-emerald-600" /><p className="font-bold text-emerald-600">+{evolution.toFixed(1)}%</p></>
            ) : evolution < 0 ? (
              <><TrendingDown className="w-5 h-5 text-red-500" /><p className="font-bold text-red-500">{evolution.toFixed(1)}%</p></>
            ) : (
              <><Minus className="w-5 h-5 text-slate-500" /><p className="font-bold text-slate-500">0%</p></>
            )}
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{MONTHS[compareMonth - 1]} {selectedYear}</p>
            <p className="font-bold text-slate-800">{formatAr(currentMonthTotal)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
