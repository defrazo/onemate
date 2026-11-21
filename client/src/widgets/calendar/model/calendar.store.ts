import { addMonths, isSameDay, startOfDay, startOfMonth } from 'date-fns';
import { action, computed, makeObservable, observable, reaction, runInAction } from 'mobx';

import { BaseStore } from '@/shared/lib/store';

import { getDateAfter, parseDayCount } from '../lib/calculation';
import { getDateInMonth } from '../lib/calendar';
import { type CalendarResult, formatCalculation, formatCalculationText } from '../lib/format';
import { isProductionWorkingDay } from '../lib/production';
import { getNextRange } from '../lib/range';
import {
	getProductionRequestKey,
	ProductionCalendar,
	type ProductionRequest,
	type ProductionSnapshot,
} from './productionCalendar';
import type { CalendarMode, CalendarState, DateRange, ProductionStatus, ProductionYear } from './types';

export class CalendarStore extends BaseStore implements CalendarState {
	private readonly production: ProductionCalendar;
	private productionSnapshot: ProductionSnapshot;
	private midnightTimer: ReturnType<typeof setTimeout> | null = null;

	today = startOfDay(new Date());
	currentMonth = startOfMonth(this.today);
	mode: CalendarMode = 'period';
	range: DateRange = [null, null];
	afterStart = this.today;
	customStart = false;
	target: Date | null = null;
	dayCount = '';
	includeWeekends = true;
	isControlsOpen = false;

	productionErrorCount = 0;

	get productionStatus(): ProductionStatus {
		const { status, key } = this.productionSnapshot;
		return status === 'active' && key !== this.productionRequestKey ? 'loading' : status;
	}

	get productionActive(): boolean {
		return this.productionStatus === 'active';
	}

	get productionFetching(): boolean {
		return (
			this.productionStatus === 'loading' &&
			this.productionSnapshot.key === this.productionRequestKey &&
			this.productionSnapshot.fetching
		);
	}

	get productionLimitation(): string | null {
		return this.productionActive ? this.productionSnapshot.limitation : null;
	}

	get productionYears(): ReadonlyMap<number, ProductionYear> | undefined {
		return this.productionActive ? this.productionSnapshot.years : undefined;
	}

	get afterEnd(): Date | null {
		if (this.productionLimitation) return null;

		if (!this.includeWeekends && this.productionStatus === 'loading') return null;

		const workingDay = this.productionActive
			? (date: Date) => isProductionWorkingDay(date, this.productionSnapshot.years)
			: undefined;

		return getDateAfter(this.afterStart, this.dayCount, this.includeWeekends, workingDay);
	}

	get calculation(): CalendarResult | null {
		if (this.productionLimitation) return null;

		if (!this.includeWeekends && this.productionStatus === 'loading') return null;

		const workingDay = this.productionActive
			? (date: Date) => isProductionWorkingDay(date, this.productionSnapshot.years)
			: undefined;

		return formatCalculation(this, this.today, workingDay, this.mode === 'after' ? this.afterEnd : undefined);
	}

	get result(): string | null {
		const calculation = this.calculation;
		return calculation ? formatCalculationText(calculation, this.mode) : null;
	}

	get hasSelection(): boolean {
		if (this.mode === 'period') return this.range[0] !== null;
		if (this.mode === 'until') return this.target !== null;

		return this.customStart || !isSameDay(this.afterStart, this.today);
	}

	get countError(): boolean {
		return this.dayCount !== '' && parseDayCount(this.dayCount) === null;
	}

	get highlightRange(): boolean {
		return this.mode === 'period';
	}

	get displayRange(): DateRange {
		if (this.mode === 'period') return this.range;
		if (this.mode === 'after') return [this.afterStart, this.afterEnd];

		return [this.target, null];
	}

	private get productionRequest(): ProductionRequest {
		return {
			currentMonth: this.currentMonth,
			mode: this.mode,
			range: this.range,
			afterStart: this.afterStart,
			target: this.target,
			dayCount: this.dayCount,
			includeWeekends: this.includeWeekends,
			today: this.today,
		};
	}

	private get productionRequestKey(): string {
		return getProductionRequestKey(this.productionRequest);
	}

	prevMonth = (): void => {
		this.currentMonth = addMonths(this.currentMonth, -1);
	};

	nextMonth = (): void => {
		this.currentMonth = addMonths(this.currentMonth, 1);
	};

	goToCurrentMonth = (): void => {
		this.syncToday();
		this.currentMonth = startOfMonth(this.today);
	};

	selectDay = (day: number): void => {
		const date = startOfDay(getDateInMonth(this.currentMonth, day));

		if (this.mode === 'period') {
			this.range = getNextRange(date, this.range);
		} else if (this.mode === 'after') {
			this.afterStart = date;
			this.customStart = true;
		} else {
			this.target = date;
		}

		this.isControlsOpen = true;
	};

