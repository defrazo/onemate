const POPULAR_CODES: readonly string[] = ['RUB', 'USD', 'EUR', 'CNY', 'JPY', 'KZT', 'GBP', 'UAH', 'TRY'] as const;

export const sortCodesByPopularity = (codes: string[]): string[] => {
	const idx = (code: string) => {
		const i = POPULAR_CODES.indexOf(code);
		return i === -1 ? POPULAR_CODES.length + 1 : i;
	};

	return [...codes].sort((a, b) => {
		const ia = idx(a);
		const ib = idx(b);
		if (ia !== ib) return ia - ib;
		return a.localeCompare(b);
	});
};
