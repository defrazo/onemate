import { capitalizeFirstLetter } from '.';

// Форматирует timestamp (секунды) в ISO-формат "YYYY-MM-DD"
export const formatDate = (timestamp: number): string => {
	return new Date(timestamp * 1000).toISOString().split('T')[0];
};

// Преобразует строку даты в локализованный формат (short — "дд.мм", long — "дд.мм.yy")
export const convertDate = (timestamp: string, length: 'short' | 'long'): string => {
	const date = new Date(timestamp);
	const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };

	if (length === 'long') options.year = '2-digit';

	return new Intl.DateTimeFormat('ru-RU', options).format(date);
};

// Возвращает день недели по timestamp (секунды) (short — "Пн", long — "Понедельник")
export const dayOfWeek = (timestamp: number, length: 'short' | 'long'): string => {
	return new Date(timestamp * 1000).toLocaleDateString('ru-RU', { weekday: length });
};

// Форматирует строку даты в полную дату + время в локали ru-RU (например: "31.07.2025, 14:05")
export const fullDate = (date: string) =>
	new Date(date).toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

// Генерирует массив годов (для select), начиная с текущего и обратно count лет
// Формат: { value: '2025', label: '2025' }
export const generateYears = (count = 100) =>
	Array.from({ length: count }, (_, i) => {
		const y = (new Date().getFullYear() - i).toString();
		return { value: y, label: y };
	});

// Генерирует массив месяцев (для select)
// value: номер месяца (0-11), label: название месяца с заглавной буквы на русском
export const generateMonth = (count = 12) =>
	Array.from({ length: count }, (_, i) => ({
		value: i.toString(),
		label: capitalizeFirstLetter(new Date(0, i).toLocaleString('ru', { month: 'long' })),
	}));
