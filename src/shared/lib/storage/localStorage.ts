export const storage = {
	get: (key: string): any => {
		const item = localStorage.getItem(key);
		try {
			return item ? JSON.parse(item) : null;
		} catch {
			return item;
		}
	},

	set: (key: string, value: any): void => {
		if (value === undefined || value === null) localStorage.removeItem(key);
		else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
	},

	remove: (key: string): void => localStorage.removeItem(key),
};
