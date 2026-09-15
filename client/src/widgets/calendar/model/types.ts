export type DateRange = [Date | null, Date | null];

export type RangeInfo = {
	label: string;
	days: number;
	hasWeekends: boolean;
	weekendLabel: string | null;
	copyText: string;
};
