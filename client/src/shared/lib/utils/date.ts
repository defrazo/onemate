import { capitalizeFirstLetter } from '.';

// Форматирует timestamp (секунды) в ISO-формат "YYYY-MM-DD"
export const formatDate = (timestamp: number) => {
	return new Date(timestamp * 1000).toISOString().split('T')[0];
};

// Форматирует дату в короткий вид: "11 ноя", "25 дек"
export const shortDate = (date: Date): string => date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

// Преобразует строку даты в локализованный формат (short – "дд.мм", long – "дд.мм.yy")
export const convertDate = (timestamp: string, length: 'short' | 'long') => {
	const date = new Date(timestamp);
	const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };

	if (length === 'long') options.year = '2-digit';

	return new Intl.DateTimeFormat('ru-RU', options).format(date);
};

// Возвращает день недели по timestamp (секунды) (short – "Пн", long – "Понедельник")
export const dayOfWeek = (timestamp: number, length: 'short' | 'long') => {
	return new Date(timestamp * 1000).toLocaleDateString('ru-RU', { weekday: length });
};

// Форматирует строку даты в полную дату + время в локали ru-RU (например: "31.07.2025, 14:05")
export const fullDate = (date: string, shortYear = false) =>
	new Date(date).toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: shortYear ? '2-digit' : 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

// Генерирует массив годов (для select), начиная с текущего и обратно count лет
// Формат: { value: '2025', label: '2025' }
export const generateYears = (count = 100): { value: string; label: string }[] =>
	Array.from({ length: count }, (_, i) => {
		const y = (new Date().getFullYear() - i).toString();
		return { value: y, label: y };
	});

// Генерирует массив месяцев (для select)
// value: номер месяца (0-11), label: название месяца с заглавной буквы на русском
export const generateMonth = (count = 12): { value: string; label: string }[] =>
	Array.from({ length: count }, (_, i) => ({
		value: i.toString(),
		label: capitalizeFirstLetter(new Date(0, i).toLocaleString('ru', { month: 'long' })),
	}));

// Делает дату относительной
interface DateOffsetOptions {
	days?: number;
	hours?: number;
	minutes?: number;
	withTime?: boolean;
}

export const dateOffset = ({ days = 0, hours = 0, minutes = 0, withTime = false }: DateOffsetOptions = {}) => {
	const date = new Date();

	date.setDate(date.getDate() + days);
	date.setHours(date.getHours() + hours);
	date.setMinutes(date.getMinutes() + minutes);

	if (withTime) return date.toISOString();

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
};
