// Генерирует случайный UUID
export const generateUUID = () => {
	if (crypto && crypto.randomUUID) return crypto.randomUUID();

	// Fallback для старых браузеров
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// Генерирует случайное число
export const randomNumber = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Склонение числительных
export const pluralize = (count: number, one: string, few: string, many: string) => {
	const mod10 = count % 10;
	const mod100 = count % 100;

	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;

	return many;
};

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
