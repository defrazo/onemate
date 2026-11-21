import { getDaysInYear } from 'date-fns';

import { fetchProductionYear } from '../api/productionCalendar';
import { getDateAfter, parseDayCount } from '../lib/calculation';
import {
	getProductionYears,
	isProductionWorkingDay,
	MAX_PRODUCTION_DAYS,
	MissingProductionYear,
	ProductionRangeError,
} from '../lib/production';
import type { CalendarState, ProductionStatus, ProductionYear } from './types';

export type ProductionRequest = Pick<
	CalendarState,
	'currentMonth' | 'mode' | 'range' | 'afterStart' | 'target' | 'dayCount' | 'includeWeekends'
> & { today: Date };

export type ProductionSnapshot = {
	status: ProductionStatus;
	key: string | null;
	years: ReadonlyMap<number, ProductionYear>;
	limitation: string | null;
	fetching: boolean;
};

type ProductionUpdate = Pick<ProductionSnapshot, 'status' | 'key' | 'limitation'> &
	Partial<Pick<ProductionSnapshot, 'fetching'>>;

export const getProductionRequestKey = (request: ProductionRequest): string => {
	const base = [request.currentMonth.getFullYear(), request.mode, request.includeWeekends];

	if (request.mode === 'period') return JSON.stringify([...base, request.range]);

	if (request.mode === 'after') return JSON.stringify([...base, request.afterStart, request.dayCount]);

	return JSON.stringify([...base, request.today, request.target]);
};

export class ProductionCalendar {
	private readonly years = new Map<number, ProductionYear>();
	private readonly pending = new Map<number, Promise<ProductionYear>>();
	private readonly controllers = new Map<number, AbortController>();
	private readonly listeners = new Set<() => void>();

	private generation = 0;
	private enabled = false;
	private destroyed = false;

	private snapshot: ProductionSnapshot = {
		status: 'inactive',
		key: null,
		years: new Map(),
		limitation: null,
		fetching: false,
	};

	getSnapshot = (): ProductionSnapshot => this.snapshot;

	subscribe = (listener: () => void): (() => void) => {
		if (this.destroyed) return () => {};

		this.listeners.add(listener);

		return () => {
			this.listeners.delete(listener);
		};
	};

	update(request: ProductionRequest) {
		if (!this.destroyed && this.enabled && getProductionRequestKey(request) !== this.snapshot.key)
			void this.run(request);
	}

	toggle(request: ProductionRequest) {
		if (this.destroyed) return;

		if (this.enabled) {
			this.enabled = false;
			this.generation++;
			this.abortPending();
			this.publish({ status: 'inactive', key: null, limitation: null });

			return;
		}

		this.enabled = true;
		void this.run(request);
	}

	private abortPending() {
		for (const controller of this.controllers.values()) {
			controller.abort();
		}

		this.controllers.clear();
		this.pending.clear();
	}

	private publish(update: ProductionUpdate) {
		this.snapshot = { ...update, fetching: update.fetching ?? false, years: new Map(this.years) };

		for (const listener of this.listeners) {
			listener();
		}
	}

	private load(year: number): Promise<ProductionYear> {
		const cached = this.years.get(year);
		if (cached) return Promise.resolve(cached);

		const pending = this.pending.get(year);
		if (pending) return pending;

		const controller = new AbortController();
		this.controllers.set(year, controller);

		const promise = this.fetchYear(year, controller.signal)
			.then((calendar) => {
				if (controller.signal.aborted) throw new DOMException('Запрос отменён', 'AbortError');

				if (
					calendar.year !== year ||
					calendar.days.length !== getDaysInYear(new Date(year, 0, 1)) ||
					calendar.days.some((day) => day !== 0 && day !== 1 && day !== 2)
				) {
					throw new Error('Некорректный производственный календарь');
				}

				this.years.set(year, calendar);
				return calendar;
			})
			.finally(() => {
				if (this.pending.get(year) === promise) {
					this.pending.delete(year);
					this.controllers.delete(year);
				}
			});

		this.pending.set(year, promise);

		return promise;
	}

	private async run(request: ProductionRequest): Promise<void> {
		const generation = ++this.generation;
		const key = getProductionRequestKey(request);

		const current = () => !this.destroyed && this.enabled && generation === this.generation;

		this.publish({
			status: 'loading',
			key,
			limitation: null,
			fetching: !this.years.has(request.currentMonth.getFullYear()),
		});

		try {
			await this.load(request.currentMonth.getFullYear());

			if (!current()) return;

			let limitation: string | null = null;

			try {
				if (!request.includeWeekends) {
					const interval =
						request.mode === 'period'
							? request.range
							: request.mode === 'until'
								? [request.today, request.target]
								: null;

					if (interval?.[0] && interval[1]) {
						const years = getProductionYears(interval[0], interval[1]);

						if (years.some((year) => !this.years.has(year)))
							this.publish({ status: 'loading', key, limitation: null, fetching: true });

						await Promise.all(years.map((year) => this.load(year)));
					}

					if (!current()) return;

					if (request.mode === 'after' && parseDayCount(request.dayCount) !== null) {
						if (Number(request.dayCount) > MAX_PRODUCTION_DAYS) throw new ProductionRangeError();

						while (current()) {
							try {
								getDateAfter(request.afterStart, request.dayCount, false, (date) =>
									isProductionWorkingDay(date, this.years)
								);
								break;
							} catch (error) {
								if (!(error instanceof MissingProductionYear)) throw error;

								this.publish({ status: 'loading', key, limitation: null, fetching: true });

								await this.load(error.year);
							}
						}
					}
				}
			} catch (error) {
				if (!(error instanceof ProductionRangeError)) throw error;

				limitation = error.message;
			}

			if (current()) {
				this.publish({ status: 'active', key, limitation });
			}
		} catch {
			if (!current()) return;

			this.enabled = false;

			this.publish({ status: 'error', key, limitation: null });

			this.onError();
		}
	}

	constructor(
		private readonly onError: () => void,
		private readonly fetchYear = fetchProductionYear
	) {}

	init(): void {
		this.destroyed = false;
	}

	destroy() {
		if (this.destroyed) return;

		this.destroyed = true;
		this.enabled = false;
		this.generation++;

		this.abortPending();
		this.years.clear();

		this.publish({ status: 'inactive', key: null, limitation: null });

		this.listeners.clear();
	}
}
