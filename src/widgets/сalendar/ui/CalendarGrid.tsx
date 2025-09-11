import { isSameDay, isToday } from 'date-fns';

import { WEEKDAYS_RU_SHORT } from '@/shared/lib/constants';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui';

import { generateCalendarDays, getDateFromDay, isInRange } from '../lib';
import type { DateRange } from '../model';

interface CalendarGridProps {
	currentDate: Date;
	range: DateRange;
	handleDayClick: (day: number) => void;
}

export const CalendarGrid = ({ currentDate, range, handleDayClick }: CalendarGridProps) => {
	const [start, end] = range;
	const calendarDays = generateCalendarDays(currentDate);

	return (
		<div className="grid h-full grid-cols-7 justify-items-center gap-0.5">
			{WEEKDAYS_RU_SHORT.map((day) => (
				<div key={day} className="flex items-center">
					{day}
				</div>
			))}

			{calendarDays.map((day, idx) => {
				if (!day) return <div key={idx} />;

				const date = getDateFromDay(currentDate, day);
				const today = isToday(date);
				const inRange = isInRange(date, range);

				return (
					<Button
						key={idx}
						className={cn(
							'aspect-square rounded-full border border-solid border-transparent p-1.5 text-sm leading-none',
							today && 'bg-[var(--accent-default)] text-[var(--accent-text)]',
							start && isSameDay(date, start) && 'border-[var(--accent-default)]',
							end && isSameDay(date, end) && 'border-[var(--accent-default)]',
							inRange && 'border-[var(--accent-default)]'
						)}
						size="custom"
						variant="custom"
						onClick={() => handleDayClick(day)}
					>
						{day}
					</Button>
				);
			})}
		</div>
	);
};
