import { LS_PREFIX } from '@/shared/config';

export const storage = {
	get: (key: string): any => {
		const item = localStorage.getItem(key);
		try {
			return item ? JSON.parse(item) : null;
		} catch {
			return item;
		}
	},

	set: (key: string, value: any) => {
		if (value === undefined || value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
	},

	remove: (key: string) => localStorage.removeItem(key),
};

export const clearDemoStorage = (userId: string) => {
	const suffix = `_demo_${userId}`;

	for (const key of Object.keys(localStorage)) {
		if (key.startsWith(LS_PREFIX) && key.endsWith(suffix)) localStorage.removeItem(key);
	}
};
