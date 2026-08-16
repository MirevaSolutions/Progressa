import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, Check, Wallet, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { Revenue } from '@/types/revenue';
import { getRevenues, createRevenue, updateRevenue, deleteRevenue,} from '@/services/revenue.service';
import { formatAr, formatDate, MONTHS } from '@/lib/format';

type Form = { amount: string; date: string; description: string };
const emptyForm: Form = { amount: '', date: new Date().toISOString().split('T')[0], description: '' };

function Modal({ title, icon, onClose, children }: { title: string; icon?: React.ReactNode; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-md shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            {icon}
            <h3 className="font-semibold text-slate-800">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded p-1 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export default function Revenus() {
  const now = new Date();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMonth, setFilterMonth] = useState<number | ''>('');
  const [filterYear, setFilterYear] = useState<number>(now.getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Revenue | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
  try {
    setLoading(true);

    const data = await getRevenues();

    setRevenues(data);
  } catch (error) {
    console.error('Erreur lors du chargement des revenus:', error);
    setRevenues([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, []);

  const filtered = revenues.filter(r => {
    const [y, m] = r.date.split('-').map(Number);
    if (filterYear && y !== filterYear) return false;
    if (filterMonth !== '' && m !== filterMonth) return false;
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const total = filtered.reduce((s, r) => s + r.amount, 0);
  const average = filtered.length > 0 ? total / filtered.length : 0;
  const hasActiveFilters = search !== '' || filterMonth !== '';

  const clearFilters = () => { setSearch(''); setFilterMonth(''); };

  const openAdd = () => { setEditing(null); setForm(emptyForm); setFormError(''); setShowModal(true); };
  const openEdit = (r: Revenue) => { setEditing(r); setForm({ amount: String(r.amount), date: r.date, description: r.description }); setFormError(''); setShowModal(true); };

  const handleSave = async () => {
  const amount = parseFloat(form.amount.replace(',', '.'));

  if (!form.amount || isNaN(amount) || amount <= 0) {
    setFormError('Le montant est obligatoire et doit être positif.');
    return;
  }

  if (!form.date) {
    setFormError('La date est obligatoire.');
    return;
  }

  setSaving(true);
  setFormError('');

  try {
    const payload = {
      amount,
      date: form.date,
      description: form.description.trim(),
    };

    if (editing) {
      await updateRevenue(editing.id, payload);
    } else {
      await createRevenue(payload);
    }

    setShowModal(false);
    await load();
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du revenu:', error);

    setFormError(
      editing
        ? 'Impossible d’enregistrer les modifications.'
        : 'Impossible d’enregistrer le revenu.'
    );
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (id: string) => {
  try {
    await deleteRevenue(id);

    setDeleteId(null);

    await load();
  } catch (error) {
    console.error('Erreur lors de la suppression du revenu:', error);
  }
};

  const years = Array.from(new Set(revenues.map(r => parseInt(r.date.split('-')[0])))).sort((a, b) => b - a);
  if (!years.includes(now.getFullYear())) years.unshift(now.getFullYear());

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Revenus</h1>
          <p className="text-slate-500 text-sm mt-0.5">Gérez vos revenus enregistrés</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-3 py-2 rounded-md shadow-sm shadow-emerald-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Ajouter</span>
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Wallet className="w-4 h-4 text-emerald-500" />
            Total affiché
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatAr(total)}</p>
          <p className="text-xs text-slate-400 mt-1">{filtered.length} revenu{filtered.length > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-md p-4 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            Montant moyen
          </div>
          <p className="text-2xl font-bold text-slate-800">{formatAr(Math.round(average))}</p>
          <p className="text-xs text-slate-400 mt-1">par entrée, sur la sélection</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-md border border-slate-100 shadow-sm p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une description..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-shadow"
          />
        </div>
        <select
          value={filterYear}
          onChange={e => setFilterYear(Number(e.target.value))}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={filterMonth}
          onChange={e => setFilterMonth(e.target.value === '' ? '' : Number(e.target.value))}
          className="px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-700"
        >
          <option value="">Tous les mois</option>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2">
            Réinitialiser
          </button>
        )}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-md border border-slate-100 shadow-sm p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-5 h-5 text-slate-300" />
          </div>
          <p className="text-slate-400 mb-4">
            {revenues.length === 0 ? 'Aucun revenu enregistré.' : 'Aucun résultat pour cette recherche.'}
          </p>
          {revenues.length === 0 ? (
            <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors">
              <Plus className="w-4 h-4" /> Ajouter un revenu
            </button>
          ) : (
            <button onClick={clearFilters} className="text-sm text-emerald-600 hover:underline font-medium">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/70 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Date</th>
                <th className="text-left px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Description</th>
                <th className="text-right px-4 py-3 text-slate-500 font-medium text-xs uppercase tracking-wide">Montant</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="group hover:bg-slate-50/60 transition-colors">
                  <td className="px-3 py-2 text-slate-600 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="px-3 py-2 text-slate-700 hidden sm:table-cell">
                    {r.description || <span className="text-slate-300 italic">Sans description</span>}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-emerald-700 whitespace-nowrap">{formatAr(r.amount)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal
          title={editing ? 'Modifier le revenu' : 'Ajouter un revenu'}
          icon={<div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center"><Wallet className="w-4 h-4 text-emerald-500" /></div>}
          onClose={() => setShowModal(false)}
        >
          <div className="space-y-4">
            {formError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-md text-red-600 text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                {formError}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Montant (Ar) *</label>
              <input
                type="number"
                min="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                placeholder="Ex : 150000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800"
                placeholder="Ex : Création d'un site web"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-white text-sm font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm p-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Supprimer ce revenu ?</h3>
            <p className="text-sm text-slate-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-md transition-colors">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}