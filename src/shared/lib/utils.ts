import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(...inputs));
}

export const formatTime = (timestamp: number): string => {
	return new Date(timestamp * 1000).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
};

export const formatDate = (timestamp: number): string => {
	return new Date(timestamp * 1000).toISOString().split('T')[0];
};

export const convertDate = (timestamp: string): string => {
	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: '2-digit',
	}).format(new Date(timestamp));
};

export const dayOfWeek = (timestamp: number, length: 'short' | 'long'): string => {
	return new Date(timestamp * 1000).toLocaleDateString('ru-RU', { weekday: length });
};

export const capitalizeFirstLetter = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateUUID = () => {
	if (crypto && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	// Fallback для старых браузеров
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
