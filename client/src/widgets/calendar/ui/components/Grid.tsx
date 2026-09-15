import { isSameDay, isToday } from 'date-fns';

import { cn } from '@/shared/lib/utils';

import { getCalendarDays, getDateInMonth, isInRange } from '../../lib';
import type { DateRange } from '../../model';

const WEEKDAYS_RU_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const;

interface GridProps {
	month: Date;
	range: DateRange;
	selectDay: (day: number) => void;
}

export const Grid = ({ month, range, selectDay }: GridProps) => {
	const [start, end] = range;

	const days = getCalendarDays(month);
	const rows = days.length / 7;

	return (
		<>
			<div className="grid h-8 grid-cols-7 rounded-lg bg-(--accent-default)/10 text-sm text-(--accent-default)">
				{WEEKDAYS_RU_SHORT.map((day) => (
					<div key={day} className="flex items-center justify-center">
						{day}
					</div>
				))}
			</div>
			<div
				className="grid min-h-0 flex-1 grid-cols-7"
				style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
			>
				{days.map((day, idx) => {
					if (!day) return <div key={idx} />;

					const date = getDateInMonth(month, day);
					const today = isToday(date);
					const inRange = isInRange(date, range);
					const isStart = Boolean(start && isSameDay(date, start));
					const isEnd = Boolean(end && isSameDay(date, end));

					return (
						<div key={idx} className="relative flex min-h-0 items-center justify-center">
							{inRange && (
								<div
									className={cn(
										'absolute top-1/2 h-7 -translate-y-1/2 bg-(--accent-default)/10 transition-opacity duration-150',
										!isStart && !isEnd && 'inset-x-0',
										isStart && !isEnd && 'right-0 left-1/2',
										isEnd && !isStart && 'right-1/2 left-0',
										isStart && isEnd && 'hidden'
									)}
								/>
							)}
							<button
								className={cn(
									'relative z-10 flex size-8 cursor-pointer items-center justify-center rounded-full font-mono tabular-nums transition-[background-color,color] duration-150',
									!inRange && 'hover:bg-(--accent-default)/10 hover:text-(--accent-default)',
									(isStart || isEnd) && 'bg-(--accent-default) text-(--color-primary)'
								)}
								type="button"
								onClick={() => selectDay(day)}
							>
								{day}
								{today && !inRange && (
									<span className="absolute bottom-0.5 size-1 rounded-full bg-(--accent-default)" />
								)}
							</button>
						</div>
					);
				})}
			</div>
		</>
	);
};
