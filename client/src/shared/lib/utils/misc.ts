import { COLOR_PALETTE, type PaletteColor } from '@/shared/config';

// Генерирует случайный UUID
export const generateUUID = (): string => {
	if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();

	const bytes = new Uint8Array(16);
	crypto.getRandomValues(bytes);

	bytes[6] = (bytes[6] & 0x0f) | 0x40;
	bytes[8] = (bytes[8] & 0x3f) | 0x80;

	const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');

	return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
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

// Генерирует случайный цвет
export const getRandomPaletteColor = (): PaletteColor => {
	const colors = Object.keys(COLOR_PALETTE) as PaletteColor[];
	return colors[Math.floor(Math.random() * colors.length)];
};
