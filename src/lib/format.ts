export function formatAr(amount: number): string {
  return new Intl.NumberFormat('fr-MG').format(amount) + ' Ar';
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export function monthName(month: number): string {
  return MONTHS[month - 1] ?? '';
}
