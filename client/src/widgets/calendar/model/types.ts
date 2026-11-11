export type DateRange = [Date | null, Date | null];
export type CalendarMode = 'period' | 'after' | 'until';

export const PRODUCTION_DAY = { off: 0, working: 1, shortened: 2 } as const;
export type ProductionDay = (typeof PRODUCTION_DAY)[keyof typeof PRODUCTION_DAY];

export type ProductionYear = { year: number; days: Uint8Array };
export type ProductionStatus = 'inactive' | 'loading' | 'active' | 'error';

export type CalendarState = {
	currentMonth: Date;
	mode: CalendarMode;
	range: DateRange;
	afterStart: Date;
	customStart: boolean;
	target: Date | null;
	dayCount: string;
	includeWeekends: boolean;
	isControlsOpen: boolean;
};
