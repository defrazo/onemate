import { capitalizeFirstLetter } from './string';

// Преобразует Unix timestamp (секунды) в дату YYYY-MM-DD по UTC
// formatDate(1762819200) → '2025-11-11'
export const formatDate = (timestamp: number) => {
	return new Date(timestamp * 1000).toISOString().split('T')[0];
};

// Форматирует Unix timestamp (миллисекунды) в дату и время без года.
// shortDateTime(1762873500000) → '11.11, 14:05' (в UTC)
export const shortDateTime = (timestamp: number): string =>
	new Date(timestamp).toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	});

// Форматирует дату как день и полное название месяца без года
// shortDate(new Date(2025, 10, 11)) → '11 ноября'
export const shortDate = (date: Date): string => date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

// Форматирует строку даты: short – ДД.ММ, long – ДД.ММ.ГГ
// convertDate('2025-11-11', 'short') → '11.11'; convertDate('2025-11-11', 'long') → '11.11.25'
export const convertDate = (timestamp: string, length: 'short' | 'long') => {
	const date = new Date(timestamp);
	const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit' };

	if (length === 'long') options.year = '2-digit';

	return new Intl.DateTimeFormat('ru-RU', options).format(date);
};

// Возвращает день недели по Unix timestamp (секунды): short – сокращённо, long – полностью
// dayOfWeek(1762819200, 'short') → 'вт'; dayOfWeek(1762819200, 'long') → 'вторник'
export const dayOfWeek = (timestamp: number, length: 'short' | 'long') => {
	return new Date(timestamp * 1000).toLocaleDateString('ru-RU', { weekday: length });
};

// Форматирует строку даты с временем в локали ru-RU; shortYear сокращает год до двух цифр
// fullDate('2025-11-11T14:05:00') → '11.11.2025, 14:05' (при локальном времени UTC)
export const fullDate = (date: string, shortYear = false) =>
	new Date(date).toLocaleString('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: shortYear ? '2-digit' : 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});

// Генерирует массив из count годов, начиная с текущего и двигаясь назад
// generateYears(2) → [{ value: '2026', label: '2026' }, { value: '2025', label: '2025' }] (в 2026 году)
export const generateYears = (count = 100): { value: string; label: string }[] =>
	Array.from({ length: count }, (_, i) => {
		const y = (new Date().getFullYear() - i).toString();
		return { value: y, label: y };
	});

// Генерирует массив месяцев с индексами 0–11 и русскими названиями с заглавной буквы
// generateMonth(2) → [{ value: '0', label: 'Январь' }, { value: '1', label: 'Февраль' }]
export const generateMonth = (count = 12): { value: string; label: string }[] =>
	Array.from({ length: count }, (_, i) => ({
		value: i.toString(),
		label: capitalizeFirstLetter(new Date(0, i).toLocaleString('ru', { month: 'long' })),
	}));

// Параметры смещения относительно текущей даты и времени
interface DateOffsetOptions {
	days?: number;
	hours?: number;
	minutes?: number;
	withTime?: boolean;
}

// Смещает текущую дату на указанное количество дней, часов и минут (допускаются отрицательные значения)
// dateOffset({ days: 1 }) → '2026-11-16'; dateOffset({ hours: 2, withTime: true }) → ISO-строка UTC с временем
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
