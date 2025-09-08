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
				const calendarAccent = 'ring-1 ring-[var(--accent-default)] ring-inset';

				return (
					<Button
						key={idx}
						className={cn(
							'aspect-square rounded-full text-sm leading-4',
							today && 'bg-[var(--accent-default)] text-[var(--accent-text)]',
							start && isSameDay(date, start) && calendarAccent,
							end && isSameDay(date, end) && calendarAccent,
							inRange && calendarAccent
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
