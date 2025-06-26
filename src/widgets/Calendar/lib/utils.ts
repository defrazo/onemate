export const formatMonthTitle = (date: Date): string => {
	return new Intl.DateTimeFormat('ru-RU', {
		month: 'long',
		year: 'numeric',
	}).format(date);
};

export const getDateFromDay = (currentDate: Date, day: number) => {
	return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
};
