import { getDaysInMonth } from 'date-fns';

import type { GenderOption } from '../model';

export const getAvailableDays = (year: string, month: string): string[] => {
	if (!year || month === '') return [];
	const count = getDaysInMonth(new Date(+year, +month));
	return Array.from({ length: count }, (_, i) => (i + 1).toString());
};

export const genderOptions: GenderOption[] = [
	{ value: 'male', label: 'Мужской' },
	{ value: 'female', label: 'Женский' },
	{ value: '', label: 'Не указывать' },
];
