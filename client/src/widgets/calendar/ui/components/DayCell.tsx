import { isSameDay, isToday } from 'date-fns';

import { cn } from '@/shared/lib/utils';
import { Tooltip } from '@/shared/ui';

import { formatCalculationDate } from '../../lib/format';
import { getProductionDecoration } from '../../lib/production';
import { isInRange } from '../../lib/range';
import type { DateRange, ProductionYear } from '../../model/types';

type DayCellProps = {
	date: Date;
	range: DateRange;
	highlightRange: boolean;
	productionYears?: ReadonlyMap<number, ProductionYear>;
	onSelect: (day: number) => void;
};

const dayStyles = {
	holiday: 'bg-(--status-error)/10 text-(--status-error)',
	nonWorking: 'bg-(--tone) text-(--text-secondary)',
	workingSaturday: 'bg-(--accent-primary-muted) text-(--accent-primary)',
	shortened: 'bg-(--status-warning)/10 text-(--text-primary)',
};

const markerStyles = {
	holiday: 'size-1 rounded-full bg-(--status-error)',
	nonWorking: 'h-0.5 w-2 rounded-full bg-(--status-warning)',
	workingSaturday: 'size-1 rounded-xs bg-(--accent-primary)',
	shortened: 'size-1 rounded-full bg-(--status-warning)',
};

export const DayCell = ({ date, range, highlightRange, productionYears, onSelect }: DayCellProps) => {
	const [start, end] = range;

	const today = isToday(date);
	const inRange = highlightRange && isInRange(date, range);
	const isStart = Boolean(start && isSameDay(date, start));
	const isEnd = Boolean(end && isSameDay(date, end));

	const isSelected = isStart || isEnd;
	const decoration = getProductionDecoration(date, productionYears);
	const kind = !isSelected && !inRange && !today ? decoration?.kind : null;

	const showRange = highlightRange && Boolean(start && end) && (inRange || isSelected) && !(isStart && isEnd);

	return (
		<div className="relative flex min-h-0 items-center justify-center">
			{showRange && (
				<div
					className={cn(
						'absolute top-1/2 h-7 -translate-y-1/2 bg-(--accent-primary-muted)',
						!isSelected && 'inset-x-0',
						isStart && 'right-0 left-1/2',
						isEnd && 'right-1/2 left-0'
					)}
				/>
			)}
			<Tooltip
				className="size-7 items-center justify-center rounded-full focus-visible:ring-1 focus-visible:ring-(--accent-primary) focus-visible:outline-none"
				content={decoration?.label}
			>
				<button
					aria-label={`${formatCalculationDate(date)}${decoration ? ` – ${decoration.label}` : ''}`}
					aria-pressed={isSelected}
					className={cn(
						'relative z-10 flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full font-mono tabular-nums',
						'focus-visible:ring-1 focus-visible:ring-(--accent-primary) focus-visible:outline-none',
						kind && dayStyles[kind],
						!inRange && !isSelected && 'hover:bg-(--accent-primary-muted) hover:text-(--accent-primary)',
						isSelected &&
							(highlightRange || isStart
								? 'bg-(--accent-primary) text-(--text-on-accent)'
								: 'bg-(--accent-primary-muted) text-(--accent-primary) ring-1 ring-(--accent-primary)')
					)}
					type="button"
					onClick={() => onSelect(date.getDate())}
				>
					{date.getDate()}
					{today && !inRange && !isSelected && (
						<span
							aria-hidden="true"
							className="absolute -bottom-0.5 size-1 rounded-full bg-(--accent-primary)"
						/>
					)}
					{kind && (
						<span
							aria-hidden="true"
							className={cn('pointer-events-none absolute -bottom-0.5', markerStyles[kind])}
						/>
					)}
				</button>
			</Tooltip>
		</div>
	);
};
