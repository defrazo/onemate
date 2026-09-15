// Генерирует случайный UUID
export const generateUUID = (): string => {
	if (crypto && crypto.randomUUID) return crypto.randomUUID();

	// Fallback для старых браузеров
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

// Генерирует случайное число
export const randomNumber = (min: number, max: number): number => {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Склонение числительных
export const pluralize = (count: number, one: string, few: string, many: string): string => {
	const mod10 = count % 10;
	const mod100 = count % 100;

	if (mod10 === 1 && mod100 !== 11) return one;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;

	return many;
};
