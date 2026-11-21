import { getDay, getDaysInMonth, startOfMonth } from 'date-fns';

export const getCalendarDays = (month: Date): (number | null)[] => {
	const firstWeekday = (getDay(startOfMonth(month)) + 6) % 7;
	const daysInMonth = getDaysInMonth(month);

	const days = Array.from({ length: 42 }, (_, idx) => {
		const day = idx - firstWeekday + 1;
		return day >= 1 && day <= daysInMonth ? day : null;
	});

	return days.slice(-7).every((day) => day === null) ? days.slice(0, -7) : days;
};

export const formatMonthTitle = (date: Date): string => {
	const title = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date);
	return title.charAt(0).toUpperCase() + title.slice(1);
};

export const getDateInMonth = (date: Date, day: number): Date => new Date(date.getFullYear(), date.getMonth(), day);
