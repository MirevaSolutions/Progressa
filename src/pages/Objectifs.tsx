import { useEffect, useState } from 'react';
import { Target, Check, Pencil, X, AlertCircle } from 'lucide-react';
import { supabase, Goal, Revenue } from '@/lib/supabase';
import { formatAr, monthName, MONTHS } from '@/lib/format';

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = pct >= 100 ? 'bg-emerald-600' : pct >= 60 ? 'bg-emerald-500' : pct >= 30 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="mt-3">
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-right text-xs text-slate-500 mt-1">{pct.toFixed(1)}%</p>
    </div>
  );
}

type GoalCardProps = {
  label: string;
  goal: Goal | undefined;
  earned: number;
  onEdit: () => void;
};

function GoalCard({ label, goal, earned, onEdit }: GoalCardProps) {
  const remaining = goal ? Math.max(goal.target_amount - earned, 0) : 0;
  return (
    <div className="bg-white rounded-md border border-slate-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-emerald-500" />
          <h2 className="font-semibold text-slate-800 text-sm">{label}</h2>
        </div>
        <button onClick={onEdit} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 transition-colors">
          <Pencil className="w-3.5 h-3.5" />
          {goal ? 'Modifier' : 'Définir'}
        </button>
      </div>

      {goal ? (
        <>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-50 rounded p-2.5">
              <p className="text-xs text-slate-500 mb-1">Objectif</p>
              <p className="font-bold text-slate-800 text-sm">{formatAr(goal.target_amount)}</p>
            </div>
            <div className="bg-emerald-50 rounded p-2.5">
              <p className="text-xs text-emerald-600 mb-1">Réalisé</p>
              <p className="font-bold text-emerald-700 text-sm">{formatAr(earned)}</p>
            </div>
            <div className="bg-slate-50 rounded p-2.5">
              <p className="text-xs text-slate-500 mb-1">Reste</p>
              <p className="font-bold text-slate-700 text-sm">{remaining === 0 ? '—' : formatAr(remaining)}</p>
            </div>
          </div>
          <ProgressBar value={earned} max={goal.target_amount} />
          {earned >= goal.target_amount && (
            <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm font-medium">
              <Check className="w-4 h-4" /> Objectif atteint !
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-400">Aucun objectif défini pour le moment.</p>
      )}
    </div>
  );
}

type FormState = { target: string };

function GoalModal({
  title,
  current,
  onSave,
  onClose,
}: {
  title: string;
  current?: Goal;
  onSave: (amount: number) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<FormState>({ target: current ? String(current.target_amount) : '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const amount = parseFloat(form.target.replace(',', '.'));
    if (!form.target || isNaN(amount) || amount <= 0) { setError('Le montant est obligatoire et doit être positif.'); return; }
    setSaving(true);
    await onSave(amount);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-md shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-slate-800">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant objectif (Ar) *</label>
            <input
              type="number"
              min="0"
              value={form.target}
              onChange={e => setForm({ target: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
              placeholder="Ex : 2000000"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-semibold rounded transition-colors flex items-center justify-center gap-2">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Objectifs() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMonthly, setEditingMonthly] = useState(false);
  const [editingAnnual, setEditingAnnual] = useState(false);

  const load = async () => {
    const [{ data: g }, { data: r }] = await Promise.all([
      supabase.from('goals').select('*').eq('year', year),
      supabase.from('revenues').select('*').gte('date', `${year}-01-01`).lte('date', `${year}-12-31`),
    ]);
    setGoals(g ?? []);
    setRevenues(r ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [year]);

  const monthlyGoal = goals.find(g => g.type === 'monthly' && g.month === month);
  const annualGoal = goals.find(g => g.type === 'annual');

  const monthlyEarned = revenues.filter(r => parseInt(r.date.split('-')[1]) === month).reduce((s, r) => s + r.amount, 0);
  const annualEarned = revenues.reduce((s, r) => s + r.amount, 0);

  const upsertGoal = async (type: 'monthly' | 'annual', amount: number) => {
    const existing = type === 'monthly' ? monthlyGoal : annualGoal;
    if (existing) {
      await supabase.from('goals').update({ target_amount: amount }).eq('id', existing.id);
    } else {
      const payload: { type: string; year: number; month?: number; target_amount: number } = { type, year, target_amount: amount };
      if (type === 'monthly') payload.month = month;
      await supabase.from('goals').insert(payload);
    }
    setEditingMonthly(false);
    setEditingAnnual(false);
    load();
  };

  const years = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  if (loading) return <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Objectifs</h1>
        <p className="text-slate-500 text-sm mt-0.5">Définissez et suivez vos objectifs de revenus</p>
      </div>

      {/* Period selector */}
      <div className="bg-white rounded-md border border-slate-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={month} onChange={e => setMonth(Number(e.target.value))} className="px-3 py-2 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        <GoalCard
          label={`Objectif mensuel — ${monthName(month)} ${year}`}
          goal={monthlyGoal}
          earned={monthlyEarned}
          onEdit={() => setEditingMonthly(true)}
        />
        <GoalCard
          label={`Objectif annuel — ${year}`}
          goal={annualGoal}
          earned={annualEarned}
          onEdit={() => setEditingAnnual(true)}
        />
      </div>

      {editingMonthly && (
        <GoalModal
          title={`Objectif mensuel — ${monthName(month)} ${year}`}
          current={monthlyGoal}
          onSave={amount => upsertGoal('monthly', amount)}
          onClose={() => setEditingMonthly(false)}
        />
      )}
      {editingAnnual && (
        <GoalModal
          title={`Objectif annuel — ${year}`}
          current={annualGoal}
          onSave={amount => upsertGoal('annual', amount)}
          onClose={() => setEditingAnnual(false)}
        />
      )}
    </div>
  );
}