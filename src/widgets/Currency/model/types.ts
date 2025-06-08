export type RatesResponse = {
	lastUpdate: number;
	rates: Record<string, number>;
};

export type RatesList = Record<string, { code: string; icon: string; name: string; value: number }>;