	setMode = (mode: CalendarMode): void => {
		if (mode === this.mode) return;

		this.mode = mode;
		this.clearSelection();
		this.isControlsOpen = true;
	};

	setDayCount = (value: string): void => {
		if (!/^\d{0,3}$/.test(value)) return;

		this.dayCount = value;
	};

	setIncludeWeekends = (value: boolean): void => {
		this.includeWeekends = value;
	};

	openControls = (): void => {
		this.isControlsOpen = true;
	};

	toggleControls = (): void => {
		if (this.isControlsOpen) this.closeControls();
		else this.openControls();
	};

	closeControls = (): void => {
		if (!this.isControlsOpen) return;

		this.clearSelection();
		this.isControlsOpen = false;
	};

	resetSelection = (): void => {
		const hasSelection = this.hasSelection;

		this.clearSelection();
		this.isControlsOpen = hasSelection;
	};

	toggleProduction = (): void => {
		this.production.toggle(this.productionRequest);
	};

	private clearSelection(): void {
		this.range = [null, null];
		this.target = null;
		this.afterStart = this.today;
		this.customStart = false;
	}

	private syncToday = (): void => {
		const today = startOfDay(new Date());

		if (isSameDay(this.today, today)) return;

		const previousToday = this.today;

		this.today = today;

		if (!this.customStart && isSameDay(this.afterStart, previousToday)) this.afterStart = today;
	};

	private readonly onVisibilityChange = (): void => {
		if (document.visibilityState !== 'visible') return;

		this.syncToday();
		this.scheduleMidnightUpdate();
	};

	private readonly onWindowFocus = (): void => {
		this.syncToday();
		this.scheduleMidnightUpdate();
	};

	private scheduleMidnightUpdate = (): void => {
		if (this.midnightTimer !== null) clearTimeout(this.midnightTimer);

		const now = new Date();
		const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

		this.midnightTimer = setTimeout(() => {
			this.syncToday();
			this.scheduleMidnightUpdate();
		}, nextMidnight.getTime() - now.getTime());
	};

	private stopMidnightUpdate = (): void => {
		if (this.midnightTimer !== null) {
			clearTimeout(this.midnightTimer);
			this.midnightTimer = null;
		}

		document.removeEventListener('visibilitychange', this.onVisibilityChange);
		window.removeEventListener('focus', this.onWindowFocus);
	};

	constructor() {
		super();

		this.production = new ProductionCalendar(() => runInAction(() => this.productionErrorCount++));
		this.productionSnapshot = this.production.getSnapshot();

		makeObservable<this, 'productionSnapshot' | 'clearSelection' | 'syncToday'>(
			this,
			{
				today: observable,
				currentMonth: observable,
				mode: observable,
				range: observable,
				afterStart: observable,
				customStart: observable,
				target: observable,
				dayCount: observable,
				includeWeekends: observable,
				isControlsOpen: observable,

				productionSnapshot: observable,
				productionErrorCount: observable,

				afterEnd: computed,
				calculation: computed,
				result: computed,
				hasSelection: computed,
				countError: computed,
				displayRange: computed,
				highlightRange: computed,

				productionStatus: computed,
				productionFetching: computed,
				productionActive: computed,
				productionLimitation: computed,
				productionYears: computed,

				prevMonth: action,
				nextMonth: action,
				goToCurrentMonth: action,
				selectDay: action,
				setMode: action,
				setDayCount: action,
				setIncludeWeekends: action,
				openControls: action,
				toggleControls: action,
				closeControls: action,
				resetSelection: action,
				toggleProduction: action,
				clearSelection: action,
				syncToday: action,
			},
			{ deep: false }
		);
	}

	init(): void {
		if (this.inited) return;
		this.inited = true;

		this.production.init();

		this.track(
			this.production.subscribe(() =>
				runInAction(() => (this.productionSnapshot = this.production.getSnapshot()))
			)
		);

		this.track(
			reaction(
				() => this.productionRequestKey,
				() => this.production.update(this.productionRequest)
			)
		);

		this.syncToday();

		document.addEventListener('visibilitychange', this.onVisibilityChange);
		window.addEventListener('focus', this.onWindowFocus);

		this.scheduleMidnightUpdate();
	}

	override destroy(): void {
		this.stopMidnightUpdate();

		super.destroy();

		this.production.destroy();

		runInAction(() => (this.productionSnapshot = this.production.getSnapshot()));
	}

	protected reset(): void {
		this.today = startOfDay(new Date());
		this.currentMonth = startOfMonth(this.today);
		this.mode = 'period';
		this.range = [null, null];
		this.afterStart = this.today;
		this.customStart = false;
		this.target = null;
		this.dayCount = '';
		this.includeWeekends = true;
		this.isControlsOpen = false;
		this.productionErrorCount = 0;
	}
}
