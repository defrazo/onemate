import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Объединяет TW классы, убирая дубликаты и конфликтующие классы через twMerge
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(...inputs));
