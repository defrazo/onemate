import { getDay, getDaysInMonth, startOfMonth } from 'date-fns';

export const getCalendarDays = (month: Date): (number | null)[] => {
	const startOfCurrentMonth = startOfMonth(month);
	const startWeekday = (getDay(startOfCurrentMonth) + 6) % 7;
	const daysInMonth = getDaysInMonth(month);

	const rawDays = Array.from({ length: 42 }, (_, i) => {
		const day = i - startWeekday + 1;
		return day > 0 && day <= daysInMonth ? day : null;
	});

	const lastWeek = rawDays.slice(-7);
	const calendarDays = lastWeek.every((d) => d === null) ? rawDays.slice(0, -7) : rawDays;

	return calendarDays;
};

export const formatMonthTitle = (date: Date) => {
	const value = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date);
	return value.charAt(0).toUpperCase() + value.slice(1);
};

export const getDateInMonth = (date: Date, day: number) => {
	return new Date(date.getFullYear(), date.getMonth(), day);
};
