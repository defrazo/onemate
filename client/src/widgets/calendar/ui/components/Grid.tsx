import { observer } from 'mobx-react-lite';

import { useStore } from '@/app/providers';
import { cn } from '@/shared/lib/utils';

import { getCalendarDays, getDateInMonth } from '../../lib/calendar';
import { DayCell } from './DayCell';

const WEEKDAYS_RU_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

export const Grid = observer(() => {
	const { calendarStore: store } = useStore();

	const range = store.displayRange;

	const highlightRange = store.highlightRange;
	const productionYears = store.productionYears;

	const days = getCalendarDays(store.currentMonth);
	const rows = days.length / 7;

	return (
		<>
			<div
				className={cn(
					'grid h-7 shrink-0 grid-cols-7 rounded-lg text-sm',
					productionYears
						? 'bg-(--accent-secondary-muted) text-(--accent-secondary)'
						: 'bg-(--accent-primary-muted) text-(--accent-primary)'
				)}
			>
				{WEEKDAYS_RU_SHORT.map((day) => (
					<div key={day} className="flex items-center justify-center">
						{day}
					</div>
				))}
			</div>
			<div
				className="mb-1 grid min-h-0 flex-1 grid-cols-7"
				style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
			>
				{days.map((day, idx) =>
					day === null ? (
						<div key={idx} />
					) : (
						<DayCell
							key={idx}
							date={getDateInMonth(store.currentMonth, day)}
							highlightRange={highlightRange}
							productionYears={productionYears}
							range={range}
							onSelect={store.selectDay}
						/>
					)
				)}
			</div>
		</>
	);
});
