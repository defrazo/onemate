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

export type CBRDailyResponse = {
	Date: string;
	PreviousDate: string;
	PreviousURL: string;
	Timestamp: string;
	Valute: Record<string, CBRValute>;
};

type CBRValute = {
	ID: string;
	NumCode: string;
	CharCode: string;
	Nominal: number;
	Name: string;
	Value: number;
	Previous: number;
};
