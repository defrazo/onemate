import { getDaysInMonth } from 'date-fns';

export const getAvailableDays = (year: string, month: string): string[] => {
	if (!year || month === '') return [];
	const count = getDaysInMonth(new Date(+year, +month));
	return Array.from({ length: count }, (_, i) => (i + 1).toString());
};
