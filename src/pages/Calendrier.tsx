import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check, Pencil, Trash2, Clock, AlertCircle, Circle, CalendarDays } from 'lucide-react';
import { Task } from '@/types/task';
import { createTask, deleteTask, getTasksByMonth, updateTask, updateTaskStatus,} from '@/services/task.service';
import { MONTHS } from '@/lib/format';

type View = 'month' | 'week' | 'day';
type Priority = 'low' | 'medium' | 'high';
type Status = 'done' | 'not_done' | 'pending';

const PRIORITY_LABEL: Record<Priority, string> = { low: 'Faible', medium: 'Moyenne', high: 'Haute' };
const PRIORITY_COLOR: Record<Priority, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-red-100 text-red-700',
};
const STATUS_LABEL: Record<Status, string> = { done: 'Fini', not_done: 'Pas fini', pending: 'En attente' };
const STATUS_DOT: Record<Status, string> = { done: 'bg-emerald-500', not_done: 'bg-red-500', pending: 'bg-amber-400' };

type TaskForm = {
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  description: string;
  priority: Priority;
  status: Status;
  reminder: string;
};

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function TaskModal({
  initialDate,
  task,
  onSave,
  onClose,
}: {
  initialDate: string;
  task?: Task;
  onSave: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TaskForm>({
    title: task?.title ?? '',
    date: task?.date ?? initialDate,
    start_time: task?.start_time ?? '',
    end_time: task?.end_time ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    status: task?.status ?? 'pending',
    reminder: task?.reminder != null ? String(task.reminder) : '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) { setError('Le titre est obligatoire.'); return; }
    if (!form.date) { setError('La date est obligatoire.'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      date: form.date,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      description: form.description,
      priority: form.priority,
      status: form.status,
      reminder: form.reminder ? parseInt(form.reminder) : null,
    };
    try {
  if (task) {
    await updateTask(task.id, payload);
  } else {
    await createTask(payload);
  }

  onSave();
} catch (error) {
  console.error(error);
  setError(
    task
      ? "Impossible de modifier l'activité."
      : "Impossible d'enregistrer l'activité."
  );
  setSaving(false);
}
    onSave();
  };

  const f = (field: keyof TaskForm, val: string) => setForm(p => ({ ...p, [field]: val }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-md shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-slate-800">{task ? 'Modifier l\'activité' : 'Nouvelle activité'}</h3>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
            <input value={form.title} onChange={e => f('title', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800" placeholder="Titre de l'activité" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
            <input type="date" value={form.date} onChange={e => f('date', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Début</label>
              <input type="time" value={form.start_time} onChange={e => f('start_time', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fin</label>
              <input type="time" value={form.end_time} onChange={e => f('end_time', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 resize-none" placeholder="Notes optionnelles..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
              <select value={form.priority} onChange={e => f('priority', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800">
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Statut</label>
              <select value={form.status} onChange={e => f('status', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800">
                <option value="pending">En attente</option>
                <option value="done">Fini</option>
                <option value="not_done">Pas fini</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rappel</label>
            <select value={form.reminder} onChange={e => f('reminder', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white text-slate-800">
              <option value="">Aucun rappel</option>
              <option value="5">5 minutes avant</option>
              <option value="10">10 minutes avant</option>
              <option value="15">15 minutes avant</option>
              <option value="30">30 minutes avant</option>
              <option value="60">1 heure avant</option>
              <option value="1440">1 jour avant</option>
            </select>
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

function TaskRow({ task, onEdit, onDelete, onStatusChange }: { task: Task; onEdit: () => void; onDelete: () => void; onStatusChange: (s: Status) => void }) {
  return (
    <div className="group flex items-start gap-3 p-3 bg-white rounded border border-slate-100 hover:border-slate-200 transition-colors">
      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${STATUS_DOT[task.status]}`} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm truncate">{task.title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {task.start_time && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />{task.start_time}{task.end_time ? ` — ${task.end_time}` : ''}
            </span>
          )}
          <span className={`text-xs px-2 py-0.5 rounded font-medium ${PRIORITY_COLOR[task.priority]}`}>{PRIORITY_LABEL[task.priority]}</span>
        </div>
        {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.description}</p>}
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <select
          value={task.status}
          onChange={e => onStatusChange(e.target.value as Status)}
          className="text-xs border border-slate-200 rounded px-2 py-1 bg-white text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="pending">En attente</option>
          <option value="done">Fini</option>
          <option value="not_done">Pas fini</option>
        </select>
        <button onClick={onEdit} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors opacity-0 group-hover:opacity-100"><Pencil className="w-3.5 h-3.5" /></button>
        <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3.5 h-3.5" /></button>
      </div>
    </div>
  );
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1; // Monday-first
}

export default function Calendrier() {
  const now = new Date();
  const [view, setView] = useState<View>('month');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(toDateStr(now));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [modalDate, setModalDate] = useState(toDateStr(now));
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
  try {
    setLoading(true);

    const data = await getTasksByMonth(year, month);

    setTasks(data);
  } catch (error) {
    console.error('Erreur lors du chargement des activités:', error);
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { load(); }, [year, month]);

  const openAdd = (date: string) => { setEditingTask(undefined); setModalDate(date); setShowModal(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setModalDate(task.date); setShowModal(true); };

  const handleDelete = async (id: string) => {
  try {
    await deleteTask(id);
    setDeleteId(null);
    await load();
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
  }
};

  const handleStatusChange = async (task: Task, status: Status) => {
  try {
    await updateTaskStatus(task.id, status);
    await load();
  } catch (error) {
    console.error('Erreur lors de la modification du statut:', error);
  }
};

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const dayTasks = (date: string) => tasks.filter(t => t.date === date);
  const selectedTasks = dayTasks(selectedDate);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendrier</h1>
          <p className="text-slate-500 text-sm mt-0.5">{MONTHS[month - 1]} {year}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-slate-200 rounded overflow-hidden text-sm">
            {(['month', 'week', 'day'] as View[]).map(v => (
              <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 ${view === v ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'} transition-colors capitalize`}>
                {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : 'Jour'}
              </button>
            ))}
          </div>
          <button onClick={openAdd.bind(null, selectedDate)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-3 py-2 rounded shadow-sm shadow-emerald-200 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Activité</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={prevMonth} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
        <span className="font-semibold text-slate-700 text-sm">{MONTHS[month - 1]} {year}</span>
        <button onClick={nextMonth} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
        <button onClick={() => { setYear(now.getFullYear()); setMonth(now.getMonth() + 1); setSelectedDate(toDateStr(now)); }} className="ml-2 text-xs text-emerald-600 hover:underline">Aujourd'hui</button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Month view */}
          {view === 'month' && (
            <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden mb-4">
              <div className="grid grid-cols-7 border-b border-slate-100">
                {weekDays.map(d => <div key={d} className="text-center text-xs font-medium text-slate-400 py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7">
                {Array.from({ length: firstDay }, (_, i) => <div key={`e-${i}`} className="border-b border-r border-slate-50 min-h-[64px]" />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const dt = dayTasks(dateStr);
                  const isToday = dateStr === toDateStr(now);
                  const isSelected = dateStr === selectedDate;
                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`border-b border-r border-slate-50 min-h-[64px] p-1 cursor-pointer transition-colors ${isSelected ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-700'}`}>{day}</div>
                      <div className="space-y-0.5">
                        {dt.slice(0, 2).map(t => (
                          <div key={t.id} className={`text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1 ${PRIORITY_COLOR[t.priority]}`}>
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[t.status]}`} />
                            {t.title}
                          </div>
                        ))}
                        {dt.length > 2 && <div className="text-[10px] text-slate-400 px-1">+{dt.length - 2}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week view — simplified as 7 day columns */}
          {view === 'week' && (() => {
            const selD = new Date(selectedDate);
            const dow = selD.getDay() === 0 ? 6 : selD.getDay() - 1;
            const weekStart = new Date(selD);
            weekStart.setDate(selD.getDate() - dow);
            const weekDates = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(weekStart);
              d.setDate(weekStart.getDate() + i);
              return toDateStr(d);
            });
            return (
              <div className="bg-white rounded-md border border-slate-100 shadow-sm overflow-hidden mb-4">
                <div className="grid grid-cols-7 border-b border-slate-100">
                  {weekDates.map((ds, i) => {
                    const d = new Date(ds);
                    const isToday = ds === toDateStr(now);
                    return (
                      <div key={ds} onClick={() => setSelectedDate(ds)} className={`text-center py-2 cursor-pointer ${ds === selectedDate ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}>
                        <div className="text-xs text-slate-400">{weekDays[i]}</div>
                        <div className={`text-sm font-semibold mt-0.5 w-7 h-7 flex items-center justify-center rounded-full mx-auto ${isToday ? 'bg-emerald-500 text-white' : 'text-slate-700'}`}>{d.getDate()}</div>
                        {dayTasks(ds).length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mx-auto mt-1" />}
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-7 min-h-32">
                  {weekDates.map(ds => {
                    const dt = dayTasks(ds);
                    return (
                      <div key={ds} className={`border-r border-slate-50 p-1 ${ds === selectedDate ? 'bg-emerald-50/50' : ''}`}>
                        {dt.map(t => (
                          <div key={t.id} onClick={() => openEdit(t)} className={`text-[10px] px-1 py-0.5 rounded mb-0.5 truncate cursor-pointer flex items-center gap-1 ${PRIORITY_COLOR[t.priority]}`}>
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[t.status]}`} />
                            {t.title}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Day view */}
          {view === 'day' && (
            <div className="bg-white rounded-md border border-slate-100 shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-700 text-sm">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                <button onClick={() => openAdd(selectedDate)} className="text-xs text-emerald-600 hover:underline">+ Ajouter</button>
              </div>
              {dayTasks(selectedDate).length === 0 ? (
                <p className="text-slate-400 text-sm py-4 text-center">Aucune activité ce jour-là.</p>
              ) : (
                <div className="space-y-2">
                  {dayTasks(selectedDate).map(t => (
                    <TaskRow key={t.id} task={t} onEdit={() => openEdit(t)} onDelete={() => setDeleteId(t.id)} onStatusChange={s => handleStatusChange(t, s)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Selected day tasks */}
          {view !== 'day' && (
            <div className="bg-white rounded-md border border-slate-100 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-slate-700 text-sm">
                  {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h2>
                <button onClick={() => openAdd(selectedDate)} className="text-xs text-emerald-600 hover:underline">+ Ajouter</button>
              </div>
              {selectedTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Circle className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-3">Aucune activité prévue ce jour.</p>
                  <button onClick={() => openAdd(selectedDate)} className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium px-3 py-2 rounded transition-colors">
                    <Plus className="w-4 h-4" /> Ajouter une activité
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map(t => (
                    <TaskRow key={t.id} task={t} onEdit={() => openEdit(t)} onDelete={() => setDeleteId(t.id)} onStatusChange={s => handleStatusChange(t, s)} />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showModal && (
        <TaskModal
          initialDate={modalDate}
          task={editingTask}
          onSave={() => { setShowModal(false); load(); }}
          onClose={() => setShowModal(false)}
        />
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-md shadow-xl w-full max-w-sm p-4">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">Supprimer cette activité ?</h3>
            <p className="text-sm text-slate-500 mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-slate-200 rounded text-sm text-slate-600 hover:bg-slate-50 transition-colors">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded transition-colors">Supprimer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}