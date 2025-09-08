export type Currency = {
	type: string;
	code: string;
	value: number;
};

export type CurrencyOption = {
	icon: string;
	key: string;
	label: string;
	value: string;
};

export type RatesList = Record<string, { code: string; icon: string; name: string; value: number }>;

export type RatesResponse = {
	base: string;
	lastUpdate: number;
	rates: Record<string, number>;
};
