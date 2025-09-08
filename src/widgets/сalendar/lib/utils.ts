import { getDay, getDaysInMonth, startOfMonth } from 'date-fns';

export const generateCalendarDays = (currentDate: Date): (number | null)[] => {
	const startOfCurrentMonth = startOfMonth(currentDate);
	const startWeekday = (getDay(startOfCurrentMonth) + 6) % 7;
	const daysInMonth = getDaysInMonth(currentDate);

	const rawDays = Array.from({ length: 42 }, (_, i) => {
		const day = i - startWeekday + 1;
		return day > 0 && day <= daysInMonth ? day : null;
	});

	const lastWeek = rawDays.slice(-7);
	const calendarDays = lastWeek.every((d) => d === null) ? rawDays.slice(0, -7) : rawDays;

	return calendarDays;
};

export const formatMonthTitle = (date: Date): string => {
	return new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(date);
};

export const getDateFromDay = (currentDate: Date, day: number): Date => {
	return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
};
