import { type ClassValue, clsx } from 'clsx';
import copy from 'copy-to-clipboard';
import { twMerge } from 'tailwind-merge';

import { notifyStore } from '../stores';

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

export const convertDate = (timestamp: string, length: 'short' | 'long'): string => {
	const date = new Date(timestamp);

	const options: Intl.DateTimeFormatOptions = {
		day: '2-digit',
		month: '2-digit',
	};

	if (length === 'long') options.year = '2-digit';

	return new Intl.DateTimeFormat('ru-RU', options).format(date);
};

export const dayOfWeek = (timestamp: number, length: 'short' | 'long'): string => {
	return new Date(timestamp * 1000).toLocaleDateString('ru-RU', { weekday: length });
};

export const capitalizeFirstLetter = (str: string): string => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const generateUUID = () => {
	if (crypto && crypto.randomUUID) return crypto.randomUUID();

	// Fallback для старых браузеров
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

export const copyExt = (data: string, message?: string): void => {
	copy(data);
	notifyStore.setSuccess(message ?? 'Данные скопированы!');
};

export function getBrowserInfo() {
	const ua = navigator.userAgent;

	let browser = 'Неизвестный';

	if (/Edg/i.test(ua)) {
		browser = 'Edge';
	} else if (/OPR/i.test(ua)) {
		browser = 'Opera';
	} else if (/Chrome/i.test(ua)) {
		browser = 'Chrome';
	} else if (/Firefox/i.test(ua)) {
		browser = 'Firefox';
	} else if (/Safari/i.test(ua)) {
		browser = 'Safari';
	}

	const isPhone = /Mobi|Android|iPhone/i.test(ua);

	return {
		browser,
		isPhone,
	};
}
