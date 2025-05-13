import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, isToday, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ptBR });
}

export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: ptBR });
}

export function getDayClassName(date: Date): string {
  if (isToday(date)) {
    return 'bg-primary text-primary-foreground font-bold';
  }
  if (isWeekend(date)) {
    return 'text-muted-foreground bg-muted';
  }
  return '';
}

export function generateMonthDays(year: number, month: number): Date[] {
  const days = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  
  return days;
}
